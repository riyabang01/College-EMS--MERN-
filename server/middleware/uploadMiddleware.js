const multer = require('multer');
const path = require('path');

// 🟣 Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/')); // ✅ uploads folder me file save hogi
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // ✅ Unique filename generate karega
  },
});

// 🟣 File type validation (Only images allowed)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true); // ✅ Only image files allowed
  } else {
    cb(new Error('❌ Only image files are allowed!'), false);
  }
};

// 🟣 Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // ✅ Max size = 5MB
});

module.exports = upload;
