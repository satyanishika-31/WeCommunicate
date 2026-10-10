const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
  getCommunities,
  createCommunity,
  deleteCommunity,
  setCommunityHead,
  getCommunityDetails,
  createBlockManager,
  assignBlockManager
} = require("../controllers/communityController");

router.get("/", protect, getCommunities);
router.post("/", protect, authorize("ADMIN"), createCommunity);
router.delete("/:id", protect, authorize("ADMIN"), deleteCommunity);

// Community Details (Accessible to ADMIN and COMMUNITY_HEAD)
router.get("/:id/details", protect, authorize("ADMIN", "COMMUNITY_HEAD"), getCommunityDetails);

// Assign or create Community Head credentials (ADMIN only)
router.post("/:id/assign-head", protect, authorize("ADMIN"), setCommunityHead);

// Assign existing resident as Block Manager (COMMUNITY_HEAD or ADMIN)
router.post("/:id/assign-block-manager", protect, authorize("COMMUNITY_HEAD", "ADMIN"), assignBlockManager);

// Legacy create credentials for Block Manager
router.post("/:id/create-block-manager", protect, authorize("ADMIN", "COMMUNITY_HEAD"), createBlockManager);

module.exports = router;

