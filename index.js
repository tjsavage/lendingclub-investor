var express = require('express');
var app = express();

var config = require('./config.json');

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/invest', function(req, res) {

})

var server = app.listen(process.env.port || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
