// app/api.js
var async = require('async');
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

        if (bpms.length < 1) {
            res.json({status: 'error', message: 'Invalid frame length'});
            return;
        }

        // for every bpm we received from the client
        for (var i = 0; i < bpms.length; i++) {
			if (bpms[i] === 0)
				continue;

            timestamp += interval;              // timestamp is of the first bpm, calculate the next
            var bpm = new Bpm({
                date: timestamp * 1000,         // js works with ms timestamp
                bpm: bpms[i],
                deviceId: id
            });

            var errored = false;
            bpm.save(function (err) {
                if (err) {
                    res.json({status: 'error', message: err});
                    errored = true;
                }
            });

            if (errored)
                return;

            // send the last bpm to the web clients
            if (i === bpms.length - 1)
                sockets.broadcast('liveUpdate', {date: bpm.date, bpm: bpm.bpm});
        }

        res.json({status: 'success', message: 'Bpm saved :)'});
    });

    // =================================
    // GET BPM DATA ====================
    // =================================
    // gets bpm data from a user, able to select a date range, how many
    // and in what order
    app.get('/api/bpm/fetch/', function (req, res) {
        // parse all request parameters
        if (!req.isAuthenticated()) {
            res.json({status: 'error', message: 'You must be logged in to view these precious bpms :<'});
            return;
        }

        var id = req.user.deviceId;
        var begin = Number(req.query.start) || 0;
        var end = Number(req.query.end) || -1;
        var limit = Number(req.query.limit) || 10;
        var order = req.query.order;

        // 1 is ascending, -1 is descending
        order = (order === 'asc') ? 1 : -1;
        limit = (limit === -1) ? 100000 : limit;

        Bpm.aggregate([
            {
                $match: {
                    $and: [
                        {'deviceId': Number(id)},
                        {
                            'date': {
                                '$gte': new Date(begin),
                                '$lte': (end === -1) ? new Date() : new Date(end)
                            }
                        }
                    ]
                }
            },
            {$sort: {'date': order}},
            {$limit: limit}
        ], function (err, data) {
            if (err)
                res.json({status: 'error', message: err});
            else
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

    // =================================
    // GET INFO ========================
    // =================================
    // gives some statistics about the web app
    app.get('/api/statistics/', function (req, res) {
        if (!req.isAuthenticated()) {
            res.json({status: 'error', message: 'You must be logged in to view these precious bpms :<'});
            return;
        }

        var id = req.user.deviceId;

        async.parallel({
            totalUsers: function (callback) {
                User.aggregate([
                    {$group: {_id: '', count: {$sum: 1}}}
                ], function (err, data) {
                    callback(err, data.length < 1 ? 0 : data[0].count);
                });
            },
            avgHeartbeat: function (callback) {
                Bpm.aggregate([
                    {$match: {deviceId: id}},
                    {$group: {_id: '', average: {$avg: '$bpm'}}}
                ], function (err, data) {
                    callback(err, data.length < 1 ? 0 : data[0].average);
                });
            },
            avgHeartbeatAll: function (callback) {
                Bpm.aggregate([
                    {$group: {_id: '', average: {$avg: '$bpm'}}}
                ], function (err, data) {
                    callback(err, data.length < 1 ? 0 : data[0].average);
                });
            },
            totalHeartbeat: function (callback) {
                Bpm.aggregate([
                    {$group: {_id: '', count: {$sum: 1}}}
                ], function (err, data) {
                    callback(err, data.length < 1 ? 0 : data[0].count);
                });
            }
        }, function(err, results) {
            if (err)
                res.json({status: 'error', message: err});
            else
                res.json({status: 'success', data: results});
        });
    });
};