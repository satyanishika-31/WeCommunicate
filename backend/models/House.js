const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema(
  {
    houseNumber: {
      type: String,
      required: true
    },

    flatNumber: {
      type: String
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

houseSchema.pre("save", function() {
  if (this.houseNumber && !this.flatNumber) {
    this.flatNumber = this.houseNumber;
  } else if (this.flatNumber && !this.houseNumber) {
    this.houseNumber = this.flatNumber;
  }
});

module.exports = mongoose.model("House", houseSchema);