/* global app, ionic */
/*
 * Controls the visual interactions on the main screen that shows up when a company logs in
 */
app.controller('CompanyHomeCtrl', function ($scope, $state, $ionicLoading, UserService, $ionicHistory, NotificationService, $rootScope, CashierModeService, SelfServiceMode, $translate, $ionicPlatform, $location) {
	var onSellerLoginEvent = $rootScope.$on('sellerLogin', function () {
		$scope.currentUser = UserService.currentUser();
	});
	$rootScope.isCustomerLoggedIn = false;
	$scope.currentUser = UserService.currentUser();
	console.log($scope.currentUser);
	if (!$scope.currentUser) {
		$state.go("app.login");
	}
	/**
	 * Alerts the user that this is the first time this customer has used the service
	 */
	if ($scope.currentUser && $scope.currentUser.isFirstLogin()) {
		NotificationService.showAlert({
			scope: $scope,
			title: 'deviceAssociated'
		},
			{
				company: $scope.currentUser.company
			})
			.then(function () {
				$scope.currentUser.setFirstLoginNotified();
			});
	}
	/**
	 * Is the app opperating in cashier mode?
	 * @returns Whether it is
	 */
	$scope.isCashierMode = function () {
		return CashierModeService.isEnabled();
	};
	/**
	 * Is the app opperating in self service mode?
	 * @returns {unresolved}
	 */
	$scope.isSelfServiceEnabled = function () {
		return SelfServiceMode.isActive();
	};
	/**
	 * Navigate to a page that will show the customer's QR and other information
	 */
	$scope.showQR = function () {
		$state.go('app.qr');
	};
	$scope.companyName = UserService.getCompanyName();
	console.log($scope.companyName);
	/**
	 * show the customer's balance in a popup
	 */
	$scope.showBalance = function () {
		UserService.balance($scope.currentUser.accountInfo);
		if ($scope.currentUser.balanceSecret) {
			NotificationService.showAlert('balanceIsSecret');
		} else {
			NotificationService.showAlert({
				scope: $scope,
				title: 'customerBalance',
				templateUrl: 'templates/customer-balance.html'
			});
		}
	};
	/**
	 * This function decides what happens when the user clicks on the "Scan CGPay Card"
	 * @returns {undefined}
	 */
	$scope.scanCustomer = function () {
//		$ionicLoading.show();
		$ionicPlatform.ready(function () {
			//is the app running on the pc or on a phone?  If it's the PC, show the demo, if it's the phone, show the barcode scanner
			var platform = ionic.Platform.platform();
			if (platform === 'linux' | platform === 'win64' || platform === 'win32' || platform === 'macintel') {
				$rootScope.whereWasI = location.hash;
				$rootScope.selfServ = $scope.isSelfServiceEnabled();
				$state.go("app.demo");
				$ionicLoading.hide();
			} else {
				if ($scope.isSelfServiceEnabled()) {
					$state.go('app.self_service_mode');
					return;
				}
				$state.go("app.customer");
			}
			;
		});
	};
});
