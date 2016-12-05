// Most app config should go here. Use the BUILD_TARGET directives below to set config that depends on
// whether the app is in dev mode, staging mode, etc.
rCreditsConfig = {

  SQLiteDatabase: {
    name: 'rcredits',
    version: '1.0',
    description: 'rCredits DB',
    estimatedSize: 20 * 1024 * 1024 // kb
  },

  // For Demo Cards
  stagingServerUrl: 'https://stage-xxx.rcredits.org/pos',

  serverproxyUrl: 'https://stage-xxx.rcredits.org/pos',
  serverUrl: 'https://stage-xxx.rcredits.org/pos',
  version: '3.0',
  build: 301,
  transaction_max_amount_offline: 300





};
