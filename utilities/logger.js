const winston = require('winston');

const logger = winston.createLogger({

    transports: [
        new winston.transports.File({
            level: 'verbose',
            format: winston.format.combine(
                winston.format.prettyPrint()
              ),
            filename: 'logs/verbos.log',
            options: { flags: 'w' }
        }),
        new winston.transports.Console({
            level    : 'info',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ],
});

logger.logTx = function(desc, receipt){
    if(receipt.hasOwnProperty('transactionHash')){
        logger.info(desc + ": " + receipt.transactionHash)
    }
    if(receipt.hasOwnProperty('tx')){
        logger.info(desc + ": " + receipt.tx)
    }
    logger.verbose({desc,receipt})
}

module.exports=logger;