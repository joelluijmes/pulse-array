var express = require('express');


var router = express.Router();

router.get('/api/*', function(req, res) {
    res.json({status: 'error', message: 'Nothing here yet'});
});

module.exports = router;