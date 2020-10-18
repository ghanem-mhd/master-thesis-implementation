require("dotenv").config();

const ContractsManager = require("./contracts-manager");
const Logger = require("./logger");
const transactionOption = {from:process.env.MANUFACTURER, gas: process.env.DEFAULT_GAS}

var contractsAsyncGets = [
    ContractsManager.getWeb3Contract(process.env.NETWORK, "VGR"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "HBW"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "MPO"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "SLD"),
    ContractsManager.getWeb3Contract(process.env.NETWORK, "Product")
];

function finish(){
    process.exit(0);
}

Promise.all(contractsAsyncGets).then( async contracts => {
    var VGRContract     = contracts[0];
    var HBWContract     = contracts[1];
    var MPOContract     = contracts[2];
    var SLDContract     = contracts[3];
    var ProductContract = contracts[4];

    for (var i=0; i<process.argv.length;i++) {
        switch (process.argv[i]) {
            case 'task':
                switch (process.argv[i+1]){
                    case 'SLD':
                        assignSortingTask()
                    break;
                    case 'MPO':
                        assignProcessingTask()
                    break;
                    case 'HBW1':
                        assignFetchContainerTask()
                    break;
                    case 'HBW2':
                        assignStoreContainerTask()
                    break;
                    case 'HBW3':
                        assignStoreProductTask()
                    break;
                    case 'HBW4':
                        assignFetchProductTask()
                    break;
                    case 'VGR1':
                        assignedGetInfoTask()
                    break;
                    case 'VGR2':
                        assignedDropToHBWTask()
                    break;
                    case 'VGR3':
                        assignedMoveHBW2MPOTask()
                    break;
                    case 'VGR4':
                        assignedPickSortedTask()
                    break;
                }
            break;
        }
    }

    async function assignSortingTask(){
        await ProductContract.methods.authorizeMachine(process.env.SLD, process.env.DUMMY_PRODUCT).send({from:process.env.PRODUCT_OWNER});
        SLDContract.methods.assignSortingTask(1, process.env.DUMMY_PRODUCT).send(transactionOption, function(error, transactionHash){
            if (error){
                Logger.error(error.stack)
            }else{
                Logger.info("Sorting task assigned " + transactionHash);
            }
            finish()
        });
    }

    async function assignProcessingTask(){
        await ProductContract.methods.authorizeMachine(process.env.MPO, process.env.DUMMY_PRODUCT).send({from:process.env.PRODUCT_OWNER});
        MPOContract.methods.assignProcessingTask(1, process.env.DUMMY_PRODUCT).send(transactionOption, function(error, transactionHash){
            if (error){
                Logger.error(error.stack)
            }else{
                Logger.info("Processing task assigned " + transactionHash);
            }
            finish()
        });
    }

    async function assignFetchContainerTask(){
        HBWContract.methods.assignFetchContainerTask(1).send(transactionOption, function(error, transactionHash){
            if (error){
                Logger.error(error.stack)
            }else{
                Logger.info("FetchContainer task assigned " + transactionHash);
            }
            finish()
        });
    }

    async function assignStoreContainerTask(){
        HBWContract.methods.assignStoreContainerTask(1).send(transactionOption, function(error, transactionHash){
            if (error){
                Logger.error(error.stack)
            }else{
                Logger.info("FetchContainer task assigned " + transactionHash);
            }
            finish()
        });
    }

    async function assignStoreProductTask(){
        await ProductContract.methods.authorizeMachine(process.env.HBW, process.env.DUMMY_PRODUCT).send({from:process.env.PRODUCT_OWNER});
        HBWContract.methods.assignStoreProductTask(1, process.env.DUMMY_PRODUCT, "1", "11").send(transactionOption, function(error, transactionHash){
            if (error){
                Logger.error(error.stack)
            }else{
                Logger.info("FetchContainer task assigned " + transactionHash);
            }
            finish()
        });
    }

    async function assignFetchProductTask(){
        await ProductContract.methods.authorizeMachine(process.env.HBW, process.env.DUMMY_PRODUCT).send({from:process.env.PRODUCT_OWNER});
        HBWContract.methods.assignFetchProductTask(1, process.env.DUMMY_PRODUCT).send(transactionOption, function(error, transactionHash){
            if (error){
                Logger.error(error.stack)
            }else{
                Logger.info("FetchContainer task assigned " + transactionHash);
            }
            finish()
        });
    }

    async function assignedGetInfoTask(){
        await ProductContract.methods.authorizeMachine(process.env.VGR, process.env.DUMMY_PRODUCT).send({from:process.env.PRODUCT_OWNER});
        VGRContract.methods.assignGetInfoTask(1, process.env.DUMMY_PRODUCT).send(transactionOption, function(error, transactionHash){
            if (error){
                Logger.error(error.stack)
            }else{
                Logger.info("GetInfo task assigned " + transactionHash);
            }
            finish()
        });
    }

    async function assignedDropToHBWTask(){
        await ProductContract.methods.authorizeMachine(process.env.VGR, process.env.DUMMY_PRODUCT).send({from:process.env.PRODUCT_OWNER});
        VGRContract.methods.assignDropToHBWTask(1, process.env.DUMMY_PRODUCT).send(transactionOption, function(error, transactionHash){
            if (error){
                Logger.error(error.stack)
            }else{
                Logger.info("DropToHBW task assigned " + transactionHash);
            }
            finish()
        });
    }

    async function assignedMoveHBW2MPOTask(){
        await ProductContract.methods.authorizeMachine(process.env.VGR, process.env.DUMMY_PRODUCT).send({from:process.env.PRODUCT_OWNER});
        VGRContract.methods.assignMoveHBW2MPOTask(1, process.env.DUMMY_PRODUCT).send(transactionOption, function(error, transactionHash){
            if (error){
                Logger.error(error.stack)
            }else{
                Logger.info("MoveHBW2MPO task assigned " + transactionHash);
            }
            finish()
        });
    }

    async function assignedPickSortedTask(){
        await ProductContract.methods.authorizeMachine(process.env.VGR, process.env.DUMMY_PRODUCT).send({from:process.env.PRODUCT_OWNER});
        VGRContract.methods.assignPickSortedTask(1, process.env.DUMMY_PRODUCT, "PINK").send(transactionOption, function(error, transactionHash){
            if (error){
                Logger.error(error.stack)
            }else{
                Logger.info("PickSorted task assigned " + transactionHash);
            }
            finish()
        });
    }
});


