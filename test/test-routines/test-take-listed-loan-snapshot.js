var TEST_URL = "http://localhost";
var temp = require('temp').track();
var path = require('path');

var tempDir = temp.mkdirSync('test');

process.env.NODE_CONFIG = JSON.stringify({
  lendingClub: {
    key: "abc",
    investorId: 11111,
    baseUrl: TEST_URL
  },
  sqlite3: {
    databasePath: path.join(tempDir, "db")
  }
});

var mocha = require('mocha');
var chai = require('chai');
var nock = require('nock');
var chaiAsPromised = require("chai-as-promised");
var sqlite3 = require('sqlite3');

chai.use(chaiAsPromised);

nock.disableNetConnect();

var expect = chai.expect;

var LendingclubManager = require('node-lendingclub-manager');

var takeListedLoanSnapshot = require('../../src/routines/take-listed-loan-snapshot');



describe('take-listed-loan-snapshot', function() {
  it('should take a correct snapshot', function() {
    var scope = nock(TEST_URL)
      .get("/loans/listing?showAll=true")
      .replyWithFile(200, __dirname + '/../fixtures/loans.json');



    var loadedPromise = takeListedLoanSnapshot();

    var selectPromise = loadedPromise.then(function() {
      return new Promise(function(resolve, reject) {
        var db = new sqlite3.Database(path.join(tempDir, 'db'));

        db.all("SELECT * FROM ListedLoansSnapshots", function(err, rows) {
          resolve(rows)
        });
      })
    });

    return expect(selectPromise).to.eventually.have.length(5);
  });
});
