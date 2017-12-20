/* global app */
(function () {
	'use strict';
	app.controller('ExchangeCtrl', function ($scope, ExchangeService, $translate, NotificationService, TransactionService, $ionicLoading, $state, $rootScope,NetworkService) {
		var self = this;
		$scope.amount = 0;
		this.init = function () {
			this.exchange = ExchangeService.getExchange();
			this.paymentMethod = this.exchange.getPaymentMethod();
			self.CommonGoodIsCurrencyFrom = self.exchange.getCurrencyFrom().getType() === 'rcredit';
			$translate('exchange_includes_fee', {
				feeValue: this.paymentMethod.getFee().getTitle(),
				paymentName: this.paymentMethod.getName()
			}).then(function (msg) {
				self.paymentFeeTitle = msg;
			});
		};
		this.calculateOutAmount = function () {
			return this.paymentMethod.applyFeeTo($scope.amount);
		};
		this.doExchange = function () {
			console.log($scope.amount, this.exchange.getCurrencyFrom(), this);
			var transactionAmount = $scope.amount;
			if (transactionAmount > 300 && NetworkService.isOffline()) {
				NotificationService.showAlert({title: 'error', template: 'no_more_than_300'});
				return false;
			}else if (transactionAmount > 100000) {
				NotificationService.showAlert({title: 'error', template: 'no_more_than_100000'});
				return false;
			} else {
				TransactionService.exchange($scope.amount, this.exchange.getCurrencyFrom(), this.paymentMethod)
					.then(function (transaction) {
						console.log(transaction, $scope.amount, this);
						$state.go('app.transaction_result',
							{'transactionStatus': 'success', 'transactionAmount': transaction.amount});
					})
					.finally(function () {
						$ionicLoading.hide();
					});
			}
		};
		this.init();
	});
})(app);