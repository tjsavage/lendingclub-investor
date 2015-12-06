var sqlite3commands = require('../db/sqlite3-commands');

LoadAllListedLoans = {};

LoadAllListedLoans.toSQLite3 = function(manager, db) {
  var listedLoansPromise = manager.listLoans();
  var createdTablePromise = sqlite3commands.createListedLoansSnapshotsTable(db);
  return Promise.all([listedLoansPromise, createdTablePromise]).then(function(results) {
    var loans = results[0];
    return sqlite3commands.insertLoansIntoSnapshot(db, loans);
  });
}

module.exports = LoadAllListedLoans;
