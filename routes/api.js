var express = require('express');
var sockets = require('../sockets');
var Bpm = require('../models/bpm');
var User = require('../models/user');

var router = express.Router();

router.post('/api/user/register', function (req, res) {
    var username = req.body.username;
    var id = req.body.id;

    if (!username || !id) {
        res.json({status: 'error', message: 'Invalid data'});
        return;
    }

    User.findOne({username: username}, function (err, existingUser) {
        if (err) {
            res.json({status: 'error', message: err});
            return;
        }
        if (existingUser) {
            res.json({status: 'error', message: 'User already registered with this username'});
            return;
        }

        var user = new User({username: username, deviceId: id});
        user.save(function (err) {
            if (err) {
                res.json({status: 'error', message: err});
                return;
            }

            res.json({status: 'success', message: 'User registered'});
        });
    })
})

router.post('/api/bpm/update', function (req, res) {
    if (!req.body.hasOwnProperty('id')
        || !req.body.hasOwnProperty('interval')
        || !req.body.hasOwnProperty('timestamp')
        || !req.body.hasOwnProperty('bpms')) {
        res.json({status: 'error', message: 'Invalid data'});
        return;
    }
    var id = req.body.id;
    var interval = parseInt(req.body.interval);
    var timestamp = parseInt(req.body.timestamp);
    var bpms = JSON.parse(req.body.bpms);

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

        for (var i = 0; i < bpms.length; i++) {
            timestamp += interval;
            var data = new Bpm({
                date: timestamp * 1000,                                 // convert to milliseconds
                bpm: bpms[i]
            });

            user.bpms.push(data);
            // TODO: UPdate graph
            // realtime.broadcast({date: data.date, bpm: data.bpm});
        }

        user.save(function (err) {
            if (err) {
                res.json({status: 'error', message: err});
                return;
            }

            res.json({status: 'success', message: 'Bpm saved :)'});
        });
    });
});

router.get('/api/bpms/fetch/', function (req, res) {
    var id = req.query.id;
    var begin = Number(req.query.start) || 0;
    var end = Number(req.query.end) || -1;
    var limit = Number(req.query.limit) || 10;
    var order = req.query.order;

    if (typeof(id) === 'undefined') {
        res.json({status: 'error', message: 'No id given'});
        return;
    }

    order = (order === 'asc') ? 1 : -1;

    User.aggregate([
        {$match: {'deviceId': Number(id)}},
        {$project: {'bpms': 1}},
        {$unwind: '$bpms'},
        {
            $match: {
                'bpms.date': {
                    '$gte': new Date(begin),
                    '$lte': (end === -1) ? new Date() : new Date(end)
                }
            }
        },
        {$sort: {'bpms.date': order}},
        {$limit: limit}
    ], function (err, data) {
        if (err) {
            res.json({status: 'error', message: err});
            return;
        }

        res.json({status: 'success', data: data});
    });

});


router.get('/api/user/list/', function (req, res) {
    User.find({}, 'username deviceId', function (err, users) {
        if (err) {
            res.json({status: 'error', message: err});
            return;
        }

        res.json({status: 'success', data: users});
    });
});


router.get('/api/*', function (req, res) {
    res.json({status: 'error', message: 'Nothing here yet'});
});

module.exports = router;