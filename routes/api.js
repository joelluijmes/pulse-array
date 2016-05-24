var express = require('express');
var realtime = require('../realtime');
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

router.post('/api/bpm/update', function(req, res) {
    if (!req.body.hasOwnProperty('id')
        || !req.body.hasOwnProperty('interval')
        || !req.body.hasOwnProperty('timestamp')
        || !req.body.hasOwnProperty('frames')
        || !req.body.hasOwnProperty('data')) {
        res.json({status: 'error', message: 'Invalid data'});
        return;
    }
    var id = req.body.id;
    var interval = parseInt(req.body.interval);
    var timestamp = parseInt(req.body.timestamp);
    var frames = parseInt(req.body.frames);
    var bpms = req.body.bpms;

    User.findOne({deviceId: id}, function(err, user) {
        if (err) {
            res.json({status: 'error', message: err});
            return;
        }
        if (!user) {
            res.json({status: 'error', message: 'User not found'});
            return;
        }
        if(frames != bpms.length || frames < 1) {
            res.json({status: 'error', message: 'Invalid frame length'});
            return;
        }

        for(var i = 0; i < frames; i++)
        {
            timestamp += interval;
            var data = new Bpm({
                date: timestamp * 1000,                                 // convert to milliseconds
                bpm: bpms[i]
            });

            user.bpms.push(data);
            realtime.broadcast({date: data.date, bpm: data.bpm});
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

router.get('/api/user/find', function (req, res) {
    var id = req.query.id;

    if (!id) {
        res.json({status: 'error', message: 'No id given'});
        return;
    }

    User.findOne({deviceId: id}, {bpms: { $slice: -10}}, function (err, user) {
        if (err) {
            res.json({status: 'error', message: err});
            return;
        }

        res.json({status: 'success', data: user});
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
})


router.get('/api/*', function (req, res) {
    res.json({status: 'error', message: 'Nothing here yet'});
});

module.exports = router;