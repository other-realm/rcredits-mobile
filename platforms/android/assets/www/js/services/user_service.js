/* global _, app, offlCtrl */
/*
 * This function handles all actual transactions from the server related to getting user information, both for cashiers and customers.
 */
app.service('UserService', function ($q, $http, $httpParamSerializer, RequestParameterBuilder, User, Seller, Customer, $rootScope, $timeout,
	PreferenceService, CashierModeService, $state, NetworkService, MemberSqlService, NotificationService, SelfServiceMode, localStorageService) {
	'use strict';
	var LOGIN_FAILED = '0';
	var LOGIN_BY_AGENT = '1';
	var LOGIN_BY_CUSTOMER = '0';
	var FIRST_PURCHASE = '-1';
	var self;
	var UserService = function () {
		self = this;
		this.seller = null;
		this.LOGIN_SELLER_ERROR_MESSAGE = 'login_your_self';
	};
	/**
	 * Gets the current seller.
	 * @returns {user_serviceL#5.seller} the user object,or null if there is no current user.
	 */
	UserService.prototype.currentUser = function () {
		$rootScope.user = this.seller;
		return this.seller;
	};
	/**
	 * Gets the current customer
	 * @returns {user_serviceL#5.UserService.customer} a customer object or null if there is no current customer.
	 */
	UserService.prototype.currentCustomer = function () {
		return this.customer;
	};
	/**
	 * Loads the current manger/cashier/seller from storage if a returning user and information from the company_home_controller sellerLogin event
	 * @param {type} - sellerId The seller's Id
	 * @returns {seller object|null}
	 */
	UserService.prototype.loadSeller = function (sellerId) {
		if (sellerId) {
			try {
				var seller = new Seller();
				seller.fillFromStorage();
				if (sellerId && sellerId !== seller.getId()) {
					throw "Seller not found";
				}
				if (!seller.hasDevice()) {
					throw "Seller does not have deviceID";
				}
				this.seller = seller;
				CashierModeService.init();
				$timeout(function () {
					$rootScope.$emit('sellerLogin');
				});
				return seller;
			} catch (e) {
				console.error(e.message);
				return null;
			}
		}
	};
	/**
	 * This is the function that actually sends and recives the requests from the server for login info 
	 * @param {type} params - the user login params
	 * @param {type} accountInfo - the seller's information
	 * @returns {json} the requested user information from the server or an error message
	 */
	UserService.prototype.makeRequest_ = function (params, accountInfo) {
		var urlConf = new UrlConfigurator();
		return $http({
			method: 'POST',
			url: urlConf.getServerUrl(accountInfo),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			data: $httpParamSerializer(params)
		});
	};
	/**
	 * Validates that this is a demo customer and that the the current user exists in the system
	 * @param {type} accountInfo
	 * @returns {undefined}
	 */
	UserService.prototype.validateDemoMode = function (accountInfo) {
		if (!this.currentUser()) {
			return;
		}
		if (this.currentUser().isDemo() && !accountInfo.isDemo()) {
			console.log(this.currentUser().isDemo(), accountInfo.isDemo().isDemo());
			throw "can_not_use_real_card";
		} else if (!this.currentUser().isDemo() && accountInfo.isDemo()) {
			console.log(this.currentUser().isDemo(), accountInfo.isDemo());
			throw "can_not_use_demo_card";
		}
	};
	/**
	 * Sends the login request to the makeRequest function and processes the returned results
	 * @param {type} params
	 * @param {type} accountInfo
	 * @returns {user_serviceL#5.UserService.prototype@call;makeRequest_@call;then@call;catch}
	 */
	UserService.prototype.loginWithRCard_ = function (params, accountInfo) {
		return this.makeRequest_(params, accountInfo).then(function (res) {
			console.log(res);
			var responseData = res.data;
			if (params.agent && params.agent.substr(-3) === accountInfo.accountId.substr(-3) && accountInfo.isCompany) {
				throw 'You cannot use yourself as a customer while you are an agent';
			}
			if (responseData.ok === LOGIN_FAILED) {
				console.log(responseData.message);
				throw responseData.message;
			}
			return responseData;
		}).catch(function (err) {
			if (_.isString(err) && err !== '') {
				console.error(err);
				if ('That Common Good Card is for a different company.') {

				}
				throw err;
			} else if (err.statusText === '') {
				err.statusText = 'not_valid_card';
			} else {
				for (var er in err) {
					if (_.isString(err)) {
						console.error(err);
						throw err;
					} else {
						for (var e in er) {
							console.error(e);
						}
					}
				}
			}
			throw err.statusText;
		});
	};
	/**
	 * If the user is oflind when trying to do a transaction...
	 * @param {type} accountInfo
	 * @returns {.$q@call;defer.promise}
	 */
	UserService.prototype.loginWithRCardOffline = function (accountInfo) {
		var loadSellerPromise = $q.defer();
		var seller = this.loadSeller(accountInfo.accountId);
		if (seller) {
			loadSellerPromise.resolve(seller);
		} else {
			loadSellerPromise.reject("No internet connection is available.");
		}
		return loadSellerPromise.promise;
	};
	/**
	 * Logs cashier user in given the scanned info from a Common Good Card (previously referred to as a rCard, hence the name).  Returns a promise that resolves when login is complete.  If this is the first login, the promise will resolve with {firstLogin: true}.  The app should then give notice to the user that the device is associated with the user.
	 * @param {type} str - the information from the card
	 * @returns {user_serviceL#5.UserService.prototype@call;loginWithRCard_@call;then@call;then|user_serviceL#5.UserService.prototype@call;loginWithRCardOffline@call;then}
	 */
	UserService.prototype.loginWithRCard = function (str) {
		console.log(str);
		var qrcodeParser = new QRCodeParser();
		qrcodeParser.setUrl(str);
		var accountInfo = qrcodeParser.parse();
		this.validateDemoMode(accountInfo);
		//these are the parameters that become the 'Customer' object
		var companyAffiliation = localStorageService.get('company');
		var params = new RequestParameterBuilder()
			.setOperationId('identify')
			.setSecurityCode(accountInfo.securityCode)
			.setMember(accountInfo.accountId)
			.setSignin(1)
			.getParams();
		params.counter = accountInfo.counter;
		if (companyAffiliation && companyAffiliation !== accountInfo.accountId.split('-')[0] && accountInfo.isCompany) {
			NotificationService.showAlert({title: 'error', template: 'must_be_affiliated'});
			throw "not_affiliated";
		}
		if (NetworkService.isOffline()) {
			return this.loginWithRCardOffline(accountInfo).then(function () {
				PreferenceService.parsePreferencesNumber(self.currentUser().getCan());
			});
		}
		return this.loginWithRCard_(params, accountInfo)
			.then(function (responseData) {
				console.log(self);
				if (responseData.can === 0 || responseData.can) {
					console.log(balence, params, accountInfo);
					if (accountInfo.isCompany) {
						localStorageService.set('company', accountInfo.accountId.split('-')[0]);
					}
					self.seller = self.createSeller(responseData);
					self.seller.accountInfo = accountInfo;
					self.seller.save();
					params.signin = 0;
					params.device = self.seller.device;
					params.agent = accountInfo.accountId.split('-')[0];

					var balence = self.getAccountBalance(params, accountInfo);
					return self.seller;
				} else if (responseData.ok === 1) {
					throw self.LOGIN_SELLER_ERROR_MESSAGE;
				}
			})
			.then(function (seller) {
				var balence = self.getAccountBalance(params, accountInfo);
				return balence;
			}).then(function (balence) {
			self.currentUser().setBalance(balence.balance);
			console.log(balence, self.currentUser().balence);
		}).then(function () {
			return self.getProfilePicture(accountInfo);
		}).then(function () {
			if (accountInfo.isCompany) {
				PreferenceService.parsePreferencesNumber(self.currentUser().getCan());
			}
		});
	};
	UserService.prototype.getAccountBalance = function (params, accountInfo) {
		return self.loginWithRCard_(params, accountInfo);
	};
	/**
	 * Creates a seller object that has the relevant information that the seller may need and verifies whether there is a valid device that is getting used and sends this back to loginWithRCard
	 * @param {type} sellerInfo
	 * @returns {user_serviceL#5.Seller|user_serviceL#5.UserService.prototype.createSeller.seller}
	 */
	UserService.prototype.createSeller = function (sellerInfo) {
		var props = ['can', 'descriptions', 'company', 'default', 'time'];
		var seller = new Seller(sellerInfo.name);
		_.each(props, function (p) {
			seller[p] = sellerInfo[p];
		});
		if (!seller.hasDevice()) {
			if (seller.isValidDeviceId(sellerInfo.device)) {
				seller.setDeviceId(sellerInfo.device);
				seller.firstLogin = true;
			}
		}
		return seller;
	};
	/**
	 * Gets customer info and photo given the scanned info from a card.
	 * Returns a promise that resolves with the following arguments:
	 *	1. user - The User object
	 *	2. flags - A hash with the following elements:
	 *			firstPurchase - Whether this is the user's first purchase. If so, the app should notify the seller to request photo ID.
	 * @param {type} str - the URL that came from the barcode
	 * @param {type} pin - if offline, the pin of the user (1234 if it is a demo user)
	 * @returns {user_serviceL#5.UserService.prototype@call;loginWithRCard_@call;then@call;then@call;then}
	 */
	UserService.prototype.identifyCustomer = function (str, pin) {
		if (str) {
			var qrcodeParser = new QRCodeParser();
			qrcodeParser.setUrl(str);
			var accountInfo = qrcodeParser.parse();
			this.validateDemoMode(accountInfo);
			if (accountInfo.accountId === this.seller.accountInfo.accountId) {
				NotificationService.showAlert({title: 'error', template: 'must_not_be_yourself'});
				throw 'must_not_be_yourself';
			}
			if (accountInfo.isCompany && this.seller.accountInfo.isPersonal) {
				NotificationService.showAlert({title: 'error', template: 'cant_trade_as_biz_when_cust'});
				throw 'cant_trade_as_biz_when_cust';
			}
			if (accountInfo.accountId.split('-')[0] === this.seller.accountInfo.accountId.split('-')[0] && accountInfo.isCompany) {
				NotificationService.showAlert({title: 'error', template: 'must_be_customer'});
				throw 'must_be_customer';
			}
			var params = new RequestParameterBuilder()
				.setOperationId('identify')
				.setAgent(this.seller.default)
				.setMember(accountInfo.accountId)
				.setSecurityCode(accountInfo.securityCode)
				.setSignin(0);
			if (pin) {
				params.setPIN(pin);
			}
			params = params.getParams();
			params.counter = accountInfo.counter;
			if (NetworkService.isOffline()) {
				return MemberSqlService.existMember(accountInfo.accountId)
					.then(function (member) {
						self.customer = Customer.parseFromDb(member);
						return self.customer;
					})
					.catch(function (err) {
						console.log("Err", err);
						console.log("Customer accountInfo => ", accountInfo);
						return self.identifyOfflineCustomer().then(function (customerResponse) {
							self.customer = self.createCustomer(customerResponse);
							self.customer.unregistered = true;
							self.customer.accountInfo = accountInfo;
							return self.customer;
						});
					});
			}
			//is Online
			return this.loginWithRCard_(params, accountInfo)
				.then(function (responseData) {
					console.log(responseData);
					self.customer = self.createCustomer(responseData);
					if (responseData.logon === FIRST_PURCHASE) {
						self.customer.firstPurchase = true;
					}
					self.customer.accountInfo = accountInfo;
					return self.customer;
				})
				.then(function (customer) {
					return self.getProfilePicture(accountInfo, accountInfo);
				})
				.then(function (blobPhotoUrl) {
					//self.customer.photo = blobPhotoUrl;
					return self.customer;
				});
		} else {
			NotificationService.showAlert({title: 'error', template: 'went_wrong'});
		}
	};
	UserService.prototype.identifyOfflineCustomer = function () {
		var customerLoginResponse = {
			"ok": "1",
			"logon": "0",
			"name": "",
			"place": "",
			"company": "",
			"balance": "0",
			"rewards": "0",
			"can": 131
		};
		var identifyPromise = $q.defer();
		identifyPromise.resolve(customerLoginResponse);
		return identifyPromise.promise;
	};
	/**
	 * Creates a customer object that has the relevant information that the seller may need and sends this back to identifyCustomer
	 * @param {type} customerInfo
	 * @returns {user_serviceL#5.Customer}
	 */
	UserService.prototype.createCustomer = function (customerInfo) {
		var props = ['balance', 'can', 'company', 'place'];
		var customer = new Customer(customerInfo.name);
		customer.setRewards(customerInfo.rewards);
		_.each(props, function (p) {
			customer[p] = customerInfo[p];
		});
		return customer;
	};
	/**
	 * Converts the jpeg binary blob coming from the server to a canvas
	 * @param {type} url
	 * @param {type} callback
	 * @param {type} outputFormat
	 * @returns {undefined}
	 */
	function convertImgToDataURLviaCanvas(url, callback, outputFormat) {
		var img = new Image();
		img.crossOrigin = 'Anonymous';
		img.onload = function () {
			var canvas = document.createElement('CANVAS');
			var ctx = canvas.getContext('2d');
			var dataURL;
			canvas.height = 208;
			canvas.width = 156;
			ctx.drawImage(this, 0, 0, 156, 208);
			dataURL = canvas.toDataURL("image/jpeg", .1);
			callback(dataURL);
			canvas = null;
		};
		img.src = url;
	}
	/**
	 * Gets a user image from the server and converts the incoming image blog into a base64 html image to show up on the customer screen
	 * @param {type} accountInfo
	 * @returns {a base64 image}
	 */
	UserService.prototype.getProfilePicture = function (accountInfo) {
		var params = new RequestParameterBuilder()
			.setOperationId('photo')
			.setAgent(this.seller.default)
			.setMember(accountInfo.accountId)
			.setSecurityCode(accountInfo.securityCode)
			.getParams();
		var urlConf = new UrlConfigurator();
		return $http({
			method: 'POST',
			url: urlConf.getServerUrl(accountInfo),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			data: $httpParamSerializer(params),
			responseType: "arraybuffer"
		}).then(function (res) {
			console.log(res);
			var arrayBufferView = new Uint8Array(res.data);
			var blob = new Blob([arrayBufferView], {type: "image/jpeg"});
			var urlCreator = window.URL || window.webkitURL;
			var imgUrl = urlCreator.createObjectURL(blob);
			var imageConvert = $q.defer();
			convertImgToDataURLviaCanvas(imgUrl, function (base64Img) {
				if (self.customer) {
					self.customer.photo = base64Img;
					imageConvert.resolve(self.customer.photo);
				} else {
					self.currentUser().photo = base64Img;
					imageConvert.resolve(self.currentUser().photo);
				}
			});
			return imageConvert.promise;
		})
			.catch(function (err) {
				console.log(err);
				throw err;
			});
	};
	/**
	 * Activates cashier mode, then redirects to the home screen
	 * @returns {undefined}
	 */
	UserService.prototype.enterCashierMode = function () {
		CashierModeService.activateCashierMode();
		$state.go('app.home');
	};
	/**
	 * Logs the user out on the remote server.
	 * @returns {a logout promise}Returns a promise that resolves when logout is complete, or rejects with error of fail.
	 */
	UserService.prototype.logout = function () {
		return $q(function (resolve, reject) {
			SelfServiceMode.disable();
			$rootScope.$emit('sellerLogout');
			self.customer = null;
			self.seller.removeFromStorage();
			self.seller = null;
			$rootScope.user = '';
			localStorageService.remove('company');
			CashierModeService.disable();
			resolve();
		});
	};
	UserService.prototype.softLogout = function () {
		return $q(function (resolve, reject) {
			SelfServiceMode.disable();
			CashierModeService.disable();
			self.customer = null;
			self.seller = null;
			$rootScope.user = 1;
			$rootScope.whereWasI = '#/app/login';
			$state.go('app.login', {disableLoadSeller: true, openScanner: true});
			$rootScope.$emit('sellerLogout');
			resolve();
		});
	};
	UserService.prototype.storageOverQuota = function () {
		return $q(function (resolve, reject) {
			SelfServiceMode.disable();
			$rootScope.$emit('sellerLogout');
			self.customer = null;
			self.seller = null;
			$rootScope.user = '';
			CashierModeService.disable();
			resolve();
		});
	};
	return new UserService();
});