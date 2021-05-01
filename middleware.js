
const Blog = require("./models/blog");
const User = require('./models/user');
const Comment = require("./models/comment");
const fetch = require("node-fetch");

module.exports.passedRecaptcha = async (req, res, next) => {
    let secret = process.env.G_RECAPTCHA,
    recaptcha = req.body['g-recaptcha-response'];

    if (recaptcha === '') {
        req.flash('error', 'you must complete the reCaptcha to register')
        return res.redirect('/register')
    }

    await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: `secret=${secret}&response=${recaptcha}`,
      })
      .then(response => response.json()) 
      .then(json => {
          if (!json.success) {
            req.flash('error', 'you must successfully complete the reCaptcha to register')
            return res.redirect('/register')
          }
      })
      .catch(err => console.log(err));
      
    next();
}

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; //store page user was trying to access on the session
        req.flash('error', 'you must be signed in.')
        return res.redirect('/login')
    }
    next();
} 

module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params;
    const blog = await Blog.findById(id)
    if (!blog.author.equals(req.user._id)) {
        req.flash('error', 'you do not have permission to do that.')
        return res.redirect(`/blogs/${id}`)
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const {id, commentId} = req.params;
    const comment = await Comment.findById(commentId)
    if (!comment.author.equals(req.user._id)) {
        req.flash('error', 'you do not have permission to do that.')
        return res.redirect(`/blogs/${id}`)
    }
    next();
}

module.exports.validatePwResetLink = async (req, res, next) => {
    const {id} = req.params; //the secret key from the password reset link
    const user = await User.findOne({secretKey: `${id}`});

    if (user && Date.now() < user.keyExpiration) {
        next();
    } else {
        req.flash('error', 'please request a new password reset link.');
        return res.redirect('/forgot');
    }
}