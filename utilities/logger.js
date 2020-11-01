require("dotenv").config()
require('winston-socket.io');

const winston = require('winston');


const logger = winston.createLogger({

    transports: [
        new winston.transports.File({
            level: 'verbose',
            format: winston.format.combine(
                winston.format.prettyPrint()
              ),
            filename: 'logs/verbose.log',
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
    // + ": " + receipt.transactionHash
    if(receipt.hasOwnProperty('transactionHash')){
        logger.info(desc )
    }
    // + ": " + receipt.tx
    if(receipt.hasOwnProperty('tx')){
        logger.info(desc)
    }
    logger.verbose({desc,receipt})
}


logger.logEvent = function(eventLocation, eventDescription, payload = null) {
    const IO = require('./socket.js').getIO();
    const DB = require('./db.js').getEventsLogDB();
    var logMessage = {
        location: eventLocation,
        description: eventDescription,
        payload: payload,
        transactionHash: null,
        timestamp: new Date(),
    }
    if (payload){
        if(payload.hasOwnProperty('transactionHash')){
            logMessage.transactionHash = payload.transactionHash
        }
        if(payload.hasOwnProperty('tx')){
            logMessage.transactionHash = payload.tx
        }
    }
    logger.verbose(logMessage);
    DB.insert(logMessage, function (err, newDoc) {
        if (err){
            logger.error(err)
        }else{
            IO.in('stream_log').emit('event_log', newDoc);
        }
    });
    if (logMessage.transactionHash){
        logger.info(`${eventLocation} - ${eventDescription} : ${logMessage.transactionHash}`)
    }else{
        logger.info(`${eventLocation} - ${eventDescription}`);
    }
}

module.exports=logger;