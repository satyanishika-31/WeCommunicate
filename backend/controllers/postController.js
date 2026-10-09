const Post = require("../models/Post");


// CREATE POST
const createPost = async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      image: imageUrl,
      block,
      isUrgent
    } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : (imageUrl || null);

    const post = await Post.create({
      author: req.user._id,
      type,
      title,
      description,
      image,
      block,
      isUrgent: isUrgent === true || isUrgent === 'true'
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET FEED
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name profileImage")
      .populate("block", "name blockNumber")
      .populate("comments.user", "name profileImage")
      .populate("acknowledgements.user", "name houseNumber email")
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET POST
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name profileImage")
      .populate("block", "name blockNumber")
      .populate("comments.user", "name profileImage");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    res.status(200).json({
      success: true,
      post
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// UPDATE POST
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    post.title = req.body.title || post.title;
    post.description = req.body.description || post.description;
    post.type = req.body.type || post.type;

    if (req.file) {
      post.image = `/uploads/${req.file.filename}`;
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// DELETE POST
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this post"
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// TOGGLE PIN POST
const togglePinPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to pin or unpin this post"
      });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.status(200).json({
      success: true,
      message: post.isPinned ? "Post pinned to top" : "Post unpinned",
      isPinned: post.isPinned,
      post
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ACKNOWLEDGE NOTICE / POST (Delivery Confirmation)
const acknowledgePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Notice / Post not found"
      });
    }

    if (!post.acknowledgements) {
      post.acknowledgements = [];
    }

    const alreadyAcked = post.acknowledgements.some(
      (a) => a.user?.toString() === req.user._id.toString()
    );

    if (alreadyAcked) {
      post.acknowledgements = post.acknowledgements.filter(
        (a) => a.user?.toString() !== req.user._id.toString()
      );
    } else {
      post.acknowledgements.push({
        user: req.user._id,
        acknowledgedAt: new Date()
      });
    }

    await post.save();
    await post.populate("acknowledgements.user", "name houseNumber email");

    res.status(200).json({
      success: true,
      message: alreadyAcked ? "Notice acknowledgement removed" : "Notice confirmed and acknowledged",
      acknowledged: !alreadyAcked,
      acknowledgementsCount: post.acknowledgements.length,
      acknowledgements: post.acknowledgements
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// LIKE / UNLIKE
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const alreadyLiked = post.likes.includes(req.user._id);

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likes: post.likes.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// COMMENT
const commentPost = async (req, res) => {
  try {
    const { text } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    post.comments.push({
      user: req.user._id,
      text
    });

    await post.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      post
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// DELETE COMMENT
const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isPostAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';
    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this comment' });
    }
    post.comments.pull(commentId);
    await post.save();
    await post.populate('comments.user', 'name profileImage');
    res.status(200).json({ success: true, message: 'Comment deleted successfully', comments: post.comments, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  togglePinPost,
  acknowledgePost,
  likePost,
  commentPost,
  deleteComment
};