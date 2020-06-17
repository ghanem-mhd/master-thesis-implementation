require('dotenv').config()



const truffleConfig = require('../truffle-config')
const networkConfig = truffleConfig['networks'][process.env.NETWORK]

const express       = require("express");
const bodyParser    = require("body-parser");
const Web3          = require('web3');
const mqttHandler   = require('../mqtt/MqttHandler');
const contractsApp  = require('../connection/app.js');


var mqttClient  = new mqttHandler();
var web3        = new Web3(new Web3.providers.HttpProvider(`http://${networkConfig['host']}:${networkConfig['port']}`));
var app         = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

mqttClient.connect();

app.get("/send-mqtt", function(req, res) {
  mqttClient.sendMessage("Hello from my node app.");
  res.status(200).send("Message sent to mqtt");
});

var server = app.listen(3000, function () {
    contractsApp.web3 = web3
    console.log("app running on port.", server.address().port);
});