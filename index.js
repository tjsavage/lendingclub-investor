var express = require('express');
var config = require('config');

var app = express();

var cron = require('./cron');

app.get('/', function (req, res) {
  res.send('Hello World, investorId: ' + config.get('lendingClub.investorId'));
});

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
  console.log('Config: ', config.get('sqlite3'))
});
