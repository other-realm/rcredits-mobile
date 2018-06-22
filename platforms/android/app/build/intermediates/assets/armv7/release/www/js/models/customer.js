/* global Class, app */
/*
 * This is the model that gets populated with customer data where it is stored on the phone and synchronized with the server if there is a network connection 
 */
(function (window, app) {
	app.service('Customer', function (User,localStorageService) {
		var DEVICE_ID_KEY = 'deviceID';
		var INDIVIDUAL_KEY= 'Individual';
		var Customer = Class.create(User, {
			balance: 0,
			rewards: null,
			lastTx: null,
			unregistered: false, // Customer logs in Offline mode for first time and not have any data
			setRewards: function (rewards) {
				this.rewards = parseFloat(rewards);
			},
			isValidDeviceId: function (device) {
				return !_.isEmpty(device);
			},
			initialize: function ($super, name) {
				$super(name);
				this.configureDeviceId_();
			},
			configureDeviceId_: function () {
				this.device = '';
				var localDeviceId = localStorageService.get(DEVICE_ID_KEY);
				if (this.isValidDeviceId(localDeviceId)) {
					this.device = localDeviceId;
				}
			},
			setBalance: function (balance) {
				this.balance = balance;
				console.log(balance);
				return this;
			},
			setDeviceId: function (device) {
				if (!this.isValidDeviceId(device)) {
					throw new Error('Invalid deviceID: ' + device);
				}
				this.device = device;
				localStorageService.set(DEVICE_ID_KEY, device);
			},
			isFirstLogin: function () {
				return this.firstLogin;
			},
			setFirstLoginNotified: function () {
				this.firstLogin = false;
				this.save();
			},
			getDevice:function (){
				return this.device;
			},
			getPlace: function () {
				return this.place;
			},
			getBalance: function () {
				return this.balance;
			},
			getRewards: function () {
				console.log(this.balance);
				return this.rewards;
			},
			setLastTx: function (transaction) {
				this.lastTx = transaction;
			},
			getLastTx: function () {
				return this.lastTx.getId();
			},
			save: function () {
				this.saveInStorage();
				this.saveInSQLite();
			},
			saveInStorage: function () {
				localStorageService.set(INDIVIDUAL_KEY, JSON.stringify(this));
			}
		});
		Customer.parseFromDb = function (customerJson) {
			var customer = new Customer(customerJson);
			var proof = customerJson.qid;
			console.log(customerJson);
			customer.setBalance(customerJson.balance);
			customer.setRewards((customerJson.rewards));
			customer.setLastTx(customerJson.lastTx);
			customer.place = customerJson.place;
			customer.company = customerJson.company;
			customer.accountInfo.accountId = customerJson.qid;
			customer.accountInfo.securityCode = proof.sc;
			if (customerJson.photo) {
				customer.photo = customerJson.photo;
			} else {
				customer.photo = '/img/New-CommonGood-Customer.png';
			}
			return customer;
		};
		window.Customer = Customer;
		return Customer;
	});
})(window, app);
