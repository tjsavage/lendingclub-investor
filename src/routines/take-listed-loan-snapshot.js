var sqlite3 = require('sqlite3');
var LendingclubManager = require('node-lendingclub-manager');
var config = require('config');
var time = require('time');

var LoadAllListedLoans = require('../etl/load-all-listed-loans');

var takeListedLoanSnapshot = function takeListedLoanSnapshot() {
  var lendingclubConfig = config.get('lendingClub');
  var dbConfig = config.get('sqlite3.databasePath');

  var manager = new LendingclubManager(lendingclubConfig);
  var db = new sqlite3.Database(dbConfig);

  return LoadAllListedLoans.toSQLite3(manager, db).then(function() {
    console.log("Completed snapshot of listed loans at ", (new time.Date()).toString());
  });
}

module.exports = takeListedLoanSnapshot;
