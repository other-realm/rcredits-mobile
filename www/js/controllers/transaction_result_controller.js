app.controller('TransactionResultCtrl', function ($scope, $state, NetworkService,
	$stateParams, $ionicLoading, $filter, NotificationService, UserService, $rootScope,
	TransactionService, BackButtonService, $timeout, $interval, SelfServiceMode) {
	var oldOnline = NetworkService.isOnline();
	console.log($stateParams.transactionType);
	$scope.transactionStatus = $stateParams.transactionStatus;
	$scope.transactionAmount = $stateParams.transactionAmount;
	$scope.networkStatus = NetworkService.isOnline();
	$scope.showQR = function () {
		$state.go('app.qr');
	};
	BackButtonService.disable();
	var statusKey;
	$scope.success = false;
	$scope.timeCan = true;
	// Enable UNDO btn for 1 min
	$timeout(function () {
		$scope.timeCan = false;
	}, 60 * 1000);
	function onoroff() {
		var onOff = $interval(function () {
			if (NetworkService.isOnline() !== oldOnline) {
				$scope.timeCan = false;
				$interval.cancel(onOff);
			}
			oldOnline = NetworkService.isOnline();
		}, 100);
	}
	onoroff();
	$scope.setMessages = function (transactionResult) {
		if (NetworkService.isOnline()) {
			$scope.note = transactionResult.data.message;
			if (transactionResult.data.txid) {
				if ($scope.note.indexOf("ransaction has been canceled") > -1) {
					$scope.heading = 'Canceled';
					$scope.success = false;
				} else {
					$scope.heading = 'Successful';
					$scope.success = true;
				}
			} else {
				$scope.heading = 'Unsuccessful';
				$scope.success = false;
			}
		} else {
			$scope.note = transactionResult.message;
			if (transactionResult.txid) {
				if ($scope.note.indexOf("ransaction has been canceled") > -1) {
					$scope.heading = 'Canceled';
					$scope.success = false;
				} else {
					$scope.heading = 'Successful';
					$scope.success = true;
				}
			} else {
				$scope.heading = 'Unsuccessful';
				$scope.success = false;
			}
		}
	};
	$scope.customer = UserService.currentCustomer();
	$scope.user = UserService.currentUser();
	if ($scope.transactionStatus === 'failure') {
		console.log(TransactionService);
		$scope.setMessages(TransactionService);
	} else {
		$scope.setMessages(TransactionService.lastTransaction);
		$scope.transactionInfo = {
			amount: $filter('currency')($scope.transactionAmount),
			company: $scope.user.company,
			customerName: $scope.customer.name
		};
	}
	$scope.undoTransaction = function () {
		NotificationService.showConfirm({
			title: 'confirm_undo_transaction',
			subTitle: "",
			okText: "yes",
			cancelText: "no"
		}).then(function (res) {
			if (res === true) {
				$ionicLoading.show();
				TransactionService.undoTransaction(TransactionService.lastTransaction)
					.then(function (transactionResult) {
						transactionResult.message = "Charge was canceled";
						$scope.setMessages(transactionResult);
						$rootScope.undo = false;
					})
					.finally(function () {
						$ionicLoading.hide();
					});
			}
		});
	};
	$scope.$on('$destroy', function () {
		BackButtonService.enable();
	});
	$scope.isSelfServiceEnabled = function () {
		return SelfServiceMode.isActive();
	};

});
