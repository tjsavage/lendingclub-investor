module.exports.filterAll = function filterAll(loans, manager) {
  return Promise.resolve().then(function() {
    if (typeof manager == 'undefined') {
      throw new Error("Must pass a manager to this filter");
    }

    var summary = manager.summary();

    return summary.then(function(summary) {
      var availableCash = summary.availableCash;

      var sortedLoans = [];

      loans.forEach(function(loan) {
        sortedLoans.push(loan);
      });

      sortedLoans.sort(function(a, b) {
        if (a.intRate < b.intRate) {
          return 1;
        } else if (a.intRate > b.intRate) {
          return -1;
        } else {
          return 0;
        }
      });

      var numNotes = Math.floor(availableCash / 25);

      return sortedLoans.slice(0, numNotes);

    });
  })

}
