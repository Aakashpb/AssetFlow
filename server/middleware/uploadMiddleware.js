import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Setup directories
const uploadsDir = './uploads';
const profilePicsDir = './uploads/profile_pictures';
const assetImagesDir = './uploads/asset_images';

[uploadsDir, profilePicsDir, assetImagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profilePicture') {
      cb(null, profilePicsDir);
    } else {
      cb(null, assetImagesDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimeCheck = allowedTypes.test(file.mimetype);
  const extCheck = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeCheck && extCheck) {
    cb(null, true);
  } else {
    cb(new Error('Invalid File Type: Only JPEG, PNG, or WEBP image formats are permitted.'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB maximum
  fileFilter
});
