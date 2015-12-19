var mocha = require('mocha');
var chai = require('chai');
var nock = require('nock');
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

nock.disableNetConnect();

var expect = chai.expect;

var LendingclubManager = require('node-lendingclub-manager');

var TEST_URL = "http://localhost";

var notPreviouslyInvestedIn = require('../../src/filters/not-previously-invested-in');

describe('not-previously-invested-in', function() {
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
    return expect(notPreviouslyInvestedIn.filterAll(loans)).to.eventually.be.rejectedWith(/manager/);
  });

  it('should correctly filter to loans not invested in', function() {
    var scope = nock(TEST_URL)
        .get('/accounts/11111/notes')
        .replyWithFile(200, __dirname + '/../fixtures/notesowned.json');

    scope = scope.get("/loans/listing?showAll=true")
      .replyWithFile(200, __dirname + '/../fixtures/loans.json');

    return expect(manager.listLoans().then(function(loans) {
      return notPreviouslyInvestedIn.filterAll(loans, manager)
    })).to.eventually.have.length(3);
  });
});
