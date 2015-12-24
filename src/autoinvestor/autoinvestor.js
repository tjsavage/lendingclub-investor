var sqlite3 = require('sqlite3');
var fs = require('fs');
var time = require('time');
var moment = require('moment');

var sqlite3commands = require('../db/sqlite3-commands');

var sanityChecks = require('./sanity-checks');
var Logger = require('./logger');


/*

Auto investing process:
Get manager
Get set of filters to apply
Get options - whether it's a dry run or not, where to write output, where db
List loans -> write listed loans to DB
Filter loans -> write filtered loans to DB
Invest -> write response to DB (if not a dry run)

*/

var AutoInvestor = function AutoInvestor(manager, filterNames, options) {
  if (!('databasePath' in options)) {
    throw new Error("Must have a databasePath to write auto-investing output to.")
  }

  if (!('logPath' in options)) {
    throw new Error("Must have a valid file to log auto-investing output to")
  }

  this.manager = manager;
  this.filterNames = filterNames;
  this.options = options;

  this.filters = [];
  var filters = this.filters;
  filterNames.forEach(function(filterName) {
    filters.push(require('../filters/' + filterName));
  });

  this.db = new sqlite3.Database(options.databasePath);
  this.timestamp = moment().format('YYYY-MM-DD HH.mm.ss');
  this.logger = new Logger(options.logPath);

}

AutoInvestor.prototype.listLoans = function() {
  return this.manager.listLoans().then(function(loans) {
    this.loans = loans;
    return this.loans;
  }.bind(this))
  .catch(function(err) {
    console.log("Error listing loans: ", err);
    throw new Error(err);
  });
}

AutoInvestor.prototype.takeSnapshot = function() {
  if (!this.db) {
    throw new Error("No database set to take snapshot");
    return;
  }

  if (!this.loans) {
    throw new Error("loans not set to take snapshot from");
    return;
  }

  this.logger.log('Creating loan snapshot');

  var createdTablePromise = sqlite3commands.createListedLoansSnapshotsTable(this.db);
  return createdTablePromise.
    then(function(results) {
      return sqlite3commands.insertLoansIntoSnapshot(this.db, this.loans);
    }.bind(this));
}

AutoInvestor.prototype.filterLoans = function() {
  if (!this.filters) {
    throw new Error("No filters set");
  }

  var manager = this.manager;
  var logger = this.logger;

  var filtersPromise = Promise.resolve(this.loans);

  this.filters.forEach(function(filter) {
    logger.log("Adding filter:", filter);
    filtersPromise = filtersPromise.then(function(filteredLoans) {
      return filter.filterAll(filteredLoans, manager).then(null, function(err) {
        logger.log("Failed filter:", err);
        return Promise.reject(err);
      });
    });
  });

  return filtersPromise.then(function(filteredLoans) {
    this.filteredLoans = filteredLoans;
    return filteredLoans;
  }.bind(this), function(err) {
    logger.log("Error running filters", err);
    return Promise.reject(err);
  });
}

AutoInvestor.prototype.runLoansSanityCheck = function() {
  var logger = this.logger;

  this.logger.log("Successfully filtered loans down to:", this.filteredLoans.length);

  return sanityChecks.checkFilteredLoans(this.filteredLoans).then(null, function(err) {
    logger.log("Failed sanity check:", err);
    return Promise.reject(err);
  });
}

AutoInvestor.prototype.createPortfolio = function() {
  var portfolioName = "Auto " + this.timestamp;
  var logger = this.logger;

  if (this.options.dryRun) {
    this.logger.log("Dry run, not actually creating a portfolio");
    var portfolioPromise = Promise.resolve({portfolioId: 1});
  } else {
    this.logger.log("Not a dry run, creating portfolio named:", portfolioName);
    var portfolioPromise = this.manager.createPortfolio(portfolioName);
  }

  return portfolioPromise.then(function(portfolio) {
    logger.log("Created portfolio:", JSON.stringify(portfolio));

    this.portfolio = portfolio;
    return portfolio;
  }.bind(this)).catch(function(err) {
    logger.log("Error creating portfolio:", err);
    return Promise.reject(err);
  });
}

AutoInvestor.prototype.createOrders = function() {
  var logger = this.logger;

  var ordersPromise = this.manager.createOrders(this.filteredLoans, 25.0, this.portfolio.portfolioId)
    .then(function(orders) {
      logger.log("Successfully created orders:", JSON.stringify(orders));
      this.orders = orders;
    }.bind(this))
    .catch(function(err) {
      logger.log("Failed in creating an order");
      return Promise.reject(err);
    });

  return ordersPromise;
}

AutoInvestor.prototype.runOrdersSanityCheck = function() {
  return sanityChecks.checkOrders(this.orders, this.filteredLoans)
    .catch(function(err) {
      logger.log("Failed sanity check:", err);
      return Promise.reject(err);
    });
}

AutoInvestor.prototype.submitOrders = function() {
  var orderResultPromise;
  var logger = this.logger;

  if (this.options.dryRun) {
    this.logger.log("Doing a dry run, not submitting orders:", JSON.stringify(this.orders));
    orderResultPromise = Promise.resolve({"dryRun": true});
  } else {
    this.logger.log("Submitting orders: ", JSON.stringify(this.orders));
    orderResultPromise = this.manager.submitOrders(this.orders)
  }

  return orderResultPromise
    .then(function(orderResult) {
      logger.log("Order result:", JSON.stringify(orderResult));
      this.orderResult = orderResult;
      return orderResult;
    }.bind(this))
    .catch(function(err) {
      logger.log("Error submitting orders:", err);
      return Promise.reject(err);
    });
}

AutoInvestor.prototype.saveOrderToDatabase = function() {
  var db = this.db;
  var logger = this.logger;
  var filteredLoans = this.filteredLoans;
  var timestamp = this.timestamp;

  var targetTotal = 0;
  this.orders.forEach(function(order) {
    targetTotal += order.requestedAmount;
  });

  var orderObj = {
    noteCount: this.orders.length,
    targetTotal: targetTotal,
    result: this.orderResult,
    orderTimestamp: this.timestamp
  };



  return sqlite3commands.createOrdersTable(db)
    .then(function() {
      return sqlite3commands.insertOrder(db, orderObj);
    }).then(function() {
      logger.log("Inserted order to database");
    })
    .then(function() {
      return sqlite3commands.createOrderLoansTable(db);
    }).then(function() {
      return sqlite3commands.selectOrderWithTimestamp(db, timestamp);
    }).then(function(orderRow) {
      logger.log("orderId:", orderRow.id);
      return sqlite3commands.insertOrderLoans(db, filteredLoans, orderRow.id);
    });
}

AutoInvestor.prototype.invest = function(manager, filterNames, options) {
  var logger = this.logger;

  this.logger.log("Starting new autoinvest routine");

  return Promise.resolve()
    .then(this.listLoans.bind(this))
    .then(this.takeSnapshot.bind(this))
    .then(this.filterLoans.bind(this))
    .then(this.runLoansSanityCheck.bind(this))
    .then(this.createPortfolio.bind(this))
    .then(this.createOrders.bind(this))
    .then(this.runOrdersSanityCheck.bind(this))
    .then(this.submitOrders.bind(this))
    .then(this.saveOrderToDatabase.bind(this))
    .then(function(result) {
      logger.log('Resolving autoinvest order');
      return Promise.resolve(result);
    }, function(err) {
      logger.log('Rejecting autoinvest order');
      return Promise.reject(err);
    });
}


module.exports = AutoInvestor;
