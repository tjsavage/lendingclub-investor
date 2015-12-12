var CronJob = require('cron').CronJob;

var takeListedLoanSnapshot = require('./src/routines/take-listed-loan-snapshot');

new CronJob('1 6,10,14,18 * * *', function() {
  takeListedLoanSnapshot();
});
