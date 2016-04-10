var sqlite3 = require('sqlite3');
var LendingclubManager = require('node-lendingclub-manager');
var config = require('config');

var time = require('time');


var AutoInvest = require('../autoinvestor/autoinvestor');

var autoinvest = function autoinvest() {
  var lendingclubConfig = config.get('lendingClub');
  var autoinvestConfig = config.get('autoinvest');

  var manager = new LendingclubManager(lendingclubConfig);

  var autoinvestor = new AutoInvest(manager,
    ['ok-to-autoinvest', 'not-previously-invested-in', 'only-available-cash'],
    autoinvestConfig);

  return autoinvestor.invest().then(function() {
    console.log("Completed autoinvest of listed loans at ", (new time.Date()).toString());
  });
}

module.exports = autoinvest;
