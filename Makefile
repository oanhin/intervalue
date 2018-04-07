VERSION=`cut -d '"' -f2 $BUILDDIR/../version.js`


cordova-base:
	grunt dist-mobile

# ios:  cordova-base
# 	make -C cordova ios
# 	open cordova/project/platforms/ios/Copay
#
# android: cordova-base
# 	make -C cordova run-android
#
# release-android: cordova-base
# 	make -C cordova release-android
#
wp8-prod:
	cordova/build.sh WP8 --clear
	cordova/wp/fix-svg.sh
	echo -e "\a"

wp8-debug:
	cordova/build.sh WP8 --dbgjs
	cordova/wp/fix-svg.sh
	echo -e "\a"

ios-prod:
	cordova/build.sh IOS --clear
	cd ../intervaluebuilds/project-IOS-tn && cordova build ios
#	open ../intervaluebuilds/project-IOS-tn/platforms/ios/InterValue.xcodeproj

ios-debug:
	cordova/build.sh IOS --dbgjs
	cd ../intervaluebuilds/project-IOS-tn && cordova build ios
	open ../intervaluebuilds/project-IOS-tn/platforms/ios/InterValue.xcodeproj

android-prod:
	cordova/build.sh ANDROID --clear
#	cp ./etc/beep.ogg ./cordova/project/plugins/phonegap-plugin-barcodescanner/src/android/LibraryProject/res/raw/beep.ogg
	cd ../intervaluebuilds/project-ANDROID-tn && cordova run android --device
	
android-prod-fast:
	cordova/build.sh ANDROID
	cd ../intervaluebuilds/project-ANDROID-tn && cordova run android --device

android-debug:
	test -d ../intervaluebuilds || mkdir ../intervaluebuilds
	cordova/build.sh ANDROID --dbgjs --clear
#	cp ./etc/beep.ogg ./cordova/project/plugins/phonegap-plugin-barcodescanner/src/android/LibraryProject/res/raw/beep.ogg
	cd ../intervaluebuilds/project-ANDROID-tn && cordova run android --device
	mv ../intervaluebuilds/project-ANDROID-tn/platforms/android/build/outputs/apk/android-debug.apk ../intervaluebuilds/InterValue.apk

android-debug-fast:
	cordova/build.sh ANDROID --dbgjs
#	cp ./etc/beep.ogg ./cordova/project/plugins/phonegap-plugin-barcodescanner/src/android/LibraryProject/res/raw/beep.ogg
	cd ../intervaluebuilds/project-ANDROID-tn && cordova run android --device
#	cd ../intervaluebuilds/project-ANDROID-tn && cordova build android
