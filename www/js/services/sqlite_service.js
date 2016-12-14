/* global app, $cordovaSQLite, SQL, WebSQLShim */
(function (app) {
	app.service('SQLiteService', function ($q, $timeout, NotificationService, localStorageService) {
		var self;
		var SQLiteService = function () {
			self = this;
//			this.sqlPlugin = window.sqlitePlugin || window;
//			this.sqlPlugin = window;
			this.db = null;
		};
//		SQLiteService.prototype.isDbEnable = function () {
//			console.log(!!this.sqlPlugin);
//			return !!this.sqlPlugin;
//		};
		SQLiteService.prototype.createDatabase = function () {
			var openPromise = $q.defer();
//			if (window.cordova) {
//				this.db = $cordovaSQLite.openDB({name: "rcredits.db"}); //device
//			} else {
			try {
				this.db = new SQL.Database();
				$timeout(function () {
					openPromise.resolve();
				}, 1000);
			} catch (e) {
				if (e === 2) {
					console.log('wrong version - ', e);
				} else {
					console.log(e);
				}
			}
			console.log(this.db);
			return openPromise.promise;
		};
		SQLiteService.prototype.ex = function () {
			var txPromise = $q.defer();
			txPromise.resolve(true);
			return txPromise.promise;
		};
		SQLiteService.prototype.executeQuery = function (query) {
			var openPromise = $q.defer();
			var res = this.db.exec(query);
			openPromise.resolve(res);
			console.log(query, res);
			return openPromise.promise;
		};
//		SQLiteService.prototype.executeQuery = function (sqlQuery) {
//			return this.executeQuery_(sqlQuery.getQueryString(), sqlQuery.getQueryData());
//		};
		SQLiteService.prototype.createSchema = function () {
			var sqlQuery = "CREATE TABLE IF NOT EXISTS members (" + // record of customers (and managers)
				"qid TEXT," + // customer or manager account code (like NEW.AAA or NEW:AAA)
				"name TEXT," + // full name (of customer or manager)
				"company TEXT," + // company name, if any (for customer or manager)
				"place TEXT," + // customer location / manager's company account code
				"balance REAL," + // current balance (as of lastTx) / manager's rCard security code
				"rewards REAL," + // rewards to date (as of lastTx) / manager's permissions / photo ID (!rewards.matches(NUMERIC))
				"lastTx INTEGER," + // unixtime of last reconciled transaction / -1 for managers
				"proof TEXT," +
				"photo TEXT);"; // lo-res B&W photo of customer (normally under 4k) / full res photo for manager
			this.executeQuery(sqlQuery);
			console.log(sqlQuery, this.db);
			sqlQuery = "CREATE TABLE IF NOT EXISTS txs (" +
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
				"description TEXT);" + // always "reverses..", if this tx undoes a previous one (previous by date)
				"CREATE INDEX IF NOT EXISTS custQid ON members(qid)";
			this.executeQuery(sqlQuery);
			console.log(sqlQuery, this.db);
		};
		SQLiteService.prototype.init = function () {
			if (!this.db) {
				if (typeof openDatabase === 'undefined'){
					openDatabase = WebSQLShim.openDatabase;
				}
				this.createDatabase().then(this.createSchema.bind(this));
			}
			console.log(this.db);
		};
		return new SQLiteService();
	});
})(app);
