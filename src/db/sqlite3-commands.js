var fs = require('fs');

SQLite3Commands = {};

SQLite3Commands.createAllTables = function(db) {
  return Promise.all([
    CreateSqlite3DB.createListedLoansSnapshotsTable(db)
  ]);
}

SQLite3Commands.createListedLoansSnapshotsTable = function(db) {
  return new Promise(function(resolve, reject) {
    fs.readFile(__dirname + '/queries/sqlite3-create-listed-loans-snapshots.sql',
      'utf-8',
      function(err, data) {
      if (err) {
        throw new Error(err);
      }

      db.run(data, function(err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    })
  })
}

SQLite3Commands.checkIfListedLoansSnapshotsTableExists = function(db) {
  return new Promise(function(resolve, reject) {
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='ListedLoansSnapshots'", function(err, row) {
      if (err) throw new Error(err);

      if (!row) {
        resolve(false);
      }
      resolve(true);
    })
  })
}

SQLite3Commands.insertLoansIntoSnapshot = function(db, loans) {
  return new Promise(function(resolve, reject) {
    fs.readFile(__dirname + '/queries/sqlite3-insert-listed-loan-snapshot.sql', 'utf-8', function(err, data) {
      if(err) {
        throw new Error(err);
      }

      var snapshotTimestamp = (new Date()).toISOString();

      db.serialize(function() {
        var stmt = db.prepare(data);
        for(var i = 0; i < loans.length; i++) {
          var loan = loans[i];

          var loanObjToInsert = {
            $snapshotTimestamp: snapshotTimestamp
          };
          Object.keys(loan).forEach(function(key) {
            loanObjToInsert['$' + key] = loan[key];
          });
          stmt.run(loanObjToInsert, function(err) {
            if (err) throw new Error(err);
          });
        }

        stmt.finalize(resolve);
      })
    })

  })
}

module.exports = SQLite3Commands;
