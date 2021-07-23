if (process.env.NODE_ENV !== "production") {
    require('dotenv').config(); //for the .env file hiddle values
}

const express = require('express');
const app = express();
const session = require('express-session');

const flash = require('connect-flash');
const mongoose = require('mongoose');
const expressSanitizer = require('express-sanitizer');
const mongoSanitize = require('express-mongo-sanitize');
const methodOverride = require("method-override");
const path = require('path');
const cookieParser = require('cookie-parser');
const User = require('./models/user');
const blogRoutes = require('./routes/blogRoutes');
const userRoutes = require('./routes/userRoutes')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const AppError = require('./AppError');
const MongoStore = require("connect-mongo");

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/restApp'
const secret = process.env.SECRET || 'thisisnotagoodsecret'

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to DB!')).catch(error => console.log(error.message));

app.set("view engine", "ejs")
app.set('views', path.join(__dirname, '/views'))

app.use(express.static("public"))
app.use(express.urlencoded({extended: true})) //this is body-parser
app.use(expressSanitizer())
app.use(methodOverride("_method"))
app.use(cookieParser())
app.use(mongoSanitize());

app.use(session({ 
    store: new MongoStore({
        mongoUrl: dbUrl,
        mongoOptions: {},
        touchAfter: 24 * 60 * 60 //limit update frequency 
      }),
    name: 'session',
    secret, 
    resave: false, 
    saveUninitialized: false,
    cookie: {
        httpsOnly: true,
        expires: Date.now() + 1000*60*60*24*7, //milliseconds in a week
        maxAge: 1000*60*60*24*7
    }
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session()); //allows persistent login, works with express-session

//passport-local methods
passport.use(new LocalStrategy(User.authenticate()))
//store, un-store user
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user; //passport provides req.user
    next()
})

//redirect root to index
app.get("/", function(req, res){ 
    res.redirect("/blogs");
})

//express router
app.use('/blogs', blogRoutes)
app.use('/', userRoutes)

app.all("*", function(req, res, next) { 
    throw new AppError('sorry, that resource wasn\'t found.', 404)
})

//error handler middleware used with AppError
app.use((err, req, res, next) => {
	let { status = 500, message} = err
	if (status != 404)
        message = "something didn't quite work right. "

    console.log(err)
    req.flash('error', message)
    res.redirect('/blogs')
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log("** blurt. is up! **");
})