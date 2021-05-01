const Comment = require('../models/comment');
const Blog = require('../models/blog');

module.exports.createNewComment = async (req, res, next) => {
    req.body.comment.body = req.sanitize(req.body.comment.body); //express sanitize
    const blog = await Blog.findById(req.params.id)
    blog.author = req.user._id;
    const comment = new Comment(req.body.comment)
    comment.author = req.user._id;
    blog.comments.push(comment)
    await comment.save()
    await blog.save()
    req.flash('success', 'comment posted!')
    res.redirect("/blogs/"+req.params.id)
}

module.exports.deleteComment = async (req, res, next) => {
    const deleted = await Comment.findByIdAndRemove(req.params.commentId)
    req.flash('success', 'comment deleted successfully.')
    res.redirect("/blogs/"+req.params.id)
}