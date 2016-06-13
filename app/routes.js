// app/routes.js
var api = require('./api');
var fs = require('fs');

module.exports = function (app) {

    // =================================
    // STATIC CONTENT ==================
    // =================================
    // serves all static content (html, css)
    // should be the last one
    app.get('*', function(req, res) {
        fs.readFile(__dirname + '/../public/index.html', 'utf8', function(err, content) {
            res.send(content);
        });
    });
};
