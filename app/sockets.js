var socketio = require('socket.io');

var server = null;
var io = null;

function onConnection(socket) {
    console.log("connection");
}

function broadcast(name, data) {
    io.sockets.emit(name, data);
}


module.exports = {};
module.exports.startServer = function (app) {
    io = socketio.listen(app);

    io.on('connection', onConnection);
};

module.exports.broadcast = broadcast;