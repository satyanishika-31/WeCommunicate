const express = require("express");
const router = express.Router();

const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  commentPost
} = require("../controllers/postController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");


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

// Create post with image
router.post(
  "/",
  protect,
  upload.single("image"),
  createPost
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


module.exports = router;