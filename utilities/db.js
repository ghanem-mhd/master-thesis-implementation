require("dotenv").config();
var Datastore = require("nedb");

let db;

module.exports = {
  init: function () {
    db = {};
    db.events_log = new Datastore({
      filename: "./logs/events_log.json",
      autoload: true,
    });
    db.credentials = new Datastore({
      filename: "./logs/credentials.json",
      autoload: true,
    });
    return db;
  },
  getEventsLogDB() {
    if (!db) {
      return null;
    }
    return module.exports.getDB().events_log;
  },
  getCredentialsDB() {
    if (!db) {
      return null;
    }
    return module.exports.getDB().credentials;
  },
  getDB: function () {
    if (!db) {
      return null;
    }
    return db;
  },
};
