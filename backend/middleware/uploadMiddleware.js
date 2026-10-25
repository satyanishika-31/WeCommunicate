const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { isCloudinaryConfigured, uploadBufferToCloudinary } = require("../config/cloudinary");

const uploadsPath = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsPath, { recursive: true });

// Memory storage keeps files in RAM so they are never saved to disk when using Cloudinary
const memoryStorage = multer.memoryStorage();

const multerImage = multer({
  storage: memoryStorage,
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

const multerRecord = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if ((file.mimetype && file.mimetype.startsWith("image/")) || allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, DOCX and image files are allowed"));
    }
  }
});

/**
 * Upload all files attached to req (single or multiple) to Cloudinary.
 * If Cloudinary is not configured, fall back to writing to uploads/ directory.
 */
const processUploadedFiles = async (req, folder = "we_communicate") => {
  const filesToProcess = [];

  if (req.file) {
    filesToProcess.push(req.file);
  }

  if (req.files) {
    if (Array.isArray(req.files)) {
      filesToProcess.push(...req.files);
    } else if (typeof req.files === "object") {
      Object.values(req.files).forEach((group) => {
        if (Array.isArray(group)) filesToProcess.push(...group);
      });
    }
  }

  if (filesToProcess.length === 0) return;

  const configured = isCloudinaryConfigured();

  for (const file of filesToProcess) {
    if (!file.buffer) continue;

    if (configured) {
      try {
        const result = await uploadBufferToCloudinary(file.buffer, {
          folder,
          resource_type: "auto"
        });
        file.secure_url = result.secure_url;
        file.url = result.secure_url;
        file.path = result.secure_url;
        file.filename = result.public_id;
      } catch (err) {
        console.error("[Cloudinary] Upload failed:", err.message);
        throw new Error(`Cloudinary upload failed: ${err.message}`);
      }
    } else {
      // Local fallback if Cloudinary credentials are not present in .env
      const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const filePath = path.join(uploadsPath, safeName);
      fs.writeFileSync(filePath, file.buffer);

      const localUrl = `/uploads/${safeName}`;
      file.filename = safeName;
      file.path = localUrl;
      file.url = localUrl;
      file.secure_url = localUrl;
      console.warn(`[Upload] Cloudinary credentials not configured in backend/.env. Saved to local disk (${localUrl}). Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to upload to Cloudinary.`);
    }
  }
};

const wrapWithCloudinary = (multerMiddleware, folder = "we_communicate") => {
  return (req, res, next) => {
    multerMiddleware(req, res, async (err) => {
      if (err) return next(err);
      try {
        await processUploadedFiles(req, folder);
        next();
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: uploadError.message
        });
      }
    });
  };
};

const upload = {
  single: (fieldName, folder = "we_communicate") =>
    wrapWithCloudinary(multerImage.single(fieldName), folder),

  array: (fieldName, maxCount = 5, folder = "we_communicate") =>
    wrapWithCloudinary(multerImage.array(fieldName, maxCount), folder),

  fields: (fieldsArray, folder = "we_communicate") =>
    wrapWithCloudinary(multerImage.fields(fieldsArray), folder),

  any: (folder = "we_communicate") =>
    wrapWithCloudinary(multerImage.any(), folder)
};

const recordsUpload = {
  single: (fieldName, folder = "we_communicate/records") =>
    wrapWithCloudinary(multerRecord.single(fieldName), folder),

  fields: (fieldsArray, folder = "we_communicate/records") =>
    wrapWithCloudinary(multerRecord.fields(fieldsArray), folder)
};

upload.records = recordsUpload;

module.exports = upload;