require("dotenv").config();
var Datastore = require("nedb");

const db = {
    VC: new Datastore({ filename: process.env.VC_DB_PATH, autoload: true }),
    LOG: new Datastore({ filename: process.env.LOG_DB_PATH, autoload: true })
}

module.exports = db;