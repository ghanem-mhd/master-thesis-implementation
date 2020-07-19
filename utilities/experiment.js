require('dotenv').config()

var Web3 = require('web3')
var ProvidersManager = require('./providers-manager')
var KeyManager = require('./keys-manager')
var ContractManager = require('./contracts-manager')
var Logger = require('./logger')


module.exports = {
    experiment: async function(networkName){

        warehouseHandler = async function(error, event){
            if (error){
                console.log(error)
            }else{
                product = event.returnValues['product']
                Logger.info(`Product ${product} is done`)
                try {
                    receipt = await DemoProductionLine1.finishWarehouseTask(product, {from: wallet.address})
                    Logger.logTx('finishWarehouseTask', receipt)
                } catch (error) {
                    Logger.error(error.toString())
                }
            }
        }

        try {
            var wallet = await KeyManager.readFromFile('m1', 'test');
            var DemoProductionLine1 = await ContractManager.getTruffleContract(networkName, 'DemoProductionLine', wallet.privateKey)
            var DemoProductionLine2 = await ContractManager.getWeb3Contract(networkName, 'DemoProductionLine')
            Logger.info(`address ${wallet.address}`)
            Logger.info("Starting listening for warehouse tasks...")
            DemoProductionLine2.events.exeWarehouseTask({ filter:{} , fromBlock: 0},warehouseHandler);
        } catch (error) {
            Logger.error(error.toString())
        }
    }
}

for (var i=0; i<process.argv.length;i++) {
    switch (process.argv[i]) {
        case 'experiment':
        module.exports.experiment(process.argv[i+1])
        break;
    }
}