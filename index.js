var express = require('express');
var config = require('config');

var app = express();

var cron = require('./cron');

var LendingclubManager = require('node-lendingclub-manager')
var manager = new LendingclubManager(config.get('lendingClub'));

app.use('/bower_components', express.static('bower_components'));
app.use('/elements', express.static('elements'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/api/loans', function(req, res) {
  manager.listLoans().then(function(loans) {
    if ('filter' in req.query) {
      var Filter = require('./src/filters/' + req.query.filter);
      return Filter.filterAll(loans);
    } else {
      return loans;
    }
  }).then(function(loans) {
    res.json(loans);
  });
});

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
  console.log('Config: ', config.get('sqlite3'))
});
