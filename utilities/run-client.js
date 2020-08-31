require("dotenv").config();

var HBWClient = require("../clients/HBW/hbw-client");
var VGRClient = require("../clients/VGR/vgr-client");
var SLDClient = require("../clients/SLD/sld-client");
var MPOClient = require("../clients/MPO/mpo-client");
var ReadingClient = require("../clients/readings-client");

for (var i=0; i<process.argv.length;i++) {
    switch (process.argv[i]) {
        case 'machine':
            var client = null;
            switch (process.argv[i+1]){
                case 'HBW':
                    client = new HBWClient();
                break;
                case 'VGR':
                    client = new VGRClient();
                break;
                case 'SLD':
                    client = new SLDClient();
                break;
                case 'MPO':
                    client = new MPOClient();
                break;
                case 'R':
                    client = new ReadingClient();
                break;
            }
            client.connect();
        break;
    }
}