if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const dbUrl = process.env.dburl || 'mongodb://127.0.0.1:27017/tourism';
const mongoStore = require("connect-mongo");
const port = process.env.PORT || 3000;

const destinationRoutes = require('./routes/destinations');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const monogSanitize = require('express-mongo-sanitize'); // used to prevent MongoDB operator injection attacks by sanitizing user input before interacting with the MongoDB database. 

// 'mongodb://127.0.0.1:27017/tourism'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(monogSanitize());

const secret = process.env.SECRET || 'thisisasecret';

const store = mongoStore.create({
    mongoUrl : dbUrl,
    secret: secret,
    touchAfter: 24*60*60
});

store.on("error", function (e){
    console.log("Session Store Error", e);
})

const sessionConfig = {
    store: store,
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}

app.use(session(sessionConfig));
app.use(flash());

// passport.initialize() must be defined after session(sessionConfig);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // authenticate methos is provided y passport.

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// res.locals will pass the perimeter passed to its across all the views/templates.
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/destinations', destinationRoutes);
app.use('/destinations/:id/reviews', reviewRoutes);

// app.get('/fakeUser', async(req, res) => {
//     const user = new User({email: 'temp@gmial.com', username: 'temp'});
//     const newUser = await User.register(user, 'chicken');
//     res.render(newUser);
// })

app.get('/', (req, res) => {
    res.render('home');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Something Went Wrong';
    res.status(statusCode).render('error', {err});
})

app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})
