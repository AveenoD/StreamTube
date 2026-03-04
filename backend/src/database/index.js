import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

let isConnected = false; // Cache the connection

const connectDB = async () => {
    // Disable buffering so it throws an error immediately if not connected
    // instead of waiting 10 seconds and timing out.
    mongoose.set('bufferCommands', false); 

    if (isConnected) {
        return;
    }

    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 10s
        });
        
        isConnected = !!connectionInstance.connections[0].readyState;
        console.log(`✅ MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("❌ MongoDB connection FAILED: ", error);
        throw error;
    }
};

export default connectDB;
