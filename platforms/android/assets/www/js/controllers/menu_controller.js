app.controller('MenuCtrl', function ($scope, $state, $ionicLoading, BarcodeService, UserService, $ionicHistory, $rootScope,
	NotificationService, CashierModeService, PreferenceService, NetworkService,
	SelfServiceMode, $ionicSideMenuDelegate, $timeout) {
	var backCount = 0;
	/**
	 * Change store and erase user data stored on phone
	 * @returns {undefined}
	 */
	$scope.logout = function () {
		$ionicLoading.show();
		UserService.logout()
			.then(function () {
				$state.go("app.login");
			})
			.catch(function (errorMsg) {
				NotificationService.showAlert({title: "error", template: errorMsg});
			})
			.finally(function () {
				$ionicLoading.hide();
			});
	};
	/**
	 * For debugging...
	 */
	$scope.trackGoBack = 'Back';
	/**
	 * Logout of cashier or self-service mode
	 * @returns {A logout object}
	 */
	$scope.softLogout = function () {
		$rootScope.cashierMode='loggingOut';
		return UserService.softLogout();
	};
	/**
	 * Redirects to login
	 * @returns {undefined}
	 */
	$scope.redirectToLogin = function () {
		$state.go("app.login");
	};
	/**
	 * Redirects the user to the main cashier screen and clears the navigation history so that you can't go back to the most recent transaction
	 * @returns {undefined}
	 */
	$scope.redirectHome = function () {
		$ionicHistory.clearHistory();
		$ionicHistory.nextViewOptions({
			disableBack: true,
			disableAnimate: true
		});
		$ionicHistory.clearCache().then(function () {
							$state.go("app.home");
		});
	};
	$scope.redirectPreferences = function () {
		$state.go("app.preferences");
	};
	$scope.isCashierModeEnabled = function () {
		return CashierModeService.isEnabled();
	};
	$scope.isCashierModeAvailable = function () {
		return PreferenceService.getCashierModePref().isEnabled();
	};
	$scope.changeCompany = function () {
		var seller = UserService.currentUser();
		console.log(seller);
		NotificationService.showConfirm({
			title: 'disassociate_company',
			subTitle: "haveToSignInAgain",
			okText: "confirm",
			cancelText: "cancel"
		}, {
			company: seller.company
		}).then(function (res) {
			if (res) {
				if ((seller.accountInfo.isCompany!==undefined && seller.accountInfo.isCompany!==null)||seller.accountInfo.isCompany) {
					seller.removeDevice();
				}
				$scope.logout();
			}
		});
	};
	$scope.enterCashierMode = function () {
		return UserService.enterCashierMode();
	};
	$scope.isOnline = function () {
		return NetworkService.isOnline();
	};
	$scope.changeToSelfServiceMode = function () {
		NotificationService.showConfirm({
			subtitle: '',
			title: "confirm_self_service_mode",
			okText: "confirm",
			cancelText: "cancel"
		}).then(function (res) {
			if (res) {
				SelfServiceMode.active();
			}
		});
	};
	$scope.isSelfServiceEnabled = function () {
		return PreferenceService.isSelfServiceEnabled();
	};
	$scope.isSelfServiceActive = function () {
		return SelfServiceMode.isActive();
	};
	$scope.$watch(function () {
		return !!UserService.currentUser();
	}, function (newValue, oldValue) {
		if (!newValue) {
			$timeout(function () {
				$ionicSideMenuDelegate.canDragContent(false);
			});
		}
	});
});