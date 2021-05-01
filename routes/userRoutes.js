const express = require('express');
const router = express.Router();
const users = require('../controllers/users')
const wrapAsync = require("../utils/wrapAsync");
const passport = require('passport')
const {passedRecaptcha, validatePwResetLink} = require('../middleware');


router.get('/register', users.renderRegisterForm);

router.post('/register', passedRecaptcha, wrapAsync(users.createNewUser));

router.get('/login', users.renderLoginForm);
 
router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.userLogin);

router.get('/logout', users.userLogout);

router.get('/forgot', users.renderForgotForm);

router.post('/forgot', users.changePw);

//user form to input a new password
router.get('/change/:id', wrapAsync(validatePwResetLink), users.renderChangeForm);

router.post('/change/:id', wrapAsync(validatePwResetLink), wrapAsync(users.saveNewPw), passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}));

module.exports = router;