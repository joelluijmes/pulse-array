// server.js

// set up ======================================================================
// get all the tools we need
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var passportSocketIo = require('passport.socketio');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');
var MongoStore = require('connect-mongo')(session);

var configDB = require('./config/database.js');
var sockets = require('./app/sockets.js');
var mongoStore = new MongoStore({url: configDB.url});

// configuration ===============================================================
// set up our express application
app.use(cookieParser());                                // read cookies (needed for auth)
app.use(bodyParser.json());                             // html forms
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev', {                                 // dev logging
    skip: function (req, res) {
        return req.url.indexOf('statistics') != -1;     // hide the statistics (hits every second :O)
    }
}));


var viewsPath = path.join(__dirname, 'public');
app.use(express.static(viewsPath));// static content
app.set('views', viewsPath);

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    key: 'express.sid',
    secret: 'joelandjasperissupercooledev',
    resave: true,
    saveUninitialized: true,
    store: mongoStore
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/api')(app);
require('./app/routes.js')(app, passport);
require('./config/passport')(passport);

// socketio ====================================================================
//With Socket.io >= 1.0
// io.use(passportSocketIo.authorize({
//     cookieParser: cookieParser,       // the same middleware you registrer in express
//     key: 'express.sid',       // the name of the cookie where express/connect stores its session_id
//     secret: 'joelandjasperissupercooledev',    // the session_secret to parse the cookie
//     store: mongoStore,        // we NEED to use a sessionstore. no memorystore please
//     success: onAuthorizeSuccess,  // *optional* callback on success - read more below
//     fail: onAuthorizeFail     // *optional* callback on fail/error - read more below
// }));


function onAuthorizeSuccess(data, accept) {
    console.log('successful connection to socket.io');

    // The accept-callback still allows us to decide whether to
    // accept the connection or not.
    accept(null, true);

}

function onAuthorizeFail(data, message, error, accept) {
    if (error)
        throw new Error(message);
    console.log('failed connection to socket.io:', message);

    // We use this callback to log all of our failed connections.
    accept(null, false);

}

// launch ======================================================================
sockets.startServer(server);
server.listen(port, function () {
    console.log('Express server on port ' + port);
});