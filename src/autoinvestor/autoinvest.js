var sqlite3 = require('sqlite3');
var fs = require('fs');
var time = require('time');

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

var AutoInvest = {};

AutoInvest.invest = function(manager, filterNames, options) {
  return new Promise(function(resolve, reject) {
    if (!('databasePath' in options)) {
      throw new Error("Must have a databasePath to write auto-investing output to.")
    }

    if (!('logPath' in options)) {
      throw new Error("Must have a valid file to log auto-investing output to")
    }

    console.log(options.databasePath);
    var db = new sqlite3.Database(options.databasePath);

    var filters = [];
    filterNames.forEach(function(filterName) {
      filters.push(require('../filters/' + filterName));
    });

    var timestamp = (new time.Date()).toString()
    var logger = new Logger(options.logPath);

    logger.log("Starting new autoinvest routine");

    var orderObj = {
      orderTimestamp: timestamp
    }

    return Promise.resolve().then(function(){
      return manager.listLoans().then(null, function(err) {
        console.log("Error listing loans: ", err);
        throw new Error(err);
      });
    }).then(function(loans) {
        logger.log('Creating loan snapshot');
        return Promise.all([AutoInvest.loadLoansSnapshotToDatabase(loans, db), loans])
          .then(null, function(err) {
            logger.log("Error taking loan snapshot");
            reject(err);
          })
      })
      .then(function(results) {
        var loans = results[1];

        var filtersPromise = Promise.resolve(loans);

        filters.forEach(function(filter) {
          filtersPromise = filtersPromise.then(function(filteredLoans) {
            return filter.filterAll(filteredLoans, manager);
          });
        });

        return filtersPromise;
      })
      .then(function(filteredLoans) {
        return sanityChecks.checkFilteredLoans(filteredLoans).then(null, function(err) {
          logger.log("Failed sanity check:", err);
          reject(err);
        });
      })
      .then(function(filteredLoans) {
        var portfolioName = timestamp.replace(/:/g, '.').replace(/[()]/g, '');
        if (options.dryRun) {
          var portfolioPromise = {portfolioId: 1};
        } else {
          var portfolioPromise = manager.createPortfolio("Autoinvest " + portfolioName);
        }

        return Promise.all([portfolioPromise, Promise.resolve(filteredLoans)]);
      })
      .then(function(results) {
        var portfolioResult = results[0];
        var filteredLoans = results[1];

        logger.log("Created portfolio", JSON.stringify(portfolioResult));
        var ordersPromise = manager.createOrders(filteredLoans, 25.0, portfolioResult.portfolioId).then(null, function(err) {
          logger.log("Failed in creating an order");
          throw new Error(err);
        });

        return Promise.all([ordersPromise, filteredLoans]);
      })
      .then(function(results) {
        var orders = results[0];
        var filteredLoans = results[1];

        return sanityChecks.checkOrders(orders, filteredLoans).then(null, function(err) {
          logger.log("Failed sanity check:", err);
          reject(err);
        });
      })
      .then(function(results) {
        var orders = results[0];
        var filteredLoans = results[1];

        var targetTotal = 0;
        orders.forEach(function(order) {
          targetTotal += order.requestedAmount;
        });

        return sqlite3commands.createOrdersTable(db).then(function() {
          orderObj.noteCount = orders.length;
          orderObj.targetTotal = targetTotal;
        }).then(function() {
          return [orders, filteredLoans];
        });
      })
      .then(function(results) {
        var orders = results[0];
        var filteredLoans = results[1];

        var orderResultPromise;
        if (options.dryRun) {
          logger.log("Doing a dry run, not submitting orders:", JSON.stringify(orders));
          orderResultPromise = {"dryRun": true}
        } else {
          logger.log("Submitting orders: ", JSON.stringify(orders));
          orderResultPromise = manager.submitOrders(orders)
        }

        return Promise.all([orderResultPromise, orders, filteredLoans]);
      })
      .then(function(results) {
        var orderResult = results[0];
        var orderNotes = results[1];
        var filteredLoans = results[2];

        logger.log("Order result:", JSON.stringify(orderResult));
        orderObj.result = orderResult;
        orderObj.orderTimestamp = timestamp;
        return sqlite3commands.insertOrder(db, orderObj).then(function() {
          logger.log("Inserted order to database");
        })
        .then(function() {
          return sqlite3commands.createOrderLoansTable(db);
        }).then(function() {
          return sqlite3commands.selectOrderWithTimestamp(db, timestamp);
        }).then(function(orderRow) {
          logger.log("orderId:", orderRow.id);
          return sqlite3commands.insertOrderLoans(db, filteredLoans, orderRow.id);
        }).then(function() {
          return orderResult;
        });
      })
      .then(function(result) {
        logger.log('Resolving autoinvest order');
        resolve(result);
      }, function(err) {
        logger.log('Rejecting autoinvest order');
        reject(err);
      });
  })
}

AutoInvest.loadLoansSnapshotToDatabase = function(loans, db) {
  var createdTablePromise = sqlite3commands.createListedLoansSnapshotsTable(db);
  return createdTablePromise.then(function(results) {
    return sqlite3commands.insertLoansIntoSnapshot(db, loans);
  });
}

module.exports = AutoInvest;
