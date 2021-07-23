const User = require('../models/user');
const crypto = require('crypto');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, //use SSL
    auth: {
        user: `${process.env.EMAIL_ADDRESS}`,
        pass: `${process.env.EMAIL_PASSWORD}`
    },
});

module.exports.renderRegisterForm = (req, res) => {
    res.render('register');
}

module.exports.createNewUser = async (req, res) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            res.redirect('/blogs')
        })
    } catch (e) {
        if (e.name === 'MongoError' && e.code === 11000) {
            req.flash('error', "a user with the given email address is already registered");
        } else req.flash('error', e.message);

        res.redirect('/register')
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render('login');
}

module.exports.renderForgotForm = (req, res) => {
    res.render('forgot');
}

//change pw
module.exports.renderChangeForm = async (req, res) => {
    const {id} = req.params; //the secret key from the password reset link
    res.render('change', {id});
}

module.exports.userLogin = (req, res) => { 
    const redirectUrl = req.session.returnTo || '/blogs';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.userLogout = (req, res) => {
    req.logout();
    res.redirect('/blogs')
}

module.exports.saveNewPw = async (req, res, next) => {
    const {id} = req.params; //the secret key from the password reset link
    const {password} = req.body; //user's new pw

    const user = await User.findOne({secretKey: `${id}`});

    await user.setPassword(`${password}`, function() {
            user.save();
    });

    req.login(user, function(err) {
        if (err) { return next(err); }
      });

    req.flash('success', 'your password has been successfully updated.')
    res.redirect('/blogs')
}

module.exports.changePw = async (req, res) => {
    try {
            const {email} = req.body;
            const user = await User.findOne({email: email})
            if (user) {
                let webUrl = '';
                if (process.env.NODE_ENV !== "production") {
                    webUrl = 'http://localhost:3000';
                } else {
                    webUrl = 'https://blurt-app.herokuapp.com';
                }

                user.secretKey = crypto.randomBytes(20).toString('hex'); //generate a random key with node's crypto module
                user.keyExpiration = Date.now() + 3600000; //1 hour
                user.save();
                const mailOptions = {
                    from: `"blurt." <${process.env.EMAIL_ADDRESS}>`,
                    to: `${email}`,
                    subject: 'Link to Reset Password',
                    text: 'You are receiving this email because there has been a request to reset your password. \n\n'
                    +'Please click on the following link or paste it into your browser to change your password within one hour of receiving this email: \n\n'
                    +`${webUrl}/change/${user.secretKey}/` 
                    +'\nIf you did not request this, you may ignore this email to leave your password unchanged.\n'
                };
                
                transporter.sendMail(mailOptions, (err, res) => {
                    if (err) {
                        console.log(err);
                        req.flash('error', "unable to send password reset link.");
                        res.redirect('blogs');
                    } 
                });

            } 

            req.flash('success', "if the provided email is registered, it will receive a password reset link.");
            res.redirect('/blogs')
        } 
    catch(e) {
        console.log(e.message)
        req.flash('error', "something didn\'t go quite right.");
        res.redirect('/blogs');
    }
}   