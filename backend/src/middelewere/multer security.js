import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb (null, 'uploads')
    },
    filename: function (req, file, cb){
        const ext = path.extname(file.originalname);
        cb(null, `${uuid}${ext}`);
    }
})

const upload = multer({ storage: storage });

export default upload;