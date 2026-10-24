const mongoose = require("mongoose");

const communityNameLockSchema = new mongoose.Schema(
  {
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommunityNameLock", communityNameLockSchema);
