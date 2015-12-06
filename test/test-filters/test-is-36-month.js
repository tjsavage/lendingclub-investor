var mocha = require('mocha');
var chai = require('chai');
var nock = require('nock');
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

nock.disableNetConnect();

var expect = chai.expect;

var LendingclubManager = require('node-lendingclub-manager');

var TEST_URL = "http://localhost";

var is36month = require('../../src/filters/is-36-month');

describe('is-36-month', function() {
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

  it('should correctly filterAll to loans with 36 month term', function() {
    var scope = nock(TEST_URL)
      .get("/loans/listing?showAll=true")
      .replyWithFile(200, __dirname + '/../fixtures/loans.json');

    return expect(manager.listLoans().then(function(loans) {
      return is36month.filterAll(loans, manager)
    })).to.eventually.have.length(1);
  });

  it('should correctly just filter a single loan', function() {
    var scope = nock(TEST_URL)
      .get("/loans/listing?showAll=true")
      .replyWithFile(200, __dirname + '/../fixtures/loans.json');

    return expect(manager.filterListedLoans(is36month.filter)).to.eventually.have.length(1);
  })
});
