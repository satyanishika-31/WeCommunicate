const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  rsvpEvent
} = require("../controllers/eventController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");


// Get events
router.get(
  "/",
  protect,
  getEvents
);

// Get event
router.get(
  "/:id",
  protect,
  getEventById
);

// Create event
router.post(
  "/",
  protect,
  authorize("ADMIN", "COMMUNITY_HEAD", "BLOCK_MANAGER"),
  upload.fields([{ name: "poster", maxCount: 1 }, { name: "image", maxCount: 1 }]),
  createEvent
);

// Update event
router.put(
  "/:id",
  protect,
  authorize("ADMIN", "COMMUNITY_HEAD", "BLOCK_MANAGER"),
  upload.fields([{ name: "poster", maxCount: 1 }, { name: "image", maxCount: 1 }]),
  updateEvent
);

// Delete event
router.delete(
  "/:id",
  protect,
  authorize("ADMIN", "COMMUNITY_HEAD", "BLOCK_MANAGER"),
  deleteEvent
);

// RSVP
router.post(
  "/:id/rsvp",
  protect,
  rsvpEvent
);


module.exports = router;