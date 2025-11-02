const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://Jeevan:Bunny123@cluster0.2jrrwqn.mongodb.net/DriveBidRent");
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Could not connect to MongoDB", err);
    process.exit(1);
  }
};

module.exports = connectDB;