
import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Import all models
import './models/User.js';
import './models/RentalRequest.js';
import './models/AuctionRequest.js';
import './models/Chat.js';
import './models/Message.js';
import RentalReview from './models/RentalReview.js';
import RentalCost from './models/RentalCost.js';

const loadEnv = () => {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            envConfig.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    process.env[key.trim()] = value.trim();
                }
            });
            console.log('Loaded .env manually');
        }
    } catch (e) {
        console.error('Error loading .env:', e);
    }
};

loadEnv();

const seedReview = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!uri) {
            console.error('MONGODB_URI is not defined.');
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // Find a rental cost
        const rentalCosts = await RentalCost.find({});
        console.log(`Found ${rentalCosts.length} rental costs.`);

        if (rentalCosts.length === 0) {
            console.log('No rental costs found.');
            process.exit(1);
        }

        const rentalCost = rentalCosts[0];
        console.log('First rental cost:', JSON.stringify(rentalCost, null, 2));

        if (!rentalCost.buyerId) {
            console.error('Rental cost has no buyerId.');
            process.exit(1);
        }

        // Check if review already exists
        const existingReview = await RentalReview.findOne({
            rentalCarId: rentalCost.rentalCarId,
            buyerId: rentalCost.buyerId
        });

        if (existingReview) {
            console.log('Review already exists for this rental.');
            process.exit(0);
        }

        // Create review
        const review = new RentalReview({
            rentalCarId: rentalCost.rentalCarId,
            buyerId: rentalCost.buyerId,
            rating: 5,
            comment: 'This is a test review seeded by the developer. The car was amazing!'
        });

        await review.save();
        console.log('Review seeded successfully:', review);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedReview();
