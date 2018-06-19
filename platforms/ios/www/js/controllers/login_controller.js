/* global app */
//Handles login if the user has the appropriate permissions
app.controller('LoginCtrl', function ($scope, $ionicLoading, $state, $ionicPlatform, BarcodeService, BackButtonService, UserService, $ionicHistory, NotificationService, CashierModeService, $stateParams, $rootScope) {
	$scope.$on('$ionicView.loaded', function () {
		ionic.Platform.ready(function () {
			if (navigator && navigator.splashscreen)
				navigator.splashscreen.hide();
		});
	});
	// Scanner Login, use the demo mode if the app is running on the desktop, otherwise, open the scanner
	$ionicHistory.clearHistory();
	$scope.openScanner = function () {
		var platform = ionic.Platform.platform();
		if (platform === 'linux' | platform === 'win64' || platform === 'win32' || platform === 'macintel') {
				console.log($rootScope.cashierMode);
			if ($rootScope.cashierMode === true) {
				$rootScope.cashierMode = false;
				$rootScope.whereWasI = '#/app/login';
			} else {
				$rootScope.whereWasI = location.hash;
			}
			$state.go("app.demo");
			$ionicLoading.hide();
		} else {
			$ionicLoading.show();
			$ionicPlatform.ready(function () {
				BarcodeService.scan('app.login')
					.then(function (str) {
						UserService.loginWithRCard(str)
							.then(function () {
								$ionicHistory.nextViewOptions({
									disableBack: true
								});
								var cUser = UserService.currentUser();
								if (cUser.accountInfo.isPersonal) {
									$rootScope.isCustomerLoggedIn = true;
									$state.go("app.home");
								} else if (cUser.accountInfo.isCompany) {
									$state.go("app.home");
								}
							})
							.catch(function (errorMsg) {
								NotificationService.showAlert({title: "error", template: errorMsg});
							})
							.finally(function () {
								$ionicLoading.hide();
							});
					})
					.catch(function (errorMsg) {
						NotificationService.showAlert({title: "error", template: errorMsg});
						$ionicLoading.hide();
					});
			});
		}
	};
	if (CashierModeService.isEnabled() || $stateParams.openScanner) {
		$scope.openScanner();
	}
});
