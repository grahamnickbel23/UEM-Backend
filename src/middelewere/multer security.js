import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';
import logger from '../logger/log logger.js';

// storage of just uploaded file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); 
  },

  // renaming of just uploaded file
  filename: function (req, file, cb) {
    const actualName = file.originalname;
    const ext = path.extname(file.originalname);
    const newName = `${uuid()}${ext}`
    cb(null, newName); 

  // genarate log after sucessful execution
  logger.info(`${req.requestId} 
    input: ${actualName }
    MULTER sucessful 
    returning: ${newName}`)
  },
});

const upload = multer({ storage });

export default upload;