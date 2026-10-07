const express = require("express");
const router = express.Router();

const {
  createHouse,
  getHouses,
  getHouseById,
  updateHouse,
  deleteHouse,
  addResident
} = require("../controllers/houseController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");


// Get all houses
router.get(
  "/",
  protect,
  authorize("ADMIN", "BLOCK_MANAGER"),
  getHouses
);

// Get house
router.get(
  "/:id",
  protect,
  getHouseById
);

// Create house
router.post(
  "/",
  protect,
  authorize("ADMIN"),
  createHouse
);

// Update house
router.put(
  "/:id",
  protect,
  authorize("ADMIN", "BLOCK_MANAGER"),
  updateHouse
);

// Delete house
router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  deleteHouse
);

// Add resident
router.put(
  "/:id/resident",
  protect,
  authorize("ADMIN", "BLOCK_MANAGER"),
  addResident
);


module.exports = router;