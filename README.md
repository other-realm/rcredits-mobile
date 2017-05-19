# Common Good App

## Initial Setup

- Use a version of node.js that works, including a compatible version of npm (node.js:v6.9.5/npm:4.5.0)

- If developing on Windows, use cygwin (because you need it for the Linux-style set-variable console command (the BUILD_TARGET line below)

- add this line to the test server's .htaccess file: Header set Access-Control-Allow-Origin *


In your project folder:


1. npm install -g bower
2. npm install
3. npm install karma --save-dev
4. In karma.conf.js, add this line as the first element in the list of files:
	'node_modules/jquery.min.js',
5. Download and copy jquery.min.js to node_modules
6. ionic state restore
7. bower install
8. ionic setup sass
9. BUILD_TARGET=development gulp config
  "development" might instead be "staging", or "production". This command copies config from the `/config.js` and `/local_config.js` files. Only config matching the given build target (or lying outside an @if block) is copied.


## To run the app in your default browser:

ionic serve

## To Run on Device

```
ionic state restore # Only if plugins or platforms may have changed
ionic run android -- --minSdkVersion=16  #the first "--" is not a typo
```

## Adding a Plugin


1. Always use `ionic plugin add`, not `cordova plugin add`
2. Ensure the version is specified in the package.json.
3. For regular plugins, add @version to the end of the command, e.g1.`ionic plugin add cordova-plugin-audio-recorder-api@0.0.6`.
4. For git repos, use `#` instead.
5. If you don't know the version, you can add without version, check it with `ionic plugin list`, remove, and then add versioned.



### If Packages Get Screwed Up

npm rebuild

### If SCSS/CSS Gets Screwed Up

gulp sass

### To Run Unit Tests

Prerequisites:
Go through the tutorial at: http://www.protractortest.org/#/tutorial

Then:
1. Start Webdriver:
webdriver-manager start
2. Start Protractor:
protractor protConf.js


Note, currently the test sometimes fails for two reasons, both related to protractor/webdriver and unrelated to the actual Common Good code: one is a timeout that happens when the server response takes too long and the other is that, for some reason, you can't get both tests to run at the same time (the second test fails, saying that the browser no longer has a valid session) and you need to comment out the one you're not testing.  I will try to find workarounds for these.