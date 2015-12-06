module.exports.filterAll = function filterAll(loans, manager) {
  return Promise.resolve().then(function() {
    if (typeof manager == 'undefined') {
      throw new Error("Must pass a manager to this filter");
    }

    var notesOwned = manager.notesOwned();

    return notesOwned.then(function(notes) {
      var notesOwnedByLoanId = {};

      notes.forEach(function(note) {
        notesOwnedByLoanId[note.loanId] = note;
      });

      return notesOwnedByLoanId;
    }).then(function(notesOwnedByLoanId) {
      var filteredLoans = [];
      loans.forEach(function(loan) {
        if (!(loan.id in notesOwnedByLoanId)) {
          filteredLoans.push(loan);
        }
      })

      return filteredLoans;
    });
  })

}
