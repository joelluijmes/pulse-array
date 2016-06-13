// server.js

// set up ======================================================================
// get all the tools we need
var express     = require('express');
var app         = express();
var port        = process.env.PORT || 3000;
var mongoose    = require('mongoose');
var server      = require('http').createServer(app);

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var path         = require('path');

var configDB    = require('./config/database.js');
var sockets     = require('./app/sockets.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

// set up our express application
app.use(morgan('dev'));                                 // log every request to the console
app.use(cookieParser());                                // read cookies (needed for auth)
app.use(bodyParser.json());                             // html forms
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));// static content

// routes ======================================================================
require('./app/api')(app);
require('./app/routes.js')(app);

// launch ======================================================================
sockets.startServer(server);
server.listen(port, function() {
    console.log('Express server on port ' + port);
});