/* global app, $cordovaSQLite */
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
//			console.log(this.sqlPlugin);
//			return !!this.sqlPlugin;
//		};
		SQLiteService.prototype.createDatabase = function () {
			this.db = new Dexie(window.rCreditsConfig.SQLiteDatabase.name);
			this.db.version(1).stores({
				members:
					"++," + //local indexeddb id
					"qid," + // customer or manager account code (like NEW.AAA or NEW:AAA)
					"name," + // full name (of customer or manager)
					"company," + // company name, if any (for customer or manager)
					"place," + // customer location / manager's company account code
					"balance," + // current balance (as of lastTx) / manager's rCard security code
					"rewards," + // rewards to date (as of lastTx) / manager's permissions / photo ID (!rewards.matches(NUMERIC))
					"lastTx," + // unixtime of last reconciled transaction / -1 for managers
					"proof," +
					"photo", // lo-res B&W photo of customer (normally under 4k) / full res photo for manager"
				txt:
					"++," + //local indexeddb id
					"me," + // company (or device-owner) account code (qid)
					"txid 0," + // transaction id (xid) on the server (for offline backup only -- not used by the app) / temporary storage of customer cardCode pending tx upload
					"status," + // see A.TX_... constants
					"created," + // transaction creation datetime (unixtime)
					"agent," + // qid for company and agent (if any) using the device
					"member," + // customer account code (qid)
					"amount," +
					"goods," + // <transaction is for real goods and services>
					"data," + // hash of cardCode, amount, created, and me (as proof of agreement)
					"account," + //account particulars
					"description" // always "reverses..", if this tx undoes a previous one (previous by date)
			});
		};
		SQLiteService.prototype.ex = function () {
			var txPromise = $q.defer();
			txPromise.resolve(true);
			return txPromise.promise;
		};
		SQLiteService.prototype.executeQuery = function (query, params) {
			this.db.transaction('rw', this.db.members, this.db.txt, function () {
				
			}, function (error) {
				console.log('transaction error: ' + error.message);
				console.log(error);
			}, function () {
			});
		};
		SQLiteService.prototype.executeQuery = function (sqlQuery) {
			return this.executeQuery_(sqlQuery.getQueryString(), sqlQuery.getQueryData());
		};
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
		SQLiteService.prototype.init = function () {
			if (!this.db()) {
				console.log("SQLite is not enabled");
			}
			this.createDatabase();
			console.log(this);
		};
		return new SQLiteService();
	});
})(app);
