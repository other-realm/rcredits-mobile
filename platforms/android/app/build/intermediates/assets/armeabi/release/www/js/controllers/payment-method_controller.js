/* global app */
(function () {
	'use strict';
	app.controller('PaymentMethodCtrl', function ($scope, ExchangeService, $translate, $state, Exchange) {
		var self = this,
			currencies = ExchangeService.getCurrencies(),
			paymentTypes = ExchangeService.getPaymentTypes();
		$scope.currency = 'USD';
		console.log(true % 2);
		this.init = function () {
			this.exchange = ExchangeService.getExchange();
			this.exchange.setCurrencyFrom(currencies[0]);
			this.exchange.setCurrencyTo(currencies[1]);
			this.paymentTypes = paymentTypes;
			this.selectedPayment = this.paymentTypes[0];
			this.paymentAdvice = '';
			this.onPaymentChange();
			console.log(this);
		};
		this.onPaymentChange = function () {
			this.exchange.setPaymentMethod(this.selectedPayment);
			$translate('exchange_selected_payment_advice', {
				feeValue: this.selectedPayment.getFee().getTitle(),
				paymentName: this.selectedPayment.getName()
			}).then(function (msg) {
				self.paymentAdvice = msg;
			});
		};
		this.goNextPage = function () {
			console.log(self);
			ExchangeService.setExchange(this.exchange);
			$state.go('app.transaction_exchange');
		};
		this.init();
	});
})(app);

