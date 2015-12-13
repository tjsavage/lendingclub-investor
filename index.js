var express = require('express');
var config = require('config');

var app = express();

var cron = require('./cron');

var LendingclubManager = require('node-lendingclub-manager')
var manager = new LendingclubManager(config.get('lendingClub'));

app.get('/', function (req, res) {

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
})

app.get('/api/loans/')

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
  console.log('Config: ', config.get('sqlite3'))
});
