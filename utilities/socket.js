const Logger = require("./logger");

let io;

module.exports = {
  init: function (server) {
    io = require("socket.io").listen(server);
    io.origins("*:*");
    io.on("connection", (socket) => {
      var sessionID = socket.id;
      Logger.info(
        `${sessionID} connected on socket io - joined stream_log and machines_state`
      );
      socket.join("stream_log");
      socket.join("machines_state");
      socket.on("disconnect", () => {
        Logger.info(`${sessionID} disconnect`);
      });
    });
    return io;
  },
  getIO: function () {
    if (!io) {
      return null;
    }
    return io;
  },
};
