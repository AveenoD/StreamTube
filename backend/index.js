import dotenv from 'dotenv';
import connectDB from './src/database/index.js';
import { app } from './src/app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start the server  
connectDB()
  .then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });   




