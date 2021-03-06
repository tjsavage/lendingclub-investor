var LRNB = {};

LRNB.filterAll = function filterAll(loans) {
  return Promise.resolve().then(function() {
    var filteredLoans = [];

    loans.forEach(function(loan) {
      if (LRNB.filter(loan)) {
        filteredLoans.push(loan);
      }
    });
    return filteredLoans;
  })
}

LRNB.filter = function filter(loan) {
  return loan.mthsSinceLastDelinq == null
    && loan.mthsSinceLastRecord == null
    && loan.mthsSinceLastMajorDerog == null
    && loan.collections12MthsExMed == 0
    && loan.term == 36
//    && loan.dti < 30
    && (loan.purpose == 'debt_consolidation' || loan.purpose == 'credit_card')
    && loan.annualInc > 30000
    && loan.intRate > 11.5;
}

module.exports = LRNB;
