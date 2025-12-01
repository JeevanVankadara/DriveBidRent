
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

const checkReviews = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        console.log('Mongo URI:', uri ? 'Defined' : 'Undefined');

        if (!uri) {
            console.error('MONGODB_URI is not defined.');
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const reviews = await RentalReview.find({}).populate('buyerId').populate('rentalCarId');
        console.log(`Found ${reviews.length} reviews.`);

        if (reviews.length > 0) {
            console.log('Sample review:', JSON.stringify(reviews[0], null, 2));
        } else {
            console.log('No reviews found.');
        }

        const costs = await RentalCost.find({});
        console.log(`Found ${costs.length} rental costs.`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkReviews();
