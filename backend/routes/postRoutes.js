const express = require("express");
const router = express.Router();

const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  deleteMyPosts,
  togglePinPost,
  acknowledgePost,
  getAcknowledgements,
  remindNonAcknowledgers,
  likePost,
  commentPost,
  deleteComment
} = require("../controllers/postController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validationMiddleware");
const { body } = require("express-validator");


// Get feed
router.get(
  "/",
  protect,
  getPosts
);

// Get single post
router.get(
  "/:id",
  protect,
  getPostById
);

router.get("/:id/acknowledgements", protect, getAcknowledgements);
router.post("/:id/remind-non-acknowledgers", protect, remindNonAcknowledgers);

// Create post with image
router.post(
  "/",
  protect,
  upload.single("image"),
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  validate,
  createPost
);

// Delete all posts created by the current user
router.delete(
  "/mine",
  protect,
  deleteMyPosts
);

// Update post
router.put(
  "/:id",
  protect,
  upload.single("image"),
  updatePost
);

// Delete post
router.delete(
  "/:id",
  protect,
  deletePost
);

// Toggle Pin / Unpin
router.patch(
  "/:id/pin",
  protect,
  togglePinPost
);

// Acknowledge Notice Receipt
router.post(
  "/:id/acknowledge",
  protect,
  acknowledgePost
);

// Like / Unlike
router.post(
  "/:id/like",
  protect,
  likePost
);

// Comment
router.post(
  "/:id/comment",
  protect,
  commentPost
);


// Delete comment
router.delete("/:id/comment/:commentId", protect, deleteComment);

module.exports = router;