const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  approveUser,
  rejectUser
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

router.put("/:id/approve", protect, authorize("ADMIN", "COMMUNITY_HEAD"), approveUser);
router.put("/:id/reject", protect, authorize("ADMIN", "COMMUNITY_HEAD"), rejectUser);

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
  authorize("ADMIN", "COMMUNITY_HEAD"),
  deleteUser
);


module.exports = router;