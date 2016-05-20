var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    methodOverride = require('method-override'),
    api = require('./routes/api'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    io = require('socket.io')(http);

var app = module.exports = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname + '/public'));
app.set('view engine', 'ejs');

app.engine('html', require('ejs').renderFile);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', api);
app.get('*', function(req, res) {
    fs.readFile(__dirname + '/public/index.html', 'utf8', function(err, content) {
        res.send(content);
    });
});


if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});


io.on('connection', function(socket) {
    console.log('haaai');
});


mongoose.connect('mongodb://localhost/pulse-array');

var server = http.createServer(app);
server.listen(app.get('port'), function() {
    console.log('Express server on port ' + app.get('port'));
});
