const express = require("express");
const router = express.Router();
const {
  getRecords,
  createRecord,
  deleteRecord
} = require("../controllers/recordController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const recordsUpload = upload.records;
const validate = require("../middleware/validationMiddleware");
const { body } = require("express-validator");

// Get records (all authenticated residents can read)
router.get("/", protect, getRecords);

// Create record (Admin and Block Managers)
router.post(
  "/",
  protect,
  authorize("ADMIN", "COMMUNITY_HEAD", "BLOCK_MANAGER"),
  recordsUpload.single("document"),
  body("title").trim().notEmpty().withMessage("Record title is required"),
  validate,
  createRecord
);

// Delete record (Admin only)
router.delete("/:id", protect, authorize("ADMIN"), deleteRecord);

module.exports = router;
