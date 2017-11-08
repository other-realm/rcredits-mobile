/* global app */
(function (app) {
	'use strict';
	app.service('CashierModeService', function (PreferenceService, localStorageService, $rootScope) {
		var CASHIER_MODE_KEY = 'cashier_mode';
		var SELLER_KEY = 'seller';
		var self;
		var CashierModeService = function () {
			self = this;
			this.isActivated = false;
		};
		/**
		 * If cashier mode is in effect, and enabled in the preferences note this in the local storage
		 */
		CashierModeService.prototype.init = function () {
			if (PreferenceService.isCashierModeEnabled()) {
				var cashierMode = localStorageService.get(CASHIER_MODE_KEY);
				if (cashierMode === true) {
					$rootScope.cashierMode = true;
					this.activateCashierMode();
				}
			}
		};
		/**
		 * Checks if the Preference 'Cashier Mode' is on and if the user is on this Mode
		 * @returns boolean
		 */
		CashierModeService.prototype.isEnabled = function () {
			$rootScope.cashierMode = true;
			localStorageService.remove(SELLER_KEY);
			return this.isActivated && PreferenceService.isCashierModeEnabled();
		};
		CashierModeService.prototype.disable = function () {
			$rootScope.cashierMode = false;
			this.isActivated = false;
			localStorageService.remove(CASHIER_MODE_KEY);
		};
		CashierModeService.prototype.activateCashierMode = function () {
			if (!PreferenceService.isCashierModeEnabled()) {
				throw new Error("Unable to activate Cashier Mode because it's not enable on Preferences.");
			}
			$rootScope.cashierMode = true;
			this.isActivated = true;
			localStorageService.set(CASHIER_MODE_KEY, true);
		};
		/**
		 * Figure out whether the active user has permission to charge the customer
		 * @returns {Boolean}
		 */
		CashierModeService.prototype.canCharge = function () {
			if (!this.isActivated) {
				return true;
			}
			return PreferenceService.getCashierCanPref().isChargeEnabled();
		};
		/**
		 * Figure out whether the active user has permission to refund the customer
		 * @returns {Boolean}
		 */
		CashierModeService.prototype.canRefund = function () {
			if (!this.isActivated) {
				return true;
			}
			return PreferenceService.getCashierCanPref().isRefundEnabled();
		};
		/**
		 * Figure out whether the active user has permission to exchange currency (CGPay Credits with USD or v/v)
		 * @returns {Boolean}
		 */
		CashierModeService.prototype.canExchange = function () {
			if (!this.isActivated) {
				return true;
			}
			return PreferenceService.getCashierCanPref().isExchangeEnabled();
		};
		return new CashierModeService();
	});
})(app);
