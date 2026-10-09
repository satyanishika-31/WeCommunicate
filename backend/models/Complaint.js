const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true
    },

    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Block"
    },

    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House"
    },

    flatNumber: {
      type: String
    },

    intakeRoute: {
      type: String,
      enum: [
        "RESIDENT_APP",
        "SECURITY_GUARD",
        "OFFICE_REGISTER",
        "PHONE_ESCALATION",
        "OTHER"
      ],
      default: "RESIDENT_APP"
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
      default: "MAINTENANCE"
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

    assignedHandlerName: {
      type: String
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    resolutionNotes: {
      type: String
    },

    resolvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);