var express = require('express');
var config = require('config');

var app = express();

app.get('/', function (req, res) {
  res.send('Hello World');
  res.send('investorId: ' + config.get('lendingClub.investorId'));
});

app.get('/invest', function(req, res) {

})

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
  console.log('Config: ', config.get('sqlite3'))
});
