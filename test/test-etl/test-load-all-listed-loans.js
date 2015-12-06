var mocha = require('mocha');
var chai = require('chai');
var nock = require('nock');
var chaiAsPromised = require("chai-as-promised");
var sqlite3 = require('sqlite3');

chai.use(chaiAsPromised);

nock.disableNetConnect();

var expect = chai.expect;

var LendingclubManager = require('node-lendingclub-manager');
var sqlite3commands = require('../../src/db/sqlite3-commands');

var TEST_URL = "http://localhost";

var LoadAllListedLoans = require('../../src/etl/load-all-listed-loans');

describe('load-all-listed-loans', function() {
  describe('toSQLite3', function() {
    var manager;
    var db;

    beforeEach(function(done) {
      manager = new LendingclubManager({
        investorId: "11111",
        key: "key",
        baseUrl: TEST_URL
      });

      db = new sqlite3.Database(':memory:');

      sqlite3commands.createListedLoansSnapshotsTable(db).then(done);
    });

    it('should successfully load loans from the api into the db', function() {
      var scope = nock(TEST_URL)
        .get("/loans/listing?showAll=true")
        .replyWithFile(200, __dirname + '/../fixtures/loans.json');

      var loadedPromise = LoadAllListedLoans.toSQLite3(manager, db);

      var selectPromise = loadedPromise.then(function() {
        return new Promise(function(resolve, reject) {
          db.all("SELECT * FROM ListedLoansSnapshots", function(err, rows) {
            resolve(rows)
          });
        })
      });

      return expect(selectPromise).to.eventually.have.length(5);
    })
  });
});
