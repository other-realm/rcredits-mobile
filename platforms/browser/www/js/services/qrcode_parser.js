/* global Sha256, parseInt, CommonGoodConfig, AccountInfo */
(function (window) {
	var COMPANY_INDICATOR = '-';
	var COMPANY_INDICATOR_URL = ':';
	var PERSONAL_INDICATOR = '.';
	var alphaB = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var regionLens = '112233344';
	var acctLens = '232323445';
	var oldCode = false;
	/**
	 * The prototype for the function that parses the QR code
	 * @returns {qrcode_parserL#2.QRCodeParser}
	 */
	var QRCodeParser = function () {
	};
	var realOrFake;
	/**
	 * Figures out what the kind of url that was scanned is and converts it into the proper format
	 * @param {type} url
	 * @returns {undefined}
	 */
	QRCodeParser.prototype.setUrl = function (url) {
		if (url.indexOf('HTTP://') === 1) {
			url='HTTPS://'+url.substring(7, url.length);
		} else if (url.indexOf('HTTP://') === -1 && url.indexOf('HTTPS://') === -1) {
			var fmt = url.substring(0, 1);
			var i = parseInt(fmt, 36) / 4;
			var regionLen = parseInt(regionLens.charAt(i));
			var region = url.substring(1, regionLen + 1);
			var transformedURL = url.replace(region, '');
			if (url.indexOf('-') !== -1) {
				realOrFake = 'RC2.ME';
			} else {
				realOrFake = 'RC4.ME';
			}
			url = 'HTTPS://' + region + '.' + realOrFake + '/' + transformedURL;
		} else if ((url.indexOf('RC2.ME') !== -1) || (url.indexOf('rc2.me') !== -1)) {
			realOrFake = 'RC2.ME';
		} else {
			realOrFake = 'RC4.ME';
		}
		this.plainUrl = url;
		console.log(url);
		this.url = new URL(url);
	};
	/**
	 * Parses the encoded url and uses the decoded information to populate the AccountInfo object
	 * @returns {AccountInfo}
	 */
	QRCodeParser.prototype.parse = function () {
		this.accountInfo = new AccountInfo();
		this.accountInfo.url = this.plainUrl;
		this.parts = this.accountInfo.url.split(/[/\\.-]/);
		if (this.parts[5].length <= 4) {
			oldCode = true;
		} else {
			oldCode = false;
		}
		this.count = this.parts.length;
//isCompany:true
//isPersonal:false
//memberId:"NEW"
//accountId:"NEW:AAD"
//securityCode:"51955e77234f285f58ebd3db39a6499b9eb5ad569e045dda909b4e897ffd1837"
//url:"HTTP://NEW.RC4.ME/AAD-utbYceW3KLLCcaw"
//serverType:"rc4"
//signin:1
//unencryptedCode:"utbYceW3KLLCcaw"
		if ((this.count === 6 || this.count === 7) && !oldCode) {
			var region = this.parts[2];
			if (this.parts[6]) {
				this.accountInfo.counter = this.parts[6];
				var tail = this.parts[5];
			} else if (this.parts[5].indexOf(':') > -1) {
				var tail = this.parts[5].split(':');
				this.accountInfo.counter = tail[1];
				tail = tail[0];
			} else {
				var tail = this.parts[5];
			}
			var fmt = tail.substring(0, 1);
			var acctLen = '';
			var i = parseInt(fmt, 36);
			var agentLen = i % 4;
			i = Math.floor(i / 4);
			var regionLen = parseInt(regionLens.charAt(i));
			acctLen = parseInt(acctLens.charAt(i));
			var account = r36ToR26(tail.substring(1, 1 + acctLen), acctLen);
			var memberId = '';
			if (acctLen >= 6 || tail.length < 1 + acctLen + agentLen) {
				console.log('That is not a valid Card: ', this.url);
				throw 'not_valid_card';
			}
			this.accountInfo.unencryptedCode = tail.substring(1 + acctLen + agentLen);
			this.accountInfo.securityCode = Sha256.hash(this.accountInfo.unencryptedCode);
			this.accountInfo.isCompany = (agentLen > 0);
			this.accountInfo.isPersonal = !this.accountInfo.isCompany;
			region = r36ToR26(region, regionLen);
			if (this.accountInfo.isCompany) {
				this.accountInfo.signin = 1;
				this.accountInfo.accountId = region + account + '-' + r36ToR26(tail.substring(1 + acctLen, 1 + acctLen + agentLen), agentLen, true);
			} else {
				this.accountInfo.accountId = region + account;
				this.accountInfo.signin = 0;
			}
			memberId = region;
			this.accountInfo.memberId = memberId;
		} else {
			this.parseAccountType_();
			this.parseAccountCode_();
			this.parseSecurityCode_();
		}
		this.parseServerType_();
		return this.accountInfo;
	};
	QRCodeParser.prototype.getAccountInfo = function () {
		return this.accountInfo;
	};
	QRCodeParser.prototype.parseAccountType_ = function () {
		if (this.url.pathname.indexOf(COMPANY_INDICATOR) !== -1) {
			this.accountInfo.isCompany = true;
			this.accountInfo.signin = 1;
		} else if (this.url.pathname.indexOf(PERSONAL_INDICATOR) !== -1) {
			this.accountInfo.isPersonal = true;
			this.accountInfo.signin = 0;
		} else {
			console.log('That is not a valid Card: ', this.url);
			throw 'not_valid_card';
		}
	};
	/**
	 * Figure out what kind of account it is (personal or manager)
	 * @returns {undefined}
	 */
	QRCodeParser.prototype.parseAccountCode_ = function () {
		var memberId = this.url.hostname.toUpperCase().split('.')[0];
		var yyy = this.url.pathname.substring(1, 4);
		this.accountInfo.memberId = memberId;
		if (this.accountInfo.isPersonalAccount()) {
			this.accountInfo.accountId = memberId + yyy;
		} else {
			this.accountInfo.accountId = memberId + yyy + '-A';
		}
	};
	/**
	 * Record whether this is being done on the developer server or real server
	 * @returns {undefined}
	 */
	QRCodeParser.prototype.parseServerType_ = function () {
		this.accountInfo.serverType = realOrFake;
	};
	/**
	 * Create an unencrypted var to be used locally and an encrypted var to be sent to the server
	 * @returns {undefined}
	 */
	QRCodeParser.prototype.parseSecurityCode_ = function () {
		this.accountInfo.securityCode = Sha256.hash(this.url.pathname.substr(5, this.url.pathname.length - 1));//
		this.accountInfo.unencryptedCode = this.url.pathname.substr(5, this.url.pathname.length - 1);
	};
	/**
	 * Convert the base 32 encoding that comes from the QR to the alphabetical 26 base format that the account id uses
	 * @param {type} part
	 * @param {type} s2Len
	 * @param {type} isAgent
	 * @returns {String}
	 */
	function r36ToR26(part, s2Len, isAgent) {
		var std = '0123456789abcdefghijklmnop';
		var ours = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		var s = parseInt(part, 36).toString(26); // d4m
		var s2 = '';
		for (var i = 0; i < s.length; i++) {
			s2 += ours.charAt(std.indexOf(s.charAt(i)));
		}
		if (!isAgent) {
			while ((s2.length < s2Len) || (s2.length < 3)) {
				s2 = 'A' + s2;
			}
		}
		return s2;
	}
	window.QRCodeParser = QRCodeParser;
})(window);