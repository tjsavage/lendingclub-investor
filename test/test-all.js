function importTest(name, path) {
  describe(name, function () {
      require(path);
  });
}

describe("top", function () {
  importTest("test-filters-not-previously-invested-in", './test-filters/test-not-previously-invested-in');
  importTest("test-filters-is-36-month", './test-filters/test-is-36-month');

  importTest("test-db-sqlite3-commands", './test-db/test-sqlite3-commands');

  importTest("test-etl-load-all-listed-loans", './test-etl/test-load-all-listed-loans');

  importTest("test-take-listed-loan-snapshot", './test-routines/test-take-listed-loan-snapshot');
});
