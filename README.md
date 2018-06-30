# Common Good App

If you have an Android phone and you just want to test it out there, download one of these two files, depending on your CPU, and then copy them into your phone via USB. If you're not sure which CPU you have, just download one of them (start with `app-x86_64-release-unsigned.apk`), and only one will work. Or go to Settings > About Phone > CPU to find out. Open the file on your phone and it should install itself.

- https://github.com/other-realm/rcredits-mobile/blob/Stable/platforms/android/app/build/outputs/apk/arm64/debug/app-arm64-debug.apk
- https://github.com/other-realm/rcredits-mobile/blob/Stable/platforms/android/app/build/outputs/apk/armeabi/debug/app-armeabi-debug.apk
- https://github.com/other-realm/rcredits-mobile/blob/Stable/platforms/android/app/build/outputs/apk/armv7/debug/app-armv7-debug.apk
- https://github.com/other-realm/rcredits-mobile/blob/Stable/platforms/android/app/build/outputs/apk/x86/debug/app-x86-debug.apk
- https://github.com/other-realm/rcredits-mobile/blob/Stable/platforms/android/app/build/outputs/apk/x86_64/debug/app-x86_64-debug.apk

## Screenshots:

https://drive.google.com/drive/folders/1Ap6Kr928QTGJZVdlNOJJe_mOSN7SLd1W


## Prerequisites:
1.  If you do not already have git installed, install git for your OS at: https://git-scm.com/downloads

2.  If you don't have the Chrome browser on your computer, download that at: https://www.google.com/chrome/browser/desktop/index.html and install the Allow-Control-Allow-Origin: * plugin at: https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi .

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

## To run the app in Google Chrome:
```
ionic serve
```
Then open Chrome and go to: http://127.0.0.1:8100/#/app/login

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
### Test Documentation
https://github.com/other-realm/rcredits-mobile/raw/Stable/test/CG%20Mobile%20Tests.docx

### To Run Tests
Prerequisites:
Install the Katalon Recorder (Selenium IDE for Chrome) https://chrome.google.com/webstore/detail/katalon-recorder-selenium/ljdobmomdgdljniojadhoplhkpialdid
CG Pay only works with the recorder extension because it lets you test things in the actual browser with the Allow-Control-Allow-Origin: * extension installed.  The stand alone Katalon Suite, although it provides a lot more features, doesn't allow extensions.

To run the tests:
1. Click the "K" icon in the toolbar area to launch the extension
2. Click the "Folder" icon to the right of "Test Suites"
3. Navigate to the test folder in the rcredits-mobile directory and choose one or more of the tests you want to perform
4. Click the "Play" or "Play Suite" or "Play All" buttons to test the app (make sure you have the app running, a.k.a. you have run 'ionic serve')
5. To record a new test, press the record button 
