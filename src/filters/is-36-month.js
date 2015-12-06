var Is36Month = {};

Is36Month.filterAll = function filterAll(loans) {
  return Promise.resolve().then(function() {
    return loans.filter(Is36Month.filter);
  })
}

Is36Month.filter = function filter(loan) {
  return loan.term == 36;
}

module.exports = Is36Month;
