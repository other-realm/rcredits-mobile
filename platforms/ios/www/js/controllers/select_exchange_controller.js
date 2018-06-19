/* global app */
(function () {
	'use strict';
	app.controller('SelectExchangeCtrl', function ($scope, ExchangeService, $translate, $state, Exchange) {
		var self = this,
			currencies = ExchangeService.getCurrencies(),
			paymentTypes = ExchangeService.getPaymentTypes();
		$scope.hide_payment = false;
		$scope.currency = 'USD';
		console.log(true % 2);
		this.switchTypes = function (selected) {
			var inMoney = this.exchange.getCurrencyFrom();
			this.exchange.setCurrencyFrom(this.exchange.getCurrencyTo());
			this.exchange.setCurrencyTo(inMoney);
			document.getElementsByClassName('currencySelect')[selected - 1].style.color = 'black';
			document.getElementsByClassName('currencySelect')[selected % 2].style.color = 'lightgray';
			$scope.hide_payment = !$scope.hide_payment;
			console.log($scope.hide_payment);
//			return type.valueOf();
		};
		this.init = function () {
			this.exchange = new Exchange();
			this.exchange.setCurrencyFrom(currencies[0]);
			this.exchange.setCurrencyTo(currencies[1]);
			this.paymentTypes = paymentTypes;
			this.selectedPayment = this.paymentTypes[0];
			this.paymentAdvice = '';
		};
		this.goNextPage = function () {
			console.log(self);
			ExchangeService.setExchange(this.exchange);
			if ($scope.hide_payment) {
				this.exchange.setPaymentMethod(this.selectedPayment);
				$translate('exchange_selected_payment_advice', {
					feeValue: this.selectedPayment.getFee().getTitle(),
					paymentName: this.selectedPayment.getName()
				}).then(function (msg) {
					self.paymentAdvice = msg;
				});
				$state.go('app.transaction_exchange');
			} else {
				$state.go('app.transaction_payment-method');
			}
		};
		this.init();
	});
})(app);

