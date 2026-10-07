const express = require("express");
const router = express.Router();

const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  updateComplaintStatus,
  assignComplaint,
  deleteComplaint
} = require("../controllers/complaintController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");


// Create complaint
router.post(
  "/",
  protect,
  upload.single("image"),
  createComplaint
);

// Get complaints
router.get(
  "/",
  protect,
  authorize("ADMIN", "BLOCK_MANAGER", "USER"),
  getComplaints
);

// Get single complaint
router.get(
  "/:id",
  protect,
  getComplaintById
);

// Update complaint
router.put(
  "/:id",
  protect,
  authorize("ADMIN", "BLOCK_MANAGER"),
  updateComplaint
);

// Update status
router.put(
  "/:id/status",
  protect,
  authorize("ADMIN", "BLOCK_MANAGER"),
  updateComplaintStatus
);

// Assign complaint
router.put(
  "/:id/assign",
  protect,
  authorize("ADMIN", "BLOCK_MANAGER"),
  assignComplaint
);

// Delete complaint
router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  deleteComplaint
);


module.exports = router;