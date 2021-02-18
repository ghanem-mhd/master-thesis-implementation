require("dotenv").config();
const express = require("express");
const mqtt = require("mqtt");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const MQTTHandler = require("./MQTT/mqtt-handler");
const app = express();
const cors = require("cors");
const Topics = require("./MQTT/topics");

const mqttHandler = new MQTTHandler();
const port = process.env.NODE_PORT || 5000;
const server = http.createServer(app);

const mqttClient = mqtt.connect(process.env.MQTT_BROKER);

const IO = require("./utilities/socket.js").init(server);
const DB = require("./utilities/db.js").init();
const Logger = require("./utilities/logger");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/events", function (req, res) {
  let page = req.query.page;
  let pageSize = req.query.pageSize;
  let skip;
  if (page && pageSize) {
    page--;
    skip = page * pageSize;
  }
  DB.events_log
    .find({})
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(pageSize)
    .exec(function (err, docs) {
      if (err) {
        next(err);
      } else {
        return res.json(docs);
      }
    });
});

app.get("/events/:eventID", function (req, res) {
  let eventID = req.params.eventID;
  DB.events_log.find({ _id: eventID }).exec(function (err, docs) {
    if (err) {
      next(err);
    } else {
      return res.json(docs);
    }
  });
});

app.get("/operation-vc/:operationID", function (req, res) {
  let operationID = req.params.operationID;
  DB.credentials.find({ operationID: operationID }).exec(function (err, docs) {
    if (err) {
      next(err);
    } else {
      if (docs.length >= 1) {
        return res.json(docs[0]);
      } else {
        return res.json({});
      }
    }
  });
});

app.get("/nfc-read", (req, res) => {
  var message = {};
  message["ts"] = new Date().toISOString();
  message["cmd"] = "read";
  mqttClient.publish(Topics.TOPIC_NFC_READ, JSON.stringify(message));
  return res.json({});
});

app.get("/nfc-delete", (req, res) => {
  var message = {};
  message["ts"] = new Date().toISOString();
  message["cmd"] = "delete";
  mqttClient.publish(Topics.TOPIC_NFC_READ, JSON.stringify(message));
  return res.json({});
});

app.use(express.static(path.join(__dirname, "frontend/build")));
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

server.listen(port, () => Logger.info(`Express Listening on port ${port}`));

mqttHandler.connect();
