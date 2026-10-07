const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Block",
      required: true
    },

    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    category: {
      type: String,
      enum: [
        "WATER",
        "ELECTRICITY",
        "LIFT",
        "CLEANING",
        "SECURITY",
        "PARKING",
        "MAINTENANCE",
        "OTHER"
      ],
      required: true
    },

    image: {
      type: String
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "IN_PROGRESS",
        "RESOLVED"
      ],
      default: "PENDING"
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);