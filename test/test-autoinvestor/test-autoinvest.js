var TEST_URL = "http://localhost";
var temp = require('temp').track();
var path = require('path');

var mocha = require('mocha');
var chai = require('chai');
var nock = require('nock');
var chaiAsPromised = require("chai-as-promised");
var sqlite3 = require('sqlite3');

chai.use(chaiAsPromised);

nock.disableNetConnect();

var expect = chai.expect;

var LendingclubManager = require('node-lendingclub-manager');

var AutoInvestor = require('../../src/autoinvestor/autoinvestor');

describe('autoinvest', function() {
  var manager;
  var config;

  beforeEach(function() {
    var tempDir = temp.mkdirSync('test');

    config = {
      databasePath: path.join(tempDir, "autoinvest_db"),
      logPath: path.join(tempDir, "autoinvest_log"),
      force: true
    }

    manager = new LendingclubManager({
      investorId: "11111",
      key: "key",
      baseUrl: TEST_URL
    });
  });

  it('should throw if not given a db', function() {
    expect(function() {
      new AutoInvestor(manager, [], {logPath: ""});
    }).to.throw(/databasePath/);
  });

  it('should throw if not given a log file', function() {
    expect(function() {
      new AutoInvestor(manager, [], {databasePath: ""});
    }).to.throw(/log/);
  });

  it('should correctly automatically invest with filters', function() {
    var scope = nock(TEST_URL)
        .get('/accounts/11111/notes')
        .replyWithFile(200, __dirname + '/../fixtures/notesowned.json');

    scope = scope.get("/loans/listing?showAll=true")
      .replyWithFile(200, __dirname + '/../fixtures/loans.json');

    scope = scope.get('/accounts/11111/notes')
      .replyWithFile(200, __dirname + '/../fixtures/notesowned.json');

    var portfolioName;

    scope = scope.post('/accounts/11111/portfolios', function(body) {
      portfolioName = body.portfolioName;
      return body.aid == 11111 && body.portfolioName.indexOf("Auto") > -1
    }).reply(200, {
      portfolioId: 22222,
      portfolioName: portfolioName
    });

    scope = scope.post('/accounts/11111/orders', {
      "aid":11111,
      "orders": [
        {
          "loanId":33333,
          "requestedAmount":25,
          "portfolioId": 22222
        },
        {
          "loanId":44444,
          "requestedAmount":25,
          "portfolioId": 22222
        },
        {
          "loanId":55555,
          "requestedAmount":25,
          "portfolioId": 22222
        }
      ]}).reply(200, {
      	"orderInstructId":55555,
      	"orderConfirmations": [
      	{
      		"loanId":33333,
      		"requestedAmount":25.0,
      		"investedAmount":25.0,
      		"executionStatus":
      			[
      			"ORDER_FULFILLED"
      			]
      	},
      	{
      		"loanId":44444,
      		"requestedAmount":25.0,
      		"investedAmount":25.0,
      		"executionStatus":
      			[
      			"ORDER_FULFILLED"
      			]
      	},
      	{
      		"loanId":55555,
      		"requestedAmount":25.0,
      		"investedAmount":0,
      		"executionStatus":
      			[
      			"NOT_AN_INFUNDING_LOAN"
      			]
      	}]
      });

    var completionPromise = Promise.resolve().then(function() {
      var autoinvestor = new AutoInvestor(manager, ['not-previously-invested-in'], config);
      console.log("Created autoinvestor object");

      return autoinvestor.invest()
        .catch(function(err) {
          console.log(err.stack);
          throw new Error(err);
        })
    });

    var selectPromise = completionPromise.then(function() {
      return new Promise(function(resolve, reject) {
        var db = new sqlite3.Database(config.databasePath);
        db.all("SELECT * FROM Orders", function(err, rows) {
          resolve(rows)
        });
      });
    })

    var orderNotesPromise = completionPromise.then(function() {
      return new Promise(function(resolve, reject) {
        var db = new sqlite3.Database(config.databasePath);
        db.all("SELECT * FROM OrderLoans", function(err, rows) {
          resolve(rows);
        });
      })
    })

    return Promise.all([
      expect(completionPromise).to.eventually.be.fulfilled
      //expect(selectPromise).to.eventually.have.length(1),
      //expect(orderNotesPromise).to.eventually.have.length(3)
    ]);
  });

  it('should correctly do a dry run', function() {
    var scope = nock(TEST_URL)
        .get('/accounts/11111/notes')
        .replyWithFile(200, __dirname + '/../fixtures/notesowned.json');

    scope = scope.get("/loans/listing?showAll=true")
      .replyWithFile(200, __dirname + '/../fixtures/loans.json');

    scope = scope.get('/accounts/11111/notes')
      .replyWithFile(200, __dirname + '/../fixtures/notesowned.json');

    var dryRunConfig = {
      databasePath: config.databasePath,
      logPath: config.logPath,
      dryRun: true,
      force: config.force
    }

    var completionPromise = Promise.resolve().then(function() {
      var autoinvestor = new AutoInvestor(manager, ['not-previously-invested-in'], dryRunConfig);
      return autoinvestor.invest()
        .catch(function(err) {
          console.log(err.stack);
          throw new Error(err);
        })
    });

    var selectPromise = completionPromise.then(function() {
      return new Promise(function(resolve, reject) {
        var db = new sqlite3.Database(config.databasePath);
        db.all("SELECT * FROM Orders", function(err, rows) {
          resolve(rows)
        });
      });
    })

    var resultPromise = completionPromise.then(function() {
      return new Promise(function(resolve, reject) {
        var db = new sqlite3.Database(config.databasePath);
        db.get("SELECT result FROM Orders", function(err, row) {
          resolve(row.result)
        })
      })
    })

    return Promise.all([
      expect(completionPromise).to.eventually.be.fulfilled,
      expect(selectPromise).to.eventually.have.length(1),
      expect(resultPromise).to.eventually.contain('dryRun')
    ]);
  });

  it('should fail the sanity check with too many orders', function() {
    var scope = nock(TEST_URL)
        .get('/accounts/11111/notes')
        .replyWithFile(200, __dirname + '/../fixtures/notesowned.json');

    scope = scope.get("/loans/listing?showAll=true")
      .replyWithFile(200, __dirname + '/../fixtures/loans_long.json');

    scope = scope.get('/accounts/11111/notes')
      .replyWithFile(200, __dirname + '/../fixtures/notesowned.json');

    var completionPromise = Promise.resolve().then(function() {
      var autoinvestor = new AutoInvestor(manager, ['not-previously-invested-in'], config);

      return autoinvestor.invest()
        .catch(function(err) {
          console.log(err.stack);
          throw new Error(err);
        })
    });

    return Promise.all([
      expect(completionPromise).to.eventually.be.rejectedWith(/sanity/),
    ]);
  });

  it('should fail if it cannot get a loan list', function() {
    var scope = nock(TEST_URL)
        .get("/loans/listing?showAll=true")
        .reply(404);
        //.replyWithFile(200, __dirname + '/../fixtures/notesowned.json');

    var completionPromise = Promise.resolve().then(function() {
      var autoinvestor = new AutoInvestor(manager, ['not-previously-invested-in'], config);

      return autoinvestor.invest()
        .catch(function(err) {
          console.log(err.stack);
          throw new Error(err);
        })
    });

    return Promise.all([
      expect(completionPromise).to.eventually.be.rejectedWith(/Undefined response/),
    ]);
  });
});
