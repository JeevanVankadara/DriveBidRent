// Backend/scripts/seedVehicles.js
//
// Seeds demo auction + rental vehicles for seller1 and seller2, using real
// photos of Indian-market cars pulled from Wikimedia Commons and re-hosted on
// this project's own Cloudinary account.
//
//   node scripts/seedVehicles.js --dry-run     # resolve images, write nothing
//   node scripts/seedVehicles.js               # seed everything
//   node scripts/seedVehicles.js --auctions    # auctions only
//   node scripts/seedVehicles.js --rentals     # rentals only
//
// Photo licensing: Commons images are mostly CC BY-SA, which requires
// attribution if you publish this. The script prints the photographer and
// licence for every image it uploads, and stores them in seedPhotoCredits.json
// next to this file so you can credit them later.
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { cloudinary } = await import('../config/cloudinary.js');
const AuctionRequest = (await import('../models/AuctionRequest.js')).default;
const RentalRequest = (await import('../models/RentalRequest.js')).default;
const User = (await import('../models/User.js')).default;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const ONLY_AUCTIONS = args.includes('--auctions');
const ONLY_RENTALS = args.includes('--rentals');

const UA = 'DriveBidRent-seed/1.0 (student project; contact via repo)';
const IMAGES_PER_VEHICLE = 4; // 1 main + 3 additional

// ---------------------------------------------------------------- images ----

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Shots that are not "a photo of the whole car"
const JUNK = /(interior|dashboard|engine|badge|logo|emblem|wheel|headlamp|taillight|rear light|seat|gearbox|boot|odometer)/i;

// Commons search, filtered to real exterior photos of the model.
// Commons rate-limits aggressive clients, so this backs off and retries.
const searchCommons = async (term, mustMatch, exclude = [], limit = 20) => {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json' +
    `&generator=search&gsrsearch=${encodeURIComponent(term)}&gsrnamespace=6&gsrlimit=${limit}` +
    '&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=1600';

  let data;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) {
      data = await res.json();
      break;
    }
    if (res.status === 429 || res.status >= 500) {
      const wait = attempt * 3000;
      console.log(`      (Commons ${res.status}, retrying in ${wait / 1000}s)`);
      await sleep(wait);
      continue;
    }
    throw new Error(`Commons search failed (${res.status})`);
  }
  if (!data) throw new Error('Commons search failed after retries');

  return Object.values(data?.query?.pages || {})
    .map((p) => {
      const info = p.imageinfo?.[0];
      if (!info) return null;
      return {
        title: p.title.replace(/^File:/, ''),
        mime: info.mime,
        url: info.thumburl || info.url,
        license: info.extmetadata?.LicenseShortName?.value || 'unknown',
        artist: (info.extmetadata?.Artist?.value || '').replace(/<[^>]*>/g, '').trim(),
      };
    })
    .filter((x) => x && /^image\/(jpeg|png|webp)$/.test(x.mime))
    // Keep files whose name actually mentions the model, drop the wrong
    // variants (an EV badge on a petrol listing, a rebadged export model)
    // and the interior / engine / badge close-ups.
    .filter((x) => {
      const t = x.title.toLowerCase();
      const named = mustMatch.every((m) => t.includes(m.toLowerCase()));
      const banned = exclude.some((e) => t.includes(e.toLowerCase()));
      return named && !banned && !JUNK.test(t);
    });
};

// Photographers usually shoot the same car repeatedly, so a listing looks
// coherent (one car, one colour) if its photos come from one photographer.
// Order by biggest artist cluster first.
const clusterByArtist = (list) => {
  const byArtist = new Map();
  list.forEach((c) => {
    const key = c.artist || '(unknown)';
    if (!byArtist.has(key)) byArtist.set(key, []);
    byArtist.get(key).push(c);
  });
  return [...byArtist.values()].sort((a, b) => b.length - a.length).flat();
};

// Commons has far more photos of European/Japanese trims than Indian ones,
// so titles hinting at the Indian model ("Maruti", "India") win first, and
// the rest only top up the remainder.
const pickPhotos = (candidates, want, prefer = []) => {
  const isPreferred = (c) => prefer.some((p) => c.title.toLowerCase().includes(p.toLowerCase()));
  const preferred = clusterByArtist(candidates.filter(isPreferred));
  const rest = clusterByArtist(candidates.filter((c) => !isPreferred(c)));
  return [...preferred, ...rest].slice(0, want);
};

