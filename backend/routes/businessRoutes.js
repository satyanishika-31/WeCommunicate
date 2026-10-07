const express = require("express");
const router = express.Router();

const {
  createBusiness,
  getBusinesses,
  getBusinessById,
  updateBusiness,
  approveBusiness,
  pauseBusiness,
  resumeBusiness,
  closeBusiness,
  deleteBusiness
} = require("../controllers/businessController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");


// Get all businesses
router.get(
  "/",
  protect,
  getBusinesses
);

// Get business
router.get(
  "/:id",
  protect,
  getBusinessById
);

// Create business
router.post(
  "/",
  protect,
  upload.array("images", 5),
  createBusiness
);

// Update business
router.put(
  "/:id",
  protect,
  upload.array("images", 5),
  updateBusiness
);

// Approve business
router.put(
  "/:id/approve",
  protect,
  authorize("ADMIN", "BLOCK_MANAGER"),
  approveBusiness
);

// Pause business
router.put(
  "/:id/pause",
  protect,
  pauseBusiness
);

// Resume business
router.put(
  "/:id/resume",
  protect,
  resumeBusiness
);

// Close business
router.put(
  "/:id/close",
  protect,
  closeBusiness
);

// Delete business
router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  deleteBusiness
);


module.exports = router;