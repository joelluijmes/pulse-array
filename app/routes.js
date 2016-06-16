// app/routes.js
var api = require('./api');
var fs = require('fs');

module.exports = function (app, passport) {

    // =================================
    // LOGIN ===========================
    // =================================
    // serves the login html page
    app.get('/login', function (req, res) {
        res.render('login.ejs', {message: req.flash('message')});
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/home', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/home', // redirect to the secure profile section
        failureRedirect: '/login#signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/login');
    });

    app.get('/complete', isLoggedIn, function (req, res) {
        res.render('complete.ejs');
    });

    app.post('/complete', isLoggedIn, function (req, res) {
        var id = req.body.deviceId;

        req.user.deviceId = id;
        req.user.save();

        res.redirect('/');
    })

    // =================================
    // GOOGLE ROUTES ===================
    // =================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            failureRedirect: '/login'
        }), function (req, res) {
            res.redirect('/');
            //var x = req.query.username;
        });

    // =====================================
    // AUTHORIZE ===========================
    // =====================================
    app.get('/connect/local', function (req, res) {
        res.render('connect-local.ejs', {message: req.flash('loginMessage')});
    });
    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', {scope: ['profile', 'email']}));

    // the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    // =================================
    // EVERYTHING ======================
    // =================================
    // if it didn't match any of the previous rules, it is probably a page
    // if not we still give them the page (A)
    app.get('*', isRegistered, function (req, res) {
        var username = '';
        if (typeof(req.user.local) !== 'undefined')
            username = req.user.local.username;
        else if (typeof(req.user.google) !== 'undefined')
            username = req.user.google.name;

        res.render('index.ejs', {username: username, deviceId: req.user.deviceId});
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

function isRegistered(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
        return;
    }
    if (typeof(req.user) === 'undefined' || typeof(req.user.deviceId) === 'undefined' || req.user.deviceId === 0) {
        res.redirect('/complete');
        return;
    }

    return next();
}