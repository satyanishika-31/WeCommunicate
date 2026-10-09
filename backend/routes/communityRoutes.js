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
  createBlockManager
} = require("../controllers/communityController");

router.get("/", protect, getCommunities);
router.post("/", protect, authorize("ADMIN"), createCommunity);
router.delete("/:id", protect, authorize("ADMIN"), deleteCommunity);

// Community Details (Accessible to ADMIN and COMMUNITY_HEAD)
router.get("/:id/details", protect, authorize("ADMIN", "COMMUNITY_HEAD"), getCommunityDetails);

// Assign or create Community Head credentials (ADMIN only)
router.post("/:id/assign-head", protect, authorize("ADMIN"), setCommunityHead);

// Create credentials for Block Manager (ADMIN or COMMUNITY_HEAD)
router.post("/:id/create-block-manager", protect, authorize("ADMIN", "COMMUNITY_HEAD"), createBlockManager);

module.exports = router;

