/* global app, $cordovaSQLite, SQL, WebSQLShim, rCreditsConfig, alasql */
(function (app) {
	app.service('SQLiteService', function ($q, $timeout, NotificationService, localStorageService) {
		var self;
//		var alasql = require('alasql');
		var SQLiteService = function () {
			self = this;
			self.db;
		};
//		SQLiteService.prototype.isDbEnable = function () {
//			console.log(!!this.sqlPlugin);
//			return !!this.sqlPlugin;
//		};
		SQLiteService.prototype.createDbObj = function () {

		};
		SQLiteService.prototype.createDatabase = function () {
			var openPromise = $q.defer();
			self.db=new alasql.Database(rCreditsConfig.SQLiteDatabase.name);
			$timeout(function () {
				openPromise.resolve();
			}, 1500);
			return openPromise.promise;
		};
		SQLiteService.prototype.ex = function () {
			var txPromise = $q.defer();
			txPromise.resolve(true);
			return txPromise.promise;
		};
		SQLiteService.prototype.executeQuery_ = function (query) {
			var openPromise = $q.defer();
			var res = this.db.exec(query);
			console.log('executeQuery_',alasql.databases.rcredits,query, res);
			openPromise.resolve(res);
			return openPromise.promise;
		};
		SQLiteService.prototype.executeQuery = function (sqlQuery) {
			console.log('executeQuery',alasql.databases.rcredits,sqlQuery.getQueryString, sqlQuery.getQueryData);
			return this.executeQuery_(sqlQuery.getQueryString, sqlQuery.getQueryData);
		};
		SQLiteService.prototype.createSchema = function () {
//			self.db=new alasql.Database(rCreditsConfig.SQLiteDatabase.name);
			this.executeQuery_(
					"CREATE INDEXEDDB DATABASE IF NOT EXISTS rcredits;"+
					"ATTACH INDEXEDDB DATABASE rcredits;"+
					"USE rcredits;"+
					"CREATE TABLE IF NOT EXISTS members ("+ // record of customers (and managers)
					"qid TEXT,"+ // customer or manager account code (like NEW.AAA or NEW:AAA)
					"name TEXT,"+ // full name (of customer or manager)
					"company TEXT,"+// company name, if any (for customer or manager)
					"place TEXT,"+// customer location / manager's company account code
					"balance REAL,"+// current balance (as of lastTx) / manager's rCard security code
					"rewards REAL,"+// rewards to date (as of lastTx) / manager's permissions / photo ID (!rewards.matches(NUMERIC))
					"lastTx INTEGER,"+// unixtime of last reconciled transaction / -1 for managers
					"proof TEXT,"+
					"photo TEXT);"// lo-res B&W photo of customer (normally under 4k) / full res photo for manager
			).then(function () {
				return self.executeQuery_(		
			"CREATE TABLE IF NOT EXISTS txs ("+
					"me TEXT,"+// company (or device-owner) account code (qid)
					"txid INTEGER DEFAULT 0,"+// transaction id (xid) on the server (for offline backup only -- not used by the app) / temporary storage of customer cardCode pending tx upload
					"status INTEGER,"+// see A.TX_... constants
					"created INTEGER,"+// transaction creation datetime (unixtime)
					"agent TEXT,"+// qid for company and agent (if any) using the device
					"member TEXT,"+// customer account code (qid)
					"amount REAL,"+
					"goods INTEGER,"+// <transaction is for real goods and services>
					"data TEXT,"+// hash of cardCode, amount, created, and me (as proof of agreement)
					"account TEXT,"+//account particulars
					"description TEXT);"// always "reverses..", if this tx undoes a previous one (previous by date)
			);});
//			.then(function () {
//				self.executeQuery_("CREATE INDEX IF NOT EXISTS custQid ON members(qid)");
//			});
			console.log(alasql.databases.rcredits);
		};
		SQLiteService.prototype.init = function () {
			if (!self.db) {
//				self.db = alasql.Database(rCreditsConfig.SQLiteDatabase.name);
			}
			self.createDatabase().then(self.createSchema.bind(this));
			console.log(self.db);
		};
		return new SQLiteService();
	});
})(app);
