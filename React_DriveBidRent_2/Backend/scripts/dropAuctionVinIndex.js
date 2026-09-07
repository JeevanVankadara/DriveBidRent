// Backend/scripts/dropAuctionVinIndex.js
//
// One-off migration. Run once after deploying the simplified Add Auction form:
//
//   node scripts/dropAuctionVinIndex.js
//
// Why this is needed:
// VIN is no longer collected on the form, so new auctions are saved with no
// vehicleDocumentation.vinNumber. The old index on that field was unique but
// NOT sparse, and MongoDB treats a missing field as null — so the first
// VIN-less auction saves fine and every one after it fails with E11000
// duplicate key. This drops the old index; Mongoose then recreates it as
// { unique: true, sparse: true } from the schema, which ignores missing values.
//
// Safe to re-run: if the index is already gone it just reports that and exits.
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const INDEX_NAME = 'vehicleDocumentation.vinNumber_1';

const run = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected. Database: ${mongoose.connection.name}`);

    const collection = mongoose.connection.db.collection('auctionrequests');

    const before = await collection.indexes();
    console.log('\nCurrent indexes:');
    before.forEach((i) => console.log(`- ${i.name}${i.unique ? ' (unique)' : ''}${i.sparse ? ' (sparse)' : ''}`));

    const existing = before.find((i) => i.name === INDEX_NAME);

    if (!existing) {
      console.log(`\n✓ ${INDEX_NAME} does not exist — nothing to do.`);
    } else if (existing.sparse) {
      console.log(`\n✓ ${INDEX_NAME} is already sparse — nothing to do.`);
    } else {
      await collection.dropIndex(INDEX_NAME);
      console.log(`\n✓ Dropped ${INDEX_NAME}`);
      console.log('  Mongoose will recreate it as unique + sparse on next boot.');
    }

    const after = await collection.indexes();
    console.log('\nRemaining indexes:');
    after.forEach((i) => console.log(`- ${i.name}`));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

run();
