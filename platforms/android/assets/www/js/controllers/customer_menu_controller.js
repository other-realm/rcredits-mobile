app.controller('CustomerMenuCtrl', function ($scope, $state, $ionicLoading, UserService, $ionicHistory, NotificationService, CashierModeService, PermissionService, SelfServiceMode) {
	//create a varable for the current customer
	$scope.customer = UserService.currentCustomer();
	//show the customer's balance in a popup
	$scope.showBalance = function () {
		if ($scope.customer.balanceSecret) {
			NotificationService.showAlert('balanceIsSecret');
		} else {
			NotificationService.showAlert({
				scope: $scope,
				title: 'customerBalance',
				templateUrl: 'templates/customer-balance.html'
			});
		}
	};
	//a function that is triggered when something is finished loading
	$scope.hideLoading = function () {
		$ionicLoading.hide();
	};
	//navigate to a page that will show the customer's QR and other information
	$scope.showQR=function (){
		$state.go('app.qr');
	};
	//get rid of the customer var when the transaction is complete
	$scope.$on('$destroy', function () {
		$scope.customer = null;
	});
	//navigate to the the screen that has the keypad so that the total can be entered
	$scope.openCharge = function () {
		//Charge the customer
		var chargeFn = function () {
			$state.go('app.transaction', {'transactionType': 'charge'});
		};
		//If the cashier has the permissions necessary to carry out a transaction, have the transaction carried out, if not, send an alert
		if (CashierModeService.canCharge()) {
			chargeFn();
		} else {
			executeAction(chargeFn);
		}
	};
	$scope.openRefund = function () {
		var refundFn = function () {
			$state.go('app.transaction', {'transactionType': 'refund'});
		};
		if (CashierModeService.canRefund()) {
			refundFn();
		} else {
			NotificationService.showAlert({title: 'action_not_enabled'});
		}
	};
	$scope.openExchange = function () {
		var exchangeFn = function () {
			$state.go('app.transaction_select_exchange');
		};
		if (CashierModeService.canExchange()) {
			exchangeFn();
		} else {
			NotificationService.showAlert({title: 'action_not_enabled'});
		}
	};
	var executeAction = function (fn) {
		NotificationService.showConfirm({
			title: 'cashier_permission',
			subTitle: "",
			okText: "scanIn",
			cancelText: "cancel"
		}, {}).then(function (res) {
			if (res) {
				return PermissionService.authorizeSeller()
					.then(function (authResult) {
						if (!authResult) {
							NotificationService.showAlert({title: 'cashier_permission_rejected'});
							return;
						}
						fn();
					});
			}
		});
	};
	$scope.isSelfServiceEnabled = function () {
		return SelfServiceMode.isActive();
	};

});