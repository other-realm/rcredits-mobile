/*
 * #app/customer - Handles customer transactions and customer information
 */
app.controller('CustomerMenuCtrl', function ($scope, $state, $ionicLoading, UserService, $ionicHistory, NotificationService, CashierModeService, PermissionService, SelfServiceMode, $rootScope, BarcodeService) {
	if (!$rootScope.isCustomerLoggedIn) {
		var onSellerLoginEvent = $rootScope.$on('sellerLogin', function () {
			$scope.currentUser = UserService.currentUser();
		});

		//	//On the off chance they decide to cancel the scan
		$scope.$on('$destroy', function () {
			if (onSellerLoginEvent) {
				onSellerLoginEvent();
			}
			if (!$rootScope.isCustomerLoggedIn) {
				$state.go("app.home");
			}
		});
		//scan the barcode of a customer and navigate to 'app.customer' if successfull, show an error if not
		BarcodeService.scan('app.customer')
			.then(function (id) {
//						$ionicLoading.show();
				UserService.identifyCustomer(id)
					.then(function () {
						$scope.customer = UserService.currentCustomer();
						//alert that this is their first purchace
						if ($scope.customer.firstPurchase) {
							NotificationService.showConfirm({
								title: 'firstPurchase',
								templateUrl: "templates/first-purchase.html",
								scope: $scope,
								okText: "confirm"
							})
								.then(function (confirmed) {
									if (confirmed) {
										$rootScope.isCustomerLoggedIn = true;
										customerMenu();
									}
								});
						} else {
							$rootScope.isCustomerLoggedIn = true;
							customerMenu();
						}
					})
					//catch and alert if the scan was not successful
					.catch(function (errorMsg) {
						if (errorMsg === 'login_your_self') {
							NotificationService.showAlert({title: "Error", template: "You are already signed in as: " + $scope.currentUser.name});
						} else {
							NotificationService.showAlert({title: "Error", template: errorMsg});
						}
						$state.go("app.home");
						$ionicLoading.hide();
					});
			})
			//catch and alert if the scan was not successful
			.catch(function (errorMsg) {
				NotificationService.showAlert({title: "error", template: errorMsg});
				$state.go("app.home");
				$ionicLoading.hide();
			});

	} else {
		customerMenu();
	}
	function customerMenu() {
		
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
		var areYouAnIndividual=UserService.currentUser();
		console.log($scope.customer);
		$scope.isIndividual=function () {
			return areYouAnIndividual.accountInfo.isPersonal;
		};
		//
		//a function that is triggered when something is finished loading
		$scope.hideLoading = function () {
			$ionicLoading.hide();
		};
		//navigate to a page that will show the customer's QR and other information
//		$scope.showQR = function () {
//			$state.go('app.qr');
//		};
		//get rid of the customer var when the transaction is complete
		$scope.$on('$destroy', function () {
			$scope.customer = null;
//		$rootScope.undo=false;
		});
		//navigate to the the screen that has the keypad so that the total can be entered
		$scope.openCharge = function () {
			$rootScope.undo = true;
			console.log($rootScope.undo);
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
			$rootScope.undo = true;
			console.log($rootScope.undo);
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
			$rootScope.undo = true;
			console.log($rootScope.undo);
			var exchangeFn = function () {
				$state.go('app.transaction_select_exchange');
			};
			if (CashierModeService.canExchange()) {
				exchangeFn();
			} else {
				executeAction(exchangeFn);
//				NotificationService.showAlert({title: 'action_not_enabled'});
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
							console.log(authResult);
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
	}
});