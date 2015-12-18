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
      var filterNames = req.query.filter.split(',');
      var filters = [];
      var filterPromiseChain = Promise.resolve(loans);

      for (var i = 0; i < filterNames.length; i++) {
        if (filterNames[i] && filterNames[i] != 'none') {
          filters.push(require('./src/filters/' + filterNames[i]));
        }
      }

      filters.forEach(function(filter) {
        filterPromiseChain = filterPromiseChain.then(function(filteredLoans) {
          return filter.filterAll(filteredLoans, manager);
        });
      })

      return filterPromiseChain;
    } else {
      return loans;
    }
  }).then(function(loans) {
    res.json(loans);
  }).catch(function(err) {
    console.log(err);
    res.sendStatus(500);
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
