require("dotenv").config();
var Datastore = require("nedb");

const db = {
    instance: new Datastore({ filename: process.env.DB_PATH, autoload: true })
}

module.exports = db;