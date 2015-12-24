var program = require('commander');

program
  .version('0.0.1')
  .option('-d, --dryRun', 'Run just a dry-run, do not actually invest')
  .option('-f, --force', 'Force-complete order')
  .option('-v, --verbose', 'Run loudly');

program
  .command('autoinvest')
  .action(function() {
    console.log(program.dryRun)
    console.log(program.force);
  });

program
  .command('list')
  .action(function() {
    console.log(program.filters);
  });

program.parse(process.argv);
