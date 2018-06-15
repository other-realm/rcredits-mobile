app.controller('BarcodeScan', function ($scope, $state, $ionicLoading, BarcodeService, UserService, $ionicHistory, NotificationService, $rootScope, CashierModeService, SelfServiceMode, $translate, $ionicPlatform, $location) {
	var onSellerLoginEvent = $rootScope.$on('sellerLogin', function () {
		$scope.currentUser = UserService.currentUser();
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
									$state.go("app.customer");
								}
							});
					} else {
						$state.go("app.customer");
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
			console.log(errorMsg);
			NotificationService.showAlert({title: "error", template: errorMsg});
			$ionicLoading.hide();
		});
//	//On the off chance they decide to cancel the scan
	$scope.$on('$destroy', function () {
		if (onSellerLoginEvent) {
			onSellerLoginEvent();
		}
		$state.go("app.home");
	});
});