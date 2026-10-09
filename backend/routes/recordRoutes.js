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

// Get records (all authenticated residents can read)
router.get("/", protect, getRecords);

// Create record (Admin and Block Managers)
router.post(
  "/",
  protect,
  authorize("ADMIN", "BLOCK_MANAGER"),
  upload.single("document"),
  createRecord
);

// Delete record (Admin only)
router.delete("/:id", protect, authorize("ADMIN"), deleteRecord);

module.exports = router;
