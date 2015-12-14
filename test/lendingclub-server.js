var express = require('express');
var config = require('config');

var app = express();

app.get('/', function (req, res) {
  res.send("Fake Lendingclub API Server");
});

app.get('/accounts/11111/summary', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(__dirname + '/summary.json');
})

app.get('/accounts/11111/availablecash', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(__dirname + '/availablecash.json');
});

app.get('/accounts/11111/notes', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(__dirname + '/notesowned.json');
});

app.get('/accounts/11111/detailednotes', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(__dirname + '/detailednotes.json');
});

app.get('/accounts/11111/portfolios', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(__dirname + '/portfolios.json');
});

app.get('/loans/listing', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(__dirname + '/fixtures/loans.json');
});

var server = app.listen(process.env.PORT || 3001, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Fake lendingclub server listening at http://%s:%s', host, port);
});
