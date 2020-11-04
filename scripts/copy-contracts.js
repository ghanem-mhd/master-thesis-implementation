var fs = require('fs');

DISTENTION_DIR_PATH     = 'frontend/src/contracts'
var contractsToCopy     = ['VGR', 'MPO', 'SLD', 'HBW', 'Product', 'SupplyingProcess', 'ProductionProcess'];

if (!fs.existsSync(DISTENTION_DIR_PATH)){
    fs.mkdirSync(DISTENTION_DIR_PATH);
}

contractsToCopy.forEach(contractName => {
    var distention_path = `${DISTENTION_DIR_PATH}/${contractName}.json`
    try {
        fs.unlinkSync(distention_path);
    } catch(err) {}
    fs.createReadStream(`build/contracts/${contractName}.json`).pipe(fs.createWriteStream(distention_path));
});

fs.createReadStream('ethr-did-registry/build/contracts/EthereumDIDRegistry.json').pipe(fs.createWriteStream(`${DISTENTION_DIR_PATH}/EthereumDIDRegistry.json`));

