/* global _$compile_, _$rootScope_, expect, browser */
//
// Feature: Parse QR Code
//   AS a cashier
//   I WANT the customer's QR code to be interpreted correctly
//   SO we know who we're dealing with.
var R2_steps = require('../r2.js');
describe('r2% -- FEATURE_NAME', function () {
	'use strict';
	var steps = new R2_steps();
	var eachStep;
	var eachStep = new Promise(function (resolve, reject) {
		resolve(1);
	});
	beforeEach(function () { // Setup
		steps.extraSetup();
	});
	it('Scenario: We scan a valid old personal card.', function () {
			eachStep.then(function (resolve, reject) {steps.testOnly = 0?resolve:reject;});
			eachStep.then(function (resolve, reject){expect(steps.weScanQR('HTTP://NEW.RC4.ME/ABB.ZzhWMCq0zcBowqw'))?resolve:reject;});
			eachStep.then(function (resolve, reject) {steps.testOnly = 1?resolve:reject;});
			eachStep.then(function (resolve, reject){expect(steps.accountIsPersonal())?resolve:reject;});
			eachStep.then(function (resolve, reject) {steps.testOnly = 1?resolve:reject;});
			eachStep.then(function (resolve, reject){expect(steps.accountIDIs('NEWABB'))?resolve:reject;});
			eachStep.then(function (resolve, reject) {steps.testOnly = 1?resolve:reject;});
			eachStep.then(function (resolve, reject){expect(steps.securityCodeIs('ZzhWMCq0zcBowqw'))?resolve:reject;});
	});

	it('Scenario: We scan a valid old company card.', function () {
		eachStep.then(function (resolve, reject) {steps.testOnly = 0?resolve:reject;});
		eachStep.then(function (resolve, reject){expect(steps.weScanQR('HTTP://NEW.RC4.ME/AAB-WeHlioM5JZv1O9G'))?resolve:reject;});
		eachStep.then(function (resolve, reject) {steps.testOnly = 1?resolve:reject;});
		eachStep.then(function (resolve, reject){expect(steps.accountIsCompany())?resolve:reject;});
		eachStep.then(function (resolve, reject) {steps.testOnly = 1?resolve:reject;});
		eachStep.then(function (resolve, reject){expect(steps.accountIDIs('NEWAAB'))?resolve:reject;});
		eachStep.then(function (resolve, reject) {steps.testOnly = 1?resolve:reject;});
		eachStep.then(function (resolve, reject){expect(steps.securityCodeIs('WeHlioM5JZv1O9G'))?resolve:reject;});
	});

	it('Scenario: We scan a valid personal card.', function () {
		eachStep.then(function (resolve, reject) {steps.testOnly = 0?resolve:reject;});
		eachStep.then(function (resolve, reject){expect(steps.weScanQR('HTTP://6VM.RC4.ME/G0RZzhWMCq0zcBowqw'))?resolve:reject;});
		//console.log(steps.weScanQR('HTTP://6VM.RC4.ME/G0RZzhWMCq0zcBowqw'));
		eachStep.then(function (resolve, reject) {steps.testOnly = 1?resolve:reject;});
		eachStep.then(function (resolve, reject){expect(steps.accountIsPersonal())?resolve:reject;});
		//console.log(steps.accountIsPersonal());
		eachStep.then(function (resolve, reject) {steps.testOnly = 1?resolve:reject;});
		eachStep.then(function (resolve, reject){expect(steps.accountIDIs('NEWABB'))?resolve:reject;});
		//console.log(steps.accountIDIs('NEWABB'));
		eachStep.then(function (resolve, reject) {steps.testOnly = 1?resolve:reject;});
		eachStep.then(function (resolve, reject){expect(steps.securityCodeIs('ZzhWMCq0zcBowqw'))?resolve:reject;});
		//console.log(steps.securityCodeIs('ZzhWMCq0zcBowqw'));
	});

	it('Scenario: We scan a valid company card.', function () {
//		eachStep.then(function (resolve, reject) {steps.testOnly = 1?resolve:reject;});
//		eachStep.then(function (resolve, reject){expect(steps.weScanQR('HTTP://6VM.RC4.ME/H010WeHlioM5JZv1O9G'));
//		//console.log(steps.weScanQR('HTTP://6VM.RC4.ME/H010WeHlioM5JZv1O9G'));
//		eachStep.then(function (resolve, reject) {steps.testOnly = 1?resolve:reject;});
////		console.log(steps.accountIsPersonal());
//		eachStep.then(function (resolve, reject){expect(steps.accountIsCompany());
//		eachStep.then(function (resolve, reject) {steps.testOnly = 1?resolve:reject;});
////		console.log(steps.accountIDIs('NEWAAB-A'));
//		eachStep.then(function (resolve, reject){expect(steps.accountIDIs('NEWAAB-A'));
//		eachStep.then(function (resolve, reject) {steps.testOnly = 1?resolve:reject;});
////		console.log(steps.securityCodeIs('WeHlioM5JZv1O9G'));
//		eachStep.then(function (resolve, reject){expect(steps.securityCodeIs('WeHlioM5JZv1O9G'));
		eachStep.then(function (resolve, reject){steps.testOnly = 0?resolve:reject;});
		eachStep.then(function (resolve, reject){expect(steps.weScanQR('HTTP://6VM.RC4.ME/H010WeHlioM5JZv1O9G'))?resolve:reject;});
		eachStep.then(function (resolve, reject){steps.testOnly = 1?resolve:reject;});
		eachStep.then(function (resolve, reject){expect(steps.accountIsCompany())?resolve:reject;});
		eachStep.then(function (resolve, reject){steps.testOnly = 1?resolve:reject;});
		eachStep.then(function (resolve, reject){expect(steps.accountIDIs('NEWAAB-A'))?resolve:reject;});
		eachStep.then(function (resolve, reject){steps.testOnly = 1?resolve:reject;});
		eachStep.then(function (resolve, reject){expect(steps.securityCodeIs('WeHlioM5JZv1O9G'))?resolve:reject;});
	});
});
  