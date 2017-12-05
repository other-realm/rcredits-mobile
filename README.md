# Common Good App

If you have an Android phone and you just want to test it out there, download one of these two files, depending on your CPU, and then copy them into your phone via USB. If you're not sure which CPU you have, just download both, and only one will work. Or go to Settings > About Phone > CPU to find out. Open the file on your phone and it should install itself.

- https://otherrealm.org/cgf/android-armv7-debug.apk
- https://otherrealm.org/cgf/android-x86-debug.apk

## Screenshots:

https://drive.google.com/drive/folders/1Ap6Kr928QTGJZVdlNOJJe_mOSN7SLd1W


## Prerequisites:
1.  If you do not already have git installed, install git for your OS at: https://git-scm.com/downloads

2.  If you don't have the Chrome browser on your computer, download that at: https://www.google.com/chrome/browser/desktop/index.html

3.  Next, you'll want to set up NodeJS, a server-side JavaScript language that the app runs on:

   Windows: https://nodejs.org/dist/v6.11.0/node-v6.11.0-x64.msi

   Mac: https://nodejs.org/dist/v6.11.0/node-v6.11.0.pkg

   Ubuntu/Debian Linux:
   ```
   curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
   sudo apt-get install nodejs
   sudo apt-get install build-essential
   sudo apt-get update && apt-get upgrade
   ```

4.  If you're using a Windows operating system, you'll probably need to install Cygwin, a Linux emulator. (Windows now has its own Linux emulator, but it's not as easy to use.) The default settings in the installation process *should* work: https://cygwin.com/setup-x86_64.exe

Once you have everything installed, run Cygwin (Windows) or open a terminal (Mac/Linux) and enter the following commands, one after another, in the directory where you want to install the app. (To change directories, type `cd the/directory/where/your/file/is` \[note, use `/` and not `\`, even if you are in Windows\].)

Then run the following commands, one after another:

```
git clone https://github.com/other-realm/rcredits-mobile.git
cd rcredits-mobile
npm install -g cordova ionic@2.1.18
npm install -g bower
npm install -g gulp
npm install
bower install
ionic setup sass
```

## To run the app in your default browser:
```
ionic serve
```

## To Run on Device
Android
```
ionic state restore # Only if plugins or platforms may have changed
ionic cordova run android
```

iOS
```
ionic state restore # Only if plugins or platforms may have changed
ionic cordova run ios
```

## Adding a Plugin

1. Always use `ionic plugin add`, not `cordova plugin add`
2. Ensure the version is specified in the package.json.
3. For regular plugins, add @version to the end of the command, e.g.:
   ```
   ionic plugin add cordova-plugin-audio-recorder-api@0.0.6
   ```
4. For git repos, use `#` instead.
5. If you don't know the version, you can add without version, check it with `ionic plugin list`, remove, and then add versioned.



### If Packages Get Screwed Up

```
npm rebuild
```

### If SCSS/CSS Gets Screwed Up

```
gulp sass
```

### To Run Unit Tests

Prerequisites:
Go through the tutorial at: http://www.protractortest.org/#/tutorial

Then:
1. Start Webdriver:
   ```
   webdriver-manager start
   ```

2. Start Protractor:
   ```
   protractor protConf.js
   ```

Note, currently the test sometimes fails for two reasons, both related to protractor/webdriver and unrelated to the actual Common Good code: one is a timeout that happens when the server response takes too long and the other is that, for some reason, you can't get both tests to run at the same time (the second test fails, saying that the browser no longer has a valid session) and you need to comment out the one you're not testing.  I will try to find workarounds for these.