// Download image bytes, backing off when Wikimedia throttles us.
const fetchImage = async (url) => {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status === 429 || res.status >= 500) {
      const wait = attempt * 5000;
      console.log(`      (image ${res.status}, retrying in ${wait / 1000}s)`);
      await sleep(wait);
      continue;
    }
    throw new Error(`image fetch failed (${res.status}) for ${url}`);
  }
  throw new Error(`image fetch failed after retries: ${url}`);
};

const uploadBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'drivebidrent/vehicles', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

const credits = [];

const uploadImages = async (label, searches, mustMatch, exclude = [], prefer = ['india', 'maruti']) => {
  // Gather candidates across every search term first, then choose.
  const candidates = [];
  for (const term of searches) {
    let hits = [];
    try {
      hits = await searchCommons(term, mustMatch, exclude);
    } catch (e) {
      console.log(`    ! search "${term}" failed: ${e.message}`);
      continue;
    }
    hits.forEach((h) => {
      if (!candidates.some((c) => c.title === h.title)) candidates.push(h);
    });
    await sleep(2500); // be polite to the Commons API
  }

  const found = pickPhotos(candidates, IMAGES_PER_VEHICLE, prefer);

  if (found.length === 0) throw new Error(`no usable Commons photos for "${label}"`);
  if (found.length < 2) throw new Error(`only ${found.length} photo for "${label}" — need a main + at least 1 more`);

  console.log(`    ${found.length} photo(s) chosen (of ${candidates.length} candidates)`);
  found.forEach((f) => console.log(`      - ${f.title}  [${f.license} | ${f.artist || 'unknown'}]`));

  if (DRY_RUN) return found.map((f) => f.url);

  const urls = [];
  for (const f of found) {
    // Fetch the bytes here rather than letting Cloudinary pull the URL:
    // Cloudinary's fetcher sends its own user agent with no pacing and
    // Wikimedia rate-limits it (429). Doing it ourselves lets us identify
    // properly and slow down.
    const buffer = await fetchImage(f.url);
    const uploaded = await uploadBuffer(buffer);
    urls.push(uploaded.secure_url);
    credits.push({ vehicle: label, file: f.title, license: f.license, artist: f.artist, cloudinary: uploaded.secure_url });
    await sleep(1500);
  }
  return urls;
};

// ---------------------------------------------------------------- data ------

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(11, 0, 0, 0);
  return d;
};
const yearsAgo = (n) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d;
};

// Every seeded car is created exactly as a seller upload leaves it: pending,
// not started, no startingBid. The real workflow takes over from there —
// auction manager reviews, assigns a mechanic, the mechanic inspects and
// writes the review, and only then does the manager approve and start the
// auction. Nothing in this script may short-circuit that.
const AUCTIONS = [
  {
    name: 'Maruti Suzuki Swift VXi', seller: 1,
    searches: ['Maruti Suzuki Swift India', 'Suzuki Swift hatchback'], mustMatch: ['swift'], exclude: ['dzire', 'sport', 'gti', 'hybrid'], prefer: ['maruti'],
    carType: 'Hatchback', year: 2019, mileage: 42000, fuelType: 'petrol', transmission: 'manual',
    condition: 'good', expectedBid: 480000, auctionInDays: 4,
    reg: 'MH12AB4521', state: 'Maharashtra', owner: 'First Owner',
  },
  {
    name: 'Hyundai Creta SX', seller: 2,
    searches: ['Hyundai Creta India', 'Hyundai Creta SX'], mustMatch: ['creta'], exclude: ['grand creta', 'ix25', 'n line'],
    carType: 'SUV', year: 2021, mileage: 28500, fuelType: 'diesel', transmission: 'automatic',
    condition: 'excellent', expectedBid: 1420000, auctionInDays: 6,
    reg: 'KA05MN7788', state: 'Karnataka', owner: 'First Owner',
  },
  {
    name: 'Tata Nexon EV Max', seller: 1,
    searches: ['Tata Nexon India', 'Tata Nexon EV'], mustMatch: ['nexon'], exclude: ['auto expo', 'concept'],
    carType: 'SUV', year: 2021, mileage: 31400, fuelType: 'electric', transmission: 'automatic',
    condition: 'good', expectedBid: 830000, auctionInDays: 3,
    reg: 'TN09CD1290', state: 'Tamil Nadu', owner: 'Second Owner',
  },
  {
    name: 'Mahindra Thar LX', seller: 2,
    searches: ['Mahindra Thar India', 'Mahindra Thar 2020'], mustMatch: ['thar'], exclude: ['roxx'],
    carType: 'SUV', year: 2022, mileage: 19800, fuelType: 'diesel', transmission: 'manual',
    condition: 'excellent', expectedBid: 1510000, auctionInDays: 8,
    reg: 'DL08EF3344', state: 'Delhi', owner: 'First Owner',
  },
  {
    name: 'Honda City ZX', seller: 1,
    searches: ['Honda City India', 'Honda City sedan'], mustMatch: ['honda', 'city'], exclude: ['vento', 'and ', 'hybrid'],
    carType: 'Sedan', year: 2018, mileage: 58000, fuelType: 'petrol', transmission: 'automatic',
    condition: 'good', expectedBid: 720000, auctionInDays: 12,
    reg: 'GJ01GH5566', state: 'Gujarat', owner: 'Second Owner',
  },
  {
    name: 'Toyota Innova Crysta', seller: 2,
    searches: ['Toyota Innova Crysta', 'Toyota Innova India'], mustMatch: ['innova'], exclude: ['police', 'pcr', 'hycross', 'ambulance'],
    carType: 'Wagon', year: 2019, mileage: 76000, fuelType: 'diesel', transmission: 'manual',
    condition: 'fair', expectedBid: 1290000, auctionInDays: 14,
    reg: 'AP16JK9911', state: 'Andhra Pradesh', owner: 'Third Owner',
  },
];

