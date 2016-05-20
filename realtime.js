var sockets = [];

module.exports = {};
module.exports.onConnection = function(socket) {
    sockets.push(socket);

    socket.on('disconnect', function() {
        sockets.splice(sockets.indexof(socket), 1);
    })
};

module.exports.broadcast = function(data) {
    sockets.forEach(function(socket) {
       socket.emit('update', data);
    });
};
