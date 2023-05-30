const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

// register and login methods are provided by passport.
// register() will check for uniqueness of username and if it is ok then
// registers a user data into the database.
// login() involves establishing a connection between the server and the 
// user by creating a session and sending a session identifier (session ID or token) to the user.
module.exports.register = async(req, res, next) => {
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password); // User.register() is being provided by passoprt-local-mongoose
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to Destination Reviewer');
            res.redirect('/destinations');
        })
    }
    catch(e){
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back');
    const redirectUrl = req.session.returnTo || '/destinations';
    delete req.session.returnTo; // deletes returnTo attribute from the session object.
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
        req.flash('success', 'Successfully logged out');
        res.redirect('/destinations');
    });
}