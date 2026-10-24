const multer = require("multer");

const path = require("path");
const fs = require("fs");

const uploadsPath = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsPath, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsPath,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`);
  }
});

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG and WEBP images are allowed"));
    }
  }
});

const recordsUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if ((file.mimetype && file.mimetype.startsWith("image/")) || allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, DOCX and image files are allowed"));
    }
  }
});

module.exports = upload;
module.exports.records = recordsUpload;