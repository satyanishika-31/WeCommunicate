const Event = require("../models/Event");
const User = require("../models/User");
const createNotifications = require("../utils/createNotification");


// CREATE EVENT
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      venue,
      block
    } = req.body;

    const poster = req.file ? `/uploads/${req.file.filename}` : null;

    const event = await Event.create({
      createdBy: req.user._id,
      title,
      description,
      poster,
      date,
      time,
      venue,
      community: req.user.community || null,
      block: block || req.user.block || null
    });
    const recipients = await User.find({ community: req.user.community }, "_id");
    await createNotifications({
      recipients: recipients.map((user) => user._id),
      type: "EVENT",
      title: "New community event",
      message: event.title,
      relatedId: event._id
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET EVENTS
const getEvents = async (req, res) => {
  try {
    const communityFilter = req.user.community
      ? {
          $or: [
            { community: req.user.community },
            { community: { $exists: false } },
            { community: null }
          ]
        }
      : {};

    const events = await Event.find(communityFilter)
      .populate("createdBy", "name")
      .populate("block", "name blockNumber")
      .populate("attendees", "name")
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET EVENT
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "name")
      .populate("block", "name blockNumber")
      .populate("attendees", "name");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.status(200).json({
      success: true,
      event
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// UPDATE EVENT
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }
    if (event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "ADMIN" &&
      (req.user.role !== "COMMUNITY_HEAD" || event.community !== req.user.community)) {
      return res.status(403).json({ success: false, message: "You are not authorized to update this event" });
    }
    ["title", "description", "date", "time", "venue", "block"].forEach((field) => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });
    if (req.file) event.poster = `/uploads/${req.file.filename}`;
    await event.save();

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// DELETE EVENT
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }
    if (event.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "ADMIN" &&
      (req.user.role !== "COMMUNITY_HEAD" || event.community !== req.user.community)) {
      return res.status(403).json({ success: false, message: "You are not authorized to delete this event" });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// RSVP
const rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    const alreadyJoined = event.attendees.includes(req.user._id);

    if (alreadyJoined) {
      event.attendees = event.attendees.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      event.attendees.push(req.user._id);
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: alreadyJoined
        ? "RSVP cancelled"
        : "RSVP successful",
      event
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  rsvpEvent
};