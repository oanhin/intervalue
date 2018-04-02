'use strict';

angular.module('copayApp.controllers').controller('splashController',
	function ($scope, $timeout, $log, configService, profileService, storageService, go, isCordova) {
		var self = this;

		this.step = isCordova ? 'device_name' : 'wallet_type';
		this.wallet_type = 'light';

		// 点击配置数据库存储信息(全节点/轻节点？)页面continue后的响应函数
		this.setWalletType = function () {
			var bLight = (self.wallet_type === 'light');	//是否轻节点
			if (!bLight) {
				self.step = 'device_name';
				return;
			}
			var fs = require('fs' + '');
			var desktopApp = require('intervaluecore/desktop_app.js');
			var appDataDir = desktopApp.getAppDataDir();
			var userConfFile = appDataDir + '/conf.json';
			fs.writeFile(userConfFile, JSON.stringify({bLight: bLight}, null, '\t'), 'utf8', function (err) {
				if (err)
					throw Error('failed to write conf.json: ' + err);
				var conf = require('intervaluecore/conf.js');
				if (!conf.bLight)
					throw Error("Failed to switch to light, please restart the app");
				self.step = 'device_name';
				$timeout(function () {
					$scope.$apply();
				});
			});
		};

		// 点击设备名设置页面上continue按钮后的响应函数
		this.saveDeviceName = function () {
			console.log('saveDeviceName: ' + self.deviceName);
			var device = require('intervaluecore/device.js');
			device.setDeviceName(self.deviceName);
			var opts = {deviceName: self.deviceName};
			configService.set(opts, function (err) {
				$timeout(function () {
					if (err)
						self.$emit('Local/DeviceError', err);
					self.bDeviceNameSet = true;
				});
			});
		};

		// 点击欢迎页面上GET STARTED按钮后的响应函数
		this.create = function (noWallet) {
			if (self.creatingProfile)		//是否完成
				return console.log('already creating profile');
			self.creatingProfile = true;

			$timeout(function () {
				profileService.create({noWallet: noWallet}, function (err) {
					if (err) {
						self.creatingProfile = false;
						$log.warn(err);
						self.error = err;
						$timeout(function () {
							$scope.$apply();
						});
						/*$timeout(function() {
                            self.create(noWallet);
                        }, 3000);*/
					}
				});
			}, 100);
		};

		configService.get(function (err, config) {
			if (err)
				throw Error("failed to read config");
			self.deviceName = config.deviceName;
		});

		this.init = function () {
			storageService.getDisclaimerFlag(function (err, val) {
				if (!val)
					go.path('preferencesGlobal.preferencesAbout.disclaimer');

				if (profileService.profile) {
					go.walletHome();
				}
			});
		};
	});