const RENTALS = [
  { name: 'Maruti Suzuki Ertiga', seller: 1, searches: ['Maruti Suzuki Ertiga', 'Suzuki Ertiga India'], mustMatch: ['ertiga'], exclude: ['proton', 'xl7'],
    year: 2021, ac: 'available', capacity: 7, condition: 'good', fuelType: 'petrol', transmission: 'manual', cost: 2600, driver: true, driverRate: 900 },
  { name: 'Hyundai i20 Asta', seller: 2, searches: ['Hyundai i20 India', 'Hyundai i20 hatchback'], mustMatch: ['i20'], exclude: ['wrc', 'rally', 'n line', 'active'],
    year: 2022, ac: 'available', capacity: 5, condition: 'excellent', fuelType: 'petrol', transmission: 'automatic', cost: 2200, driver: false },
  { name: 'Tata Tiago XZ', seller: 1, searches: ['Tata Tiago India', 'Tata Tiago hatchback', 'Tata Tiago car'], mustMatch: ['tiago'], exclude: ['ev', 'nrg'],
    year: 2020, ac: 'available', capacity: 5, condition: 'good', fuelType: 'petrol', transmission: 'manual', cost: 1700, driver: false },
  { name: 'Mahindra Scorpio N', seller: 2, searches: ['Mahindra Scorpio India', 'Mahindra Scorpio SUV', 'Mahindra Scorpio car'], mustMatch: ['scorpio'], exclude: ['getaway', 'pik up', 'pickup', 'army', 'police'], prefer: ['india'],
    year: 2022, ac: 'available', capacity: 7, condition: 'excellent', fuelType: 'diesel', transmission: 'manual', cost: 4200, driver: true, driverRate: 1200 },
  { name: 'Maruti Suzuki Baleno', seller: 1, searches: ['Maruti Suzuki Baleno', 'Suzuki Baleno India'], mustMatch: ['baleno'], exclude: ['rs', 'cross', '1995', '1998'],
    year: 2021, ac: 'available', capacity: 5, condition: 'good', fuelType: 'petrol', transmission: 'automatic', cost: 2400, driver: false },
  { name: 'Toyota Fortuner 4x4', seller: 2, searches: ['Toyota Fortuner India', 'Toyota Fortuner SUV'], mustMatch: ['fortuner'], exclude: ['legender', 'police'],
    year: 2020, ac: 'available', capacity: 7, condition: 'good', fuelType: 'diesel', transmission: 'automatic', cost: 6500, driver: true, driverRate: 1500 },
];

const buildDocumentation = (v) => ({
  registrationNumber: v.reg,
  registrationState: v.state,
  ownershipType: v.owner,
  insuranceStatus: 'Valid',
  insuranceExpiryDate: daysFromNow(220),
  insuranceType: 'Comprehensive',
  previousInsuranceClaims: false,
  accidentHistory: false,
  numberOfAccidents: 0,
  majorRepairs: false,
  readyForTransfer: true,
  serviceHistory: v.condition === 'excellent' ? 'Complete Service Records' : 'Partial Records',
  lastServiceDate: daysFromNow(-120),
  serviceBookAvailable: true,
  pollutionCertificate: 'Valid',
  pollutionExpiryDate: daysFromNow(150),
  documentsVerified: false,
});

