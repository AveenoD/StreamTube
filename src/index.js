import dotenv from 'dotenv';
dotenv.config({path: './.env'});
import connectDB from './database/index.js'
import { app } from './app.js';


connectDB()
.then( ()=>{
    app.on('error', (error)=>{
        console.log("Error starting the server: ", error);
    });
    app.listen(process.env.PORT || 3000, ()=>{
        console.log(`🚀 Server is running on port ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.log("Error connecting to MongoDB: ", error);
});