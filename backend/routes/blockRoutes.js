const express = require("express");
const router = express.Router();

const {
  createBlock,
  getBlocks,
  getBlockById,
  updateBlock,
  deleteBlock,
  assignManager
} = require("../controllers/blockController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");


// Get all blocks
router.get(
  "/",
  protect,
  authorize("ADMIN", "BLOCK_MANAGER", "USER"),
  getBlocks
);

// Get single block
router.get(
  "/:id",
  protect,
  authorize("ADMIN", "BLOCK_MANAGER", "USER"),
  getBlockById
);

// Create block
router.post(
  "/",
  protect,
  authorize("ADMIN"),
  createBlock
);

// Update block
router.put(
  "/:id",
  protect,
  authorize("ADMIN"),
  updateBlock
);

// Delete block
router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  deleteBlock
);

// Assign block manager
router.put(
  "/:id/manager",
  protect,
  authorize("ADMIN"),
  assignManager
);


module.exports = router;