// ---------------------------------------------------------------- run ------

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Database: ${mongoose.connection.name}`);
  console.log(`Mode    : ${DRY_RUN ? 'DRY RUN — resolves photos, writes nothing' : 'SEEDING'}\n`);

  const seller1 = await User.findOne({ email: 'seller1@gmail.com' }).select('_id firstName').lean();
  const seller2 = await User.findOne({ email: 'seller2@gmail.com' }).select('_id firstName').lean();
  if (!seller1 || !seller2) throw new Error('seller1@gmail.com / seller2@gmail.com not found');
  const sellerFor = (n) => (n === 1 ? seller1._id : seller2._id);
  console.log(`seller1 = ${seller1._id}\nseller2 = ${seller2._id}\n`);

  if (!ONLY_RENTALS) {
    console.log('--- AUCTIONS ---');
    for (const v of AUCTIONS) {
      console.log(`\n  ${v.name}  (seller${v.seller}, awaiting auction manager)`);

      // Re-runnable: skip what this seller already has, so a run that dies
      // partway can just be repeated without duplicating or re-uploading.
      if (!DRY_RUN) {
        const existing = await AuctionRequest.findOne({ vehicleName: v.name, sellerId: sellerFor(v.seller) })
          .select('_id')
          .lean();
        if (existing) {
          console.log(`    already seeded (${existing._id}) — skipping`);
          continue;
        }
      }

      const images = await uploadImages(v.name, v.searches, v.mustMatch, v.exclude, v.prefer);
      if (DRY_RUN) continue;

      const doc = new AuctionRequest({
        vehicleName: v.name,
        mainImage: images[0],
        additionalImages: images.slice(1),
        carType: v.carType,
        year: v.year,
        mileage: v.mileage,
        condition: v.condition,
        fuelType: v.fuelType,
        transmission: v.transmission,
        expectedBid: v.expectedBid,
        purchaseDate: yearsAgo(new Date().getFullYear() - v.year),
        auctionDate: daysFromNow(v.auctionInDays),
        sellerId: sellerFor(v.seller),
        vehicleDocumentation: buildDocumentation(v),
        // Fresh seller upload. startingBid, the mechanic assignment and the
        // review all belong to later stages of the workflow, so none of them
        // are set here.
        status: 'pending',
        started_auction: 'no',
        auction_stopped: false,
      });

      await doc.save();
      console.log(`    saved ${doc._id}`);
    }
  }

  if (!ONLY_AUCTIONS) {
    console.log('\n--- RENTALS ---');
    for (const v of RENTALS) {
      console.log(`\n  ${v.name}  (seller${v.seller})`);

      if (!DRY_RUN) {
        const existing = await RentalRequest.findOne({ vehicleName: v.name, sellerId: sellerFor(v.seller) })
          .select('_id')
          .lean();
        if (existing) {
          console.log(`    already seeded (${existing._id}) — skipping`);
          continue;
        }
      }

      const images = await uploadImages(v.name, v.searches, v.mustMatch, v.exclude, v.prefer);
      if (DRY_RUN) continue;

      const doc = new RentalRequest({
        vehicleName: v.name,
        vehicleImage: images[0],
        additionalImages: images.slice(1),
        year: v.year,
        AC: v.ac,
        capacity: v.capacity,
        condition: v.condition,
        fuelType: v.fuelType,
        transmission: v.transmission,
        costPerDay: v.cost,
        driverAvailable: v.driver,
        ...(v.driver ? { driverRate: v.driverRate } : {}),
        sellerId: sellerFor(v.seller),
        status: 'available',
      });

      await doc.save();
      console.log(`    saved ${doc._id}`);
    }
  }

  if (!DRY_RUN && credits.length) {
    const out = path.join(__dirname, 'seedPhotoCredits.json');
    fs.writeFileSync(out, JSON.stringify(credits, null, 2));
    console.log(`\nPhoto credits written to ${out}`);
  }

  console.log('\n--- TOTALS ---');
  console.log(`auctionrequests: ${await AuctionRequest.countDocuments()}`);
  console.log(`  awaiting auction manager: ${await AuctionRequest.countDocuments({ status: 'pending' })}`);
  console.log(`  live (set by the auction manager, never by this script): ${await AuctionRequest.countDocuments({ status: 'approved', started_auction: 'yes', auction_stopped: false })}`);
  console.log(`rentalrequests : ${await RentalRequest.countDocuments()}`);

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('\nFailed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
