var filter = require('../src/filters/ok-to-autoinvest');
var loans = require('./fixtures/real_loans.json');

var filteredLoans = filter.filterAll(loans);

filteredLoans.then(function(result) {
  console.log(result.length);
})
