/**
 * Most app config should go here. Use the BUILD_TARGET directives below to set config that depends on
whether the app is in dev mode, staging mode, etc.
 * @type type
 */
CommonGoodConfig = {
	SQLiteDatabase: {
		name: 'cg',
		version: '1.0',
		description: 'Common Good DB',
		estimatedSize: 20 * 1024 * 1024 // kb
	},
	// For Demo Cards
	stagingServerUrl: 'https://ws.rcredits.org/pos',
	serverproxyUrl: 'https://ws.rcredits.org/pos',
	serverUrl: 'https://ws.rcredits.org/pos',
	version: '3.0',
	build: 301,
	transaction_max_amount_offline: 300
};