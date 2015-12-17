var express = require('express');
var config = require('config');
var fork = require('child_process').fork;
var bodyParser = require('body-parser');


var app = express();

var cron = require('./cron');

var LendingclubManager = require('node-lendingclub-manager')
var manager = new LendingclubManager(config.get('lendingClub'));

if (process.env.NODE_ENV == 'development') {
   var lendingclubServer = fork('./test/lendingclub-server.js');
   lendingclubServer.on('message', function(data) {
     console.log('lendingclubServer: ' + data);
   });
}

app.use(bodyParser.json());

app.use('/bower_components', express.static('bower_components'));
app.use('/elements', express.static('elements'));

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

app.get('/api/summary', function(req, res) {
  manager.summary().then(function(summary) {
    res.json(summary);
  });
});

app.post('/api/submitOrder', function(req, res) {
  manager.createOrders(req.body)
    .then(function(orders) {
      return manager.submitOrders(orders)
    })
    .then(function(result) {
      res.json(result);
    });
})

app.get('/*', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
