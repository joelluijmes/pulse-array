// config/passport.js

var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// user model
var User = require('../app/models/user');

// load the auth variables
var configAuth = require('./auth');

module.exports = function(passport) {
    // =================================
    // SETUP ===========================
    // =================================
    // required for persistent login sessions

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =================================
    // LOCAL SIGNUP ====================
    // =================================

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, function(req, username, password, done) {
        process.nextTick(function() {
            var id = Number(req.body.deviceId);
            if (id === undefined || !id) {
                return done(null, false, req.flash('message', 'Invalid device id.'));
            }

            // find a user with username
            // we are checking to see if the user trying to login already exists
            User.findOne({'local.username': username}, function (err, user) {
                // if there are any errors, return the error
                if (err) {
                    console.log(err);
                    return done(err);
                }

                // check to see if theres already a user with that email
                if (user) {
                    console.log('User registration failed: user already exists')
                    return done(null, false, req.flash('message', 'That username is already taken.'));
                } else {

                    // if there is no user with that email
                    // create the user
                    var newUser = new User();

                    // set the user's local credentials
                    newUser.local.username = username;
                    newUser.local.password = newUser.generateHash(password);
                    newUser.deviceId = id;

                    // save the user
                    newUser.save(function (err) {
                        if (err) {
                            console.log('Error saving registration: ' + err)
                            throw err;
                        }
                        return done(null, newUser);
                    });
                }
            });
        })
    }));

    // =================================
    // LOCAL LOGIN =====================
    // =================================
    passport.use('local-login', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, username, password, done) {

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({'local.username': username}, function (err, user) {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('message', 'Username not found.')); // req.flash is the way to set flashdata using connect-flash

                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done(null, false, req.flash('message', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                
                // all is well, return successful user
                return done(null, user);
            });

        }));

    // =================================
    // GOOGLE ==========================
    // =================================
    passport.use(new GoogleStrategy({
            clientID            : configAuth.googleAuth.clientID,
            clientSecret        : configAuth.googleAuth.clientSecret,
            callbackURL         : configAuth.googleAuth.callbackURL,
            passReqToCallback   : true
        },
        function(req, token, refreshToken, profile, done) {

            // check if user is logged in
            if (!req.user) {
                // try to find the user based on their google id
                User.findOne({'google.id': profile.id}, function (err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if a user is found, log them in
                        return done(null, user);
                    } else {
                        // if the user isnt in our database, create a new user
                        var newUser = new User();

                        // set all of the relevant information
                        newUser.google.id = profile.id;
                        newUser.google.token = token;
                        newUser.google.name = profile.displayName;
                        newUser.google.email = profile.emails[0].value; // pull the first email

                        // save the user
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            } else {
                // user is logged in
                var user = req.user;

                // set all of the relevant information
                user.google.id = profile.id;
                user.google.token = token;
                user.google.name = profile.displayName;
                user.google.email = profile.emails[0].value; // pull the first email

                user.save(function(err) {
                    if (err)
                        throw err;

                    return done(null, user);
                })
            }
        }));
};