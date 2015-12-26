var sqlite3 = require('sqlite3');
var LendingclubManager = require('node-lendingclub-manager');
var config = require('config');
var time = require('time');

var AutoInvest = require('../autoinvestor/autoinvest');

var autoinvest = function autoinvest() {
  var lendingclubConfig = config.get('lendingClub');
  var autoinvestConfig = config.get('autoinvest');

  var manager = new LendingclubManager(lendingclubConfig);

  return AutoInvest.invest(manager, ['ok-to-autoinvest', 'not-previously-invested-in', 'only-available-cash'], autoinvestConfig).then(function() {
    console.log("Completed autoinvest of listed loans at ", (new time.Date()).toString());
  });
}

module.exports = autoinvest;
