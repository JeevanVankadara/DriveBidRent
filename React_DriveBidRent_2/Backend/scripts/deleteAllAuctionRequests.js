// Backend/scripts/deleteAllAuctionRequests.js
//
// Deletes every vehicle in the auctionrequests collection, and optionally the
// records that hang off them (bids, costs, inspection reports/chats, wishlist
// entries, auction notifications, manager task assignments).
//
// DRY RUN BY DEFAULT — it prints what it would delete and exits without
// writing. Nothing is removed unless you pass --confirm.
//
//   node scripts/deleteAllAuctionRequests.js                    # report only
//   node scripts/deleteAllAuctionRequests.js --confirm          # delete auctions + related
//   node scripts/deleteAllAuctionRequests.js --confirm --keep-related
//   node scripts/deleteAllAuctionRequests.js --confirm --keep-purchases
//
// Purchases are money records: they are KEPT unless you pass --delete-purchases,
// because a completed sale is usually worth preserving even when the listing is
// gone. Everything else is meaningless without its auction, so it goes by
// default (use --keep-related to leave it all in place).
//
// THIS IS IRREVERSIBLE. Take a database backup first.
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);

const CONFIRM = has('--confirm');
const KEEP_RELATED = has('--keep-related');
const DELETE_PURCHASES = has('--delete-purchases');

// Collections whose documents are meaningless once the auction is gone.
// [collection, field holding the auction reference]
const RELATED = [
  ['auctionbids', 'auctionId'],
  ['auctioncosts', 'auctionId'],
  ['inspectionreports', 'auctionId'],
  ['inspectionchats', 'inspectionTask'],
  ['chats', 'inspectionTask'],
  ['notifications', 'auctionId'],
];

const run = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set. Aborting.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  console.log('='.repeat(60));
  console.log(`Database : ${mongoose.connection.name}`);
  console.log(`Mode     : ${CONFIRM ? 'DELETE (irreversible)' : 'DRY RUN — no writes'}`);
  console.log('='.repeat(60));

  const auctions = db.collection('auctionrequests');
  const total = await auctions.countDocuments();
  console.log(`\nauctionrequests: ${total} document(s)`);

  if (total === 0) {
    console.log('Nothing to delete.');
    await mongoose.disconnect();
    return;
  }

  const byStatus = await auctions
    .aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }, { $sort: { n: -1 } }])
    .toArray();
  console.log('  by status: ' + byStatus.map((s) => `${s._id}=${s.n}`).join(', '));

  const sample = await auctions
    .find({}, { projection: { vehicleName: 1, status: 1, sellerId: 1 } })
    .limit(50)
    .toArray();
  console.log('\n  vehicles:');
  sample.forEach((a) => console.log(`   - ${a.vehicleName}  [${a.status}]  ${a._id}`));
  if (total > sample.length) console.log(`   ... and ${total - sample.length} more`);

  const auctionIds = (await auctions.find({}, { projection: { _id: 1 } }).toArray()).map((d) => d._id);

  // Report related records
  console.log('\nRelated records:');
  const plan = [];
  for (const [name, field] of RELATED) {
    const count = await db.collection(name).countDocuments({ [field]: { $in: auctionIds } });
    console.log(`  ${name}.${field}: ${count}` + (KEEP_RELATED ? '  (kept)' : '  (will delete)'));
    if (!KEEP_RELATED && count > 0) plan.push([name, field, count]);
  }

  const wishlistCount = await db
    .collection('wishlists')
    .countDocuments({ 'items.auctionId': { $in: auctionIds } })
    .catch(() => 0);
  console.log(`  wishlists containing these auctions: ${wishlistCount}`);

  const purchaseCount = await db.collection('purchases').countDocuments({ auctionId: { $in: auctionIds } });
  console.log(
    `  purchases.auctionId: ${purchaseCount}` +
      (DELETE_PURCHASES ? '  (will delete)' : '  (KEPT — pass --delete-purchases to remove)')
  );

  if (!CONFIRM) {
    console.log('\nDRY RUN — nothing was deleted.');
    console.log('Re-run with --confirm to actually delete.');
    await mongoose.disconnect();
    return;
  }

  // ---- destructive section ----
  console.log('\nDeleting...');

  for (const [name, field] of plan.map(([n, f]) => [n, f])) {
    const res = await db.collection(name).deleteMany({ [field]: { $in: auctionIds } });
    console.log(`  ${name}: removed ${res.deletedCount}`);
  }

  if (DELETE_PURCHASES && purchaseCount > 0) {
    const res = await db.collection('purchases').deleteMany({ auctionId: { $in: auctionIds } });
    console.log(`  purchases: removed ${res.deletedCount}`);
  }

  // Pull auction entries out of wishlists rather than deleting the wishlist
  const wl = await db
    .collection('wishlists')
    .updateMany({}, { $pull: { items: { auctionId: { $in: auctionIds } } } })
    .catch((e) => ({ modifiedCount: `error: ${e.message}` }));
  console.log(`  wishlists: cleaned ${wl.modifiedCount}`);

  // Detach assigned tasks from auction managers
  const am = await db
    .collection('auctionmanagers')
    .updateMany({}, { $pull: { assignedTasks: { $in: auctionIds } } })
    .catch((e) => ({ modifiedCount: `error: ${e.message}` }));
  console.log(`  auctionmanagers.assignedTasks: cleaned ${am.modifiedCount}`);

  const res = await auctions.deleteMany({});
  console.log(`  auctionrequests: removed ${res.deletedCount}`);

  console.log(`\nRemaining auctionrequests: ${await auctions.countDocuments()}`);
  console.log('Done.');

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
