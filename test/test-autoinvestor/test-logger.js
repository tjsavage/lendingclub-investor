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

var Logger = require('../../src/autoinvestor/logger');

describe('Logger', function(){
  var logger;

  beforeEach(function() {
    var tempDir = temp.mkdirSync('test');

    var logFile = path.join(tempDir, "logfile");

    logger = new Logger(logFile);
  });
})
