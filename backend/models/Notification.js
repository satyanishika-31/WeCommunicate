const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: [
        "NEW_BUSINESS",
        "NEW_NOTICE",
        "COMPLAINT_UPDATE",
        "EVENT",
        "GENERAL"
      ],
      required: true
    },

    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);