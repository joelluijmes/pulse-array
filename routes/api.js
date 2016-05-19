var express = require('express');
var BpmModel = require('../models/bpm-model');

var router = express.Router();

router.post('/api/bpm/update', function(req, res) {
    var bpm = new BpmModel({
        date: req.body.date,
        bpm: req.body.bpm
    });

    bpm.save(function(err) {
        if (err) {
            res.json(err);
            return;
        }

        res.json({status: 'success', message: 'Bpm saved :)'});
    });
});

router.get('/api/*', function(req, res) {
    res.json({status: 'error', message: 'Nothing here yet'});
});

module.exports = router;