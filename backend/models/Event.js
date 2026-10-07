const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    poster: {
      type: String
    },

    date: {
      type: Date,
      required: true
    },

    time: {
      type: String
    },

    venue: {
      type: String,
      required: true
    },

    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Block"
    },

    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Event", eventSchema);