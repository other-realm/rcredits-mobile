/* global app, ionic */
/*
 * Controls the visual interactions on the main screen that shows up when a company logs in
 */
app.controller('CompanyHomeCtrl', function ($scope, $state, $ionicLoading, BarcodeService, UserService, $ionicHistory, NotificationService, $rootScope, CashierModeService, SelfServiceMode, $translate, $ionicPlatform, $location) {
	var onSellerLoginEvent = $rootScope.$on('sellerLogin', function () {
		$scope.currentUser = UserService.currentUser();
	});
	$scope.currentUser = UserService.currentUser();
	if (!$scope.currentUser) {
		$state.go("app.login");
	}
	/**
	 * Alerts the user that this is the first time this customer has used the service
	 */
	if ($scope.currentUser && $scope.currentUser.isFirstLogin()) {
		$scope.currentUser.setFirstLoginNotified();
	}
	$scope.isCashierMode = function () {
		return CashierModeService.isEnabled();
	};
	$scope.isSelfServiceEnabled = function () {
		return SelfServiceMode.isActive();
	};
	/**
	 * This function decides what happens when the user clicks on the "Scan Common Good Card"
	 * @returns {undefined}
	 */
	$scope.scanCustomer = function () {
		if ($scope.isSelfServiceEnabled()) {
			$state.go('app.self_service_mode');
			return;
		}
		$ionicLoading.show();
		$ionicPlatform.ready(function () {
			//is the app running on the pc or on a phone?
			var platform = ionic.Platform.platform();
			if (platform === 'linux' | platform === 'win64' || platform === 'win32' || platform === 'macintel') {
				$rootScope.whereWasI = location.hash;
				$state.go("app.demo");
				$ionicLoading.hide();
			} else {
				//scan the barcode of a customer and navigate to 'app.customer' if successfull, show an error if not
				BarcodeService.scan('app.home')
					.then(function (id) {
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
												$ionicLoading.show();
												$state.go("app.customer");
											}
										});
									$ionicLoading.hide();
								} else {
									$ionicLoading.hide();
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
								$ionicLoading.hide();
							});
					})
					//catch and alert if the scan was not successful
					.catch(function (errorMsg) {
						NotificationService.showAlert({title: "error", template: errorMsg});
						$ionicLoading.hide();
					});
				//On the off chance they decide to cancel the scan
				$scope.$on('$destroy', function () {
					if (onSellerLoginEvent) {
						onSellerLoginEvent();
					}
				});
			}
			;
		});
	};
});
