import dotenv from 'dotenv';
import connectDB from '../database/index.js';
import { app } from '../app.js';

dotenv.config();

// Initialize DB connection
connectDB()
    .then(() => {
        console.log("✅ MongoDB connected");
    })
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err);
    });

// Export the app for Vercel's serverless handler
export default app;
