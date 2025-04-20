const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://vipul:vipul123@cluster0.0zocwck.mongodb.net/airportDB';

const connectDB = async () => {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to MongoDB");
    } catch (err) {
      console.error("MongoDB connection error:", err);
    }
  };
  
module.exports = connectDB;

