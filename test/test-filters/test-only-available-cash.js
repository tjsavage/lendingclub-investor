var mocha = require('mocha');
var chai = require('chai');
var nock = require('nock');
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

nock.disableNetConnect();

var expect = chai.expect;

var LendingclubManager = require('node-lendingclub-manager');

var TEST_URL = "http://localhost";

var onlyAvailableCash = require('../../src/filters/only-available-cash');

describe('only-available-cash', function() {
  var manager;
  var loans;

  beforeEach(function() {
    manager = new LendingclubManager({
      investorId: "11111",
      key: "key",
      baseUrl: TEST_URL
    });

    loans = JSON.parse(JSON.stringify(require('../fixtures/loans.json')));
  })

  it('should throw if called without a manager', function() {
    return expect(onlyAvailableCash.filterAll(loans)).to.eventually.be.rejectedWith(/manager/);
  });

  it('should correctly filter to only 2 loans with the highest interest rate', function() {
    var scope = nock(TEST_URL)
        .get('/accounts/11111/summary')
        .replyWithFile(200, __dirname + '/../fixtures/summary.json');

    scope = scope.get("/loans/listing?showAll=true")
      .replyWithFile(200, __dirname + '/../fixtures/loans.json');

    var loansPromise = manager.listLoans().then(function(loans) {
      return onlyAvailableCash.filterAll(loans, manager);
    });

    return Promise.all([
      expect(loansPromise).to.eventually.have.length(2),
      expect(loansPromise.then(function(loans) {
        return loans[0].intRate;
      })).to.eventually.equal(18.49)
    ]);

  });
});
