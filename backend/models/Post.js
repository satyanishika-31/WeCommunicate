const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: [
        "GENERAL",
        "NOTICE",
        "EVENT",
        "BUSINESS"
      ],
      default: "GENERAL"
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    image: {
      type: String
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },

        text: {
          type: String,
          required: true
        },

        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Block"
    },

    isPinned: {
      type: Boolean,
      default: false
    },

    isUrgent: {
      type: Boolean,
      default: false
    },

    acknowledgements: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        acknowledgedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Post", postSchema);