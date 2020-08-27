require("dotenv").config();

var HBWClient = require("./HBW/hbw-client");
var VGRClient = require("./VGR/vgr-client");
var SLDClient = require("./SLD/sld-client");
var MPOClient = require("./MPO/mpo-client");

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
            }
            client.connect();
        break;
    }
}