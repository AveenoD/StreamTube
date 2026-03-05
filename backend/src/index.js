import dotenv from 'dotenv';
dotenv.config();
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, './env') });

console.log('✅ ENV LOADED!');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

import connectDB from './database/index.js';
import { app } from './app.js';

connectDB()
.then(() => {
    console.log('✅ MongoDB connected');
    
    const PORT = process.env.PORT || 8000;
    
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
})
.catch((error) => {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
});