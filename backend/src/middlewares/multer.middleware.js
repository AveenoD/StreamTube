// import multer from "multer";
// import path from "path";
// import { fileURLToPath } from 'url';
// import fs from 'fs';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


// const tempDir = path.join(__dirname, '../../public/temp');


// if (!fs.existsSync(tempDir)) {
//     fs.mkdirSync(tempDir, { recursive: true });
//     console.log('✅ Created directory:', tempDir);
// }

// const storage = multer.diskStorage({
//     destination: function(req, file, cb){
//         cb(null, tempDir);
//     },
//     filename: function (req, file, cb){
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });

// export const upload = multer({ 
//     storage: storage,
//     limits: {
//         fileSize: 100 * 1024 * 1024 
//     }
// });

import multer from "multer";
import os from "os"; // Use os.tmpdir() for cross-platform compatibility

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        // Change this to use the system temp directory
        cb(null, os.tmpdir()); 
    },
    filename: function (req, file, cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

export const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});
