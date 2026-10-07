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
  authorize("ADMIN", "BLOCK_MANAGER"),
  upload.single("poster"),
  createEvent
);

// Update event
router.put(
  "/:id",
  protect,
  authorize("ADMIN", "BLOCK_MANAGER"),
  upload.single("poster"),
  updateEvent
);

// Delete event
router.delete(
  "/:id",
  protect,
  authorize("ADMIN", "BLOCK_MANAGER"),
  deleteEvent
);

// RSVP
router.post(
  "/:id/rsvp",
  protect,
  rsvpEvent
);


module.exports = router;