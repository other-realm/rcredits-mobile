# Common Good App

If you have an Android phone and you just want to test it out there, download these two files: https://otherrealm.org/cgf/android-x86-debug.apk / https://otherrealm.org/cgf/androidAPKs.zip and then copy them into your phone via USB.  Then open the files on your phone and one of the two should install itself (and only one will work, the one that will is dependent on the architecture of your phone)

## Prerequisites:
1.	If you do not already have git installed (I.E. you are not a programmer/you're not on Linux), install git for your OS at: https://git-scm.com/downloads 
2.	If you don't have the Chrome browser on your computer, download that at: https://www.google.com/chrome/browser/desktop/index.html
3.	Next, you'll want to set up NodeJS, a server-side JavaScript language that the app runs on:
Windows: https://nodejs.org/dist/v6.11.0/node-v6.11.0-x64.msi
Mac: https://nodejs.org/dist/v6.11.0/node-v6.11.0.pkg
4.	If you're using a windows operating system, you'll probably need to install Cygwin, a Linux emulator; the default settings in the installation process /should/ work (Windows now has its own Linux emulator, but if you know how to use that, you probably don't need these detailed prerequisites): https://cygwin.com/setup-x86_64.exe .  Mac is can usually run Linux natively
5.	Download the zip: file https://github.com/other-realm/rcredits-mobile/archive/Stable.zip and unzip it to a directory probably somewhere without any spaces in it (so not "My Documents" or "Program Files") - it will probably still work if you put it there, but there may be some issues.


Once you have everything installed, run Cygwin or other shell terminal and enter the following commands, one after another, assuming you are in the directory you want to install the app at (ex. the prompt to the left of $ says `Someone@your-Laptop /cygdrive/e/xampp/htdocs/cg/rcredits-mobile/` ).  If you are not, type cd the/directory/where/your/file/is (note, use '/' and not '\\', even if you are in windows)
Then run the following commands, one after the other:


```
npm install -g cordova ionic
npm install -g bower
npm install
ionic state restore
bower install
ionic setup sass
ionic serve #this is the command to run to emulate the mobile app in the browser.
```

## To run the app in your default browser:
```
ionic serve
```
## To Run on Device
Android
```
ionic state restore # Only if plugins or platforms may have changed
ionic run android -- --minSdkVersion=16  #the first "--" is not a typo
```

iOS
```
ionic state restore # Only if plugins or platforms may have changed
ionic run ios
```
## Adding a Plugin


1. Always use `ionic plugin add`, not `cordova plugin add`
2. Ensure the version is specified in the package.json.
3. For regular plugins, add @version to the end of the command, e.g1.`ionic plugin add cordova-plugin-audio-recorder-api@0.0.6`.
4. For git repos, use `#` instead.
5. If you don't know the version, you can add without version, check it with `ionic plugin list`, remove, and then add versioned.



### If Packages Get Screwed Up

`npm rebuild`

### If SCSS/CSS Gets Screwed Up

`gulp sass`

### To Run Unit Tests

Prerequisites:
Go through the tutorial at: http://www.protractortest.org/#/tutorial

Then:
1. Start Webdriver:
`webdriver-manager start`
2. Start Protractor:
`protractor protConf.js`


Note, currently the test sometimes fails for two reasons, both related to protractor/webdriver and unrelated to the actual Common Good code: one is a timeout that happens when the server response takes too long and the other is that, for some reason, you can't get both tests to run at the same time (the second test fails, saying that the browser no longer has a valid session) and you need to comment out the one you're not testing.  I will try to find workarounds for these.
