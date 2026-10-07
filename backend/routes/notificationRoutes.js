const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");


// Get my notifications
router.get(
  "/",
  protect,
  getNotifications
);

// Mark one as read
router.put(
  "/:id/read",
  protect,
  markAsRead
);

// Mark all as read
router.put(
  "/read-all",
  protect,
  markAllAsRead
);

// Delete notification
router.delete(
  "/:id",
  protect,
  deleteNotification
);


module.exports = router;