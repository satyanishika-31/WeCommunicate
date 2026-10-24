const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser
  ,approveUser
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");


// Get all users
router.get(
  "/",
  protect,
  authorize("ADMIN", "COMMUNITY_HEAD", "BLOCK_MANAGER", "USER"),
  getUsers
);

router.put("/:id/approve", protect, authorize("ADMIN", "COMMUNITY_HEAD", "BLOCK_MANAGER"), approveUser);

// Get user by ID
router.get(
  "/:id",
  protect,
  getUserById
);

// Update user
router.put(
  "/:id",
  protect,
  updateUser
);

// Delete user
router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  deleteUser
);


module.exports = router;