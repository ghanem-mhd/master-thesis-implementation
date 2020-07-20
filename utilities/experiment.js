require('dotenv').config()

var Web3 = require('web3')
var ProvidersManager = require('./providers-manager')
var KeyManager = require('./keys-manager')
var ContractManager = require('./contracts-manager')
var Logger = require('./logger')
const sleep = require('util').promisify(setTimeout)

module.exports = {

    init: async function(networkName){
        Logger.info("Initializing Wallets")

        Logger.info("Initializing wallet for device 1")
        this.wallet1 = await KeyManager.readFromFile('m1', 'test');
        this.provider1 = ProvidersManager.getHttpProvider(networkName, this.wallet1.privateKey);
        this.httpContract1 = await ContractManager.getTruffleContract(this.provider1, 'DemoProductionLine');
        
        Logger.info("Initializing wallet for device 2")
        this.wallet2 = await KeyManager.readFromFile('m2', 'test');
        this.provider2 = ProvidersManager.getHttpProvider(networkName, this.wallet2.privateKey);
        this.httpContract2 = await ContractManager.getTruffleContract(this.provider2, 'DemoProductionLine');

        Logger.info("Initializing wallet for device 3")
        this.wallet3 = await KeyManager.readFromFile('m3', 'test');
        this.provider3 = ProvidersManager.getHttpProvider(networkName, this.wallet3.privateKey);
        this.httpContract3 = await ContractManager.getTruffleContract(this.provider3, 'DemoProductionLine');

        Logger.info("Initializing wallet for device 4")
        this.wallet4 = await KeyManager.readFromFile('m4', 'test');
        this.provider4 = ProvidersManager.getHttpProvider(networkName, this.wallet4.privateKey);
        this.httpContract4 = await ContractManager.getTruffleContract(this.provider4, 'DemoProductionLine');
    },
    warehouseTask: async function(networkName, product, taskId){
        try {
            Logger.info("Executing warehouse task")

            await sleep(2000)

            var receipt = await this.httpContract1.finishWarehouseTask(product, taskId, {from: this.wallet1.address})
            Logger.logTx('Finished warehouse task', receipt)
        } catch (error) {
            Logger.error(error.toString())
        }
    },
    transferTask: async function(networkName, product, taskId){
        try {
            var transferParamName = Web3.utils.asciiToHex("direction");
            var receipt = await this.httpContract2.getTaskParameter(taskId, transferParamName);

            Logger.info("Executing transfer task with direction " + Web3.utils.hexToAscii(receipt));

            await sleep(2000)

            receipt = await this.httpContract2.finishTransferTask(product, taskId, {from: this.wallet2.address});
            Logger.logTx('Finished transfer task', receipt)
        } catch (error) {
            Logger.error(error.toString())
        }
    },
    mainTask: async function(networkName, product, taskId){
        try {
            Logger.info("Executing main task")

            await sleep(2000)

            var receipt = await this.httpContract3.finishMainTask(product, taskId, {from: this.wallet3.address})
            Logger.logTx('Finished main task', receipt)
        } catch (error) {
            Logger.error(error.toString())
        }
    },
    sortTask :async function(networkName, product, taskId){
        try {
            Logger.info("Executing sorting task")

            await sleep(2000)
            
            var someValue = Web3.utils.asciiToHex("someValue")

            var receipt = await this.httpContract4.finishSortingTask(product, taskId, someValue, {from: this.wallet4.address})
            Logger.logTx('Finished sorting task', receipt)
        } catch (error) {
            Logger.error(error.toString())
        }
    },
    create: async function(networkName){

        var provider = ProvidersManager.getHttpProvider(networkName, process.env.ADMIN_MNEMONIC)
        var adminAddress = KeyManager.getAddressFromMnemonic(process.env.ADMIN_MNEMONIC);


        var productAddress = KeyManager.getAddress('p1');
        var productColor = Web3.utils.asciiToHex("Red");

        var DemoProductionLine1 = await ContractManager.getTruffleContract(provider, 'DemoProductionLine');
        var receipt = await DemoProductionLine1.createDemoProduct(productAddress, productColor , {from: adminAddress});
        console.log(receipt)

    },
    listen: async function(networkName){
        try {
            var webSocketContract = await ContractManager.getWeb3Contract(networkName, 'DemoProductionLine');
            Logger.info("Starting listening for tasks...");
            webSocketContract.events.NewTask({ filter:{ device: this.wallet1.address } , fromBlock: 0}, async function(error, event){
                if (error){
                    console.log(error)
                }else{
                    product = event.returnValues['product']
                    taskId = event.returnValues['taskId']
                    device = event.returnValues['device']
                    Logger.info("Received warehouse task with id " + taskId);
                    module.exports.warehouseTask(networkName, product, taskId);
                }
            });

            webSocketContract.events.NewTask({ filter:{ device: this.wallet2.address } , fromBlock: 0}, async function(error, event){
                if (error){
                    console.log(error)
                }else{
                    product = event.returnValues['product']
                    taskId = event.returnValues['taskId']
                    device = event.returnValues['device']
                    Logger.info("Received transfer task with id " + taskId);
                    module.exports.transferTask(networkName, product, taskId);
                }
            });

            webSocketContract.events.NewTask({ filter:{ device: this.wallet3.address } , fromBlock: 0}, async function(error, event){
                if (error){
                    console.log(error)
                }else{
                    product = event.returnValues['product']
                    taskId = event.returnValues['taskId']
                    device = event.returnValues['device']
                    Logger.info("Received main task with id " + taskId);
                    module.exports.mainTask(networkName, product, taskId);
                }
            });

            webSocketContract.events.NewTask({ filter:{ device: this.wallet4.address } , fromBlock: 0}, async function(error, event){
                if (error){
                    console.log(error)
                }else{
                    product = event.returnValues['product']
                    taskId = event.returnValues['taskId']
                    device = event.returnValues['device']
                    Logger.info("Received sorting task with id " + taskId);
                    module.exports.sortTask(networkName, product, taskId);
                }
            });

        } catch (error) {
            Logger.error(error.toString())
        }
    },
    helper: function(array){
        var newArray = [];
        array.forEach(element => {
            newArray.push(Web3.utils.hexToUtf8(element))
        });
        return newArray;
    },
    show: async function(networkName){

        var provider = ProvidersManager.getHttpProvider(networkName, process.env.ADMIN_MNEMONIC)
        var adminAddress = KeyManager.getAddressFromMnemonic(process.env.ADMIN_MNEMONIC);


        var productAddress = KeyManager.getAddress('p1');

        var DemoProductionLine1 = await ContractManager.getTruffleContract(provider, 'DemoProductionLine');
        var tasks = await DemoProductionLine1.getProductTasks(productAddress);
        tasks.forEach(task => {
            var taskId = task.toString()
            DemoProductionLine1.getTask(taskId).then( (taskInfo) => {
                Logger.info(`Task ${taskId} info:`)
                console.log({
                    'Executed by device': taskInfo[0],
                    'Product Id': taskInfo[1],
                    'Task type': taskInfo[2],
                    'Starting time': new Date(taskInfo[3].toString() * 1000),
                    'Finishing time': new Date(taskInfo[4].toString() * 1000),
                    'Task Params': module.exports.helper(taskInfo[5])
                });
            });
        });
    },
}

for (var i=0; i<process.argv.length;i++) {
    switch (process.argv[i]) {
        case 'man':
        networkName = process.argv[i+1]
        module.exports.init(networkName).then( () => {
            module.exports.listen(networkName)
        });
        break;
        case 'create':
            module.exports.create(process.argv[i+1])
            break;
        case 'show':
            module.exports.show(process.argv[i+1])
            break;
    }
}