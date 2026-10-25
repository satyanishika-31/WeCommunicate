const Post = require("../models/Post");
const User = require("../models/User");
const createNotifications = require("../utils/createNotification");


// CREATE POST
const createPost = async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      image: imageUrl,
      block,
      community: targetCommunity,
      isUrgent
    } = req.body;
    if (type === "NOTICE" && !["ADMIN", "COMMUNITY_HEAD", "BLOCK_MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Only community managers can publish notices" });
    }

    const fileUrl = req.file ? (req.file.secure_url || req.file.url || req.file.path || `/uploads/${req.file.filename}`) : null;
    const image = fileUrl || (typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : null);

    // Resolve post community (enforces community isolation even if admin posts)
    let community = (targetCommunity || req.user.community || "").trim();

    if (!community && block) {
      const Block = require("../models/Block");
      const blockDoc = await Block.findById(block);
      if (blockDoc?.community) community = blockDoc.community.trim();
    }

    if (!community && req.user.role === "ADMIN") {
      const Community = require("../models/Community");
      const defaultComm = await Community.findOne({}).sort({ createdAt: 1 });
      if (defaultComm) community = defaultComm.name.trim();
    }

    if (!community) {
      return res.status(400).json({
        success: false,
        message: "A target community is required to publish this post."
      });
    }

    const post = await Post.create({
      author: req.user._id,
      type,
      title,
      description,
      image,
      block,
      community,
      isUrgent: isUrgent === true || isUrgent === 'true'
    });
    if (post.type === "NOTICE") {
      const recipients = await User.find(
        block ? { block } : { community: post.community },
        "_id"
      );
      await createNotifications({
        recipients: recipients.map((user) => user._id),
        type: "NEW_NOTICE",
        title: "New community notice",
        message: post.title,
        relatedId: post._id
      });
    } else if (post.type === "EVENT") {
      const recipients = await User.find({ community: post.community }, "_id");
      await createNotifications({
        recipients: recipients.map((user) => user._id),
        type: "EVENT",
        title: "New community event",
        message: post.title,
        relatedId: post._id
      });
    }

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

const getAcknowledgements = async (req, res) => {
  if (!["ADMIN", "COMMUNITY_HEAD", "BLOCK_MANAGER"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Manager access required" });
  }
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: "Post not found" });
  const filter = post.block ? { block: post.block } : { community: req.user.community };
  const recipients = await User.find(filter, "name houseNumber");
  const acknowledgedIds = new Set(post.acknowledgements.map((item) => item.user.toString()));
  const pending = recipients.filter((user) => !acknowledgedIds.has(user._id.toString()));
  res.json({
    success: true,
    totalRecipients: recipients.length,
    acknowledgedCount: recipients.length - pending.length,
    notAcknowledged: pending
  });
};

const remindNonAcknowledgers = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: "Post not found" });
  const filter = post.block ? { block: post.block } : { community: req.user.community };
  const recipients = await User.find(filter, "_id");
  const acknowledgedIds = new Set(post.acknowledgements.map((item) => item.user.toString()));
  await createNotifications({
    recipients: recipients.filter((user) => !acknowledgedIds.has(user._id.toString())).map((user) => user._id),
    type: "NEW_NOTICE",
    title: "Notice acknowledgement reminder",
    message: post.title,
    relatedId: post._id
  });
  res.json({ success: true, message: "Reminders sent" });
};


// GET FEED
const getPosts = async (req, res) => {
  try {
    let filter = {};
    if (req.query.type) filter.type = req.query.type;

    // Isolate by community so residents and managers see posts of their own community, community-wide, or legacy posts
    const userCommunity = (req.user?.community || "").trim();
    if (userCommunity) {
      const escapedComm = userCommunity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { community: { $regex: new RegExp(`^${escapedComm}$`, 'i') } },
        { community: "All Communities" },
        { community: null },
        { community: { $exists: false } }
      ];
    } else if (req.user?.role === "ADMIN" && req.query.community) {
      const escapedComm = req.query.community.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.community = { $regex: new RegExp(`^${escapedComm}$`, 'i') };
    }

    if (req.query.block) {
      filter.$or = [{ block: req.query.block }, { block: null }, { block: { $exists: false } }];
    }

    const posts = await Post.find(filter)
      .populate("author", "name profileImage community role")
      .populate("block", "name blockNumber")
      .populate("comments.user", "name profileImage")
      .sort({ isPinned: -1, createdAt: -1 });
    const postsWithPrivateAcknowledgements = posts.map((post) => {
      const json = post.toObject();
      json.acknowledgementsCount = post.acknowledgements.length;
      json.acknowledgedByMe = post.acknowledgements.some(
        (ack) => ack.user.toString() === req.user._id.toString()
      );
      delete json.acknowledgements;
      return json;
    });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts: postsWithPrivateAcknowledgements
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

    // Community access boundary:
    const userCommunity = (req.user?.community || "").trim().toLowerCase();
    const postCommunity = (post.community || "").trim().toLowerCase();
    if (userCommunity && postCommunity && userCommunity !== postCommunity && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "This post belongs to another community and cannot be accessed."
      });
    }
    if (post.author.toString() !== req.user._id.toString() &&
      !["ADMIN", "COMMUNITY_HEAD", "BLOCK_MANAGER"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "You are not authorized to update this post" });
    }

    const json = post.toObject();
    json.acknowledgementsCount = post.acknowledgements.length;
    json.acknowledgedByMe = post.acknowledgements.some((ack) => ack.user.toString() === req.user._id.toString());
    delete json.acknowledgements;
    res.status(200).json({
      success: true,
      post: json
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

    if (
      post.author.toString() !== req.user._id.toString() &&
      !["ADMIN", "COMMUNITY_HEAD", "BLOCK_MANAGER"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this post"
      });
    }

    post.title = req.body.title || post.title;
    post.description = req.body.description || post.description;
    post.type = req.body.type || post.type;

    if (req.file) {
      post.image = req.file.secure_url || req.file.url || req.file.path || `/uploads/${req.file.filename}`;
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

    if (post.author.toString() !== req.user._id.toString() &&
      !["ADMIN", "COMMUNITY_HEAD", "BLOCK_MANAGER"].includes(req.user.role)) {
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

// DELETE ALL POSTS CREATED BY THE CURRENT USER
const deleteMyPosts = async (req, res) => {
  try {
    const result = await Post.deleteMany({ author: req.user._id });

    res.status(200).json({
      success: true,
      message: "All your posts were deleted successfully",
      deletedCount: result.deletedCount
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

    const isManager = ["ADMIN", "COMMUNITY_HEAD", "BLOCK_MANAGER"].includes(req.user.role);
    if (!isManager && post.author.toString() !== req.user._id.toString()) {
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
    res.status(200).json({
      success: true,
      message: alreadyAcked ? "Notice acknowledgement removed" : "Notice confirmed and acknowledged",
      acknowledged: !alreadyAcked,
      acknowledgementsCount: post.acknowledgements.length
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
    const isAdmin = req.user.role === "ADMIN";
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
  deleteMyPosts,
  togglePinPost,
  acknowledgePost,
  getAcknowledgements,
  remindNonAcknowledgers,
  likePost,
  commentPost,
  deleteComment
};