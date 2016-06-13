var User = require('./models/user'),
    socketio = require('socket.io'),
    io;

var onlineViewers = 0;

function broadcast(name, data) {
    io.sockets.emit(name, data);
}

function updateStatistics() {
    if (onlineViewers === 0)
        return;

    User.aggregate([
        {
            $group: {
                _id: '',
                count: {$sum: 1}
            }
        }
    ], function (err, totalUsers) {
        if (totalUsers.length > 0)
            broadcast('totalUsers', totalUsers[0].count);
    });

    User.aggregate([
        {$unwind: '$bpms'},
        {
            $group: {
                _id: '',
                average: {$avg: '$bpms.bpm'}
            }
        }
    ], function (err, avgHeartbeat) {
        if (avgHeartbeat.length > 0)
            broadcast('avgHeartbeat', avgHeartbeat[0].average);
    });

    User.aggregate([
        {$unwind: '$bpms'},
        {
            $group: {
                _id: '',
                count: {$sum: 1}
            }
        }
    ], function (err, totalHeartbeat) {
        if (totalHeartbeat.length > 0)
            broadcast('totalHeartbeat', totalHeartbeat[0].count);
    });

    broadcast('onlineViewers', onlineViewers);
}

function onConnection(socket) {
    ++onlineViewers;
    console.log('New viewer connected ' + onlineViewers);

    socket.on('disconnect', function () {
        --onlineViewers;
        console.log('Viewer disconnected ' + onlineViewers);
    });
}

module.exports = {};
module.exports.startServer = function (app) {
    io = socketio.listen(app);

    io.on('connection', onConnection);

    setInterval(function () {
        updateStatistics();
    }, 1000);
};

module.exports.broadcast = broadcast;