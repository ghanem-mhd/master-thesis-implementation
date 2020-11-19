require("dotenv").config();

var FactorySimulator = require("../MQTT/factory-simulator");
var HBWClient = require("../MQTT/machines/hbw-client");
var VGRClient = require("../MQTT/machines/vgr-client");
var SLDClient = require("../MQTT/machines/sld-client");
var MPOClient = require("../MQTT/machines/mpo-client");
var ReadingClient = require("../MQTT/readings-client");
var StateClient = require("../MQTT/state-client");
new FactorySimulator().connect();

for (var i = 0; i < process.argv.length; i++) {
  switch (process.argv[i]) {
    case "machine":
      var client = null;
      switch (process.argv[i + 1]) {
        case "HBW":
          client = new HBWClient();
          break;
        case "VGR":
          client = new VGRClient();
          break;
        case "SLD":
          client = new SLDClient();
          break;
        case "MPO":
          client = new MPOClient();
          break;
        case "R":
          client = new ReadingClient();
          break;
        case "S":
          client = new StateClient();
          break;
      }
      client.connect();
      break;
  }
}
