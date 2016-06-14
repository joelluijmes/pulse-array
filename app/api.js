// app/api.js
var User = require('./models/user');
var Bpm = require('./models/bpm');
var sockets = require('./sockets');

module.exports = function (app) {

    // =================================
    // POST BPM ========================
    // =================================
    // Appends the posted bpm with the user in the database
    app.post('/api/bpm/update', function (req, res) {
        if (!req.body.hasOwnProperty('id')
            || !req.body.hasOwnProperty('interval')
            || !req.body.hasOwnProperty('timestamp')
            || !req.body.hasOwnProperty('bpms')) {
            res.json({status: 'error', message: 'Invalid data'});
            return;
        }

        // parse all request params
        var id = req.body.id;
        var interval = parseInt(req.body.interval);
        var timestamp = parseInt(req.body.timestamp);
        var bpms = JSON.parse(req.body.bpms);

        // find the user with this device id
        User.findOne({deviceId: id}, function (err, user) {
            if (err) {
                res.json({status: 'error', message: err});
                return;
            }
            if (!user) {
                res.json({status: 'error', message: 'User not found'});
                return;
            }
            if (bpms.length < 1) {
                res.json({status: 'error', message: 'Invalid frame length'});
                return;
            }

            // for every bpm we received from the client
            for (var i = 0; i < bpms.length; i++) {
                timestamp += interval;              // timestamp is of the first bpm, calculate the next
                var data = new Bpm({
                    date: timestamp * 1000,         // js works with ms timestamp
                    bpm: bpms[i]
                });

                user.bpms.push(data);

                // send the bpm to the web clients
                sockets.broadcast('liveUpdate', {date: data.date, bpm: data.bpm});
            }

            // save the data
            user.save(function (err) {
                if (err) {
                    res.json({status: 'error', message: err});
                    return;
                }

                res.json({status: 'success', message: 'Bpm saved :)'});
            });
        });
    });

    // =================================
    // GET BPM DATA ====================
    // =================================
    // gets bpm data from a user, able to select a date range, how many
    // and in what order
    app.get('/api/bpms/fetch/', function (req, res) {
        // parse all request parameters
        var id = req.user.deviceId;
        var begin = Number(req.query.start) || 0;
        var end = Number(req.query.end) || -1;
        var limit = Number(req.query.limit) || 10;
        var order = req.query.order;

        if (typeof(id) === 'undefined') {
            res.json({status: 'error', message: 'No id given'});
            return;
        }

        // 1 is ascending, -1 is descending
        order = (order === 'asc') ? 1 : -1;

        User.aggregate([
            {$match: {'deviceId': Number(id)}},     // where matches the device id
            {$project: {'bpms': 1}},
            {$unwind: '$bpms'},                     // project on bpms
            {
                $match: {
                    'bpms.date': {                  // where the date is in range
                        '$gte': new Date(begin),
                        '$lte': (end === -1) ? new Date() : new Date(end)
                    }
                }
            },
            {$sort: {'bpms.date': order}},          // order by the date
            {$limit: limit}                         // maximum to get
        ], function (err, data) {
            if (err) {
                res.json({status: 'error', message: err});
                return;
            }

            res.json({status: 'success', data: data});
        });

    });

    // =================================
    // GET USERS =======================
    // =================================
    // lists all usernames with their device id
    app.get('/api/user/list/', function (req, res) {
        User.find({}, 'username deviceId', function (err, users) {
            if (err) {
                res.json({status: 'error', message: err});
                return;
            }

            res.json({status: 'success', data: users});
        });
    });
};