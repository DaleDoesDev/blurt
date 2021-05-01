const Blog = require('../models/blog');
const Comment = require('../models/comment');
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res, next) => {
    let totalBlogs = await Blog.find({});
    let pageCount = Math.ceil(totalBlogs.length / 3);
    let pageNumber, canGoBack;

    if (Object.keys(req.query).length === 0)
        pageNumber = 1;
    else {
        let queryPage = parseInt(req.query.page);
        queryPage > pageCount ? pageNumber = pageCount : pageNumber = queryPage;
    }
    
    let skips = 3 * (pageNumber - 1);
    const blogs = await Blog.find({}).skip(skips).limit(3).populate('author') //the blog's author

    pageNumber > 1 ? canGoBack = true : canGoBack = false;

    res.render("index", {blogs, pageNumber, pageCount, canGoBack} )
}

module.exports.renderNewForm = (req, res) => {
    res.render("new")
}

module.exports.createNewBlog = async (req, res, next) => {
	//express-sanitizer on the req
	req.body.blog.body = req.sanitize(req.body.blog.body) //removes <script> tags, etc
    //submitted "blog" from the req.body used here for model.create()
    const newBlog = await Blog.create(req.body.blog);
    newBlog.author = req.user._id; //storing the mongo _id
    newBlog.images = req.files.map(f => ({ url: f.path, filename: f.filename})); //new array
    await newBlog.save();
    req.flash('success', 'blog created successfully.')
	res.redirect(`/blogs/${newBlog._id}`)
}

module.exports.showSingleBlog = async (req, res, next) => {
    const blog = await Blog.findById(req.params.id).populate({ path: 'comments',
            populate: {
                path: 'author' //nested, to reach the comment's author
            }}).populate('author') //the blog's author

    if (blog) {
        //comment pagination code
        let totalComments = blog.comments;
        let pageCount = Math.ceil(totalComments.length / 3);
        let pageNumber, canGoBack;

        if (Object.keys(req.query).length === 0)
            pageNumber = 1;
        else {
            let queryPage = parseInt(req.query.page);
            queryPage > pageCount ? pageNumber = pageCount : pageNumber = queryPage;
        }

        let skips = 3 * (pageNumber - 1);

        const comments = await Comment.find({
			_id: {
				$in: blog.comments 
            }
        }).skip(skips).limit(3).populate('author')

        pageNumber > 1 ? canGoBack = true : canGoBack = false;
            
        res.render("show", {blog, comments, pageNumber, pageCount, canGoBack})

    } else {
        req.flash('error', 'blog not found.')
        res.redirect('/blogs')
    }
};

module.exports.renderBlogEditForm = async (req, res, next) => {
    const {id} = req.params;
    const blog = await Blog.findById(req.params.id)
	if (blog) {
        res.render("edit", {blog})
    } else {
        req.flash('error', 'cannot find that blog post.')
        return res.redirect("/blogs/"+id)
    }
};

module.exports.updateBlog = async (req,res, next) => {
    req.body.blog.body = req.sanitize(req.body.blog.body)
    const {id} = req.params;
    const blog = await Blog.findById(id);
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename})); //new array
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body.blog)
    blog.images.push(...imgs);
    await blog.save();

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename);
        }

        //pull from the images arr on the blog doc any images with a filename matching the deleteImages arr
        await blog.updateOne( { $pull: {images: { filename: { $in: req.body.deleteImages } } } } );
    }

    req.flash('success', 'blog post updated successfully.')
    res.redirect("/blogs/"+req.params.id)
};

module.exports.deleteBlog = async (req,res) => {
    const blog = await Blog.findById(req.params.id)
    if (blog.images) {
        for (let img of blog.images) {
                await cloudinary.uploader.destroy(img.filename);
        }
    }
    const deleted = await Blog.findByIdAndRemove(req.params.id)
    req.flash('success', 'blog post deleted successfully.')
	res.redirect("/blogs")
};