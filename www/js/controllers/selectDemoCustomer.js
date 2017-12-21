/* global app, $ionicHistory 
 {name: 'Cathy Cashier', url: 'HTTPS://NEW.RC4.ME/ABJ-ME04nW44DHzxVDg', signin: '1', img: 'img/CathyCashier.jpg'},
 {name: 'Bob Bossman', url: 'HTTPS://NEW.RC4.ME/AAB-WeHlioM5JZv1O9G', signin: '1', img: 'img/BobBossman.jpg'},
 {name: 'Curt Customer', url: 'HTTPS://NEW.RC4.ME/AAK.NyCBBlUF1qWNZ2k', signin: '0', img: 'img/CurtCustomerMember.jpg'},
 {name: 'Susan Shopper', url: 'HTTPS://NEW.RC4.ME/ABB.ZzhWMCq0zcBowqw', signin: '0', img: 'img/SusanShopper.jpg'},
 {name: "Curt-Helga's Hardware", url: 'HTTPS://NEW.RC4.ME/AAD-utbYceW3KLLCcaw', signin: '1', img, ionic: 'img/CurtCustomerAgent.jpg'}
 * */
app.controller('SelectDemoCust', function ($scope, $state, $stateParams, $ionicLoading, $filter, NotificationService, UserService, TransactionService, $location, $rootScope, NetworkService, $ionicHistory) {
	/**
	 * The dummy user info to use in tests on the desktop
	 */
	$scope.populateDemoCustomers = [
		[
			{name: 'Susan Shopper', url: 'HTTPS://NEW.RC4.ME/ABB.ZzhWMCq0zcBowqw', signin: '0', img: 'img/SusanShopper.jpg'},
			{name: 'Maria Manager', url: 'HTTPS://NEW.RC4.ME/AAB-WeHlioM5JZv1O9G', signin: '1', img: 'img/MariaManager.jpg'},
//			{name: 'Cathy Cashier', url: 'HTTPS://NEW.RC4.ME/ABJ-ME04nW44DHzxVDg', signin: '1', img: 'img/CathyCashier.jpg'},
			{name: 'Curt Customer', url: 'HTTPS://NEW.RC4.ME/AAK.NyCBBlUF1qWNZ2k', signin: '0', img: 'img/CurtCustomerPersonal.jpg'},
			{name: "Curt-Helga's Hardware", url: 'HTTPS://NEW.RC4.ME/AAD-utbYceW3KLLCcaw', signin: '1', img: 'img/CurtCustomerHelgasHardware.jpg'}
		], [
			{name: 'Susan', url: 'HTTPS://6VM.RC4.ME/G0RZzhWMCq0zcBowqw', signin: '0', img: 'img/SusanShopper.jpg'},
			{name: 'Maria', url: 'HTTPS://6VM.RC4.ME/H010WeHlioM5JZv1O9G:somethingForBob', signin: '1', img: 'img/MariaManager.jpg'},
//			{name: 'Cathy', url: 'HTTPS://6VM.RC4.ME/H021ME04nW44DHzxVDg', signin: '1', img: 'img/CathyCashier.jpg'},
			{name: 'Curt', url: 'HTTPS://6VM.RC4.ME/G0ANyCBBlUF1qWNZ2k.something', signin: '0', img: 'img/CurtCustomerPersonal.jpg'},
			{name: "Curt's Hardware", url: 'HTTPS://6VM.RC4.ME/H0G0utbYceW3KLLCcaw', signin: '1', img: 'img/CurtCustomerHelgasHardware.jpg'}
		], [
			{name: 'Susan', url: 'G6VM0RZzhWMCq0zcBowqw', signin: '0', img: 'img/SusanShopper.jpg'},
			{name: 'Maria', url: 'H6VM010WeHlioM5JZv1O9G', signin: '1', img: 'img/MariaManager.jpg'},
//			{name: 'Cathy', url: 'H6VM021ME04nW44DHzxVDg', signin: '1', img: 'img/CathyCashier.jpg'},
			{name: 'Curt', url: 'G6VM0ANyCBBlUF1qWNZ2k.something', signin: '0', img: 'img/CurtCustomerPersonal.jpg'},
			{name: "Curt's Hardware", url: 'H6VM0G0utbYceW3KLLCcaw', signin: '1', img: 'img/CurtCustomerHelgasHardware.jpg'}
		]
	];
	/*
	 
	 */
	var formats = document.getElementsByName('formattype');
	$scope.iswebview = ionic.Platform.platform();
	$scope.format = {
		type: 2
	};
	for (var i = 0; i < formats.length; i++) {
		formats[i].onclick = function () {
			$scope.format.type = this.value;
			$scope.customer = $scope.populateDemoCustomers[$scope.format.type];
			$scope.manager = $scope.populateDemoCustomers[$scope.format.type];
		};
	}
	var type_Of_QR = $scope.format.type[0];
	$scope.data = {
		clientSide: 'new'
	};
	$scope.customer = $scope.populateDemoCustomers[$scope.format.type];
	$scope.selectedCustomer = {
		selected: $scope.customer
	};
	$scope.manager = $scope.populateDemoCustomers[$scope.format.type];
	$scope.selectedManager = {
		selected: $scope.manager
	};
	$scope.whereWasI = $rootScope.whereWasI;
	$scope.customPerson = $scope.populateDemoCustomers[$scope.format.type];
	$scope.customPerson.url = '';// 'G6VM0RZzhWMCq0zcBowqw';//H6VM010WeHlioM5JZv1O9G
	$scope.onSelectCustomer = function (person, goToNextPage) {
		var selected = person;
		console.log(selected);
		UserService.identifyCustomer(selected)
			.then(function () {
				$scope.customPerson = UserService.currentCustomer();
				if (goToNextPage) {
					$scope.customer = UserService.currentCustomer();
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
									$rootScope.isCustomerLoggedIn = true;
									$state.go("app.customer");
								}
							});
						$ionicLoading.hide();
					} else {
						$ionicLoading.hide();
						$rootScope.isCustomerLoggedIn = true;
						$state.go("app.customer");
					}
				}
			})
			.catch(function (errorMsg) {
				console.log(errorMsg);
				$rootScope.isCustomerLoggedIn = false;
				if (errorMsg === 'login_your_self') {
					NotificationService.showAlert({title: "Error", template: "You cannot use yourself as a customer while you are an agent"});
				} else if (errorMsg === 'login_your_self') {
					NotificationService.showAlert({title: "Error", template: "You are already signed in as: " + $scope.currentUser.name});
				} else {
					NotificationService.showAlert({title: "Error", template: errorMsg});
				}
				$ionicLoading.hide();
			});
	};
	$scope.onSelectManager = function (person, goToNextPage) {
		var selected = person.url;
		if (!selected) {
			selected = person;
		}
		$rootScope.isCustomerLoggedIn = false;
		person.signin = 1;
		UserService.loginWithRCard(selected)
			.then(function () {
				$scope.customPerson = UserService.currentUser();
				console.log($scope.customPerson);
				if (goToNextPage) {
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					$state.go("app.home");
				}
			})
			.catch(function (errorMsg) {
				if (errorMsg === 'login_your_self') {
					NotificationService.showAlert({title: "Error", template: "You are already signed in as: " + person.name});
				} else if (errorMsg === 'TypeError: this.db is null') {
					NotificationService.showAlert({title: "Error", template: "You need to have WebSQL enabled"});
				} else {
					console.log(errorMsg);
				}
				$ionicLoading.hide();
//				console.log($scope.customPerson.accountInfo.isPersonal, $scope.customPerson, goToNextPage);
				if ($scope.customPerson.accountInfo) {
					$state.go("app.home");
				} else {
					$state.go('app.login');
				}
			})
			.finally(function () {
				$ionicLoading.hide();
			});
	};
	$scope.testD = {members: [{"id":".ZZC",
				"fullName":"Corner Store",
				"city":"Ashfield",
				"state":"MA",
				"balance":"0",
				"flags":"ok,co"
			},{
				"id":".ZZS",
				"fullName":"Susan Shopper",
				"city":"Montague",
				"state":"MA",
				"balance":"100",
				"flags":"ok"
			}]};
	console.log($scope.testD.members[0]);
	$scope.doTest = function (whattotest, testData) {
		console.log(whattotest, testData,TransactionService.testThings(whattotest, testData));
		 $scope.testResults=TransactionService.testThings(whattotest, testData);
	};
	$scope.testResults='';
	$scope.wifi = {checked: !NetworkService.isOnline()};
	$scope.toggleWiFi = function () {
		if (!$scope.wifi.checked) {
			NetworkService.fakingIt(false);
		} else {
			NetworkService.fakingIt(true);
		}
	};
});