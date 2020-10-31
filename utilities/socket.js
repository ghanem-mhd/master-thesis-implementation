const Logger      = require('./logger');

let io;

module.exports = {
    init: function(server) {
        io = require('socket.io').listen(server);
        io.origins('*:*');
        io.on("connection", socket => {
            var sessionID = socket.id;
            Logger.info(`${sessionID} connected on socket io`);
            socket.join('stream_log');
            Logger.info(`${sessionID} joined stream_log`);
            socket.on("disconnect", () => {
                Logger.info(`${sessionID} disconnect`);
            });
        });
        return io;
    },
    getIO: function() {
        if (!io) {
            throw new Error("must call .init(server) before you can call .getIO()");
        }
        return io;
    }
}