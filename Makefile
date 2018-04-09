VERSION=`cut -d '"' -f2 $BUILDDIR/../version.js`


cordova-base:
	grunt dist-mobile

wp8-prod:
	cordova/build.sh WP8 --clear
	cordova/wp/fix-svg.sh
	echo -e "\a"

wp8-debug:
	cordova/build.sh WP8 --dbgjs
	cordova/wp/fix-svg.sh
	echo -e "\a"

ios:
	cordova/build.sh IOS --dbgjs
	cd ../intervaluebuilds/project-IOS-tn && cordova build ios
	open ../intervaluebuilds/project-IOS-tn/platforms/ios/InterValue.xcodeproj

ios-prod:
	cordova/build.sh IOS --clear
	cd ../intervaluebuilds/project-IOS-tn && cordova build ios

ios-debug:
	cordova/build.sh IOS --dbgjs
	cd ../intervaluebuilds/project-IOS-tn && cordova build ios
	open ../intervaluebuilds/project-IOS-tn/platforms/ios/InterValue.xcodeproj

android:
	test -d ../intervaluebuilds || mkdir ../intervaluebuilds
	cordova/build.sh ANDROID --clear
	cd ../intervaluebuilds/project-ANDROID-tn && cordova build android 2>&1 >/dev/null
	mv ../intervaluebuilds/project-ANDROID-tn/platforms/android/build/outputs/apk/android-debug.apk ../intervaluebuilds/InterValue.apk

android-prod:
	test -d ../intervaluebuilds || mkdir ../intervaluebuilds
	cordova/build.sh ANDROID --clear
	cd ../intervaluebuilds/project-ANDROID-tn && cordova build android 2>&1 >/dev/null
	mv ../intervaluebuilds/project-ANDROID-tn/platforms/android/build/outputs/apk/android-debug.apk ../intervaluebuilds/InterValue.apk

android-prod-fast:
	test -d ../intervaluebuilds || mkdir ../intervaluebuilds
	cordova/build.sh ANDROID
#	cd ../intervaluebuilds/project-ANDROID-tn && cordova run android --device
	cd ../intervaluebuilds/project-ANDROID-tn && cordova build android 2>&1 >/dev/null
	mv ../intervaluebuilds/project-ANDROID-tn/platforms/android/build/outputs/apk/android-debug.apk ../intervaluebuilds/InterValue.apk

android-debug:
	test -d ../intervaluebuilds || mkdir ../intervaluebuilds
	cordova/build.sh ANDROID --dbgjs --clear
	cd ../intervaluebuilds/project-ANDROID-tn && cordova build android 2>&1 >/dev/null
	mv ../intervaluebuilds/project-ANDROID-tn/platforms/android/build/outputs/apk/android-debug.apk ../intervaluebuilds/InterValue.apk

android-debug-fast:
	cordova/build.sh ANDROID --dbgjs
	cd ../intervaluebuilds/project-ANDROID-tn && cordova run android --device

win32:
	grunt.cmd desktop
	cp -r node_modules ../intervaluebuilds/InterValue-TN/win32/
	grunt.cmd inno32

win64:
	grunt.cmd desktop
	cp -r node_modules ../intervaluebuilds/InterValue-TN/win64/
	grunt.cmd inno64

linux64:
	grunt desktop
	cp -r node_modules ../intervaluebuilds/InterValue-TN/linux64/
	grunt linux64

osx64:
	grunt desktop
	cp -r node_modules ../intervaluebuilds/InterValue-TN/osx64/InterValue.app/Contents/Resources/app.nw/
	grunt dmg