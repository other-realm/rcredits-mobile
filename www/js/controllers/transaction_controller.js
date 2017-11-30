/* global app */
app.controller('TransactionCtrl', function ($scope, $state, $stateParams, $ionicLoading, $rootScope, $filter, NotificationService, UserService, TransactionService) {
	$scope.transactionType = $stateParams.transactionType;
	$scope.amount = 0;
	var seller = UserService.currentUser();
	var customer = UserService.currentCustomer();
	var isTransactionTypeCharge = function () {
		return $scope.transactionType === 'charge';
	};
	$scope.sellOrCust = seller.accountInfo.isCompany;
	var fillCategories = function () {
		if ($scope.sellOrCust) {
			if (isTransactionTypeCharge()) {
				// You can put in other and none for the future here
				return seller.descriptions;
			}
			return seller.descriptions;
		} else {
			console.log(seller.descriptions);
			seller.descriptions = "Individual Payment";
			return seller.descriptions;
		}
	};
	$scope.moreThan1Category = function () {
		if (seller.accountInfo.isCompany && seller.descriptions.length > 1) {
			return true;
		} else {
			return false;
		}
	};
	$scope.categories = fillCategories();
	console.log($scope.categories, seller.accountInfo.isCompany);
	$scope.selectedCategory = {
		selected: $scope.categories[0],
		custom: null
	};
	$scope.disableTransaction = function () {
		if ($scope.amount === 0 || !$scope.selectedCategory.selected) {
			return true;
		}
	};
	jQuery('.downSymbol').ready(function () {
		jQuery('.downSymbol').click(function () {
			console.log(this);
		});
	});
	function chooseCat() {
		console.log('test');
		$scope.onSelectCategory();
	}
	$scope.charge = function () {
		return TransactionService.charge($scope.amount, $scope.selectedCategory.selected);
	};
	$scope.refund = function () {
		return TransactionService.refund($scope.amount, $scope.selectedCategory.selected);
	};
	$scope.initiateTransaction = function () {
		var transactionAmount = $scope.amount;
		console.log($rootScope.onOnline);
		if (transactionAmount > 300 && $rootScope.amIOnline) {
			NotificationService.showAlert({title: 'error', template: 'no_more_than_300'});
			return false;
		} else {
			var transactionPromise;
			try {
				if (isTransactionTypeCharge()) {
					transactionPromise = $scope.charge();
				} else {
					transactionPromise = $scope.refund();
				}
				transactionPromise.then(function (transaction) {
					$state.go('app.transaction_result', {'transactionStatus': 'success', 'transactionAmount': transactionAmount});
					$ionicLoading.hide();
				}, function (errorMsg) {
					console.log(errorMsg);
					TransactionService.lastTransaction = errorMsg;
					$state.go('app.transaction_result', {'transactionStatus': 'failure', 'transactionAmount': transactionAmount, 'transactionMessage': errorMsg.message});
					$ionicLoading.hide();
				});
			} catch (e) {
				$ionicLoading.hide();
			}
		}
	};
	$scope.onSelectCategory = function () {
		if (!isTransactionTypeCharge() || $scope.selectedCategory.selected !== 'other') {
			return;
		}
		console.log($scope.categories);
		$scope.selectedCategory.custom = null;
		var myPopup = NotificationService.showConfirm({
			template: '<input type="text" ng-model="selectedCategory.custom">',
			title: 'enterNewCategory',
			subTitle: '',
			scope: $scope,
			buttons: [
				{text: 'Cancel'},
				{
					text: '<b>Save</b>',
					type: 'button-positive',
					onTap: function (e) {
						if (!$scope.selectedCategory.custom) {
							//don't allow a user to close unless they enter a wifi password
							e.preventDefault();
						} else {
							return $scope.selectedCategory.custom;
						}
					}
				}
			]
		});
		myPopup.then(function (res) {
			if (res) {
				$scope.categories.push(res);
				$scope.selectedCategory.selected = res;
			}
		});
	};
});
