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

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');

var configDB = require('./config/database.js');
var sockets = require('./app/sockets.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

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
app.use(session({secret: 'joelandjasperissupercooledev:D', resave: true, saveUninitialized: true})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/api')(app);
require('./app/routes.js')(app, passport);
require('./config/passport')(passport);

// launch ======================================================================
sockets.startServer(server);
server.listen(port, function () {
    console.log('Express server on port ' + port);
});