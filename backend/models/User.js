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

    flatNumber: {
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

    assignedDate: {
      type: Date
    },

    profileImage: {
      type: String
    },

    isApproved: {
      type: Boolean,
      default: true
    },

    isRejected: {
      type: Boolean,
      default: false
    },

    rejectionReason: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.pre("save", function () {
  if (this.houseNumber && !this.flatNumber) {
    this.flatNumber = this.houseNumber;
  } else if (this.flatNumber && !this.houseNumber) {
    this.houseNumber = this.flatNumber;
  }
});

module.exports = mongoose.model("User", userSchema);