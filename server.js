require("dotenv").config()

const express     = require("express");
const http        = require("http");
const socketIo    = require("socket.io");
const path        = require('path');
const bodyParser  = require('body-parser');
const MQTTHandler = require('./MQTT/mqtt-handler');
const Logger      = require('./utilities/logger');


const app         = express();
const mqttHandler = new MQTTHandler();
const port        = process.env.NODE_PORT || 5000;
const server      = http.createServer(app);
const io          = socketIo(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API calls

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'frontend/build')));

  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
  });
}

server.listen(port,() => Logger.info(`Express Listening on port ${port}`));
io.on("connection", socket => {
    Logger.info("New client connected");
    socket.on("log", data => {
			console.log(data)
    });
    socket.on("disconnect", () => console.log("Client disconnected"));
});

mqttHandler.connect();