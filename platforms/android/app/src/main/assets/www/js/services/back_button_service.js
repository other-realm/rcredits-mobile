(function (app) {
	'use strict';
	app.service('BackButtonService', function ($ionicPlatform) {
		var self = this;
		var desregisterBackButton;
		var BackButtonService = function () {
			self = this;
			//For some reason I think this is true when disabled and false when enabled
			this.enableBackButton = true;
		};
		BackButtonService.prototype.init = function () {};
		/**
		 * Disables the Backbutton
		 * @returns {undefined}
		 */
		BackButtonService.prototype.disable = function () {
			this.enableBackButton = true;
			desregisterBackButton = $ionicPlatform.registerBackButtonAction(function (event) {
				if (!self.isEnable()) {
					event.preventDefault();
					event.stopPropagation();
				}
			}, 100);
		};
		/**
		 * Enables the Backbutton
		 * @returns {undefined}
		 */
		BackButtonService.prototype.enable = function () {
			this.enableBackButton = false;
			if (desregisterBackButton) {
				desregisterBackButton();
				desregisterBackButton = null;
			}
		};
		/**
		 * Just returnes whether the backbutton is enabled or not
		 * @returns {Boolean}
		 */
		BackButtonService.prototype.isEnable = function () {
			return this.enableBackButton;
		};
		return new BackButtonService();
	});
})(app);