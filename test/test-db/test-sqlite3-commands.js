var mocha = require('mocha');
var chai = require('chai');
var nock = require('nock');
var chaiAsPromised = require("chai-as-promised");

var sqlite3 = require('sqlite3');

chai.use(chaiAsPromised);

var expect = chai.expect;

describe('sqlite3-commands', function() {
  var sqlite3commands;

  beforeEach(function() {
    sqlite3commands = require('../../src/db/sqlite3-commands');
  })

  describe('createListedLoansSnapshotsTable', function() {
    it('should correctly create the table', function() {
      var db = new sqlite3.Database(':memory:');

      var createdPromise = sqlite3commands.createListedLoansSnapshotsTable(db);

      return expect(createdPromise.then(function(error) {
        if (error) {
          throw new Error(error);
        }
      }).then(function() {
        return new Promise(function(resolve, reject) {
          db.run("SELECT * FROM ListedLoansSnapshots", function(err) {
            expect(err).to.be.null;
            if (err) reject(err);
            resolve();
          })
        });
      })).to.eventually.resolve;
    })
  });

  describe('checkIfListedLoansSnapshotsTableExists', function() {
    it('should correctly get that the table exists', function() {
      var db = new sqlite3.Database(':memory:');

      var createdPromise = sqlite3commands.createListedLoansSnapshotsTable(db);

      var tableExistsPromise = createdPromise.then(function() {
        return sqlite3commands.checkIfListedLoansSnapshotsTableExists(db)
      });

      return expect(tableExistsPromise).to.eventually.equal(true);
    });

    it('should correctly return false if the table does not exist', function() {
      var db = new sqlite3.Database(':memory:');

      return expect(sqlite3commands.checkIfListedLoansSnapshotsTableExists(db)).to.eventually.be.false;
    })
  });

  describe('insertLoansIntoSnapshot', function() {
    var db;

    beforeEach(function(done) {
      db = new sqlite3.Database(':memory:')
      var createdPromise = sqlite3commands.createListedLoansSnapshotsTable(db);
      createdPromise.then(done);
    });

    it('should correctly insert loans', function() {
      var loansResponse = JSON.parse(JSON.stringify(require('../fixtures/loans.json')));
      var loans = loansResponse.loans;

      var insertedPromise = sqlite3commands.insertLoansIntoSnapshot(db, loans);

      var selectPromise = insertedPromise.then(function() {
        return new Promise(function(resolve, reject) {
          db.all("SELECT * FROM ListedLoansSnapshots", function(err, rows) {
            resolve(rows)
          });
        })
      });

      return expect(selectPromise).to.eventually.have.length(5);
    })
  })
})
