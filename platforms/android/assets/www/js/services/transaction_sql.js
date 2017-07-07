/* global Transaction, app, moment */
(function (app) {
	app.service('TransactionSql', function ($q, SqlQuery, SQLiteService,NotificationService) {
		var self;
		var TransactionSql = function () {
			self = this;
		};
		/**
		 * Get whatever transactions were done while offline and return them, excluding those in the exludeTxs parameter 
		 * @param {type} exludeTxs
		 * @returns {The transactions that were done while offline, or a message stating that none were found}
		 */
		TransactionSql.prototype.getOfflineTransaction = function (exludeTxs) {
			var filter = '';
			if (exludeTxs) {
				filter = ' and created not in (' + exludeTxs.join(',') + ' ) ';
			}
			var sqlQuery = new SqlQuery();
			sqlQuery.setQueryString("SELECT * FROM txs where STATUS = " + Transaction.Status.OFFLINE + filter + " order by rowid asc limit 1");
			return SQLiteService.executeQuery(sqlQuery).then(function (SQLResultSet) {
				if (SQLResultSet.rows.length > 0) {
					var sqlT = SQLResultSet.rows[0];
					return sqlT;
				} else {
					throw "No offline transactions";
				}
			});
		};
		/**
		 * Record that an offline transaction was just synced
		 * @param {type} sqlTransaction
		 * @returns {a WebSQL query}
		 */
		TransactionSql.prototype.setTransactionSynced = function (sqlTransaction) {
			var sqlQuery = new SqlQuery();
			sqlQuery.setQueryString("UPDATE txs SET status = '" + Transaction.Status.DONE + "' where created = " + sqlTransaction.created);
			return SQLiteService.executeQuery(sqlQuery);
		};
		/**
		 * See if their are any transactions that have not been synced in the past day
		 * @returns {whether there were any old transactions still unsynced}
		 */
		TransactionSql.prototype.exist24HsTransactions = function () {
			var yesterday = moment().subtract(1, 'day').unix();
			var sqlQuery = new SqlQuery();
			sqlQuery.setQueryString("SELECT * from txs where created < " + yesterday + " and  STATUS = " + Transaction.Status.OFFLINE);
			return SQLiteService.executeQuery(sqlQuery).then(function (SQLResultSet) {
				return SQLResultSet.rows.length > 0;
			});
		};
		return new TransactionSql();
	});
})(app);
