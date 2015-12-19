var fs = require('fs');
var time = require('time');

var Logger = function(logfile) {
  this.logfile = logfile;
};

Logger.prototype.log = function() {
  var argsString = "";
  for (var i = 0; i < arguments.length; i++) {
    argsString += " " + arguments[i];
  }
  var logString = (new time.Date()).toString() + ": " + argsString;
  console.log(logString);
  fs.appendFileSync(this.logfile, logString, 'utf8', function(err) {
    throw new Error(err);
  });
}

module.exports = Logger;
