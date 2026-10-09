const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    phone: {
      type: String
    },

    community: {
      type: String,
      trim: true
    },

    houseNumber: {
      type: String,
      trim: true
    },

    role: {
      type: String,
      enum: ["ADMIN", "COMMUNITY_HEAD", "BLOCK_MANAGER", "USER"],
      default: "USER"
    },

    residentType: {
      type: String,
      enum: ["OWNER", "TENANT"]
    },

    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House"
    },

    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Block"
    },

    profileImage: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);