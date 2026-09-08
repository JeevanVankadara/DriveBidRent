// Backend/scripts/resetSeededAuctionsToPending.js
//
// Puts auction listings back to the state a seller upload actually produces:
// awaiting the auction manager, with nothing downstream pre-filled.
//
//   node scripts/resetSeededAuctionsToPending.js              # report only
//   node scripts/resetSeededAuctionsToPending.js --confirm    # apply
//
// The seed script had promoted some cars straight to a live auction, which
// skipped the real workflow:
//
//   seller uploads -> auction manager reviews -> assigns a mechanic
//   -> mechanic inspects and writes the review -> auction manager
//      approves and starts/stops the auction
//
// This resets only the workflow fields. Vehicle details, photos, documentation
// and the seller are left exactly as they are.
//
// Safe to re-run: cars already pending are reported as such and skipped.
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const CONFIRM = process.argv.slice(2).includes('--confirm');

// A freshly uploaded auction request looks like this.
const FRESH = {
  status: 'pending',
  started_auction: 'no',
  auction_stopped: false,
  reviewStatus: 'pending',
};

// Set by later stages of the workflow, so they must not be pre-filled.
const DOWNSTREAM_FIELDS = [
  'startingBid',          // auction manager sets this on approval
  'assignedMechanic',     // auction manager assigns
  'assignedAuctionManager',
  'mechanicReview',       // mechanic writes after inspection
  'multipointInspection',
  'inspectionDate',
  'inspectionTime',
  'winnerId',
  'finalPurchasePrice',
  'rejectionReason',
  'rejectedBy',
];

const isFresh = (doc) =>
  doc.status === 'pending' &&
  doc.started_auction === 'no' &&
  doc.auction_stopped === false &&
  DOWNSTREAM_FIELDS.every((f) => doc[f] === undefined || doc[f] === null);

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.db.collection('auctionrequests');

  console.log('='.repeat(64));
  console.log(`Database : ${mongoose.connection.name}`);
  console.log(`Mode     : ${CONFIRM ? 'APPLY' : 'DRY RUN — no writes'}`);
  console.log('='.repeat(64));

  const all = await col.find({}).toArray();
  console.log(`\nauctionrequests: ${all.length}\n`);

  const needsReset = [];
  for (const doc of all) {
    const fresh = isFresh(doc);
    const extras = DOWNSTREAM_FIELDS.filter((f) => doc[f] !== undefined && doc[f] !== null);
    console.log(
      `  ${String(doc.vehicleName).padEnd(24)} status=${String(doc.status).padEnd(9)} ` +
        `started=${String(doc.started_auction).padEnd(5)} ` +
        (fresh ? '-> already awaiting auction manager' : `-> RESET${extras.length ? ` (clearing: ${extras.join(', ')})` : ''}`)
    );
    if (!fresh) needsReset.push(doc._id);
  }

  if (needsReset.length === 0) {
    console.log('\nEverything is already in the fresh-upload state. Nothing to do.');
    await mongoose.disconnect();
    return;
  }

  if (!CONFIRM) {
    console.log(`\n${needsReset.length} listing(s) would be reset. Re-run with --confirm to apply.`);
    await mongoose.disconnect();
    return;
  }

  const res = await col.updateMany(
    { _id: { $in: needsReset } },
    {
      $set: FRESH,
      $unset: DOWNSTREAM_FIELDS.reduce((acc, f) => ({ ...acc, [f]: '' }), {}),
    }
  );
  console.log(`\nReset ${res.modifiedCount} listing(s).`);

  const after = await col
    .find({}, { projection: { vehicleName: 1, status: 1, started_auction: 1, startingBid: 1 } })
    .toArray();
  console.log('\nAfter:');
  after.forEach((d) =>
    console.log(
      `  ${String(d.vehicleName).padEnd(24)} status=${String(d.status).padEnd(9)} ` +
        `started=${String(d.started_auction).padEnd(5)} startingBid=${d.startingBid ?? '-'}`
    )
  );

  const live = await col.countDocuments({ status: 'approved', started_auction: 'yes', auction_stopped: false });
  console.log(`\nBuyer-visible (live) auctions now: ${live}`);

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
