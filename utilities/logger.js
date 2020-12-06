require("dotenv").config();
require("winston-socket.io");

const winston = require("winston");

winston.loggers.add("GasLogger", {
  transports: [
    new winston.transports.File({
      level: "info",
      format: winston.format.combine(winston.format.prettyPrint()),
      filename: "logs/GasUsed.log",
      options: { flags: "w" },
    }),
  ],
});

const GasLogger = winston.loggers.get("GasLogger");

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      level: "verbose",
      format: winston.format.combine(winston.format.prettyPrint()),
      filename: "logs/verbose.log",
      options: { flags: "w" },
    }),
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

logger.logTx = function (desc, receipt) {
  // + ": " + receipt.transactionHash
  if (receipt.hasOwnProperty("transactionHash")) {
    logger.info(desc);
  }
  // + ": " + receipt.tx
  if (receipt.hasOwnProperty("tx")) {
    logger.info(desc);
  }
  logger.verbose({ desc, receipt });
};

logger.logError = function (error, errorLocation = "Not specified") {
  logger.error(`Error in ${errorLocation}`);
  logger.error(error);
  logger.error(error.stack);
};

logger.logEvent = function (eventLocation, eventDescription, payload = null) {
  var logMessage = {
    location: eventLocation,
    description: eventDescription,
    payload: payload,
    transactionHash: null,
    timestamp: new Date(),
  };
  if (payload) {
    if (payload.hasOwnProperty("transactionHash")) {
      logMessage.transactionHash = payload.transactionHash;
      GasLogger.info({
        eventDescription: eventDescription,
        gasUsed: payload.receipt.gasUsed,
      });
    }
    if (payload.hasOwnProperty("tx")) {
      logMessage.transactionHash = payload.tx;
      GasLogger.info({
        eventDescription: eventDescription,
        gasUsed: payload.receipt.gasUsed,
      });
    }
  }
  logger.verbose(logMessage);
  if (logMessage.transactionHash) {
    logger.info(
      `${eventLocation} - ${eventDescription} : ${logMessage.transactionHash}`
    );
  } else {
    logger.info(`${eventLocation} - ${eventDescription}`);
    if (payload) {
      logger.info(`${JSON.stringify(payload)}`);
    }
  }
  console.log(
    "----------------------------------------------------------------------------------------------------------"
  );
  const IO = require("./socket.js").getIO();
  const DB = require("./db.js").getEventsLogDB();
  if (DB) {
    DB.insert(logMessage, function (err, newDoc) {
      if (err) {
        logger.error(err);
      } else {
        if (IO) {
          IO.in("stream_log").emit("event_log", newDoc);
        }
      }
    });
  }
};

module.exports = logger;
