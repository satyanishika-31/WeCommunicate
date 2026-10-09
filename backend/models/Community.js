const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    totalBlocks: { type: Number, default: 0 },
    totalFlats: { type: Number, default: 0 },
    managerName: { type: String, trim: true },
    residentCount: { type: Number, default: 0 },
    communityHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    blocksList: [{ type: String, trim: true }],
    flatsList: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Community", communitySchema);
