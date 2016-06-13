// app/routes.js
var api = require('./api');
var fs = require('fs');

module.exports = function (app, passport) {

    // =================================
    // LOGIN ===========================
    // =================================
    // serves the login html page
    app.get('/login', function(req, res) {
        fs.readFile(__dirname + '/../public/login.html', 'utf8', function(err, content) {
            res.send(content);
        });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/home', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/home', // redirect to the secure profile section
        failureRedirect : '/login#signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =================================
    // GOOGLE ROUTES ===================
    // =================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect : '/home',
            failureRedirect : '/'
        }));

    // =================================
    // STATIC CONTENT ==================
    // =================================
    // serves all static content (html, css)
    // should be the last one
    app.get('*', isLoggedIn, function(req, res) {
        fs.readFile(__dirname + '/../public/index.html', 'utf8', function(err, content) {
            res.send(content);
        });
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}