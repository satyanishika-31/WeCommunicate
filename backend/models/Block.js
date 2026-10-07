const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    blockNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    totalHouses: {
      type: Number,
      default: 0
    },

    description: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Block", blockSchema);