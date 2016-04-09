var fs = require('fs');
var time = require('time');

var Logger = function(logfile, logglyConfig) {
  this.logfile = logfile;

  if (logglyConfig) {
    this.winston = require('winston');
    require('winston-loggly');
    this.winston.add(this.winston.transports.Loggly, logglyConfig);
  }
};

Logger.prototype.log = function() {
  var logString = this._logStringFromArgs.apply(this, arguments);


  if (this.winston) {
    this.winston.log('info', logString);
  } else {
    console.log(logString);
  }
  this._logToFile(logString);
}

Logger.prototype.error = function() {
  var logString = this._logStringFromArgs(arguments);

  //console.error(logString);
  if (this.winston) {
    this.winston.log('error', logString);
  } else {
    console.log(logString);
  }
  this._logToFile(logString);
}

Logger.prototype._logStringFromArgs = function() {
  var argsString = "";
  for (var i = 0; i < arguments.length; i++) {
    argsString += " " + arguments[i];
  }

  var logString = (new time.Date()).toString() + ": " + argsString;
  return logString
}

Logger.prototype._logToFile = function(logString) {
  logString += "\n";

  fs.appendFileSync(this.logfile, logString, 'utf8', function(err) {
    throw new Error(err);
  });
}

module.exports = Logger;
