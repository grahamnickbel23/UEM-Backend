import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { fileCleanupQueue } from '../quene/genaral quene.js';
import logger from '../logger/log logger.js';

// storage of just uploaded file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); 
  },

  // renaming of just uploaded file
  filename: async function (req, file, cb) {
    const actualName = file.originalname;
    const ext = path.extname(file.originalname);
    const newName = `${uuid()}${ext}`
    const filePath = path.join("uploads", newName);
    cb(null, newName); 

  // Schedule file deletion after 10 minutes
  await fileCleanupQueue.add(
    "deleteFile",
    { filePath },
    { delay: 10 * 60 * 1000 } // 10 minutes
  );

  // genarate log after sucessful execution
  logger.info(`${req.requestId} 
    input: ${actualName }
    MULTER sucessful 
    returning: ${newName}`)
  },
});

const upload = multer({ storage });

export default upload;