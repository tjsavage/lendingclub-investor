var AutoInvest = {};

AutoInvest.filterAll = function filterAll(loans) {
  return Promise.resolve().then(function() {
    var filteredLoans = [];

    loans.forEach(function(loan) {
      if (AutoInvest.filter(loan)) {
        filteredLoans.push(loan);
      }
    });
    return filteredLoans;
  })
}

AutoInvest.filter = function filter(loan) {
  return loan.mthsSinceLastDelinq == null
    && loan.mthsSinceLastRecord == null
    && loan.mthsSinceLastMajorDerog == null
    && loan.collections12MthsExMed == 0
    && loan.term == 36
    && loan.dti < 30
    && (loan.purpose == 'debt_consolidation' || loan.purpose == 'credit_card')
    && loan.annualInc / 12 > loan.installment * 8
    && loan.installment < 1100
    && loan.inqLast6Mths == 0
    && loan.revolBal < 50000
    && loan.revolBal < loan.annualInc
    && loan.intRate > 11.5;
}

module.exports = AutoInvest;
