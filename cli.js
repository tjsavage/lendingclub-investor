var program = require('commander');
var config = require('config');
var clone = require('clone');
var LendingclubManager = require('node-lendingclub-manager');

var AutoInvestor = require('./src/autoinvestor/autoinvestor');

program
  .version('0.0.1')
  .option('-d, --dryRun [true|false]', 'Run just a dry-run, do not actually invest')
  .option('-f, --force', 'Force-complete order')

program
  .command('autoinvest')
  .action(function() {
    var lendingclubConfig = config.get('lendingClub');
    var autoinvestConfig = clone(config.get('autoinvest'));

    var manager = new LendingclubManager(lendingclubConfig);

    if (program.force) {
      autoinvestConfig.force = true;
    }

    if (typeof program.dryRun != 'undefined') {
      if (program.dryRun == 'false' || !program.dryRun) {
        autoinvestConfig.dryRun = false;
      } else {
        autoinvestConfig.dryRun = true;
      }
    }

    var autoinvestor = new AutoInvestor(manager, ['ok-to-autoinvest', 'not-previously-invested-in', 'only-available-cash'], autoinvestConfig);

    return autoinvestor.invest();
  });

program.parse(process.argv);
