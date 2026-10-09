const fs = require('fs');
let c = fs.readFileSync('controllers/postController.js', 'utf8');
let fn = `\n\n// DELETE COMMENT
const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isPostAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "ADMIN";

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment"
      });
    }

    post.comments.pull(commentId);
    await post.save();
    await post.populate("comments.user", "name profileImage");

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      comments: post.comments,
      post
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};``;

if (!c.includes('deleteComment')) {
  const exportIdx = c.lastIndexOf('module.exports');
  c = c.slice(0, exportIdx) + fn+ '\n\n' + c.slice(exportIdx);
  c = c.replace('commentPost', 'commentPost,\n  deleteComment');
  fs.writeFileSync('controllers/postController.js', c, 'utf8');
  console.log('PostController patched successfully');
} else {
  console.log('Already patched');
}
