/* global app */
(function (app) {
	app.service('SQLiteService', function ($q, $timeout, NotificationService) {
		var decodeHtml = function (html) {
			var txt = document.createElement("textarea");
			txt.innerHTML = html;
			return txt.value;
		};
		var self;
		var SQLiteService = function () {
			self = this;
			//this.sqlPlugin = window.sqlitePlugin || window;
			this.sqlPlugin = window;
			this.db = null;
		};
		/**
		 * Does the browser in use support the local database
		 * @returns {Boolean}
		 */
		SQLiteService.prototype.isDbEnable = function () {
			return !!this.sqlPlugin;
		};
		/**
		 * Trys to create a WebSQL database and when the database has been been created, resolves 
		 * @returns {.$q@call;defer.promise}
		 */
		SQLiteService.prototype.createDatabase = function () {
			var openPromise = $q.defer();
			this.db = this.sqlPlugin.openDatabase(
				window.CommonGoodConfig.SQLiteDatabase.name,
				window.CommonGoodConfig.SQLiteDatabase.version,
				window.CommonGoodConfig.SQLiteDatabase.description, 100000);
			$timeout(function () {
				openPromise.resolve();
			}, 1000);
			return openPromise.promise;
		};
		/**
		 * These two functions actually execute the database transaction
		 * @returns {.$q@call;defer.promise}
		 */
		SQLiteService.prototype.ex = function () {
			var txPromise = $q.defer();
			txPromise.resolve(true);
			return txPromise.promise;
		};
		SQLiteService.prototype.executeQuery_ = function (query, params) {
			var txPromise = $q.defer();
			this.db.transaction(function (tx) {
				console.log(tx);
				tx.executeSql(query, params, function (tx, res) {
					console.log(query, params, res);
					txPromise.resolve(res);
				}, function (tx, e) {
					console.log(tx, e);
					txPromise.reject(e.message);
				});
			}, function (error) {
				console.log('transaction error: ', error);
			}, function () {
			});
			return txPromise.promise;
		};
		/**
		 * splits a string into the necessary format to be sent to the WebSQL database
		 * @param {type} sqlQuery
		 * @returns {.$q@call;defer.promise}
		 */
		SQLiteService.prototype.executeQuery = function (sqlQuery) {
			return this.executeQuery_(sqlQuery.getQueryString(), sqlQuery.getQueryData());
		};
		/**
		 * Create a customer database table
		 * @returns {a promise to create the table}
		 */
		SQLiteService.prototype.createSchema = function () {
			this.executeQuery_(
				"CREATE TABLE IF NOT EXISTS members (" + // record of customers (and managers)
				"qid TEXT," + // customer or manager account code (like NEW.AAA or NEW:AAA)
				"name TEXT," + // full name (of customer or manager)
				"company TEXT," + // company name, if any (for customer or manager)
				"place TEXT," + // customer location / manager's company account code
				"balance REAL," + // current balance (as of lastTx) / manager's rCard security code
				"rewards REAL," + // rewards to date (as of lastTx) / manager's permissions / photo ID (!rewards.matches(NUMERIC))
				"lastTx INTEGER," + // unixtime of last reconciled transaction / -1 for managers
				"proof TEXT," +
				"photo TEXT);" // lo-res B&W photo of customer (normally under 4k) / full res photo for manager
				).then(function () {
				return self.executeQuery_(
					"CREATE TABLE IF NOT EXISTS txs (" +
					"me TEXT," + // company (or device-owner) account code (qid)
					"txid INTEGER DEFAULT 0," + // transaction id (xid) on the server (for offline backup only -- not used by the app) / temporary storage of customer cardCode pending tx upload
					"status INTEGER," + // see A.TX_... constants
					"created INTEGER," + // transaction creation datetime (unixtime)
					"agent TEXT," + // qid for company and agent (if any) using the device
					"member TEXT," + // customer account code (qid)
					"amount REAL," +
					"goods INTEGER," + // <transaction is for real goods and services>
					"data TEXT," + // hash of cardCode, amount, created, and me (as proof of agreement)
					"account TEXT," + //account particulars
					"description TEXT);" // always "reverses..", if this tx undoes a previous one (previous by date)
					);
			}).then(function () {
				self.executeQuery_("CREATE INDEX IF NOT EXISTS custQid ON members(qid)");
			});
		};
		/**
		 * Initiate the database, if it doesn't yet exist, create it and show a console error if WebSQL doesn't work 
		 * @returns {undefined}
		 */
		SQLiteService.prototype.init = function () {
			if (!this.isDbEnable()) {
				console.warn("SQLite is not enable");
			}
			this.createDatabase().then(this.createSchema.bind(this));
		};
		return new SQLiteService();
	});
})(app);
