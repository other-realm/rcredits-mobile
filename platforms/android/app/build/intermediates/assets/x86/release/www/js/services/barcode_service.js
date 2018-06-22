/* global _, app */
/**
 * Deals with scanning the barcode
 * @param {type} app
 * @returns {a new barcode service}
 */
(function (app) {
	'use strict';
	var WebScanner = function () {
		this.id = 0;
		this.scan = function (success, fail) {
			success(WebScanner.SCANS[this.id++]);
		};
	};
	// This is the read from Bob Bossman: NEW:AAB, WeHlioM5JZv1O9G
	//{text: "HTTP://NEW.RC4.ME/AAB-WeHlioM5JZv1O9G", format: "QR_CODE", cancelled: false}, // Seller Bob Bossman
	//{text: "HTTP://NEW.RC4.ME/ABB.ZzhWMCq0zcBowqw", format: "QR_CODE", cancelled: false}  // Customer Susan Shopper
	WebScanner.SCANS = [

	];
	app.service('BarcodeService', function ($q, $ionicPlatform, $rootScope) {
		var self;
		var BarcodeService = function () {
			self = this;
			this.configure_();
		};
		/**
		 * Only used on web app. not on mobile
		 */
		BarcodeService.WebScanner = WebScanner;
		/**
		 * Sets the scanner id to 0 when the seller logs out
		 * @returns {undefined}
		 */
		BarcodeService.prototype.setScanForCustomer = function () {
			self.scanner.id = 0;
		};
		BarcodeService.prototype.configure_ = function () {
			if (ionic.Platform.isWebView()) {
				$ionicPlatform.ready(function () {
					self.scanner = cordova.plugins.barcodeScanner;
				});
			} else {
				this.scanner = new WebScanner();
				$rootScope.$on('sellerLogin', function () {
					self.scanner.id = 1;
				});

				$rootScope.$on('sellerLogout', function () {
					self.setScanForCustomer();
				});

				$rootScope.$on("TransactionDone", function () {
					self.scanner.id = 1;
				});
			}
		};
		/**
		 * Fetches a barcode.
		 * @returns {promise} a promise that resolves with the scanned data when scanning is complete.
		 */
		BarcodeService.prototype.scan = function () {
			return $q(function (resolve, reject) {
				self.scanner.scan(function (scanResult) {
					self.scanSuccess_(resolve, reject, new BarcodeResult(scanResult));
				},
					_.partial(self.scanFail_, reject).bind(self));
			});
		};
		/**
		 * A function that fires when the scan is carried out to see what the results are
		 * @param {type} sucessFn - emit a message that the scan returned a result
		 * @param {type} rejectFn - emit message that either the scan was canceled or that the result was not a QR code
		 * @param {type} barCodeResult - the result of a barcode scan
		 * @returns {undefined}
		 */
		BarcodeService.prototype.scanSuccess_ = function (sucessFn, rejectFn, barCodeResult) {
			if (barCodeResult.wasCancelled()) {
				rejectFn('scanCancelled');
			}
			if (!barCodeResult.isQRCode()) {
				rejectFn('scanQRCode');
			} else {
				sucessFn(barCodeResult.text);
			}
		};
		/**
		 * What happens when the scan returns an error (as opposed to simply a bad QR code)
		 * @param {type} rejectFn
		 * @param {type} scanError
		 * @returns {undefined}
		 */
		BarcodeService.prototype.scanFail_ = function (rejectFn, scanError) {
			console.error("Scan failed: ", scanError);
			rejectFn(scanError);
		};
		return new BarcodeService();
	});
})(app);