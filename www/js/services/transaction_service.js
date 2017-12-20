/* global CommonGoodConfig, Transaction, _, app, Sha256, parseFloat, moment */
app.service('TransactionService',
	function ($q, UserService, RequestParameterBuilder, $http, $httpParamSerializer, SQLiteService,
		SqlQuery, NetworkService, MemberSqlService, NotificationService, $ionicLoading, TransactionSql, $rootScope) {
		var self;
		var TRANSACTION_OK = "1";
		var TransactionService = function () {
			self = this;
			this.lastTransaction = null;
		};
		/**
		 * Gets ride of messed up html tags
		 * @param {type} html
		 * @returns {.document@call;createElement.value|txt.value}
		 */
		var decodeHtml = function (html) {
			var txt = document.createElement("textarea");
			txt.innerHTML = html;
			txt.value = txt.value.replace('\'', '');
			return txt.value;
		};
		/**
		 * Actually sends the transaction request to the server
		 * @param {array} params - the details about the transaction
		 * @param {object} account - information about the manager's account
		 * @returns {json} information from the server about the transaction or error information if the transaction did not go through
		 */
		TransactionService.prototype.makeRequest_ = function (params, account) {
			var urlConf = new UrlConfigurator();
			return $http({
				method: 'POST',
				url: urlConf.getServerUrl(account),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data: $httpParamSerializer(params)
			});
		};
		/**
		 * Gets the returned transaction information and uses this to populate a Transaction model object
		 * @param {type} transactionInfo - information from the server about the transaction
		 * @returns {Transaction|transaction_serviceL#3.TransactionService.prototype.parseTransaction_.transaction} a populated Transaction model opbject
		 */
		TransactionService.prototype.parseTransaction_ = function (transactionInfo) {
			var transaction = new Transaction();
			_.keys(transaction).forEach(function (k) {
				if (transactionInfo.hasOwnProperty(k)) {
					transaction[k] = transactionInfo[k];
				}
			});
			transaction.status = transactionInfo.transaction_status || Transaction.Status.DONE;
			return transaction;
		};
		/**
		 * Gathers information about the transaction and loads it into an array to be sent to the makeRequest function that actually sends the transaction request
		 * @param {type} amount - the price change to be recorded on the server if the transaction is successful
		 * @param {type} description - description of transaction. For exchanges of Common Good Funds for USD, the description is “USD in” or “USD out”, followed by the method, in parenthesis: “ (cash)”, “ (check)”, or “ (card)”.
		 * @param {type} goods - “1” for real goods and services, “0” means an exchange of Common Good Funds for US Dollars. “2” means for real goods and services with the app in “self-service” mode. “3” means non-goods (like a loan or reimbursement).
		 * @param {type} force - (optional):
		 *		“0” normal (transaction will fail if there is insufficient balance or permission)
		 *		“1” if transaction should go through regardless of customer balance
		 *		“-1” to force reversal of the transaction if it exists, regardless of customer balance (return new transaction’s txid and creation date, if any, otherwise txid=0 and created=””)
		 * @returns {json} the results of the transaction, or if offline, the intended results of the transaction, if not too much
		 */
		TransactionService.prototype.makeTransactionRequest = function (amount, description, goods, force) {
			if (UserService.currentUser().accountInfo) {
				var sellerAccountInfo = UserService.currentUser().accountInfo,
					customerAccountInfo = UserService.currentCustomer();
				if (_.isUndefined(goods) || _.isNull(goods)) {
					goods = 1;
				}
				if (_.isUndefined(force) || _.isNull(force)) {
					force = 0;
				}
				try {
					var params = new RequestParameterBuilder()
						.setOperationId('charge')
						.setSecurityCode(customerAccountInfo.accountInfo.securityCode)
						.setAgent(sellerAccountInfo.accountId.split('-')[0])
						.setMember(customerAccountInfo.accountInfo.accountId)
						.setField('amount', (amount).toFixed(2))
						.setField('description', encodeURI(description))
						.setField('created', moment().unix())
						.setField('force', force)
						.setField('goods', goods)
						.setField('photoid', 0)
						.getParams();
					var proof = Sha256.hash((params.agent.split('-')[0] + params.amount + params.member + customerAccountInfo.accountInfo.unencryptedCode + params.created));
					if (UserService.currentUser().accountInfo.isPersonal && !params.device) {
						params.device = customerAccountInfo.device;
					} else if (UserService.currentUser().accountInfo.isPersonal) {
						params['signin'] = 0;
					}
					console.log((amount).toFixed(2));

					params['proof'] = proof;
//					params['seller'] = sellerAccountInfo;
					console.log((params.agent.split('-')[0] + params.amount + params.member + customerAccountInfo.accountInfo.unencryptedCode + params.created), (amount).toFixed(2), params, customerAccountInfo, sellerAccountInfo, params.created);
				} catch (e) {
					console.log('catch: ', e);
					NotificationService.showAlert({title: 'error', template: e});
				}
				if (NetworkService.isOnline()) {
					return this.makeRequest_(params, sellerAccountInfo).then(function (res) {
						console.log(res);
						return res;
					});
				} else {
					// Offline
					return this.doOfflineTransaction(params, customerAccountInfo).then(function (result) {
						self.warnOfflineTransactions();
						return result;
					});
				}
			} else {
				NotificationService.showAlert({title: 'error', template: 'We were unable to find your account'});
			}
		};
		/**
		 * Initial and resulting handling of charges and storing of local customer information
		 * @param {type} amount - the price change to be recorded on the server if the transaction is successful
		 * @param {type} description - description of transaction. For exchanges of Common Good Funds for USD, the description is “USD in” or “USD out”, followed by the method, in parenthesis: “ (cash)”, “ (check)”, or “ (card)”.
		 * @param {type} goods - “1” for real goods and services, “0” means an exchange of Common Good Funds for US Dollars. “2” means for real goods and services with the app in “self-service” mode. “3” means non-goods (like a loan or reimbursement).
		 * @param {type} force - (optional):
		 *		“0” normal (transaction will fail if there is insufficient balance or permission)
		 *		“1” if transaction should go through regardless of customer balance
		 *		“-1” to force reversal of the transaction if it exists, regardless of customer balance (return new transaction’s txid and creation date, if any, otherwise txid=0 and created=””)
		 * @returns {json} the results of the transaction, or if offline, the intended results of the transaction, if not too much
		 */
		TransactionService.prototype.charge = function (amount, description, goods, force) {
			if (amount > 100000) {
				reject = NotificationService.showAlert({title: 'error', template: 'Amounts over 100,000 are not allowed'});
			} else {
//				console.log(amount);
				return this.makeTransactionRequest(amount, description, goods, force)
					.then(function (transactionResult) {
						if (transactionResult.data.ok === TRANSACTION_OK) {
							var transaction = self.parseTransaction_(transactionResult);
							transaction.configureType(amount);
							var customer = UserService.currentCustomer();
							customer.balance = transactionResult.data.balance;
							customer.rewards = transactionResult.data.rewards;
							transaction.amount = (amount);
							transaction.description = description;
							transaction.goods = 1;
							transaction.data = transactionResult.data;
							transaction.data.message = decodeHtml(transaction.data.message);
							transaction.data.undo = decodeHtml(transaction.data.undo);
							customer.company = decodeHtml(customer.company);
							console.log(transaction, customer);
							customer.setLastTx(transaction);
							customer.saveInSQLite().then(function () {
								self.saveTransaction(transaction);
							});
							self.lastTransaction = transaction;
							return transaction;
						} else {
							console.log(transactionResult.data.ok, transactionResult);
						}
						self.lastTransaction = transactionResult;
						return transactionResult;
					})
					.finally(function () {
						$rootScope.$emit("TransactionDone");
					});
			}
		};
		/**
		 * Negates an amount
		 * @param {float} amount - the amount to be negated
		 * @param {string} description - the description of the transaction to be refunded
		 * @returns {json|transaction_serviceL#3.TransactionService.prototype@call;makeTransactionRequest@call;then@call;finally} - the negated amount plus the description
		 */
		TransactionService.prototype.refund = function (amount, description) {
			console.log((amount * -1).toFixed(2));
			return this.charge((amount * -1), description);
		};
		/**
		 * Processes the information required to do an exchange of USD to Common Good Currency or vice versa
		 * @param {float} amount - the amount to be exchanged
		 * @param {type} currency - either USD or Common Good Currency
		 * @param {type} paymentMethod - Credit Card, Cash, Check
		 * @returns {json|transaction_serviceL#3.TransactionService.prototype@call;makeTransactionRequest@call;then@call;finally} - the results of the transaction
		 */
		TransactionService.prototype.exchange = function (amount, currency, paymentMethod) {
			var exchangeType = 'USD in';
			var amountToSend = amount;
			console.log(currency.isUSD(), amount, currency, paymentMethod);
			if (!currency.isUSD()) {
				exchangeType = 'USD out';
				amountToSend = amount * (-1);
			} else {
			}
			var description = exchangeType + '(' + paymentMethod.getId() + ')';
			console.log(amountToSend, currency, paymentMethod, description);
			return this.charge(amountToSend, description, 0);
		};
		/**
		 * Undoes a recent transaction 
		 * @param {object} transaction – a transaction object
		 * @returns {json|transaction_serviceL#3.TransactionService.prototype@call;makeTransactionRequest@call;then@call;finally} – the results of a negated transaction
		 */
		TransactionService.prototype.undoTransaction = function (transaction) {
			$rootScope.undo = false;
			return this.charge(parseFloat(transaction.amount * -1), transaction.description, transaction.goods, 0);
		};
		/**
		 * Saves information about a transaction to the local database
		 * @param {type} transaction - information about a transaction
		 * @returns {unresolved} - an object to be stored in the local database
		 */
		TransactionService.prototype.saveTransaction = function (transaction) {
			//"me TEXT," + // company (or device-owner) account code (qid)
			//"txid INTEGER DEFAULT 0," + // transaction id (xid) on the server (for offline backup only -- not used by the app) / temporary storage of customer cardCode pending tx upload
			//"status INTEGER," + // see A.TX_... constants
			//"created INTEGER," + // transaction creation datetime (unixtime)
			//"agent TEXT," + // qid for company and agent (if any) using the device
			//"member TEXT," + // customer account code (qid)
			//"amount REAL," +
			//"goods INTEGER," + // <transaction is for real goods and services>
			//"proof TEXT," + // hash of cardCode, amount, created, and me (as proof of agreement)
			//"description TEXT);" // always "reverses..", if this tx undoes a previous one (previous by date)
			var seller = UserService.currentUser(),
				customer = UserService.currentCustomer();
			var sqlQuery = new SqlQuery();
			sqlQuery.setQueryString('INSERT INTO txs (me, txid, status, created, agent, member, amount, goods, data, account, description) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
			sqlQuery.setQueryData([
				seller.getId(),
				transaction.getId(),
				transaction.status,
				transaction.created,
				seller.getId(),
				customer.getId(),
				transaction.amount,
				transaction.goods,
				JSON.stringify(transaction.data),
				JSON.stringify({
					account: customer.accountInfo,
					sc: customer.accountInfo.securityCode,
					customerId: customer.getId(),
					amount: transaction.amount,
					created: transaction.created,
					sellerId: seller.getId()
				}),
				transaction.description

			]);
			return SQLiteService.executeQuery(sqlQuery);
		};
		/**
		 * Handles the storage of customer information until the device goes back online
		 * @param {type} params - the params to be sent to the server when the divice goes back online
		 * @param {type} customer - customer information
		 * @returns {.$q@call;defer.promise} - a defered promise of the Transaction
		 */
		TransactionService.prototype.doOfflineTransaction = function (params, customer) {
			var q = $q.defer();
			var transactionResponseOk = {
				"message": "",
				"txid": customer.getId(),
				"created": moment().unix(),
				"balance": '',
				"rewards": '',
				"did": "",
				"undo": "",
				"transaction_status": Transaction.Status.OFFLINE,
				"data": params,
				"ok": "1"
			};
			transactionResponseOk.data.ok = "1";
			var transactionResponseError = {
				"ok": "0",
				"message": "There has been an error"
			};
			console.log(customer);
			if (customer.isPersonal === false) {
				return q.reject();
			}
			if (params.amount > CommonGoodConfig.transaction_max_amount_offline) {
				transactionResponseError.message = "Limit $" + CommonGoodConfig.transaction_max_amount_offline + " exceeded";
				q.reject(transactionResponseError);
				return q.promise;
			}
			MemberSqlService.existMember(customer.getId())
				.then(function (customerDbInfo) {
					// do transaction
					transactionResponseOk.ok = '1';
					console.log(transactionResponseOk);
					return q.resolve(transactionResponseOk);
				})
				.catch(function (msg) {
					askConfirmation('cashier_permission', '', 'ok', 'cancel')
						.then(function () {
							// do transaction
							transactionResponseOk.ok = '1';
							console.log(transactionResponseOk);
							return q.resolve(transactionResponseOk);
						})
						.catch(function () {
							// reject transaction
							transactionResponseError.message = "Not Authorized";
							return q.reject(transactionResponseError);
						});
				});
			return q.promise;
		};
		/**
		 * An alert to the cashier to ask for confirmation
		 * @param {type} title
		 * @param {type} subTitle
		 * @param {type} okText
		 * @param {type} cancelText
		 * @returns {bool}
		 */
		var askConfirmation = function (title, subTitle, okText, cancelText) {
			$ionicLoading.hide();
			return NotificationService.showConfirm({
				title: title,
				subTitle: subTitle,
				okText: okText,
				cancelText: cancelText
			})
				.then(function (confirmed) {
					$ionicLoading.show();
					if (confirmed) {
						return true;
					} else {
						throw false;
					}
				});
		};
		/**
		 * Notify the casheer that the transaction has not gone through for 24 hours
		 * @returns {undefined}
		 */
		TransactionService.prototype.warnOfflineTransactions = function () {
			TransactionSql.exist24HsTransactions().then(function (exists) {
				if (exists) {
					NotificationService.showAlert('offline_old_transactions');
				}
			});
		};
		TransactionService.prototype.testThings = function (whattotest) {
			var perams = {
				"op": "test", 
				"function": "Transact", 
				"testOnly": 0, 
				"args": [{
						"id": ".ZZC", 
						"fullName": "Corner Store", 
						"city": "Ashfield", 
						"state": "MA", 
						"balance": "0", 
						"flags": "ok`co"
					}, {
						"id": ".ZZS", 
						"fullName": "Susan Shopper", 
						"city": "Montague", 
						"state": "MA", 
						"balance": "100", 
						"flags": "ok,co"
					}]};
		};
		return new TransactionService();
	});