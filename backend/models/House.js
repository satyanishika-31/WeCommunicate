const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema(
  {
    houseNumber: {
      type: String,
      required: true
    },

    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Block",
      required: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    residents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    status: {
      type: String,
      enum: [
        "OWNER_OCCUPIED",
        "TENANT_OCCUPIED",
        "VACANT"
      ],
      default: "VACANT"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("House", houseSchema);