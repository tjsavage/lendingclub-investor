var sqlite3 = require('sqlite3');

var LendingclubManager = require('node-lendingclub-manager');
var config = require('../../config.json');

var LoadAllListedLoans = require('../etl/load-all-listed-loans');

var manager = new LendingclubManager(config.lendingClub);
var db = new sqlite3.Database(config.sqlite3.filename);

LoadAllListedLoans.toSQLite3(manager, db).then(function() {
  console.log("DONE!");
});
