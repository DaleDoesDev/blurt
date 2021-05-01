const express = require('express');
const router = express.Router( {mergeParams: true} );
const blogs = require('../controllers/blogs')
const comments = require('../controllers/comments')
const wrapAsync = require('../utils/wrapAsync');
const {isLoggedIn, isAuthor, isReviewAuthor} = require('../middleware')
const {storage} = require('../cloudinary')
const multer = require('multer');
const upload = multer({ storage });


//index
router.get("/", wrapAsync(blogs.index));

//create new blog form
router.get("/new", isLoggedIn, blogs.renderNewForm);

//create
router.post("/", isLoggedIn, upload.array('blog[images]'), wrapAsync(blogs.createNewBlog));

//show
router.get("/:id", wrapAsync(blogs.showSingleBlog));

//edit specific blog form
router.get("/:id/edit", isLoggedIn, isAuthor, wrapAsync(blogs.renderBlogEditForm));

//update
router.put("/:id", isLoggedIn, isAuthor, upload.array('blog[images]'), wrapAsync(blogs.updateBlog));

//delete
router.delete("/:id", isLoggedIn, isAuthor, wrapAsync(blogs.deleteBlog))

//new comment route
router.post('/:id/comments', isLoggedIn, wrapAsync(comments.createNewComment))

//delete comment route
router.delete("/:id/comments/:commentId", isLoggedIn, isReviewAuthor, wrapAsync(comments.deleteComment))


module.exports = router