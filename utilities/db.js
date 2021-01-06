require("dotenv").config();
var Datastore = require("nedb");

let db;

module.exports = {
  init: function () {
    db = {};
    db.credentials = new Datastore({
      filename: "./logs/credentials.json",
      autoload: true,
    });
    return db;
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
