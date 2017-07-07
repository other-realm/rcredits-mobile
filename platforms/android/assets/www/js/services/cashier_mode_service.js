/* global app */
(function (app) {
	'use strict';
	app.service('CashierModeService', function (PreferenceService, localStorageService) {
		var CASHIER_MODE_KEY = 'cashier_mode';
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
					this.activateCashierMode();
				}
			}
		};
		/**
		 * Checks if the Preference 'Cashier Mode' is on and if the user is on this Mode
		 * @returns boolean
		 */
		CashierModeService.prototype.isEnabled = function () {
			return this.isActivated && PreferenceService.isCashierModeEnabled();
		};
		CashierModeService.prototype.disable = function () {
			this.isActivated = false;
			localStorageService.remove(CASHIER_MODE_KEY);
		};
		CashierModeService.prototype.activateCashierMode = function () {
			if (!PreferenceService.isCashierModeEnabled()) {
				throw new Error("Unable to activate Cashier Mode because it's not enable on Preferences.");
			}
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
		 * Figure out whether the active user has permission to exchange currency (Common Good Credits with USD or v/v)
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
