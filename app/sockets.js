var socketio = require('socket.io');
var io = null;

module.exports = {
    broadcast: function(name, data) {
        if (io)
            io.sockets.emit(name, data);
    },
    startServer: function (app) {
        io = socketio.listen(app);
    }
};