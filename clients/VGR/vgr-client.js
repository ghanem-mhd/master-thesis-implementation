require('dotenv').config()

const mqtt = require('mqtt');

var VGRMQTTHandler = require('./vgr-mqtt-handler')
var Web3 = require('web3')
var ProvidersManager = require('../../utilities/providers-manager')
var KeyManager = require('../../utilities/keys-manager')
var ContractManager = require('../../utilities/contracts-manager')
var Logger = require('../../utilities/logger')

var mqttClient = new VGRMQTTHandler();
mqttClient.connect();