const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: [
        "BYLAWS",
        "AGM_MINUTES",
        "COMMITTEE_HANDOVER",
        "FINANCIAL_AUDIT",
        "VENDOR_CONTRACT",
        "SOCIETY_RESOLUTION"
      ],
      default: "BYLAWS"
    },
    description: {
      type: String,
      trim: true
    },
    documentUrl: {
      type: String
    },
    referenceCode: {
      type: String
    },
    effectiveDate: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    community: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Record", recordSchema);
