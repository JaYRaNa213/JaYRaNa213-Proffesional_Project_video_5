
import mongoose from "mongoose";
import { DB_name } from "../constants.js";  // Import DB name from constants

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Use the MongoDB URI and append the DB name
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`\nMongoDB connected! DB Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);  // Exit process with failure code if connection fails
  }
};

export default connectDB;