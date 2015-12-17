var express = require('express');
var config = require('config');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send("Fake Lendingclub API Server");
});

app.get('/accounts/11111/summary', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(__dirname + '/fixtures/summary.json');
})

app.get('/accounts/11111/availablecash', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(__dirname + '/fixtures/availablecash.json');
});

app.get('/accounts/11111/notes', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(__dirname + '/fixtures/notesowned.json');
});

app.get('/accounts/11111/detailednotes', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(__dirname + '/fixtures/detailednotes.json');
});

app.get('/accounts/11111/portfolios', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(__dirname + '/fixtures/portfolios.json');
});

app.get('/loans/listing', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(__dirname + '/fixtures/loans.json');
});

app.post('/accounts/11111/orders', function(req, res) {
  console.log("Submitted order:", req.body);

  var orderConfirmations = [];
  for(var i = 0; i < req.body.orders.length; i++) {
    var order = req.body.orders[i];
    var orderConfirmation = {
      loanId: order.loanId,
      requestedAmount: order.requestedAmount,
      investedAmount: order.requestedAmount,
      executionStatus: ["ORDER_FULFILLED"]
    }
    orderConfirmations.push(orderConfirmation);
  }

  res.json({
    orerInstructId: 55555,
    orderConfirmations: orderConfirmations
  });
})

var server = app.listen(process.env.PORT || 3001, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Fake lendingclub server listening at http://%s:%s', host, port);
});
