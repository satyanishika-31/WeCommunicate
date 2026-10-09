const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    businessName: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      enum: [
        "TAILORING",
        "TUITION",
        "BAKING",
        "BEAUTY",
        "FITNESS",
        "ART",
        "FOOD",
        "OTHER"
      ],
      required: true
    },

    description: {
      type: String,
      required: true
    },

    images: [
      {
        type: String
      }
    ],

    services: [
      {
        name: {
          type: String,
          required: true
        },

        price: {
          type: Number
        }
      }
    ],

    contact: {
      type: String
    },

    timings: {
      type: String
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "ACTIVE",
        "PAUSED",
        "CLOSED"
      ],
      default: "PENDING"
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    reviews: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true
        },
        comment: {
          type: String,
          trim: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Business", businessSchema);