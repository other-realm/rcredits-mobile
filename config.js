// Most app config should go here. Use the BUILD_TARGET directives below to set config that depends on
// whether the app is in dev mode, staging mode, etc.
CommonGoodConfig = {

  SQLiteDatabase: {
    name: 'CommonGood',
    version: '1.0',
    description: 'CommonGood DB',
    estimatedSize: 20 * 1024 * 1024 // kb
  },

  // For Demo Cards
  stagingServerUrl: 'https://xxx.commongood.earth/pos',

  // @if BUILD_TARGET='development'
  serverproxyUrl: 'https://xxx.commongood.earth/pos',
  serverUrl: 'https://xxx.commongood.earth/pos',
  version: '3.0',
  build: 301,
  transaction_max_amount_offline: 300

  // @endif

  // @if BUILD_TARGET='staging'
  serverproxyUrl: 'https://xxx.commongood.earth/pos',
  serverUrl: 'https://xxx.commongood.earth/pos',
  version: '3.0',
  build: 301,
  transaction_max_amount_offline: 300
  // @endif

  // @if BUILD_TARGET='production'
  serverproxyUrl: 'https://xxx.commongood.earth/pos',
  serverUrl: 'https://xxx.commongood.earth/pos',
  version: '3.0',
  build: 301,
  transaction_max_amount_offline: 300
  // @endif


};
