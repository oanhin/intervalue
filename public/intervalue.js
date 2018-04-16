var bwcModule = angular.module('bwcModule', []);
//var Client = require('../node_modules/bitcore-wallet-client');
console.log("before");
//console.log("path="+require.resolve('./angular-bitcore-wallet-client/bitcore-wallet-client/index.js'));
// we are in public/, require() from webkit context
var Client = require('../angular-bitcore-wallet-client/bitcore-wallet-client/index.js');
console.log("after");

bwcModule.constant('MODULE_VERSION', '1.0.0');

bwcModule.provider("bwcService", function() {
  var provider = {};

  provider.$get = function() {
    var service = {};

    service.getBitcore = function() {
      return Client.Bitcore;
    };

    service.getSJCL = function() {
      return Client.sjcl;
    };


    service.getUtils = function() {
      return Client.Utils;
    };

    service.getClient = function(walletData) {
      var bwc = new Client({});
      if (walletData)
        bwc.import(walletData);
      return bwc;
    };
      
    return service;
  };

  return provider;
});

'use strict';

var modules = [
  'ui.router',
  'angularMoment',
  'angular-carousel',
  'mm.foundation',
  'monospaced.qrcode',
  'monospaced.elastic',
  'gettext',
  'ngLodash',
  'uiSwitch',
  'bwcModule',
  'copayApp.filters',
  'copayApp.services',
  'copayApp.controllers',
  'copayApp.directives',
  'copayApp.addons',
  'ct.ui.router.extras'
];

var copayApp = window.copayApp = angular.module('copayApp', modules);

angular.module('copayApp.filters', []);
angular.module('copayApp.services', []);
angular.module('copayApp.controllers', []);
angular.module('copayApp.directives', []);
angular.module('copayApp.addons', []);


'use strict';

var unsupported, isaosp;
var breadcrumbs = require('intervaluecore/breadcrumbs.js');

if (window && window.navigator) {
	var rxaosp = window.navigator.userAgent.match(/Android.*AppleWebKit\/([\d.]+)/);
	isaosp = (rxaosp && rxaosp[1] < 537);
	if (!window.cordova && isaosp)
		unsupported = true;
	if (unsupported) {
		window.location = '#/unsupported';
	}
}


//Setting up route
angular
	.module('copayApp')
	.config(function (historicLogProvider, $provide, $logProvider, $stateProvider, $urlRouterProvider, $compileProvider, $qProvider) {
		$qProvider.errorOnUnhandledRejections(false);
		$urlRouterProvider.otherwise('/');

		$logProvider.debugEnabled(true);
		$provide.decorator('$log', ['$delegate',
			function ($delegate) {
				var historicLog = historicLogProvider.$get();

				['debug', 'info', 'warn', 'error', 'log'].forEach(function (level) {

					var orig = $delegate[level];
					$delegate[level] = function () {
						if (level == 'error')
							console.log(arguments);

						var args = [].slice.call(arguments);
						if (!Array.isArray(args)) args = [args];
						args = args.map(function (v) {
							try {
								if (typeof v == 'undefined') v = 'undefined';
								if (!v) v = 'null';
								if (typeof v == 'object') {
									if (v.message)
										v = v.message;
									else
										v = JSON.stringify(v);
								}
								// Trim output in mobile
								if (window.cordova) {
									v = v.toString();
									if (v.length > 1000) {
										v = v.substr(0, 997) + '...';
									}
								}
							} catch (e) {
								console.log('Error at log decorator:', e);
								v = 'undefined';
							}
							return v;
						});
						try {
							if (window.cordova)
								console.log(args.join(' '));
							historicLog.add(level, args.join(' '));
							orig.apply(null, args);
						} catch (e) {
							console.log('ERROR (at log decorator):', e, args[0]);
						}
					};
				});
				return $delegate;
			}
		]);

		// whitelist 'chrome-extension:' for chromeApp to work with image URLs processed by Angular
		// link: http://stackoverflow.com/questions/15606751/angular-changes-urls-to-unsafe-in-extension-page?lq=1
		$compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);

		$stateProvider
			.state('splash', {
				url: '/splash',
				needProfile: false,
				views: {
					'main': {
						templateUrl: 'views/splash.html',
					}
				}
			});

		$stateProvider
			.state('walletHome', {
				url: '/',
				walletShouldBeComplete: true,
				needProfile: true,
				deepStateRedirect: true,
				sticky: true,
				views: {
					'main': {
						templateUrl: 'views/walletHome.html',
					},
				}
			})
			.state('unsupported', {
				url: '/unsupported',
				needProfile: false,
				views: {
					'main': {
						templateUrl: 'views/unsupported.html'
					}
				}
			})

			.state('create', {
				url: '/create',
				templateUrl: 'views/create.html',
				needProfile: true,
				modal: true,
				views: {
					'main': {
						templateUrl: 'views/create.html'
					},
				}
			})
			.state('copayers', {
				url: '/copayers',
				needProfile: true,
				views: {
					'main': {
						templateUrl: 'views/copayers.html'
					},
				}
			})
			.state('correspondentDevices', {
				url: '/correspondentDevices',
				walletShouldBeComplete: false,
				needProfile: true,
				deepStateRedirect: true,
				sticky: true,
				views: {
					'chat': {
						templateUrl: 'views/correspondentDevices.html'
					},
				}
			})
			.state('correspondentDevices.correspondentDevice', {
				url: '/device',
				walletShouldBeComplete: false,
				needProfile: true,
				views: {
					'dialog': {
						templateUrl: 'views/correspondentDevice.html'
					},
				}
			})
			.state('correspondentDevices.correspondentDevice.editCorrespondentDevice', {
				url: '/edit',
				walletShouldBeComplete: false,
				needProfile: true,
				views: {
					'dialog@correspondentDevices': {
						templateUrl: 'views/editCorrespondentDevice.html'
					},
				}
			})
			.state('correspondentDevices.addCorrespondentDevice', {
				url: '/add',
				needProfile: true,
				views: {
					'dialog': {
						templateUrl: 'views/addCorrespondentDevice.html'
					},
				}
			})
			.state('correspondentDevices.addCorrespondentDevice.inviteCorrespondentDevice', {
				url: '/invite',
				walletShouldBeComplete: false,
				needProfile: true,
				views: {
					'dialog@correspondentDevices': {
						templateUrl: 'views/inviteCorrespondentDevice.html'
					},
				}
			})
			.state('correspondentDevices.addCorrespondentDevice.acceptCorrespondentInvitation', {
				url: '/acceptCorrespondentInvitation',
				walletShouldBeComplete: false,
				needProfile: true,
				views: {
					'dialog@correspondentDevices': {
						templateUrl: 'views/acceptCorrespondentInvitation.html'
					},
				}
			})
			.state('correspondentDevices.bot', {
				url: '/bot/:id',
				walletShouldBeComplete: false,
				needProfile: true,
				views: {
					'dialog': {
						templateUrl: 'views/bot.html'
					},
				}
			})
			.state('authConfirmation', {
				url: '/authConfirmation',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main': {
						templateUrl: 'views/authConfirmation.html'
					},
				}
			})
			.state('preferences', {
				url: '/preferences',
				templateUrl: 'views/preferences.html',
				walletShouldBeComplete: true,
				needProfile: true,
				modal: true,
				views: {
					'main': {
						templateUrl: 'views/preferences.html',
					},
				}
			})
			.state('preferences.preferencesColor', {
				url: '/color',
				templateUrl: 'views/preferencesColor.html',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/preferencesColor.html'
					},
				}
			})

			.state('preferences.preferencesAlias', {
				url: '/alias',
				templateUrl: 'views/preferencesAlias.html',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/preferencesAlias.html'
					},

				}
			})
			.state('preferences.preferencesAdvanced', {
				url: '/advanced',
				templateUrl: 'views/preferencesAdvanced.html',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/preferencesAdvanced.html'
					},
				}
			})
			.state('preferences.preferencesAdvanced.preferencesInformation', {
				url: '/information',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/preferencesInformation.html'
					},
				}
			})
			.state('preferences.preferencesAdvanced.paperWallet', {
				url: '/paperWallet',
				templateUrl: 'views/paperWallet.html',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/paperWallet.html'
					},
				}
			})
			.state('preferences.preferencesAdvanced.preferencesDeleteWallet', {
				url: '/delete',
				templateUrl: 'views/preferencesDeleteWallet.html',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/preferencesDeleteWallet.html'
					},
				}
			})
			.state('preferencesGlobal', {
				url: '/preferencesGlobal',
				needProfile: true,
				modal: true,
				views: {
					'main': {
						templateUrl: 'views/preferencesGlobal.html',
					},
				}
			})
			.state('preferencesGlobal.preferencesDeviceName', {
				url: '/deviceName',
				walletShouldBeComplete: false,
				needProfile: false,
				views: {
					'main@': {
						templateUrl: 'views/preferencesDeviceName.html'
					},
				}
			})
			.state('preferencesGlobal.preferencesHub', {
				url: '/hub',
				walletShouldBeComplete: false,
				needProfile: false,
				views: {
					'main@': {
						templateUrl: 'views/preferencesHub.html'
					},
				}
			})
			.state('preferencesGlobal.preferencesTor', {
				url: '/tor',
				templateUrl: 'views/preferencesTor.html',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/preferencesTor.html'
					}
				}
			})
			.state('preferencesGlobal.preferencesLanguage', {
				url: '/language',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/preferencesLanguage.html'
					},
				}
			})
			.state('preferencesGlobal.preferencesUnit', {
				url: '/unit',
				templateUrl: 'views/preferencesUnit.html',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/preferencesUnit.html'
					},
				}
			})
			.state('preferencesGlobal.preferencesBbUnit', {
				url: '/bbUnit',
				templateUrl: 'views/preferencesBbUnit.html',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/preferencesBbUnit.html'
					},
				}
			})
			.state('preferencesGlobal.preferencesEmail', {
				url: '/email',
				templateUrl: 'views/preferencesEmail.html',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/preferencesEmail.html'
					},

				}
			})
			.state('preferencesGlobal.preferencesWitnesses', {
				url: '/witnesses',
				templateUrl: 'views/preferencesWitnesses.html',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/preferencesWitnesses.html'
					},
				}
			})
			.state('preferencesGlobal.preferencesWitnesses.preferencesEditWitness', {
				url: '/edit',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/preferencesEditWitness.html'
					},
				}
			})
			.state('preferencesGlobal.backup', {
				url: '/backup',
				templateUrl: 'views/backup.html',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/backup.html'
					},
				}
			})
			.state('preferencesGlobal.recoveryFromSeed', {
				url: '/recoveryFromSeed',
				templateUrl: 'views/recoveryFromSeed.html',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/recoveryFromSeed.html'
					}
				}
			})
			.state('preferencesGlobal.export', {
				url: '/export',
				templateUrl: 'views/export.html',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/export.html'
					},
				}
			})
			.state('preferencesGlobal.import', {
				url: '/import',
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/import.html'
					},
				}
			})

			.state('preferencesGlobal.preferencesAbout', {
				url: '/about',
				templateUrl: 'views/preferencesAbout.html',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/preferencesAbout.html'
					},
				}
			})
			.state('preferencesGlobal.preferencesAbout.disclaimer', {
				url: '/disclaimer',
				needProfile: false,
				views: {
					'main@': {
						templateUrl: 'views/disclaimer.html',
					}
				}
			})
			.state('preferencesGlobal.preferencesAbout.translators', {
				url: '/translators',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/translators.html'
					}
				}
			})
			.state('preferencesGlobal.preferencesAbout.preferencesLogs', {
				url: '/logs',
				templateUrl: 'views/preferencesLogs.html',
				walletShouldBeComplete: true,
				needProfile: true,
				views: {
					'main@': {
						templateUrl: 'views/preferencesLogs.html'
					},
				}
			})

			.state('add', {
				url: '/add',
				needProfile: true,
				views: {
					'main': {
						templateUrl: 'views/add.html'
					},
				}
			})
			.state('receive', {
				url: '/receive',
				templateUrl: 'receive.html',
				views: {
					'main': {
						templateUrl: 'views/receive.html'
					},
				}
			})
			.state('cordova', { // never used
				url: '/cordova/:status/:isHome',
				views: {
					'main': {
						controller: function ($rootScope, $state, $stateParams, $timeout, go, isCordova) {
							console.log('cordova status: ' + $stateParams.status);
							switch ($stateParams.status) {
								case 'resume':
									$rootScope.$emit('Local/Resume');
									break;
								case 'backbutton':
									if (isCordova && $stateParams.isHome == 'true' && !$rootScope.modalOpened)
										navigator.app.exitApp();
									else
										$rootScope.$emit('closeModal');
									break;
							}
							;
							// why should we go home on resume or backbutton?
							/*
                          $timeout(function() {
                            $rootScope.$emit('Local/SetTab', 'walletHome', true);
                          }, 100);
                          go.walletHome();
                          */
						}
					}
				},
				needProfile: false
			});
	})
	.run(function ($rootScope, $state, $log, uriHandler, isCordova, profileService, $timeout, nodeWebkit, uxLanguage, animationService) {
		FastClick.attach(document.body);

		uxLanguage.init();

		// Register URI handler, not for mobileApp
		if (!isCordova) {
			uriHandler.register();
		}

		if (nodeWebkit.isDefined()) {
			var gui = require('nw.gui');
			var win = gui.Window.get();
			var nativeMenuBar = new gui.Menu({
				type: "menubar"
			});
			try {
				nativeMenuBar.createMacBuiltin("InterValue");
			} catch (e) {
				$log.debug('This is not OSX');
			}
			win.menu = nativeMenuBar;
		}

		$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

			if (!profileService.profile && toState.needProfile) {

				// Give us time to open / create the profile
				event.preventDefault();

				if (!profileService.assocVisitedFromStates)
					profileService.assocVisitedFromStates = {};
				breadcrumbs.add('$stateChangeStart no profile from ' + fromState.name + ' to ' + toState.name);
				if (profileService.assocVisitedFromStates[fromState.name] && !fromState.name)
					return breadcrumbs.add("already loading profile, ignoring duplicate $stateChangeStart from " + fromState.name);
				profileService.assocVisitedFromStates[fromState.name] = true;

				// Try to open local profile
				profileService.loadAndBindProfile(function (err) {
					delete profileService.assocVisitedFromStates[fromState.name];
					if (err) {
						if (err.message && err.message.match('NOPROFILE')) {
							$log.debug('No profile... redirecting');
							$state.transitionTo('splash');
						} else if (err.message && err.message.match('NONAGREEDDISCLAIMER')) {
							$log.debug('Display disclaimer... redirecting');
							$state.transitionTo('preferencesGlobal.preferencesAbout.disclaimer');
						} else {
							throw new Error(err); // TODO
						}
					} else {
						$log.debug('Profile loaded ... Starting UX.');
						$state.transitionTo(toState.name || toState, toParams);
					}
				});
			}

			if (profileService.focusedClient && !profileService.focusedClient.isComplete() && toState.walletShouldBeComplete) {

				$state.transitionTo('copayers');
				event.preventDefault();
			}

			if (!animationService.transitionAnimated(fromState, toState)) {
				event.preventDefault();
				// Time for the backpane to render
				setTimeout(function () {
					$state.transitionTo(toState);
				}, 50);
			}
		});
	});

'use strict';

function selectText(element) {
	var doc = document;
	if (doc.body.createTextRange) { // ms
		var range = doc.body.createTextRange();
		range.moveToElementText(element);
		range.select();
	} else if (window.getSelection) {
		var selection = window.getSelection();
		var range = doc.createRange();
		range.selectNodeContents(element);
		selection.removeAllRanges();
		selection.addRange(range);

	}
}

function isValidAddress(value) {
	var ValidationUtils = require('intervaluecore/validation_utils.js');
	if (!value) {
		return false;
	}

	// intervalue uri
	var conf = require('intervaluecore/conf.js');
	var re = new RegExp('^' + conf.program + ':([A-Z2-7]{32})\b', 'i');
	var arrMatches = value.match(re);
	if (arrMatches) {
		return ValidationUtils.isValidAddress(arrMatches[1]);
	}

	return ValidationUtils.isValidAddress(value);
}

function isValidEmail(value) {
	var ValidationUtils = require('intervaluecore/validation_utils.js');

	// 刘星屏蔽
	// return ValidationUtils.isValidEmail(value);
	return true;
}

angular.module('copayApp.directives')
	.directive('validAddress', ['$rootScope', 'profileService',
		function ($rootScope, profileService) {
			return {
				require: 'ngModel',
				link: function (scope, elem, attrs, ctrl) {
					var validator = function (value) {
						if (!profileService.focusedClient)
							return;
						ctrl.$setValidity('validAddress', isValidAddress(value));
						return value;
					};
					ctrl.$parsers.unshift(validator);
					ctrl.$formatters.unshift(validator);
				}
			};
		}
	])
	.directive('validAddressOrEmail', ['$rootScope', 'profileService',
		function ($rootScope, profileService) {
			return {
				require: 'ngModel',
				link: function (scope, elem, attrs, ctrl) {
					var validator = function (value) {
						if (!profileService.focusedClient)
							return;
						ctrl.$setValidity('validAddressOrEmail', isValidAddress(value) || isValidEmail(value));
						return value;
					};
					ctrl.$parsers.unshift(validator);
					ctrl.$formatters.unshift(validator);
				}
			};
		}
	])
	.directive('validAddresses', ['$rootScope', 'profileService', 'configService',
		function ($rootScope, profileService, configService) {
			return {
				require: 'ngModel',
				link: function (scope, elem, attrs, ctrl) {
					var asset = attrs.validAddresses;
					var validator = function (value) {
						for (var key in ctrl.$error) {
							if (key.indexOf('line-') > -1) ctrl.$setValidity(key, true);
						}
						if (!profileService.focusedClient || !value)
							return value;
						var lines = value.split(/\r?\n/);
						if (lines.length > 120) {
							ctrl.$setValidity('validAddresses', false);
							return value;
						}
						for (i = 0; i < lines.length; i++) {
							var tokens = lines[i].trim().match(/^([A-Z0-9]{32})[\s,;]+([0-9]*\.[0-9]+|[0-9]+)$/);
							if (!tokens) {
								ctrl.$setValidity('validAddresses', false);
								ctrl.$setValidity("line-" + lines[i], false); //hack to get wrong line text
								return value;
							}
							var address = tokens[1];
							var amount = +tokens[2];

							var settings = configService.getSync().wallet.settings;
							var unitValue = 1;
							var decimals = 0;
							if (asset === 'base') {
								unitValue = settings.unitValue;
								decimals = Number(settings.unitDecimals);
							}
							else if (profileService.assetMetadata[asset]) {
								decimals = profileService.assetMetadata[asset].decimals || 0;
								unitValue = Math.pow(10, decimals);
							}

							var vNum = Number((amount * unitValue).toFixed(0));

							if (!isValidAddress(address) || typeof vNum !== "number" || vNum <= 0) {
								ctrl.$setValidity('validAddresses', false);
								ctrl.$setValidity("line-" + lines[i], false); //hack to get wrong line text
								return value;
							}
							var sep_index = ('' + amount).indexOf('.');
							var str_value = ('' + amount).substring(sep_index + 1);
							if (sep_index > 0 && str_value.length > decimals) {
								ctrl.$setValidity('validAddresses', false);
								ctrl.$setValidity("line-" + lines[i], false); //hack to get wrong line text
								return value;
							}
						}
						ctrl.$setValidity('validAddresses', true);
						return value;
					};
					ctrl.$parsers.unshift(validator);
					ctrl.$formatters.unshift(validator);
				}
			};
		}
	])
	.directive('validUrl', [

		function () {
			return {
				require: 'ngModel',
				link: function (scope, elem, attrs, ctrl) {
					var validator = function (value) {
						// Regular url
						if (/^https?:\/\//.test(value)) {
							ctrl.$setValidity('validUrl', true);
							return value;
						} else {
							ctrl.$setValidity('validUrl', false);
							return value;
						}
					};

					ctrl.$parsers.unshift(validator);
					ctrl.$formatters.unshift(validator);
				}
			};
		}
	])
	.directive('validMnemonic', [function () {
		return {
			require: 'ngModel',
			link: function (scope, elem, attrs, ctrl) {
				var Mnemonic = require('bitcore-mnemonic');
				var validator = function (value) {
					try {
						value = value.split('-').join(' ');
						if (Mnemonic.isValid(value)) {
							ctrl.$setValidity('validMnemonic', true);
							return value;
						} else {
							ctrl.$setValidity('validMnemonic', false);
							return value;
						}
					} catch (ex) {
						ctrl.$setValidity('validMnemonic', false);
						return value;
					}
				};
				ctrl.$parsers.unshift(validator);
				ctrl.$formatters.unshift(validator);
			}
		};
	}
	])
	.directive('validAmount', ['configService', 'profileService',
		function (configService, profileService) {

			return {
				require: 'ngModel',
				link: function (scope, element, attrs, ctrl) {
					var val = function (value) {
						//console.log('-- scope', ctrl);
						/*if (scope.home && scope.home.bSendAll){
                            console.log('-- send all');
                            ctrl.$setValidity('validAmount', true);
                            return value;
                        }*/
						//console.log('-- amount');
						var constants = require('intervaluecore/constants.js');
						var asset = attrs.validAmount;
						var settings = configService.getSync().wallet.settings;
						var unitValue = 1;
						var decimals = 0;
						if (asset === 'base') {
							unitValue = settings.unitValue;
							decimals = Number(settings.unitDecimals);
						}
						else if (asset === constants.BLACKBYTES_ASSET) {
							unitValue = settings.bbUnitValue;
							decimals = Number(settings.bbUnitDecimals);
						}
						else if (profileService.assetMetadata[asset]) {
							decimals = profileService.assetMetadata[asset].decimals || 0;
							unitValue = Math.pow(10, decimals);
						}

						var vNum = Number((value * unitValue).toFixed(0));

						if (typeof value == 'undefined' || value == 0) {
							ctrl.$pristine = true;
							return value;
						}

						if (typeof vNum == "number" && vNum > 0) {
							var sep_index = ('' + value).indexOf('.');
							var str_value = ('' + value).substring(sep_index + 1);
							if (sep_index > 0 && str_value.length > decimals) {
								ctrl.$setValidity('validAmount', false);
							} else {
								ctrl.$setValidity('validAmount', true);
							}
						} else {
							ctrl.$setValidity('validAmount', false);
						}
						return value;
					}
					ctrl.$parsers.unshift(val);
					ctrl.$formatters.unshift(val);
				}
			}
		}
	])
	.directive('validFeedName', ['configService',
		function (configService) {

			return {
				require: 'ngModel',
				link: function (scope, elem, attrs, ctrl) {
					var validator = function (value) {
						var oracle = configService.oracles[attrs.validFeedName];
						if (!oracle || !oracle.feednames_filter) {
							ctrl.$setValidity('validFeedName', true);
							return value;
						}
						for (var i in oracle.feednames_filter) {
							var matcher = new RegExp(oracle.feednames_filter[i], "g");
							if (matcher.test(value)) {
								ctrl.$setValidity('validFeedName', true);
								return value;
							}
						}
						ctrl.$setValidity('validFeedName', false);
						return value;
					};

					ctrl.$parsers.unshift(validator);
					ctrl.$formatters.unshift(validator);
				}
			};
		}
	])
	.directive('validFeedValue', ['configService',
		function (configService) {

			return {
				require: 'ngModel',
				link: function (scope, elem, attrs, ctrl) {
					var validator = function (value) {
						var oracle = configService.oracles[attrs.validFeedValue];
						if (!oracle || !oracle.feedvalues_filter) {
							ctrl.$setValidity('validFeedValue', true);
							return value;
						}
						for (var i in oracle.feedvalues_filter) {
							var matcher = new RegExp(oracle.feedvalues_filter[i], "g");
							if (matcher.test(value)) {
								ctrl.$setValidity('validFeedValue', true);
								return value;
							}
						}
						ctrl.$setValidity('validFeedValue', false);
						return value;
					};

					ctrl.$parsers.unshift(validator);
					ctrl.$formatters.unshift(validator);
				}
			};
		}
	])
	.directive('loading', function () {
		return {
			restrict: 'A',
			link: function ($scope, element, attr) {
				var a = element.html();
				var text = attr.loading;
				element.on('click', function () {
					element.html('<i class="size-21 fi-bitcoin-circle icon-rotate spinner"></i> ' + text + '...');
				});
				$scope.$watch('loading', function (val) {
					if (!val) {
						element.html(a);
					}
				});
			}
		}
	})
	.directive('ngFileSelect', function () {
		return {
			link: function ($scope, el) {
				el.bind('change', function (e) {
					$scope.file = (e.srcElement || e.target).files[0];
					$scope.getFile();
				});
			}
		}
	})
	.directive('contact', ['addressbookService', function (addressbookService) {
		return {
			restrict: 'E',
			link: function (scope, element, attrs) {
				var addr = attrs.address;
				addressbookService.getLabel(addr, function (label) {
					if (label) {
						element.append(label);
					} else {
						element.append(addr);
					}
				});
			}
		};
	}])
	.directive('highlightOnChange', function () {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				scope.$watch(attrs.highlightOnChange, function (newValue, oldValue) {
					element.addClass('highlight');
					setTimeout(function () {
						element.removeClass('highlight');
					}, 500);
				});
			}
		}
	})
	.directive('checkStrength', function () {
		return {
			replace: false,
			restrict: 'EACM',
			require: 'ngModel',
			link: function (scope, element, attrs) {

				var MIN_LENGTH = 8;
				var MESSAGES = ['Very Weak', 'Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
				var COLOR = ['#dd514c', '#dd514c', '#faa732', '#faa732', '#16A085', '#16A085'];

				function evaluateMeter(password) {
					var passwordStrength = 0;
					var text;
					if (password.length > 0) passwordStrength = 1;
					if (password.length >= MIN_LENGTH) {
						if ((password.match(/[a-z]/)) && (password.match(/[A-Z]/))) {
							passwordStrength++;
						} else {
							text = ', add mixed case';
						}
						if (password.match(/\d+/)) {
							passwordStrength++;
						} else {
							if (!text) text = ', add numerals';
						}
						if (password.match(/.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/)) {
							passwordStrength++;
						} else {
							if (!text) text = ', add punctuation';
						}
						if (password.length > 12) {
							passwordStrength++;
						} else {
							if (!text) text = ', add characters';
						}
					} else {
						text = ', that\'s short';
					}
					if (!text) text = '';

					return {
						strength: passwordStrength,
						message: MESSAGES[passwordStrength] + text,
						color: COLOR[passwordStrength]
					}
				}

				scope.$watch(attrs.ngModel, function (newValue, oldValue) {
					if (newValue && newValue !== '') {
						var info = evaluateMeter(newValue);
						scope[attrs.checkStrength] = info;
					}
				});
			}
		};
	})
	.directive('showFocus', function ($timeout) {
		return function (scope, element, attrs) {
			scope.$watch(attrs.showFocus,
				function (newValue) {
					$timeout(function () {
						newValue && element[0].focus();
					});
				}, true);
		};
	})
	.directive('match', function () {
		return {
			require: 'ngModel',
			restrict: 'A',
			scope: {
				match: '='
			},
			link: function (scope, elem, attrs, ctrl) {
				scope.$watch(function () {
					return (ctrl.$pristine && angular.isUndefined(ctrl.$modelValue)) || scope.match === ctrl.$modelValue;
				}, function (currentValue) {
					ctrl.$setValidity('match', currentValue);
				});
			}
		};
	})
	.directive('clipCopy', function () {
		return {
			restrict: 'A',
			scope: {
				clipCopy: '=clipCopy'
			},
			link: function (scope, elm) {
				// TODO this does not work (FIXME)
				elm.attr('tooltip', 'Press Ctrl+C to Copy');
				elm.attr('tooltip-placement', 'top');

				elm.bind('click', function () {
					selectText(elm[0]);
				});
			}
		};
	})
	.directive('menuToggle', function () {
		return {
			restrict: 'E',
			replace: true,
			templateUrl: 'views/includes/menu-toggle.html'
		}
	})
	.directive('logo', function () {
		return {
			restrict: 'E',
			scope: {
				width: "@",
				negative: "="
			},
			controller: function ($scope) {
				//$scope.logo_url = $scope.negative ? 'img/logo-negative.svg' : 'img/logo.svg';
				$scope.logo_url = $scope.negative ? 'img/icons/icon-white-32.png' : 'img/icons/icon-black-32.png';
			},
			replace: true,
			//template: '<img ng-src="{{ logo_url }}" alt="InterValue">'
			template: '<div><img ng-src="{{ logo_url }}" alt="InterValue"><br>InterValue</div>'
		}
	})
	.directive('availableBalance', function () {
		return {
			restrict: 'E',
			replace: true,
			templateUrl: 'views/includes/available-balance.html'
		}
	}).directive('selectable', function ($rootScope, $timeout) {
	return {
		restrict: 'A',
		scope: {
			bindObj: "=model",
			bindProp: "@prop",
			targetProp: "@exclusionBind"
		},
		link: function (scope, elem, attrs) {
			$timeout(function () {
				var dropdown = angular.element(document.querySelector(attrs.selectable));

				dropdown.find('li').on('click', function (e) {
					var li = angular.element(this);
					elem.html(li.find('a').find('span').eq(0).html());
					scope.bindObj[scope.bindProp] = li.attr('data-value');
					if (!$rootScope.$$phase) $rootScope.$digest();
				});
				scope.$watch(function (scope) {
					return scope.bindObj[scope.bindProp]
				}, function (newValue, oldValue) {
					angular.forEach(dropdown.find('li'), function (element) {
						var li = angular.element(element);
						if (li.attr('data-value') == newValue) {
							elem.html(li.find('a').find('span').eq(0).html());
							li.addClass('selected');
						} else {
							li.removeClass('selected');
						}
					});
				});
				var selected = false;
				angular.forEach(dropdown.find('li'), function (el) {
					var li = angular.element(el);
					var a = angular.element(li.find('a'));
					a.append('<i class="fi-check check"></i>');
					if (scope.bindObj[scope.bindProp] == li.attr('data-value')) {
						a[0].click();
						selected = true;
					}
				});
				if (!selected && typeof attrs.notSelected == "undefined") dropdown.find('a').eq(0)[0].click();

				if (scope.targetProp) {
					scope.$watch(function (scope) {
						return scope.bindObj[scope.targetProp]
					}, function (newValue, oldValue) {
						angular.forEach(dropdown.find('li'), function (element) {
							var li = angular.element(element);
							if (li.attr('data-value') != newValue) {
								li[0].click();
								scope.bindObj[scope.bindProp] = li.attr('data-value');
							}
						});
					});
				}
			});
		}
	}
}).directive('cosigners', function () {
	return {
		restrict: 'E',
		template: '<ul class="no-bullet m20b whopays">\
                  <li class="" ng-repeat="copayer in index.copayers">\
                      <span class="size-12 text-gray" ng-show="copayer.me">\
                          <i class="icon-contact size-24 m10r"></i>{{\'Me\'|translate}} <i class="fi-check m5 right"></i>\
                      </span>\
                      <div class="size-12" style="width: 100%" ng-show="!copayer.me" ng-click="copayer.signs = !copayer.signs">\
                          <i class="icon-contact size-24 m10r"></i> {{copayer.name}} ({{copayer.device_address.substr(0,4)}}...) <i class="m5 right" ng-class="copayer.signs ? \'fi-check\' : \'\'"></i>\
                      </div>\
                  </li>\
                </ul>\
                '
	}
}).filter('encodeURIComponent', function () {
	return window.encodeURIComponent;
})
	.filter('objectKeys', [function () {
		return function (item) {
			if (!item) return null;
			var keys = Object.keys(item);
			keys.sort();
			return keys;
		};
	}])
	.filter('sumNumbers', [function () {
		return function (str) {
			return str ? str.split(/[\n\s,;]/).reduce(function (acc, val) {
				return isNaN(+val) ? acc : acc + (+val)
			}, 0) : 0;
		};
	}]);

'use strict';

/*  
 * This is a modification from https://github.com/angular/angular.js/blob/master/src/ngTouch/swipe.js
 */


function makeSwipeDirective(directiveName, direction, eventName) {
  angular.module('copayApp.directives')
    .directive(directiveName, ['$parse', '$swipe', '$timeout',
      function($parse, $swipe, $timeout) {
        // The maximum vertical delta for a swipe should be less than 75px.
        var MAX_VERTICAL_DISTANCE = 75;
        // Vertical distance should not be more than a fraction of the horizontal distance.
        var MAX_VERTICAL_RATIO = 0.4;
        // At least a 30px lateral motion is necessary for a swipe.
        var MIN_HORIZONTAL_DISTANCE = 30;

        return function(scope, element, attr) {
          var swipeHandler = $parse(attr[directiveName]);

          var startCoords, valid;

          function validSwipe(coords) {
            // Check that it's within the coordinates.
            // Absolute vertical distance must be within tolerances.
            // Horizontal distance, we take the current X - the starting X.
            // This is negative for leftward swipes and positive for rightward swipes.
            // After multiplying by the direction (-1 for left, +1 for right), legal swipes
            // (ie. same direction as the directive wants) will have a positive delta and
            // illegal ones a negative delta.
            // Therefore this delta must be positive, and larger than the minimum.
            if (!startCoords) return false;
            var deltaY = Math.abs(coords.y - startCoords.y);
            var deltaX = (coords.x - startCoords.x) * direction;
            return valid && // Short circuit for already-invalidated swipes.
              deltaY < MAX_VERTICAL_DISTANCE &&
              deltaX > 0 &&
              deltaX > MIN_HORIZONTAL_DISTANCE &&
              deltaY / deltaX < MAX_VERTICAL_RATIO;
          }

          var pointerTypes = ['touch'];
          $swipe.bind(element, {
            'start': function(coords, event) {
              startCoords = coords;
              valid = true;
            },
            'move': function(coords, event) {
              if (validSwipe(coords)) {
                $timeout(function() {
	                scope.$apply(function() {
		                element.triggerHandler(eventName);
		                swipeHandler(scope, {
			                $event: event
		                });
	                });
                });
              }
            }
          }, pointerTypes);
        };
      }
    ]);
}
/*
// Left is negative X-coordinate, right is positive.
makeSwipeDirective('ngSwipeLeft', -1, 'swipeleft');
makeSwipeDirective('ngSwipeRight', 1, 'swiperight');
*/
'use strict';

var breadcrumbs = require('intervaluecore/breadcrumbs.js');

angular.module('copayApp.directives')
    .directive('qrScanner', ['$rootScope', '$timeout', '$modal', 'isCordova', 'gettextCatalog',
      function($rootScope, $timeout, $modal, isCordova, gettextCatalog) {

        var controller = function($scope) {

          $scope.cordovaOpenScanner = function() {
            window.ignoreMobilePause = true;
            window.plugins.spinnerDialog.show(null, gettextCatalog.getString('Preparing camera...'), true);
            $timeout(function() {
              cordova.plugins.barcodeScanner.scan(
                  function onSuccess(result) {
                    $timeout(function() {
                      window.plugins.spinnerDialog.hide();
                      window.ignoreMobilePause = false;
                    }, 100);
                    if (result.cancelled) return;

                    $timeout(function() {
                      var data = result.text;
                      $scope.onScan({ data: data });
                    }, 1000);
                  },
                  function onError(error) {
                    $timeout(function() {
                      window.ignoreMobilePause = false;
                      window.plugins.spinnerDialog.hide();
                    }, 100);
                    alert('Scanning error');
                  }
              );
              if ($scope.beforeScan) {
                $scope.beforeScan();
              }
            }, 100);
          };

          $scope.modalOpenScanner = function() {
            var parentScope = $scope;
            var ModalInstanceCtrl = function($scope, $rootScope, $modalInstance) {
              // QR code Scanner
              var video;
              var canvas;
              var $video;
              var context;
              var localMediaStream;
              var prevResult;

              var _scan = function(evt) {
                if (localMediaStream) {
                  context.drawImage(video, 0, 0, 300, 225);
                  try {
                    qrcode.decode();
                  } catch (e) {
                    //qrcodeError(e);
                  }
                }
                $timeout(_scan, 800);
              };

              var _scanStop = function() {
                if (localMediaStream && localMediaStream.active) {
                  var localMediaStreamTrack = localMediaStream.getTracks();
                  for (var i = 0; i < localMediaStreamTrack.length; i++) {
                    localMediaStreamTrack[i].stop();
                  }
                } else {
                  try {
                    localMediaStream.stop();
                  } catch(e) {
                    // Older Chromium not support the STOP function
                  };
                }
                localMediaStream = null;
				if (video)
					video.src = '';
              };

              qrcode.callback = function(data) {
                if (prevResult != data) {
                  prevResult = data;
                  return;
                }
                _scanStop();
                $modalInstance.close(data);
              };

              var _successCallback = function(stream) {
                video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
                localMediaStream = stream;
                video.play();
                $timeout(_scan, 1000);
              };

              var _videoError = function(err) {
				breadcrumbs.add('qr scanner video error');
                $scope.cancel();
              };

              var setScanner = function() {
                navigator.getUserMedia = navigator.getUserMedia ||
                    navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
                    navigator.msGetUserMedia;
                window.URL = window.URL || window.webkitURL ||
                    window.mozURL || window.msURL;
              };

              $scope.init = function() {
                setScanner();
                $timeout(function() {
                  if (parentScope.beforeScan) {
                    parentScope.beforeScan();
                  }
                  canvas = document.getElementById('qr-canvas');
				  if (!canvas)
					  return;
                  context = canvas.getContext('2d');


                  video = document.getElementById('qrcode-scanner-video');
                  $video = angular.element(video);
                  canvas.width = 300;
                  canvas.height = 225;
                  context.clearRect(0, 0, 300, 225);

                  navigator.getUserMedia({
                    video: true
                  }, _successCallback, _videoError);
                }, 500);
              };

              $scope.cancel = function() {
				breadcrumbs.add('qr scanner cancel');
                _scanStop();
				try{
                	$modalInstance.dismiss('cancel');
				}
				catch(e){
					e.bIgnore = true;
				//	throw e;
				}
              };
            };

            var modalInstance = $modal.open({
              templateUrl: 'views/modals/scanner.html',
              windowClass: 'full',
              controller: ModalInstanceCtrl,
              backdrop : 'static',
              keyboard: false
            });
            modalInstance.result.then(function(data) {
              parentScope.onScan({ data: data });
            });

          };

          $scope.openScanner = function() {
            if (isCordova) {
              $scope.cordovaOpenScanner();
            }
            else {
              $scope.modalOpenScanner();
            }
          };
        };

        return {
          restrict: 'E',
          scope: {
            onScan: "&",
            beforeScan: "&"
          },
          controller: controller,
          replace: true,
          template: '<a id="camera-icon" class="p10" ng-click="openScanner()"><i class="iconfont icon-gengduo1"></i></a>'
        }
      }
    ]);

'use strict';

angular.module('copayApp.filters', [])
  .filter('amTimeAgo', ['amMoment',
    function(amMoment) {
      return function(input) {
        return amMoment.preprocessDate(input).fromNow();
      };
    }
  ])
  .filter('paged', function() {
    return function(elements) {
      if (elements) {
        return elements.filter(Boolean);
      }

      return false;
    };
  })
  .filter('removeEmpty', function() {
    return function(elements) {
      elements = elements || [];
      // Hide empty change addresses from other copayers
      return elements.filter(function(e) {
        return !e.isChange || e.balance > 0;
      });
    }
  })

.filter('noFractionNumber', ['$filter', '$locale', 'configService',
  function(filter, locale, configService) {
    var numberFilter = filter('number');
    var formats = locale.NUMBER_FORMATS;
    var config = configService.getSync().wallet.settings;
    return function(amount, n) {
      if (typeof(n) === 'undefined' && !config) return amount;

      var fractionSize = (typeof(n) !== 'undefined') ?
        n : config.unitValue.toString().length - 1;
      var value = numberFilter(amount, fractionSize);
      var sep = value.indexOf(formats.DECIMAL_SEP);
      var group = value.indexOf(formats.GROUP_SEP);
      if (amount >= 0) {
        if (group > 0) {
          if (sep < 0) {
            return value;
          }
          var intValue = value.substring(0, sep);
          var floatValue = parseFloat(value.substring(sep));
          if (floatValue === 0) {
            floatValue = '';
          } else {
            if (floatValue % 1 === 0) {
              floatValue = floatValue.toFixed(0);
            }
            floatValue = floatValue.toString().substring(1);
          }
          var finalValue = intValue + floatValue;
          return finalValue;
        } else {
          value = parseFloat(value);
          if (value % 1 === 0) {
            value = value.toFixed(0);
          }
          return value;
        }
      }
      return 0;
    };
  }
]);

'use strict';

/**
 * Profile
 *
 * credential: array of OBJECTS
 */
function Profile() {
	this.version = '1.0.0';
};

Profile.create = function(opts) {
	opts = opts || {};

	var x = new Profile();
	x.createdOn = Date.now();
	x.credentials = opts.credentials || [];
	if (!opts.xPrivKey && !opts.xPrivKeyEncrypted)
		throw Error("no xPrivKey, even encrypted");
	if (!opts.mnemonic && !opts.mnemonicEncrypted)
		throw Error("no mnemonic, even encrypted");
	if (!opts.tempDeviceKey)
		throw Error("no tempDeviceKey");
	x.xPrivKey = opts.xPrivKey;
	x.mnemonic = opts.mnemonic;
	x.xPrivKeyEncrypted = opts.xPrivKeyEncrypted;
	x.mnemonicEncrypted = opts.mnemonicEncrypted;
	x.tempDeviceKey = opts.tempDeviceKey;
	x.prevTempDeviceKey = opts.prevTempDeviceKey; // optional
	x.my_device_address = opts.my_device_address;
	return x;
};


Profile.fromObj = function(obj) {
	var x = new Profile();

	x.createdOn = obj.createdOn;
	x.credentials = obj.credentials;

	if (x.credentials[0] && typeof x.credentials[0] != 'object')
		throw ("credentials should be an object");

	if (!obj.xPrivKey && !obj.xPrivKeyEncrypted)
		throw Error("no xPrivKey, even encrypted");
//	if (!obj.mnemonic && !obj.mnemonicEncrypted)
//		throw Error("no mnemonic, even encrypted");
	if (!obj.tempDeviceKey)
		throw Error("no tempDeviceKey");
	x.xPrivKey = obj.xPrivKey;
	x.mnemonic = obj.mnemonic;
	x.xPrivKeyEncrypted = obj.xPrivKeyEncrypted;
	x.mnemonicEncrypted = obj.mnemonicEncrypted;
	x.tempDeviceKey = obj.tempDeviceKey;
	x.prevTempDeviceKey = obj.prevTempDeviceKey; // optional
	x.my_device_address = obj.my_device_address;
	
	return x;
};


Profile.fromString = function(str) {
	return Profile.fromObj(JSON.parse(str));
};

Profile.prototype.toObj = function() {
	return JSON.stringify(this);
};



'use strict';

angular.module('copayApp.services').service('addonManager', function (lodash) {
  var addons = [];

  this.registerAddon = function (addonSpec) {
    addons.push(addonSpec);
  };

  this.addonMenuItems = function () {
    return lodash.map(addons, function (addonSpec) {
      return addonSpec.menuItem;
    });
  };

  this.addonViews = function () {
    return lodash.map(addons, function (addonSpec) {
      return addonSpec.view;
    });
  };

  this.formatPendingTxp = function (txp) {
    lodash.each(addons, function (addon) {
      if (addon.formatPendingTxp) {
        addon.formatPendingTxp(txp);
      }
    });
  };

  this.txTemplateUrl = function() {
    var addon = lodash.find(addons, 'txTemplateUrl');
    return addon ? addon.txTemplateUrl() : null;
  }
});

'use strict';

angular.module('copayApp.services').factory('addressbookService', function(storageService, profileService) {
  var root = {};

  root.getLabel = function(addr, cb) {
    var fc = profileService.focusedClient;
    storageService.getAddressbook(fc.credentials.network, function(err, ab) {
      if (!ab) return cb();
      ab = JSON.parse(ab);
      if (ab[addr]) return cb(ab[addr]);
      else return cb();
    });
  };

  root.list = function(cb) {
    var fc = profileService.focusedClient;
    storageService.getAddressbook(fc.credentials.network, function(err, ab) {
      if (err) return cb('Could not get the Addressbook');
      if (ab) ab = JSON.parse(ab);
      return cb(err, ab);
    });
  };

  root.add = function(entry, cb) {
    var fc = profileService.focusedClient;
    root.list(function(err, ab) {
      if (err) return cb(err);
      if (!ab) ab = {};
      if (ab[entry.address]) return cb('Entry already exist');
      ab[entry.address] = entry.label;
      storageService.setAddressbook(fc.credentials.network, JSON.stringify(ab), function(err, ab) {
        if (err) return cb('Error adding new entry');
        root.list(function(err, ab) {
          return cb(err, ab);
        });
      });
    });
  };
  
  root.remove = function(addr, cb) {
    var fc = profileService.focusedClient;
    root.list(function(err, ab) {
      if (err) return cb(err);
      if (!ab) return;
      if (!ab[addr]) return cb('Entry does not exist');
      delete ab[addr];
      storageService.setAddressbook(fc.credentials.network, JSON.stringify(ab), function(err) {
        if (err) return cb('Error deleting entry');
        root.list(function(err, ab) {
          return cb(err, ab);
        });
      });
    }); 
  };

  root.removeAll = function() {
    var fc = profileService.focusedClient;
    storageService.removeAddressbook(fc.credentials.network, function(err) {
      if (err) return cb('Error deleting addressbook');
      return cb();
    });
  };

  return root;
});

'use strict';
'use strict';
angular.module('copayApp.services')
  .factory('addressService', function(profileService, $log, $timeout, lodash, gettextCatalog) {
    var root = {};


    root.expireAddress = function(walletId,cb) {
        $log.debug('Cleaning Address ' + walletId );
        cb();
    };


    root._createAddress = function(walletId, cb) {
      var client = profileService.getClient(walletId);

      $log.debug('Creating address for wallet:', walletId);
        

      client.createAddress(0, function(err, addr) {
        if (err)
            throw "impossible err creating address";
        return cb(null, addr.address);
      });
    };

    
    root.getAddress = function(walletId, forceNew, cb) {
        if (forceNew) {
            root._createAddress(walletId, function(err, addr) {
                if (err)
                    return cb(err);
                cb(null, addr);
            });
        }
        else {
            var client = profileService.getClient(walletId);
            client.getAddresses({reverse: true, limit: 1, is_change: 0}, function(err, addr) {
                if (err)
                    return cb(err);
                if (addr.length > 0)
                    return cb(null, addr[0].address);
                else // issue new address
                    root.getAddress(walletId, true, cb);
            });
        }
    };

    return root;
  });

'use strict';

angular.module('copayApp.services').factory('animationService', function(isCordova) {
  var root = {};

  var cachedTransitionState, cachedBackPanel;

  // DISABLE ANIMATION ON DESKTOP
  root.modalAnimated = {
    slideUp: isCordova ? 'full animated slideInUp' : 'full',
    slideRight: isCordova ? 'full animated slideInRight' : 'full',
    slideOutDown: isCordova ? 'slideOutDown' : 'hideModal',
    slideOutRight: isCordova ? 'slideOutRight' : 'hideModal',
  };

  var pageWeight = {
    walletHome: 0,
    copayers: -1,
    cordova: -1,
    payment: -1,

    preferences: 11,
    "preferences.preferencesColor": 12,
    "preferencesGlobal.backup": 12,
    "preferences.preferencesAdvanced": 12,
    "preferencesGlobal.preferencesAbout": 12,
    "preferences.preferencesAdvanced.preferencesDeleteWallet": 13,
    "preferencesGlobal.preferencesDeviceName": 12,
    "preferencesGlobal.preferencesLanguage": 12,
    "preferencesGlobal.preferencesUnit": 12,
    preferencesFee: 12,
    preferencesAltCurrency: 12,
    "preferences.preferencesAlias": 12,
    "preferencesGlobal.preferencesEmail": 12,
    "preferencesGlobal.export": 13,
    "preferences.preferencesAdvanced.paperWallet": 13,
    "preferencesGlobal.preferencesAbout.preferencesLogs": 13,
    "preferences.preferencesAdvanced.preferencesInformation": 13,
    "preferencesGlobal.preferencesAbout.translators": 13,
    "preferencesGlobal.preferencesAbout.disclaimer": 13,
    add: 11,
    create: 12,
    "preferencesGlobal.import": 12,
    importLegacy: 13
  };

  function cleanUpLater(e, e2) {
    var cleanedUp = false,
      timeoutID;
    var cleanUp = function() {
      if (cleanedUp) return;
      cleanedUp = true;
	  if (e2.parentNode) // sometimes it is null
		  e2.parentNode.removeChild(e2);
      e2.innerHTML = "";
      e.className = '';
      cachedBackPanel = null;
      cachedTransitionState = '';
      if (timeoutID) {
        timeoutID = null;
        window.clearTimeout(timeoutID);
      }
    };
    e.addEventListener("animationend", cleanUp, true);
    e2.addEventListener("animationend", cleanUp, true);
    e.addEventListener("webkitAnimationEnd", cleanUp, true);
    e2.addEventListener("webkitAnimationEnd", cleanUp, true);
    timeoutID = setTimeout(cleanUp, 500);
  };

  root.transitionAnimated = function(fromState, toState, event) {

    if (isaosp)
      return true;

    // Animation in progress?
    var x = document.getElementById('mainSectionDup');
    if (x && !cachedTransitionState) {
      console.log('Anim in progress');
      return true;
    }

    var fromName = fromState.name;
    var toName = toState.name;
    if (!fromName || !toName)
      return true;

    var fromWeight = pageWeight[fromName];
    var toWeight = pageWeight[toName];


    var entering = null,
      leaving = null;

    // Horizontal Slide Animation?
    if (isCordova && fromWeight && toWeight) {
      if (fromWeight > toWeight) {
        leaving = 'CslideOutRight';
      } else {
        entering = 'CslideInRight';
      }

      // Vertical Slide Animation?
    } else if (isCordova && fromName && fromWeight >= 0 && toWeight >= 0) {
      if (toWeight) {
        entering = 'CslideInUp';

      } else {
        leaving = 'CslideOutDown';
      }

      // no Animation  ?
    } else {
      return true;
    }

    var e = document.getElementById('mainSection');


    var desiredTransitionState = (fromName || '-') + ':' + (toName || '-');

    if (desiredTransitionState == cachedTransitionState) {
      e.className = entering || '';
      cachedBackPanel.className = leaving || '';
      cleanUpLater(e, cachedBackPanel);
      //console.log('USing animation', cachedTransitionState);
      return true;
    } else {
      var sc;
      // Keep prefDiv scroll
      var contentDiv = e.getElementsByClassName('content');
      if (contentDiv && contentDiv[0])
        sc = contentDiv[0].scrollTop;

      cachedBackPanel = e.cloneNode(true);
      cachedBackPanel.id = 'mainSectionDup';
      var c = document.getElementById('sectionContainer');
      c.appendChild(cachedBackPanel);

      if (sc)
        cachedBackPanel.getElementsByClassName('content')[0].scrollTop = sc;

      cachedTransitionState = desiredTransitionState;
      return false;
    }
  }

  return root;
});
'use strict';
angular.module('copayApp.services')
  .factory('applicationService', function($rootScope, $timeout, isCordova, nodeWebkit, go) {
    var root = {};

    root.restart = function() {
      var hashIndex = window.location.href.indexOf('#/');
      if (isCordova) {
        window.location = window.location.href.substr(0, hashIndex);
        $timeout(function() {
          $rootScope.$digest();
        }, 1);

      } else {
        // Go home reloading the application
        if (nodeWebkit.isDefined()) {
          go.walletHome();
          $timeout(function() {
            var win = require('nw.gui').Window.get();
            win.reload(3);
            //or
            win.reloadDev();
          }, 100);
        } else {
          window.location = window.location.href.substr(0, hashIndex);
        }
      }
    };

    return root;
  });

'use strict';


angular.module('copayApp.services').factory('authService', function() {
    var root = {};

    root.objRequest = null;


    return root;
});

'use strict';


angular.module('copayApp.services')
.factory('autoUpdatingWitnessesList', function($timeout, $modal, $rootScope, configService){
  var root = {};

  root.autoUpdate = true;
  root.timerNextCheck = null;

  root.checkChangeWitnesses = function(){
    if (!root.autoUpdate) return;

	var device = require('intervaluecore/device.js');
	var myWitnesses = require('intervaluecore/my_witnesses.js');
    device.getWitnessesFromHub(function(err, arrWitnessesFromHub){
      if (arrWitnessesFromHub) {
        myWitnesses.readMyWitnesses(function(arrWitnesses){
          root.addWitnesses = arrWitnessesFromHub.filter(function(witness){
            return arrWitnesses.indexOf(witness) == -1;
          });
          root.delWitnesses = arrWitnesses.filter(function(witness){
            return arrWitnessesFromHub.indexOf(witness) == -1;
          });

          if (root.addWitnesses.length != 0) {
              var modalInstance = $modal.open({
                  templateUrl: 'views/modals/approveNewWitnesses.html',
                  controller: 'approveNewWitnesses'
              });
              $rootScope.$on('closeModal', function() {
                  modalInstance.dismiss('cancel');
              });
          }
          if (root.timerNextCheck) $timeout.cancel(root.timerNextCheck);
          root.timerNextCheck = $timeout(root.checkChangeWitnesses, 1000 * 60 * 60 * 24);
        }, 'wait');
      }
      else {
        if (root.timerNextCheck) $timeout.cancel(root.timerNextCheck);
        root.timerNextCheck = $timeout(root.checkChangeWitnesses, 1000 * 60);
      }
    });
  };

  root.setAutoUpdate = function(bAutoUpdate){
    configService.set({autoUpdateWitnessesList: bAutoUpdate},function(){
    });
    root.autoUpdate = bAutoUpdate;
  };

  configService.get(function(err, conf){
    if (conf.autoUpdateWitnessesList === undefined) {
      root.setAutoUpdate(true);
    } else {
      root.autoUpdate = conf.autoUpdateWitnessesList;
    }
    root.checkChangeWitnesses();
  });

  return root;
});

'use strict';


angular.module('copayApp.services').factory('backButton', function($log, $rootScope, gettextCatalog, $deepStateRedirect, $document, $timeout, go, $state, lodash) {
	var root = {};
	
	root.menuOpened = false;
	root.dontDeletePath = false;
	
	var arrHistory = [];
	var body = $document.find('body').eq(0);
	var shownExitMessage = false;
	
	$rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams){
		// if we navigated to point already been somewhere in history -> cut all the history past this point
		/*for (var i = 0; i < arrHistory.length; i++) {
			var state = arrHistory[i];
			if (to.name == state.to && lodash.isEqual(toParams, state.toParams)) {
				arrHistory.splice(i+1);
				break;
			}
		}*/

		lastState = arrHistory.length ? arrHistory[arrHistory.length - 1] : null;
		if (from.name == "" // first state
			|| (lastState && !(to.name == lastState.to && lodash.isEqual(toParams, lastState.toParams)))) // jumped back in history 
			arrHistory.push({to: to.name, toParams: toParams, from: from.name, fromParams: fromParams});
		if (to.name == "walletHome") {
			$rootScope.$emit('Local/SetTab', 'walletHome', true);
		}
		root.menuOpened = false;
	});
	
	function back() {
		if (body.hasClass('modal-open')) {
			$rootScope.$emit('closeModal');
		}
		else if (root.menuOpened) {
			go.swipe();
			root.menuOpened = false;
		}
		else {
			var currentState = arrHistory.pop();
			if (!currentState || currentState.from == "") {
				arrHistory.push(currentState);
				askAndExit();
			} else {
				var parent_state = $state.get('^');
				if (parent_state.name) { // go up on state tree
					$deepStateRedirect.reset(parent_state.name);
					$state.go(parent_state);	
				} else { // go back across history
					var targetState = $state.get(currentState.from);
					if (targetState.modal || (currentState.to == "walletHome" && $rootScope.tab == "walletHome")) { // don't go to modal and don't go to anywhere wfom home screen 
						arrHistory.push(currentState);
						askAndExit();
					} else if (currentState.from.indexOf(currentState.to) != -1) { // prev state is a child of current one
						go.walletHome();
					} else {
						$state.go(currentState.from, currentState.fromParams);
					}
				}
			}
		}
	}
	
	function askAndExit(){
		if (shownExitMessage) {
			navigator.app.exitApp();
		}
		else {
			shownExitMessage = true;
			window.plugins.toast.showShortBottom(gettextCatalog.getString('Press again to exit'));
			$timeout(function() {
				shownExitMessage = false;
			}, 2000);
		}
	}

	function clearHistory() {
		arrHistory.splice(1);
	}
	
	document.addEventListener('backbutton', function() {
		back();
	}, false);

	/*document.addEventListener('keydown', function(e) {
		if (e.which == 37) back();
	}, false);*/
	
	root.back = back;
	root.arrHistory = arrHistory;
	root.clearHistory = clearHistory;
	return root;
});
'use strict';
angular.module('copayApp.services')
  .factory('backupService', function backupServiceFactory($log, $timeout, profileService, sjcl) {

    var root = {};

    var _download = function(ew, filename, cb) {
      var NewBlob = function(data, datatype) {
        var out;

        try {
          out = new Blob([data], {
            type: datatype
          });
          $log.debug("case 1");
        } catch (e) {
          window.BlobBuilder = window.BlobBuilder ||
            window.WebKitBlobBuilder ||
            window.MozBlobBuilder ||
            window.MSBlobBuilder;

          if (e.name == 'TypeError' && window.BlobBuilder) {
            var bb = new BlobBuilder();
            bb.append(data);
            out = bb.getBlob(datatype);
            $log.debug("case 2");
          } else if (e.name == "InvalidStateError") {
            // InvalidStateError (tested on FF13 WinXP)
            out = new Blob([data], {
              type: datatype
            });
            $log.debug("case 3");
          } else {
            // We're screwed, blob constructor unsupported entirely   
            $log.debug("Errore");
          }
        }
        return out;
      };

      var a = document.createElement("a");
      document.body.appendChild(a);
      a.style.display = "none";

      var blob = new NewBlob(ew, 'text/plain;charset=utf-8');
      var url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = filename;
      a.click();
      $timeout(function() {
        window.URL.revokeObjectURL(url);
      }, 250);
      return cb();
    };

    root.addMetadata = function(b, opts) {

      b = JSON.parse(b);
      if (opts.historyCache) b.historyCache = opts.historyCache;
      if (opts.addressBook) b.addressBook = opts.addressBook;
      return JSON.stringify(b);
    }

    root.walletExport = function(password, opts) {
      if (!password) {
        return null;
      }
      var fc = profileService.focusedClient;
      try {
        opts = opts || {};
        var b = fc.export(opts);
        if (opts.historyCache || opts.addressBook) b = root.addMetadata(b, opts);

        var e = sjcl.encrypt(password, b, {
          iter: 10000
        });
        return e;
      } catch (err) {
        $log.debug('Error exporting wallet: ', err);
        return null;
      };
    };

    root.walletDownload = function(password, opts, cb) {
      var fc = profileService.focusedClient;
      var ew = root.walletExport(password, opts);
      if (!ew) return cb('Could not create backup');

      var walletName = (fc.alias || '') + (fc.alias ? '-' : '') + fc.credentials.walletName;
      if (opts.noSign) walletName = walletName + '-noSign'
      var filename = walletName + '-Copaybackup.aes.json';
      _download(ew, filename, cb)
    };
    return root;
  });
'use strict';
angular.module('copayApp.services')
  .factory('bitcore', function bitcoreFactory(bwcService) {
    var bitcore = bwcService.getBitcore();
    return bitcore;
  });

'use strict';

// 配置模块
angular.module('copayApp.services').factory('configService', function (storageService, lodash, $log, isCordova) {
    var root = {};
    // 颜色列表，
    root.colorOpts = [
        '#DD4B39',
        '#F38F12',
        '#FAA77F',
        '#FADA58',
        '#9EDD72',
        '#77DADA',
        '#4A90E2',
        '#484ED3',
        '#9B59B6',
        '#E856EF',
        '#FF599E',
        '#7A8C9E',      //灰色
    ];

    var constants = require('intervaluecore/constants.js');
    var isTestnet = constants.version.match(/t$/);
    //
    root.TIMESTAMPER_ADDRESS = isTestnet ? 'OPNUXBRSSQQGHKQNEPD2GLWQYEUY5XLD' : 'I2ADHGP4HL6J37NQAD73J7E5SKFIXJOT';

    root.oracles = {
        "FOPUBEUPBC6YLIQDLKL6EW775BMV7YOH": {
            name: "Bitcoin Oracle",
            feednames_filter: ["^bitcoin_merkle$", "^random[\\d]+$"],
            feedvalues_filter: ["^[13][a-km-zA-HJ-NP-Z1-9]{25,34}\\:[0-9\\.]+$", "^\\d{1,6}$"]
        },
        "JPQKPRI5FMTQRJF4ZZMYZYDQVRD55OTC": {
            name: "Crypto exchange rates",
            feednames_filter: ["^[\\dA-Z]+_[\\dA-Z]+$"],
            feedvalues_filter: ["^[\\d\\.]+$"]
        },
        "GFK3RDAPQLLNCMQEVGGD2KCPZTLSG3HN": {
            name: "Flight delay tracker",
            feednames_filter: ["^[\\w\\d]+-\\d{4}-\\d{2}-\\d{2}$"],
            feedvalues_filter: ["^[\\d]+$"]
        },
        "TKT4UESIKTTRALRRLWS4SENSTJX6ODCW": {
            name: "Sports betting",
            feednames_filter: ["^[\\w\\d]+_[\\w\\d]+_\\d{4}-\\d{2}-\\d{2}$"],
            feedvalues_filter: ["^[\\w\\d]+$"]
        },
        "I2ADHGP4HL6J37NQAD73J7E5SKFIXJOT": {
            name: "Timestamp",
            feednames_filter: ["^timestamp$"],
            feedvalues_filter: ["^\\d{13,}$"]
        }
    };

    // 默认设置
    var defaultConfig = {
        // wallet limits
        limits: {
            totalCosigners: 6
        },

        hub: (constants.alt === '2' && isTestnet) ? 'inve07.hashproject.net/bb-test' : 'inve07.hashproject.net/bb',

        // requires bluetooth permission on android
        //deviceName: /*isCordova ? cordova.plugins.deviceName.name : */require('os').hostname(),

        getDeviceName: function () {
            return isCordova ? cordova.plugins.deviceName.name : require('os').hostname();
        },

        // wallet default config
        wallet: {
            requiredCosigners: 2,
            totalCosigners: 3,
            spendUnconfirmed: false,
            reconnectDelay: 5000,
            idleDurationMin: 4,
            singleAddress: false,
            settings: {
                unitName: 'INVE',
                unitValue: 1000000000000000000,
                unitDecimals: 18,
                unitCode: 'one',
                bbUnitName: 'INVE',
                bbUnitValue: 1000000000000000000,
                bbUnitDecimals: 18,
                bbUnitCode: 'one',
                alternativeName: 'US Dollar',
                alternativeIsoCode: 'USD',
            }
        },

        rates: {
            url: 'https://insight.bitpay.com:443/api/rates',
        },

        pushNotifications: {
            enabled: true,
            config: {
                android: {
                    icon: 'push',
                    iconColor: '#2F4053'
                },
                ios: {
                    alert: 'true',
                    badge: 'true',
                    sound: 'true',
                },
                windows: {},
            }
        },
        autoUpdateWitnessesList: true
    };

    var configCache = null;

    //
    root.getSync = function () {
        if (!configCache)
            throw new Error('configService#getSync called when cache is not initialized');
        return configCache;
    };

    root.get = function (cb) {
        storageService.getConfig(function (err, localConfig) {
            configCache = migrateLocalConfig(localConfig);
            $log.debug('Preferences read:', configCache);
            return cb(err, configCache);
        });
    };

    root.set = function (newOpts, cb) {
        var config = defaultConfig;
        storageService.getConfig(function (err, oldOpts) {
            if (lodash.isString(oldOpts)) {
                oldOpts = JSON.parse(oldOpts);
            }
            if (lodash.isString(config)) {
                config = JSON.parse(config);
            }
            if (lodash.isString(newOpts)) {
                newOpts = JSON.parse(newOpts);
            }
            lodash.merge(config, oldOpts, newOpts);
            checkAndReplaceOldUnitCode(config.wallet.settings);
            configCache = config;

            storageService.storeConfig(JSON.stringify(config), cb);
        });
    };

    root.reset = function (cb) {
        configCache = lodash.clone(defaultConfig);
        storageService.removeConfig(cb);
    };

    root.getDefaults = function () {
        return lodash.clone(defaultConfig);
    };

    if (window.config) {
        configCache = migrateLocalConfig(window.config);
    } else {
        root.get(function () {
        });
    }

    function migrateLocalConfig(localConfig) {
        if (localConfig) {
            var _config = JSON.parse(localConfig);

            //these ifs are to avoid migration problems
            if (!_config.wallet) {
                _config.wallet = defaultConfig.wallet;
            }
            if (!_config.wallet.settings.unitCode) {
                _config.wallet.settings.unitCode = defaultConfig.wallet.settings.unitCode;
            }
            if (!_config.wallet.settings.unitValue) {
                if (_config.wallet.settings.unitToBytes) {
                    _config.wallet.settings.unitValue = _config.wallet.settings.unitToBytes;
                } else {
                    _config.wallet.settings.unitValue = defaultConfig.wallet.settings.unitValue;
                }
            }
            if (!_config.wallet.settings.bbUnitName) {
                _config.wallet.settings.bbUnitName = defaultConfig.wallet.settings.bbUnitName;
            }
            if (!_config.wallet.settings.bbUnitValue) {
                _config.wallet.settings.bbUnitValue = defaultConfig.wallet.settings.bbUnitValue;
            }
            if (!_config.wallet.settings.bbUnitDecimals) {
                _config.wallet.settings.bbUnitDecimals = defaultConfig.wallet.settings.bbUnitDecimals;
            }
            if (!_config.wallet.settings.bbUnitCode) {
                _config.wallet.settings.bbUnitCode = defaultConfig.wallet.settings.bbUnitCode;
            }
            if (!_config.pushNotifications) {
                _config.pushNotifications = defaultConfig.pushNotifications;
            }
            if (!_config.hub)
                _config.hub = defaultConfig.hub;
            if (!_config.deviceName)
                _config.deviceName = defaultConfig.getDeviceName();

            checkAndReplaceOldUnitCode(_config.wallet.settings);
        } else {
            _config = lodash.clone(defaultConfig);
            _config.deviceName = defaultConfig.getDeviceName();
        }
        return _config;
    }

    function checkAndReplaceOldUnitCode(setting) {
        switch (setting.unitCode) {
            case 'byte':
                setting.unitCode = 'one';
                setting.unitValue = 1;
                break;
            case 'kB':
                setting.unitCode = 'kilo';
                setting.unitValue = 1000;
                break;
            case 'MB':
                setting.unitCode = 'mega';
                setting.unitValue = 1000000;
                break;
            case 'GB':
                setting.unitCode = 'giga';
                setting.unitValue = 1000000000;
                break;
        }
    }


    return root;
});


'use strict';

angular.module('copayApp.services').factory('confirmDialog', function($log, $timeout, gettextCatalog, isCordova) {
  var root = {};


  var acceptMsg = gettextCatalog.getString('Accept');
  var cancelMsg = gettextCatalog.getString('Cancel');
  var confirmMsg = gettextCatalog.getString('Confirm');

  root.show = function(msg, cb) {
    if (isCordova) {
      navigator.notification.confirm(
        msg,
        function(buttonIndex) {
          if (buttonIndex == 1) {
            $timeout(function() {
              return cb(true);
            }, 1);
          } else {
            return cb(false);
          }
        },
        confirmMsg, [acceptMsg, cancelMsg]
      );
    } else {
      return cb(confirm(msg));
    }
  };

  return root;
});


'use strict';

var constants = require('intervaluecore/constants.js');
var eventBus = require('intervaluecore/event_bus.js');
var ValidationUtils = require('intervaluecore/validation_utils.js');
var objectHash = require('intervaluecore/object_hash.js');

angular.module('copayApp.services').factory('correspondentListService', function($state, $rootScope, $sce, $compile, configService, storageService, profileService, go, lodash, $stickyState, $deepStateRedirect, $timeout, gettext) {
	var root = {};
	var device = require('intervaluecore/device.js');
	var wallet = require('intervaluecore/wallet.js');

	var chatStorage = require('intervaluecore/chat_storage.js');
	$rootScope.newMessagesCount = {};
	$rootScope.newMsgCounterEnabled = false;

	if (typeof nw !== 'undefined') {
		var win = nw.Window.get();
		win.on('focus', function(){
			$rootScope.newMsgCounterEnabled = false;
		});
		win.on('blur', function(){
			$rootScope.newMsgCounterEnabled = true;
		});
		$rootScope.$watch('newMessagesCount', function(counters) {
			var sum = lodash.sum(lodash.values(counters));
			if (sum) {
				win.setBadgeLabel(""+sum);
			} else {
				win.setBadgeLabel("");
			}
		}, true);
	}
	$rootScope.$watch('newMessagesCount', function(counters) {
		$rootScope.totalNewMsgCnt = lodash.sum(lodash.values(counters));
	}, true);
	
	function addIncomingMessageEvent(from_address, body, message_counter){
		var walletGeneral = require('intervaluecore/wallet_general.js');
		walletGeneral.readMyAddresses(function(arrMyAddresses){
			body = highlightActions(escapeHtml(body), arrMyAddresses);
			body = text2html(body);
			console.log("body with markup: "+body);
			addMessageEvent(true, from_address, body, message_counter);
		});
	}
	
	function addMessageEvent(bIncoming, peer_address, body, message_counter, skip_history_load){
		if (!root.messageEventsByCorrespondent[peer_address] && !skip_history_load) {
			return loadMoreHistory({device_address: peer_address}, function() {
				addMessageEvent(bIncoming, peer_address, body, message_counter, true);
			});
		}
		//root.messageEventsByCorrespondent[peer_address].push({bIncoming: true, message: $sce.trustAsHtml(body)});
		if (bIncoming) {
			if (peer_address in $rootScope.newMessagesCount)
				$rootScope.newMessagesCount[peer_address]++;
			else {
				$rootScope.newMessagesCount[peer_address] = 1;
			}
			if ($rootScope.newMessagesCount[peer_address] == 1 && (!$state.is('correspondentDevices.correspondentDevice') || root.currentCorrespondent.device_address != peer_address)) {
				root.messageEventsByCorrespondent[peer_address].push({
					bIncoming: false,
					message: '<span>new messages</span>',
					type: 'system',
					new_message_delim: true
				});
			}
		}
		var msg_obj = {
			bIncoming: bIncoming,
			message: body,
			timestamp: Math.floor(Date.now() / 1000),
			message_counter: message_counter
		};
		checkAndInsertDate(root.messageEventsByCorrespondent[peer_address], msg_obj);
		insertMsg(root.messageEventsByCorrespondent[peer_address], msg_obj);
		if ($state.is('walletHome') && $rootScope.tab == 'walletHome') {
			setCurrentCorrespondent(peer_address, function(bAnotherCorrespondent){
				$stickyState.reset('correspondentDevices.correspondentDevice');
				go.path('correspondentDevices.correspondentDevice');
			});
		}
		else
			$timeout(function(){
				$rootScope.$digest();
			});
	}

	function insertMsg(messages, msg_obj) {
		for (var i = messages.length-1; i >= 0 && msg_obj.message_counter; i--) {
			var message = messages[i];
			if (message.message_counter === undefined || message.message_counter && msg_obj.message_counter > message.message_counter) {
				messages.splice(i+1, 0, msg_obj);
				return;
			}
		}
		messages.push(msg_obj);
	}
	
	var payment_request_regexp = /\[.*?\]\(intervalue:([0-9A-Z]{32})\?([\w=&;+%]+)\)/g; // payment description within [] is ignored
	
	function highlightActions(text, arrMyAddresses){
		return text.replace(/\b[2-7A-Z]{32}\b(?!(\?(amount|asset|device_address)|"))/g, function(address){
			if (!ValidationUtils.isValidAddress(address))
				return address;
		//	if (arrMyAddresses.indexOf(address) >= 0)
		//		return address;
			//return '<a send-payment address="'+address+'">'+address+'</a>';
			return '<a dropdown-toggle="#pop'+address+'">'+address+'</a><ul id="pop'+address+'" class="f-dropdown" style="left:0px" data-dropdown-content><li><a ng-click="sendPayment(\''+address+'\')">'+gettext('Pay to this address')+'</a></li><li><a ng-click="offerContract(\''+address+'\')">'+gettext('Offer a contract')+'</a></li></ul>';
		//	return '<a ng-click="sendPayment(\''+address+'\')">'+address+'</a>';
			//return '<a send-payment ng-click="sendPayment(\''+address+'\')">'+address+'</a>';
			//return '<a send-payment ng-click="console.log(\''+address+'\')">'+address+'</a>';
			//return '<a onclick="console.log(\''+address+'\')">'+address+'</a>';
		}).replace(payment_request_regexp, function(str, address, query_string){
			if (!ValidationUtils.isValidAddress(address))
				return str;
		//	if (arrMyAddresses.indexOf(address) >= 0)
		//		return str;
			var objPaymentRequest = parsePaymentRequestQueryString(query_string);
			if (!objPaymentRequest)
				return str;
			return '<a ng-click="sendPayment(\''+address+'\', '+objPaymentRequest.amount+', \''+objPaymentRequest.asset+'\', \''+objPaymentRequest.device_address+'\')">'+objPaymentRequest.amountStr+'</a>';
		}).replace(/\[(.+?)\]\(command:(.+?)\)/g, function(str, description, command){
			return '<a ng-click="sendCommand(\''+escapeQuotes(command)+'\', \''+escapeQuotes(description)+'\')" class="command">'+description+'</a>';
		}).replace(/\[(.+?)\]\(payment:(.+?)\)/g, function(str, description, paymentJsonBase64){
			var arrMovements = getMovementsFromJsonBase64PaymentRequest(paymentJsonBase64, true);
			if (!arrMovements)
				return '[invalid payment request]';
			description = 'Payment request: '+arrMovements.join(', ');
			return '<a ng-click="sendMultiPayment(\''+paymentJsonBase64+'\')">'+description+'</a>';
		}).replace(/\[(.+?)\]\(vote:(.+?)\)/g, function(str, description, voteJsonBase64){
			var objVote = getVoteFromJsonBase64(voteJsonBase64);
			if (!objVote)
				return '[invalid vote request]';
			return '<a ng-click="sendVote(\''+voteJsonBase64+'\')">'+objVote.choice+'</a>';
		}).replace(/\[(.+?)\]\(profile:(.+?)\)/g, function(str, description, privateProfileJsonBase64){
			var objPrivateProfile = getPrivateProfileFromJsonBase64(privateProfileJsonBase64);
			if (!objPrivateProfile)
				return '[invalid profile]';
			return '<a ng-click="acceptPrivateProfile(\''+privateProfileJsonBase64+'\')">[Profile of '+objPrivateProfile._label+']</a>';
		}).replace(/\[(.+?)\]\(profile-request:([\w,]+?)\)/g, function(str, description, fields_list){
			var arrFields = fields_list.split(',');
			return '<a ng-click="choosePrivateProfile(\''+fields_list+'\')">[Request for profile]</a>';
		}).replace(/\bhttps?:\/\/\S+/g, function(str){
			return '<a ng-click="openExternalLink(\''+escapeQuotes(str)+'\')" class="external-link">'+str+'</a>';
		});
	}
	
	function getMovementsFromJsonBase64PaymentRequest(paymentJsonBase64, bAggregatedByAsset){
		var paymentJson = Buffer(paymentJsonBase64, 'base64').toString('utf8');
		console.log(paymentJson);
		try{
			var objMultiPaymentRequest = JSON.parse(paymentJson);
		}
		catch(e){
			return null;
		}
		if (objMultiPaymentRequest.definitions){
			for (var destinationAddress in objMultiPaymentRequest.definitions){
				var arrDefinition = objMultiPaymentRequest.definitions[destinationAddress].definition;
				if (destinationAddress !== objectHash.getChash160(arrDefinition))
					return null;
			}
		}
		try{
			var assocPaymentsByAsset = getPaymentsByAsset(objMultiPaymentRequest);
		}
		catch(e){
			return null;
		}
		var arrMovements = [];
		if (bAggregatedByAsset)
			for (var asset in assocPaymentsByAsset)
				arrMovements.push(getAmountText(assocPaymentsByAsset[asset], asset));
		else
			arrMovements = objMultiPaymentRequest.payments.map(function(objPayment){
				return getAmountText(objPayment.amount, objPayment.asset || 'base') + ' to ' + objPayment.address;
			});
		return arrMovements;
	}
	
	function getVoteFromJsonBase64(voteJsonBase64){
		var voteJson = Buffer(voteJsonBase64, 'base64').toString('utf8');
		console.log(voteJson);
		try{
			var objVote = JSON.parse(voteJson);
		}
		catch(e){
			return null;
		}
		if (!ValidationUtils.isStringOfLength(objVote.poll_unit, 44) || typeof objVote.choice !== 'string')
			return null;
		return objVote;
	}
	
	function getPrivateProfileFromJsonBase64(privateProfileJsonBase64){
		var privateProfileJson = Buffer(privateProfileJsonBase64, 'base64').toString('utf8');
		console.log(privateProfileJson);
		try{
			var objPrivateProfile = JSON.parse(privateProfileJson);
		}
		catch(e){
			return null;
		}
		if (!ValidationUtils.isStringOfLength(objPrivateProfile.unit, 44) || !ValidationUtils.isStringOfLength(objPrivateProfile.payload_hash, 44) || typeof objPrivateProfile.src_profile !== 'object')
			return null;
		var arrFirstFields = [];
		for (var field in objPrivateProfile.src_profile){
			var value = objPrivateProfile.src_profile[field];
			if (!Array.isArray(value))
				continue;
			arrFirstFields.push(value[0]);
			if (arrFirstFields.length === 2)
				break;
		}
		objPrivateProfile._label = arrFirstFields.join(' ');
		return objPrivateProfile;
	}
	
	function getPaymentsByAsset(objMultiPaymentRequest){
		var assocPaymentsByAsset = {};
		objMultiPaymentRequest.payments.forEach(function(objPayment){
			var asset = objPayment.asset || 'base';
			if (asset !== 'base' && !ValidationUtils.isValidBase64(asset, constants.HASH_LENGTH))
				throw Error("asset "+asset+" is not valid");
			if (!ValidationUtils.isPositiveInteger(objPayment.amount))
				throw Error("amount "+objPayment.amount+" is not valid");
			if (!assocPaymentsByAsset[asset])
				assocPaymentsByAsset[asset] = 0;
			assocPaymentsByAsset[asset] += objPayment.amount;
		});
		return assocPaymentsByAsset;
	}
	
	function formatOutgoingMessage(text){
		return escapeHtmlAndInsertBr(text).replace(payment_request_regexp, function(str, address, query_string){
			if (!ValidationUtils.isValidAddress(address))
				return str;
			var objPaymentRequest = parsePaymentRequestQueryString(query_string);
			if (!objPaymentRequest)
				return str;
			return '<i>'+objPaymentRequest.amountStr+' to '+address+'</i>';
		}).replace(/\[(.+?)\]\(payment:(.+?)\)/g, function(str, description, paymentJsonBase64){
			var arrMovements = getMovementsFromJsonBase64PaymentRequest(paymentJsonBase64);
			if (!arrMovements)
				return '[invalid payment request]';
			return '<i>Payment request: '+arrMovements.join(', ')+'</i>';
		}).replace(/\[(.+?)\]\(vote:(.+?)\)/g, function(str, description, voteJsonBase64){
			var objVote = getVoteFromJsonBase64(voteJsonBase64);
			if (!objVote)
				return '[invalid vote request]';
			return '<i>Vote request: '+objVote.choice+'</i>';
		}).replace(/\[(.+?)\]\(profile:(.+?)\)/g, function(str, description, privateProfileJsonBase64){
			var objPrivateProfile = getPrivateProfileFromJsonBase64(privateProfileJsonBase64);
			if (!objPrivateProfile)
				return '[invalid profile]';
			return '<a ng-click="acceptPrivateProfile(\''+privateProfileJsonBase64+'\')">[Profile of '+objPrivateProfile._label+']</a>';
		}).replace(/\[(.+?)\]\(profile-request:([\w,]+?)\)/g, function(str, description, fields_list){
			var arrFields = fields_list.split(',');
			return '[Request for profile fields '+fields_list+']';
		}).replace(/\bhttps?:\/\/\S+/g, function(str){
			return '<a ng-click="openExternalLink(\''+escapeQuotes(str)+'\')" class="external-link">'+str+'</a>';
		});
	}
	
	function parsePaymentRequestQueryString(query_string){
		var URI = require('intervaluecore/uri.js');
		var assocParams = URI.parseQueryString(query_string, '&amp;');
		var strAmount = assocParams['amount'];
		if (!strAmount)
			return null;
		var amount = parseInt(strAmount);
		if (amount + '' !== strAmount)
			return null;
		if (!ValidationUtils.isPositiveInteger(amount))
			return null;
		var asset = assocParams['asset'] || 'base';
		console.log("asset="+asset);
		if (asset !== 'base' && !ValidationUtils.isValidBase64(asset, constants.HASH_LENGTH)) // invalid asset
			return null;
		var device_address = assocParams['device_address'] || '';
		if (device_address && !ValidationUtils.isValidDeviceAddress(device_address))
			return null;
		var amountStr = 'Payment request: ' + getAmountText(amount, asset);
		return {
			amount: amount,
			asset: asset,
			device_address: device_address,
			amountStr: amountStr
		};
	}
	
	function text2html(text){
		return text.replace(/\r/g, '').replace(/\n/g, '<br>').replace(/\t/g, ' &nbsp; &nbsp; ');
	}
	
	function escapeHtml(text){
		return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}
	
	function escapeHtmlAndInsertBr(text){
		return text2html(escapeHtml(text));
	}
	
	function escapeQuotes(text){
		return text.replace(/(['\\])/g, "\\$1").replace(/"/g, "&quot;");
	}
	
	function setCurrentCorrespondent(correspondent_device_address, onDone){
		if (!root.currentCorrespondent || correspondent_device_address !== root.currentCorrespondent.device_address)
			device.readCorrespondent(correspondent_device_address, function(correspondent){
				root.currentCorrespondent = correspondent;
				onDone(true);
			});
		else
			onDone(false);
	}
	
	// amount is in smallest units
	function getAmountText(amount, asset){
		if (asset === 'base'){
			var walletSettings = configService.getSync().wallet.settings;
			var unitValue = walletSettings.unitValue;
			var unitName = walletSettings.unitName;
			if (amount !== 'all')
				amount /= unitValue;
			return amount + ' ' + unitName;
		}
		else if (asset === constants.BLACKBYTES_ASSET){
			var walletSettings = configService.getSync().wallet.settings;
			var bbUnitValue = walletSettings.bbUnitValue;
			var bbUnitName = walletSettings.bbUnitName;
			amount /= bbUnitValue;
			return amount + ' ' + bbUnitName;
		}
		else if (profileService.assetMetadata[asset]){
			amount /= Math.pow(10, profileService.assetMetadata[asset].decimals || 0);
			return amount + ' ' + profileService.assetMetadata[asset].name;
		}
		else
			return amount + ' of ' + asset;
	}
		
	function getHumanReadableDefinition(arrDefinition, arrMyAddresses, arrMyPubKeys, arrPeerAddresses, bWithLinks){
		function getDisplayAddress(address){
			if (arrMyAddresses.indexOf(address) >= 0)
				return '<span title="your address: '+address+'">you</span>';
			if (arrPeerAddresses.indexOf(address) >= 0)
				return '<span title="peer address: '+address+'">peer</span>';
			return address;
		}
		function parse(arrSubdefinition){
			var op = arrSubdefinition[0];
			var args = arrSubdefinition[1];
			switch(op){
				case 'sig':
					var pubkey = args.pubkey;
					return 'signed by '+(arrMyPubKeys.indexOf(pubkey) >=0 ? 'you' : 'public key '+pubkey);
				case 'address':
					var address = args;
					return 'signed by '+getDisplayAddress(address);
				case 'cosigned by':
					var address = args;
					return 'co-signed by '+getDisplayAddress(address);
				case 'not':
					return '<span class="size-18">not</span>'+parseAndIndent(args);
				case 'or':
				case 'and':
					return args.map(parseAndIndent).join('<span class="size-18">'+op+'</span>');
				case 'r of set':
					return 'at least '+args.required+' of the following is true:<br>'+args.set.map(parseAndIndent).join(',');
				case 'weighted and':
					return 'the total weight of the true conditions below is at least '+args.required+':<br>'+args.set.map(function(arg){
						return arg.weight+': '+parseAndIndent(arg.value);
					}).join(',');
				case 'in data feed':
					var arrAddresses = args[0];
					var feed_name = args[1];
					var relation = args[2];
					var value = args[3];
					var min_mci = args[4];
					if (feed_name === 'timestamp' && relation === '>')
						return 'after ' + ((typeof value === 'number') ? new Date(value).toString() : value);
					var str = 'Oracle '+arrAddresses.join(', ')+' posted '+feed_name+' '+relation+' '+value;
					if (min_mci)
						str += ' after MCI '+min_mci;
					return str;
				case 'in merkle':
					var arrAddresses = args[0];
					var feed_name = args[1];
					var value = args[2];
					var min_mci = args[3];
					var str = 'A proof is provided that oracle '+arrAddresses.join(', ')+' posted '+value+' in '+feed_name;
					if (min_mci)
						str += ' after MCI '+min_mci;
					return str;
				case 'has':
					if (args.what === 'output' && args.asset && args.amount_at_least && args.address)
						return 'sends at least ' + getAmountText(args.amount_at_least, args.asset) + ' to ' + getDisplayAddress(args.address);
					if (args.what === 'output' && args.asset && args.amount && args.address)
						return 'sends ' + getAmountText(args.amount, args.asset) + ' to ' + getDisplayAddress(args.address);
					return JSON.stringify(arrSubdefinition);
				case 'seen':
					if (args.what === 'output' && args.asset && args.amount && args.address){
						var dest_address = ((args.address === 'this address') ? objectHash.getChash160(arrDefinition) : args.address);
						var bOwnAddress = (arrMyAddresses.indexOf(args.address) >= 0);
						var expected_payment = getAmountText(args.amount, args.asset) + ' to ' + getDisplayAddress(args.address);
						return 'there was a transaction that sends ' + ((bWithLinks && !bOwnAddress) ? ('<a ng-click="sendPayment(\''+dest_address+'\', '+args.amount+', \''+args.asset+'\')">'+expected_payment+'</a>') : expected_payment);
					}
					else if (args.what === 'input' && (args.asset && args.amount || !args.asset && !args.amount) && args.address){
						var how_much = (args.asset && args.amount) ? getAmountText(args.amount, args.asset) : '';
						return 'there was a transaction that spends '+how_much+' from '+args.address;
					}
					return JSON.stringify(arrSubdefinition);

				default:
					return JSON.stringify(arrSubdefinition);
			}
		}
		function parseAndIndent(arrSubdefinition){
			return '<div class="indent">'+parse(arrSubdefinition)+'</div>\n';
		}
		return parse(arrDefinition, 0);
	}

	var historyEndForCorrespondent = {};
	function loadMoreHistory(correspondent, cb) {
		if (historyEndForCorrespondent[correspondent.device_address]) {
			if (cb) cb();
			return;
		}
		if (!root.messageEventsByCorrespondent[correspondent.device_address])
			root.messageEventsByCorrespondent[correspondent.device_address] = [];
		var messageEvents = root.messageEventsByCorrespondent[correspondent.device_address];
		var limit = 10;
		var last_msg_ts = null;
		var last_msg_id = 90071992547411;
		if (messageEvents.length && messageEvents[0].id) {
			last_msg_ts = new Date(messageEvents[0].timestamp * 1000);
			last_msg_id = messageEvents[0].id;
		}
		chatStorage.load(correspondent.device_address, last_msg_id, limit, function(messages){
			for (var i in messages) {
				messages[i] = parseMessage(messages[i]);
			}
			var walletGeneral = require('intervaluecore/wallet_general.js');
			walletGeneral.readMyAddresses(function(arrMyAddresses){
				if (messages.length < limit)
					historyEndForCorrespondent[correspondent.device_address] = true;
				for (var i in messages) {
					var message = messages[i];
					var msg_ts = new Date(message.creation_date.replace(' ', 'T')+'.000Z');
					if (last_msg_ts && last_msg_ts.getDay() != msg_ts.getDay()) {
						messageEvents.unshift({type: 'system', bIncoming: false, message: "<span>" + last_msg_ts.toDateString() + "</span>", timestamp: Math.floor(msg_ts.getTime() / 1000)});	
					}
					last_msg_ts = msg_ts;
					if (message.type == "text") {
						if (message.is_incoming) {
							message.message = highlightActions(escapeHtml(message.message), arrMyAddresses);
							message.message = text2html(message.message);
						} else {
							message.message = formatOutgoingMessage(message.message);
						}
					}
					messageEvents.unshift({id: message.id, type: message.type, bIncoming: message.is_incoming, message: message.message, timestamp: Math.floor(msg_ts.getTime() / 1000), chat_recording_status: message.chat_recording_status});
				}
				if (historyEndForCorrespondent[correspondent.device_address] && messageEvents.length > 1) {
					messageEvents.unshift({type: 'system', bIncoming: false, message: "<span>" + (last_msg_ts ? last_msg_ts : new Date()).toDateString() + "</span>", timestamp: Math.floor((last_msg_ts ? last_msg_ts : new Date()).getTime() / 1000)});
				}
				$timeout(function(){
					$rootScope.$digest();
				});
				if (cb) cb();
			});
		});
	}

	function checkAndInsertDate(messageEvents, message) {
		if (messageEvents.length == 0 || typeof messageEvents[messageEvents.length-1].timestamp == "undefined") return;

		var msg_ts = new Date(message.timestamp * 1000);
		var last_msg_ts = new Date(messageEvents[messageEvents.length-1].timestamp * 1000);
		if (last_msg_ts.getDay() != msg_ts.getDay()) {
			messageEvents.push({type: 'system', bIncoming: false, message: "<span>" + msg_ts.toDateString() + "</span>", timestamp: Math.floor(msg_ts.getTime() / 1000)});	
		}
	}

	function parseMessage(message) {
		switch (message.type) {
			case "system":
				message.message = JSON.parse(message.message);
				message.message = "<span>chat recording " + (message.message.state ? "&nbsp;" : "") + "</span><b dropdown-toggle=\"#recording-drop\">" + (message.message.state ? "ON" : "OFF") + "</b><span class=\"padding\"></span>";
				message.chat_recording_status = true;
				break;
		}
		return message;
	}
	
	eventBus.on("text", function(from_address, body, message_counter){
		device.readCorrespondent(from_address, function(correspondent){
			if (!root.messageEventsByCorrespondent[correspondent.device_address]) loadMoreHistory(correspondent);
			addIncomingMessageEvent(correspondent.device_address, body, message_counter);
			if (correspondent.my_record_pref && correspondent.peer_record_pref) chatStorage.store(from_address, body, 1);
		});
	});

	eventBus.on("chat_recording_pref", function(correspondent_address, enabled, message_counter){
		device.readCorrespondent(correspondent_address, function(correspondent){
			var oldState = (correspondent.peer_record_pref && correspondent.my_record_pref);
			correspondent.peer_record_pref = enabled;
			var newState = (correspondent.peer_record_pref && correspondent.my_record_pref);
			device.updateCorrespondentProps(correspondent);
			if (newState != oldState) {
				if (!root.messageEventsByCorrespondent[correspondent_address]) root.messageEventsByCorrespondent[correspondent_address] = [];
				var message = {
					type: 'system',
					message: JSON.stringify({state: newState}),
					timestamp: Math.floor(Date.now() / 1000),
					chat_recording_status: true,
					message_counter: message_counter
				};
				insertMsg(root.messageEventsByCorrespondent[correspondent_address], parseMessage(message));
				$timeout(function(){
					$rootScope.$digest();
				});
				chatStorage.store(correspondent_address, JSON.stringify({state: newState}), 0, 'system');
			}
			if (root.currentCorrespondent && root.currentCorrespondent.device_address == correspondent_address) {
				root.currentCorrespondent.peer_record_pref = enabled ? 1 : 0;
			}
		});
	});
	
	eventBus.on("sent_payment", function(peer_address, amount, asset, bToSharedAddress){
		var title = bToSharedAddress ? 'Payment to smart address' : 'Payment';
		setCurrentCorrespondent(peer_address, function(bAnotherCorrespondent){
			var body = '<a ng-click="showPayment(\''+asset+'\')" class="payment">'+title+': '+getAmountText(amount, asset)+'</a>';
			addMessageEvent(false, peer_address, body);
			device.readCorrespondent(peer_address, function(correspondent){
				if (correspondent.my_record_pref && correspondent.peer_record_pref) chatStorage.store(peer_address, body, 0, 'html');
			});
			go.path('correspondentDevices.correspondentDevice');
		});
	});
	
	eventBus.on("received_payment", function(peer_address, amount, asset, message_counter, bToSharedAddress){
		var title = bToSharedAddress ? 'Payment to smart address' : 'Payment';
		var body = '<a ng-click="showPayment(\''+asset+'\')" class="payment">'+title+': '+getAmountText(amount, asset)+'</a>';
		addMessageEvent(true, peer_address, body, message_counter);
		device.readCorrespondent(peer_address, function(correspondent){
			if (correspondent.my_record_pref && correspondent.peer_record_pref) chatStorage.store(peer_address, body, 1, 'html');
		});
	});
	
	eventBus.on('paired', function(device_address){
		if ($state.is('correspondentDevices'))
			return $state.reload(); // refresh the list
		if (!$state.is('correspondentDevices.correspondentDevice'))
			return;
		if (!root.currentCorrespondent)
			return;
		if (device_address !== root.currentCorrespondent.device_address)
			return;
		// re-read the correspondent to possibly update its name
		device.readCorrespondent(device_address, function(correspondent){
			// do not assign a new object, just update its property (this object was already bound to a model)
			root.currentCorrespondent.name = correspondent.name;
			$timeout(function(){
				$rootScope.$digest();
			});
		});
	});

	 eventBus.on('removed_paired_device', function(device_address){
		if ($state.is('correspondentDevices'))
			return $state.reload(); // todo show popup after refreshing the list
		if (!$state.is('correspondentDevices.correspondentDevice'))
		 	return;
		if (!root.currentCorrespondent)
		 	return;
		if (device_address !== root.currentCorrespondent.device_address)
		 	return;
		
		// go back to list of correspondentDevices
		// todo show popup message
		// todo return to correspondentDevices when in edit-mode, too
		$deepStateRedirect.reset('correspondentDevices');
		go.path('correspondentDevices');
		$timeout(function(){
			$rootScope.$digest();
		});
	});
	

	$rootScope.$on('Local/CorrespondentInvitation', function(event, device_pubkey, device_hub, pairing_secret){
		console.log('CorrespondentInvitation', device_pubkey, device_hub, pairing_secret);
		root.acceptInvitation(device_hub, device_pubkey, pairing_secret, function(){});
	});

	
	root.getPaymentsByAsset = getPaymentsByAsset;
	root.getAmountText = getAmountText;
	root.setCurrentCorrespondent = setCurrentCorrespondent;
	root.formatOutgoingMessage = formatOutgoingMessage;
	root.getHumanReadableDefinition = getHumanReadableDefinition;
	root.loadMoreHistory = loadMoreHistory;
	root.checkAndInsertDate = checkAndInsertDate;
	root.parseMessage = parseMessage;
	root.escapeHtmlAndInsertBr = escapeHtmlAndInsertBr;
	root.addMessageEvent = addMessageEvent;
	
	root.list = function(cb) {
	  device.readCorrespondents(function(arrCorrespondents){
		  cb(null, arrCorrespondents);
	  });
	};


	root.startWaitingForPairing = function(cb){
		device.startWaitingForPairing(function(pairingInfo){
			cb(pairingInfo);
		});
	};
	
	root.acceptInvitation = function(hub_host, device_pubkey, pairing_secret, cb){
		//return setTimeout(cb, 5000);
		if (device_pubkey === device.getMyDevicePubKey())
			return cb("cannot pair with myself");
		if (!device.isValidPubKey(device_pubkey))
			return cb("invalid peer public key");
		// the correspondent will be initially called 'New', we'll rename it as soon as we receive the reverse pairing secret back
		device.addUnconfirmedCorrespondent(device_pubkey, hub_host, 'New', function(device_address){
			device.startWaitingForPairing(function(reversePairingInfo){
				device.sendPairingMessage(hub_host, device_pubkey, pairing_secret, reversePairingInfo.pairing_secret, {
					ifOk: cb,
					ifError: cb
				});
			});
			// this continues in parallel
			// open chat window with the newly added correspondent
			device.readCorrespondent(device_address, function(correspondent){
				root.currentCorrespondent = correspondent;
				if (!$state.is('correspondentDevices.correspondentDevice'))
					go.path('correspondentDevices.correspondentDevice');
				else {
					$stickyState.reset('correspondentDevices.correspondentDevice');
					$state.reload();
				}
			});
		});
	};
	
	root.currentCorrespondent = null;
	root.messageEventsByCorrespondent = {};

  /*
  root.remove = function(addr, cb) {
	var fc = profileService.focusedClient;
	root.list(function(err, ab) {
	  if (err) return cb(err);
	  if (!ab) return;
	  if (!ab[addr]) return cb('Entry does not exist');
	  delete ab[addr];
	  storageService.setCorrespondentList(fc.credentials.network, JSON.stringify(ab), function(err) {
		if (err) return cb('Error deleting entry');
		root.list(function(err, ab) {
		  return cb(err, ab);
		});
	  });
	}); 
  };

  root.removeAll = function() {
	var fc = profileService.focusedClient;
	storageService.removeCorrespondentList(fc.credentials.network, function(err) {
	  if (err) return cb('Error deleting correspondentList');
	  return cb();
	});
  };*/

	return root;
});

'use strict';

angular.module('copayApp.services').factory('derivationPathHelper', function(lodash) {
  var root = {};

  root.default = "m/44'/0'/0'"
  root.parse = function(str) {
    var arr = str.split('/');

    var ret = {};

    if (arr[0] != 'm')
      return false;

    switch (arr[1]) {
      case "44'":
        ret.derivationStrategy = 'BIP44';
        break;
      case "48'":
        ret.derivationStrategy = 'BIP48';
        break;
      default:
        return false;
    };

    switch (arr[2]) {
      case "0'":
        ret.networkName = 'livenet';
        break;
      case "1'":
        ret.networkName = 'testnet';
        break;
      default:
        return false;
    };

    var match = arr[3].match(/(\d+)'/);
    if (!match)
      return false;
    ret.account = + match[1]

    return ret;
  };

  return root;
});

'use strict';

angular.module('copayApp.services')
  .factory('fileStorageService', function() {
    var fileStorage = require('./fileStorage.js');
    var root = {};
    
    root.get = function(k, cb) {
		fileStorage.get(k, cb);
    };
    
    root.set = function(k, v, cb) {
		fileStorage.set(k, v, cb);  
    };
      

    root.remove = function(k, cb) {
      fileStorage.init(function(err, fs, dir) {
        if (err) return cb(err);
        dir.getFile(k, {
          create: false
        }, function(fileEntry) {
          // Create a FileWriter object for our FileEntry (log.txt).
          fileEntry.remove(function() {
            console.log('File removed.');
            return cb();
          }, cb);
        }, cb);
      });
    };

    /**
     * Same as setItem, but fails if an item already exists
     */
    root.create = function(name, value, callback) {
      fileStorage.get(name,
        function(err, data) {
          if (data) {
            return callback('EEXISTS');
          } else {
            return fileStorage.set(name, value, callback);
          }
        });
    };

    return root;
  });

'use strict';

angular.module('copayApp.services')
.factory('fileSystemService', function($log, isCordova) {
	var root = {},
		bFsInitialized = false;
	
	var fs = require('fs' + '');
	try {
		var desktopApp = require('intervaluecore/desktop_app.js' + '');
	} catch (e) {
		
	}
	
	root.init = function(cb) {
		if (bFsInitialized) return cb(null);
		
		function onFileSystemSuccess(fileSystem) {
			console.log('File system started: ', fileSystem.name, fileSystem.root.name);
			bFsInitialized = true;
			return cb(null);
		}
		
		function fail(evt) {
			var msg = 'Could not init file system: ' + evt.target.error.code;
			console.log(msg);
			return cb(msg);
		}
		
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);
	};
	
	root.readFileFromForm = function(file, cb) {
		if (isCordova) {
			var reader = new FileReader();
			reader.onloadend = function() {
				var fileBuffer = Buffer.from(new Uint8Array(this.result));
				cb(null, fileBuffer);
			};
			reader.readAsArrayBuffer(file);
		}
		else {
			return cb(null, fs.createReadStream(file.path));
		}
	};
	
	root.readFile = function(path, cb) {
		if (isCordova) {
			root.init(function() {
				window.resolveLocalFileSystemURL(path, function(fileEntry) {
					fileEntry.file(function(file) {
						root.readFileFromForm(file, cb);
					});
				}, function(e) {
					throw new Error('error: ' + JSON.stringify(e));
				});
			});
		}
		else {
			fs.readFile(path, function(err, data) {
				return err ? cb(err) : cb(null, data);
			});
		}
	};
	
	root.getPath = function(path, cb) {
		return cb(null, path.replace(/\\/g, '/'));
	};
	
	root.nwWriteFile = function(path, data, cb) {
		if (!isCordova) {
			fs.writeFile(path, data, function(err) {
				return err ? cb(err) : cb(null);
			});
		}
		else {
			cb('use cordovaWriteFile')
		}
	};
	
	// example: fileSystemService.cordovaWriteFile(cordova.file.externalRootDirectory, 'testFolder', 'testFile.txt', 'testText :)', function(err) {
	root.cordovaWriteFile = function(cordovaFile, path, fileName, data, cb) {
		if (isCordova) {
			root.init(function() {
				window.resolveLocalFileSystemURL(cordovaFile, function(dirEntry) {
					if (!path || path == '.' || path == '/') {
						_cordovaWriteFile(dirEntry, fileName, data, cb);
					}
					else {
						dirEntry.getDirectory(path, {create: true, exclusive: false}, function(dirEntry1) {
							_cordovaWriteFile(dirEntry1, fileName, data, cb);
						}, cb);
					}
				}, cb);
			});
		}
		else {
			cb('use nwWriteFile');
		}
	};
	
	function _cordovaWriteFile(dirEntry, name, data, cb) {
		if(typeof data != 'string') data = data.buffer;
		dirEntry.getFile(name, {create: true, exclusive: false}, function(file) {
			file.createWriter(function(writer) {
				writer.onwriteend = function() {
					cb(null); 
				};
				writer.write(data);
			}, cb);
		}, cb);
	}
	
	root.readdir = function(path, cb) {
		if (isCordova) {
			root.init(function() {
				window.resolveLocalFileSystemURL(path,
					function(fileSystem) {
						var reader = fileSystem.createReader();
						reader.readEntries(
							function(entries) {
								cb(null, entries.map(function(entry) {
									return entry.name
								}));
							},
							function(err) {
								cb(err);
							}
						);
					}, function(err) {
						cb(err);
					}
				);
			});
		}
		else {
			fs.readdir(path, function(err, entries) {
				return err ? cb(err) : cb(null, entries);
			});
		}
	};
	
	root.nwMoveFile = function(oldPath, newPath, cb){
		var read = fs.createReadStream(oldPath);
		var write = fs.createWriteStream(newPath);

		read.pipe(write);
		read.on('end',function() {
			fs.unlink(oldPath, cb);
		});
	};
	
	root.nwUnlink = function(path, cb) {
		fs.unlink(path, cb);
	};
	
	root.nwRmDir = function(path, cb) {
		fs.rmdir(path, cb);
	};
	
	root.nwExistsSync = function(path) {
		return fs.existsSync(path);
	};
	
	
	root.getParentDirPath = function() {
		if (!isCordova) return false;
		switch (window.cordova.platformId) {
			case 'ios':
				return window.cordova.file.applicationStorageDirectory + '/Library';
			case 'android':
			default:
				return window.cordova.file.applicationStorageDirectory;
		}
	};
	
	root.getDatabaseDirName = function() {
		if (!isCordova) return false;
		switch (window.cordova.platformId) {
			case 'ios':
				return 'LocalDatabase';
			case 'android':
			default:
				return 'databases';
		}
	};
	
	root.getDatabaseDirPath = function() {
		if (isCordova) {
			return root.getParentDirPath() + '/' + root.getDatabaseDirName();
		}
		else {
			return desktopApp.getAppDataDir();
		}
	};

	root.recursiveMkdir = function(path, mode, callback) {
		var parentDir = require('path' + '').dirname(path);
		
		fs.stat(parentDir, function(err, stats) {
			if (err && err.code !== 'ENOENT')
				throw Error("failed to stat dir: "+err);

			if (err && err.code === 'ENOENT') {
				root.recursiveMkdir(parentDir, mode, function(err) {
					if (err)
						callback(err);
					else
						fs.mkdir(path, mode, callback);
				});
			} else {
				fs.mkdir(path, mode, callback);
			}
		});
	};
	
	return root;
});

'use strict';

var eventBus = require('intervaluecore/event_bus.js');

angular.module('copayApp.services').factory('go', function($window, $rootScope, $location, $state, profileService, fileSystemService, nodeWebkit, notification, gettextCatalog, authService, $deepStateRedirect, $stickyState) {
	var root = {};

	var hideSidebars = function() {
		if (typeof document === 'undefined')
			return;

		var elem = document.getElementById('off-canvas-wrap');
		elem.className = 'off-canvas-wrap';
	};

	var toggleSidebar = function(invert) {
		if (typeof document === 'undefined')
			return;

		var elem = document.getElementById('off-canvas-wrap');
		var leftbarActive = elem.className.indexOf('move-right') >= 0;

		if (invert) {
			if (profileService.profile && !$rootScope.hideNavigation) {
				elem.className = 'off-canvas-wrap move-right';
			}
		} else {
			if (leftbarActive) {
				hideSidebars();
			}
		}
	};

	root.openExternalLink = function(url, target) {
		if (nodeWebkit.isDefined()) {
			nodeWebkit.openExternalLink(url);
		}
		else {
			target = target || '_blank';
			var ref = window.open(url, target, 'location=no');
		}
	};

	root.path = function(path, cb) {
		$state.go(path)
		.then(function() {
			console.log("transition done "+path);
			if (cb) return cb();
		}, function() {
			console.log("transition failed "+path);
			if (cb) return cb('animation in progress');
		});
		hideSidebars();
	};

	root.swipe = function(invert) {
		toggleSidebar(invert);
	};

	root.walletHome = function() {
		var fc = profileService.focusedClient;
		if (fc && !fc.isComplete())
			root.path('copayers');
		else {
			root.path('walletHome', function() {
				$rootScope.$emit('Local/SetTab', 'walletHome', true);
			});
		}
	};


	root.send = function(cb) {
		$stickyState.reset('walletHome');
		root.path('walletHome', function() {
			$rootScope.$emit('Local/SetTab', 'send');
			if (cb)
				cb();
		});
	};

	root.history = function(cb) {
		root.path('walletHome', function() {
			$rootScope.$emit('Local/SetTab', 'history');
			if (cb)
				cb();
		});
	};

	root.addWallet = function() {
		$state.go('add');
	};

	root.receive = function() {
		$state.go('receive');
	};


	root.preferences = function() {
		$state.go('preferences');
	};

	root.preferencesGlobal = function() {
		$state.go('preferencesGlobal');
	};

	root.reload = function() {
		$state.reload();
	};


	// Global go. This should be in a better place TODO
	// We dont do a 'go' directive, to use the benefits of ng-touch with ng-click
	$rootScope.go = function(path, resetState) {
		var targetState = $state.get(path);
		if (resetState) $deepStateRedirect.reset(targetState.name);
		root.path(path);
	};

	$rootScope.openExternalLink = function(url, target) {
		root.openExternalLink(url, target);
	};


	function handleUri(uri){
		console.log("handleUri "+uri);
		require('intervaluecore/uri.js').parseUri(uri, {
			ifError: function(err){
				console.log(err);
				notification.error(err);
				//notification.success(gettextCatalog.getString('Success'), err);
			},
			ifOk: function(objRequest){
				console.log("request: "+JSON.stringify(objRequest));
				if (objRequest.type === 'address'){
					root.send(function(){
						$rootScope.$emit('paymentRequest', objRequest.address, objRequest.amount, objRequest.asset);
					});
				}
				else if (objRequest.type === 'pairing'){
					$rootScope.$emit('Local/CorrespondentInvitation', objRequest.pubkey, objRequest.hub, objRequest.pairing_secret);
				}
				else if (objRequest.type === 'auth'){
					authService.objRequest = objRequest;
					root.path('authConfirmation');
				}
				else if (objRequest.type === 'textcoin') {
					$rootScope.$emit('claimTextcoin', objRequest.mnemonic);
				}
				else
					throw Error('unknown url type: '+objRequest.type);
			}
		});
	}
	
	function extractInterValueArgFromCommandLine(commandLine){
		var conf = require('intervaluecore/conf.js');
		var re = new RegExp('^'+conf.program+':', 'i');
		var arrParts = commandLine.split(' '); // on windows includes exe and all args, on mac just our arg
		for (var i=0; i<arrParts.length; i++){
			var part = arrParts[i].trim();
			if (part.match(re))
				return part;
		}
		return null;
	}
	
	function registerWindowsProtocolHandler(){
		// now we do it in inno setup
	}
	
	function createLinuxDesktopFile(){
		console.log("will write .desktop file");
		var fs = require('fs'+'');
		var path = require('path'+'');
		var child_process = require('child_process'+'');
		var package = require('../package.json'+''); // relative to html root
		var applicationsDir = process.env.HOME + '/.local/share/applications';
		fileSystemService.recursiveMkdir(applicationsDir, parseInt('700', 8), function(err){
			console.log('mkdir applications: '+err);
			fs.writeFile(applicationsDir + '/' +package.name+'.desktop', "[Desktop Entry]\n\
Type=Application\n\
Version=1.0\n\
Name="+package.name+"\n\
Comment="+package.description+"\n\
Exec="+process.execPath.replace(/ /g, '\\ ')+" %u\n\
Icon="+path.dirname(process.execPath)+"/public/img/icons/icon-white-outline.iconset/icon_256x256.png\n\
Terminal=false\n\
Categories=Office;Finance;\n\
MimeType=x-scheme-handler/"+package.name+";\n\
X-Ubuntu-Touch=true\n\
X-Ubuntu-StageHint=SideStage\n", {mode: 0755}, function(err){
				if (err)
					throw Error("failed to write desktop file: "+err);
				child_process.exec('update-desktop-database ~/.local/share/applications', function(err){
					if (err)
						throw Error("failed to exec update-desktop-database: "+err);
					console.log(".desktop done");
				});
			});
		});
	}
	
	var gui;
	try{
		gui = require('nw.gui');
	}
	catch(e){
	}
	
	if (gui){ // nwjs
		var removeListenerForOnopen = $rootScope.$on('Local/BalanceUpdatedAndWalletUnlocked', function(){
			removeListenerForOnopen();
			gui.App.on('open', function(commandLine) {
				console.log("Open url: " + commandLine);
				if (commandLine){
					var file = extractInterValueArgFromCommandLine(commandLine);
					if (!file)
						return console.log("no intervalue: arg found");
					handleUri(file);
					gui.Window.get().focus();
				}
			});
		});
		console.log("argv: "+gui.App.argv);
		if (gui.App.argv[0]){
			// wait till the wallet fully loads
			var removeListener = $rootScope.$on('Local/BalanceUpdatedAndWalletUnlocked', function(){
				setTimeout(function(){
					handleUri(gui.App.argv[0]);
				}, 100);
				removeListener();
			});
		}
		if (process.platform === 'win32' || process.platform === 'linux'){
			// wait till the wallet fully loads
			var removeRegListener = $rootScope.$on('Local/BalanceUpdated', function(){
				setTimeout(function(){
					(process.platform === 'win32') ? registerWindowsProtocolHandler() : createLinuxDesktopFile();
					gui.desktop = process.env.HOME + '/.local/share/applications';
				}, 200);
				removeRegListener();
			});
		}
		/*var win = gui.Window.get();
		win.on('close', function(){
			console.log('close event');
			var db = require('intervaluecore/db.js');
			db.close(function(err){
				console.log('close err: '+err);
			});
			this.close(true);
		});*/
	}
	else if (window.cordova){
		//console.log("go service: setting temp handleOpenURL");
		//window.handleOpenURL = tempHandleUri;
		// wait till the wallet fully loads
		var removeListener = $rootScope.$on('Local/BalanceUpdatedAndWalletUnlocked', function(){
			console.log("setting permanent handleOpenURL");
			window.handleOpenURL = handleUri;
			if (window.open_url){ // use cached url at startup
				console.log("using cached open url "+window.open_url);
				setTimeout(function(){
					handleUri(window.open_url);
				}, 100);
			}
			removeListener();
		});
		/*
		document.addEventListener('backbutton', function() {
			console.log('doc backbutton');
			if (root.onBackButton)
				root.onBackButton();
		});*/
		document.addEventListener('resume', function() {
			console.log('resume');
			$rootScope.$emit('Local/Resume');
		}, false);
	}
   
	
	root.handleUri = handleUri;
	
	return root;
}).factory('$exceptionHandler', function($log){
	return function myExceptionHandler(exception, cause) {
		console.log("angular $exceptionHandler");
		$log.error(exception, cause);
		eventBus.emit('uncaught_error', "An exception occurred: "+exception+"; cause: "+cause, exception);
	};
});

function tempHandleUri(url){
	console.log("saving open url "+url);
	window.open_url = url;
}


console.log("parsing go.js");
if (window.cordova){
	// this is temporary, before angular starts
	console.log("go file: setting temp handleOpenURL");
	window.handleOpenURL = tempHandleUri;
}

window.onerror = function(msg, url, line, col, error){
	console.log("onerror");
	eventBus.emit('uncaught_error', "Javascript error: "+msg, error);
};

process.on('uncaughtException', function(e){
	console.log("uncaughtException");
	eventBus.emit('uncaught_error', "Uncaught exception: "+e, e);
});


'use strict';
var logs = [];
angular.module('copayApp.services')
  .factory('historicLog', function historicLog() {
    var root = {};

    root.add = function(level, msg) {
      logs.push({
        level: level,
        msg: msg,
      });
    };

    root.get = function() {
      return logs;
    };

    return root;
  });

'use strict';

angular.module('copayApp.services').value('isCordova',  window.cordova ? true : false);

'use strict';

// Detect mobile devices
var isMobile = {
  Android: function() {
    return !!navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function() {
    return !!navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function() {
    return !!navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function() {
    return !!navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function() {
    return !!navigator.userAgent.match(/IEMobile/i);
  },
  Safari: function() {
    return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
  },
  any: function() {
    return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
  }
};


angular.module('copayApp.services').value('isMobile', isMobile);

'use strict';

angular.module('copayApp.services')
  .factory('localStorageService', function($timeout) {
    var root = {};
    var ls = ((typeof window.localStorage !== "undefined") ? window.localStorage : null);

    if (!ls)
      throw new Error('localstorage not available');

    root.get = function(k, cb) {
        return cb(null, ls.getItem(k));
    };

    /**
     * Same as setItem, but fails if an item already exists
     */
    root.create = function(name, value, callback) {
      root.get(name,
        function(err, data) {
          if (data) {
            return callback('EEXISTS');
          } else {
            return root.set(name, value, callback);
          }
        });
    };

    root.set = function(k, v, cb) {
        ls.setItem(k, v);
        return cb();
    };

    root.remove = function(k, cb) {
        ls.removeItem(k);
        return cb();
    };

    return root;
  });

'use strict';
angular.module('copayApp.services')
  .factory('logHeader', function($log, isCordova, nodeWebkit) {
    $log.info('Starting InterValue v' + window.version + ' #' + window.commitHash);
    $log.info('Client: isCordova:', isCordova, 'isNodeWebkit:', nodeWebkit.isDefined());
    $log.info('Navigator:', navigator.userAgent);
    return {};
  });

'use strict';

var eventBus = require('intervaluecore/event_bus.js');

angular.module('copayApp.services')
.factory('newVersion', function($modal, $timeout, $rootScope){
  var root = {};
  root.shown = false;
  root.timerNextShow = false;

  eventBus.on('new_version', function(ws, data){
    root.version = data.version;
    if(!root.shown) {
      var modalInstance = $modal.open({
          templateUrl: 'views/modals/newVersionIsAvailable.html',
          controller: 'newVersionIsAvailable'
      });
      $rootScope.$on('closeModal', function() {
      	  modalInstance.dismiss('cancel');
      });
      root.shown = true;
      startTimerNextShow();
    }
  });

  function startTimerNextShow(){
    if (root.timerNextShow) $timeout.cancel(root.timerNextShow);
    root.timerNextShow = $timeout(function(){
      root.shown = false;
    }, 1000 * 60 * 60 * 24);
  }

  return root;
});

'use strict';

angular.module('copayApp.services').factory('nodeWebkit', function nodeWebkitFactory() {
  var root = {};

  var isNodeWebkit = function() {
    var isNode = (typeof process !== "undefined" && typeof require !== "undefined");
    if(isNode) {
      try {
        return (typeof require('nw.gui') !== "undefined");
      } catch(e) {
        return false;
      }
    }
  };
    

  root.isDefined = function() {
    return isNodeWebkit();
  };

  root.readFromClipboard = function() {
    if (!isNodeWebkit()) return;
    var gui = require('nw.gui');
    var clipboard = gui.Clipboard.get();
    return clipboard.get();
  };

  root.writeToClipboard = function(text) {
    if (!isNodeWebkit()) return;
    var gui = require('nw.gui');
    var clipboard = gui.Clipboard.get();
    return clipboard.set(text);
  };

  root.openExternalLink = function(url) {
    if (!isNodeWebkit()) return;
    var gui = require('nw.gui');
    return gui.Shell.openExternal(url);
  };

  return root;
});

'use strict';

angular.module('copayApp.services').
factory('notification', ['$timeout',
  function($timeout) {

    var notifications = [];

    /*
    ls.getItem('notifications', function(err, data) {
      if (data) {
        notifications = JSON.parse(data);
      }
    });
    */

    var queue = [];
    var settings = {
      info: {
        duration: 6000,
        enabled: true
      },
      funds: {
        duration: 7000,
        enabled: true
      },
      version: {
        duration: 60000,
        enabled: true
      },
      warning: {
        duration: 7000,
        enabled: true
      },
      error: {
        duration: 7000,
        enabled: true
      },
      success: {
        duration: 5000,
        enabled: true
      },
      progress: {
        duration: 0,
        enabled: true
      },
      custom: {
        duration: 35000,
        enabled: true
      },
      details: true,
      localStorage: false,
      html5Mode: false,
      html5DefaultIcon: 'img/icons/favicon-white.ico'
    };

    function html5Notify(icon, title, content, ondisplay, onclose) {
      if (window.webkitNotifications && window.webkitNotifications.checkPermission() === 0) {
        if (!icon) {
          icon = 'img/icons/favicon-white.ico';
        }
        var noti = window.webkitNotifications.createNotification(icon, title, content);
        if (typeof ondisplay === 'function') {
          noti.ondisplay = ondisplay;
        }
        if (typeof onclose === 'function') {
          noti.onclose = onclose;
        }
        noti.show();
      } else {
        settings.html5Mode = false;
      }
    }


    return {

      /* ========== SETTINGS RELATED METHODS =============*/

      disableHtml5Mode: function() {
        settings.html5Mode = false;
      },

      disableType: function(notificationType) {
        settings[notificationType].enabled = false;
      },

      enableHtml5Mode: function() {
        // settings.html5Mode = true;
        settings.html5Mode = this.requestHtml5ModePermissions();
      },

      enableType: function(notificationType) {
        settings[notificationType].enabled = true;
      },

      getSettings: function() {
        return settings;
      },

      toggleType: function(notificationType) {
        settings[notificationType].enabled = !settings[notificationType].enabled;
      },

      toggleHtml5Mode: function() {
        settings.html5Mode = !settings.html5Mode;
      },

      requestHtml5ModePermissions: function() {
        if (window.webkitNotifications) {
          if (window.webkitNotifications.checkPermission() === 0) {
            return true;
          } else {
            window.webkitNotifications.requestPermission(function() {
              if (window.webkitNotifications.checkPermission() === 0) {
                settings.html5Mode = true;
              } else {
                settings.html5Mode = false;
              }
            });
            return false;
          }
        } else {
          return false;
        }
      },


      /* ============ QUERYING RELATED METHODS ============*/

      getAll: function() {
        // Returns all notifications that are currently stored
        return notifications;
      },

      getQueue: function() {
        return queue;
      },

      /* ============== NOTIFICATION METHODS ==============*/

      info: function(title, content, userData) {
        return this.awesomeNotify('info', 'fi-info', title, content, userData);
      },

      funds: function(title, content, userData) {
        return this.awesomeNotify('funds', 'icon-receive', title, content, userData);
      },

      version: function(title, content, severe) {
        return this.awesomeNotify('version', severe ? 'fi-alert' : 'fi-flag', title, content);
      },

      error: function(title, content, userData) {
        return this.awesomeNotify('error', 'fi-x', title, content, userData);
      },

      success: function(title, content, userData) {
        return this.awesomeNotify('success', 'fi-check', title, content, userData);
      },

      warning: function(title, content, userData) {
        return this.awesomeNotify('warning', 'fi-alert', title, content, userData);
      },

      new: function(title, content, userData) {
        return this.awesomeNotify('warning', 'fi-plus', title, content, userData);
      },

      sent: function(title, content, userData) {
        return this.awesomeNotify('warning', 'icon-paperplane', title, content, userData);
      },

      awesomeNotify: function(type, icon, title, content, userData) {
        /**
         * Supposed to wrap the makeNotification method for drawing icons using font-awesome
         * rather than an image.
         *
         * Need to find out how I'm going to make the API take either an image
         * resource, or a font-awesome icon and then display either of them.
         * Also should probably provide some bits of color, could do the coloring
         * through classes.
         */
        // image = '<i class="icon-' + image + '"></i>';
        return this.makeNotification(type, false, icon, title, content, userData);
      },

      notify: function(image, title, content, userData) {
        // Wraps the makeNotification method for displaying notifications with images
        // rather than icons
        return this.makeNotification('custom', image, true, title, content, userData);
      },

      makeNotification: function(type, image, icon, title, content, userData) {
        var notification = {
          'type': type,
          'image': image,
          'icon': icon,
          'title': title,
          'content': content,
          'timestamp': +new Date(),
          'userData': userData
        };

        notifications.push(notification);

        if (settings.html5Mode) {
          html5Notify(image, title, content, function() {
            // inner on display function
          }, function() {
            // inner on close function
          });
        }

        //this is done because html5Notify() changes the variable settings.html5Mode
        if (!settings.html5Mode) {
          queue.push(notification);
          $timeout(function removeFromQueueTimeout() {
            queue.splice(queue.indexOf(notification), 1);
          }, settings[type].duration);
        }

        // Mobile notification
        if (window && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([200, 100, 200]);
        };

        if (document.hidden && (type == 'info' || type == 'funds')) {
          new window.Notification(title, {
            body: content,
            icon: 'img/notification.png'
          });
        }

        this.save();
        return notification;
      },


      /* ============ PERSISTENCE METHODS ============ */

      save: function() {
        // Save all the notifications into localStorage
        if (settings.localStorage) {
          localStorage.setItem('notifications', JSON.stringify(notifications));
        }
      },

      restore: function() {
        // Load all notifications from localStorage
      },

      clear: function() {
        notifications = [];
        this.save();
      }

    };
  }
]).directive('notifications', function(notification, $compile) {
  /**
   *
   * It should also parse the arguments passed to it that specify
   * its position on the screen like "bottom right" and apply those
   * positions as a class to the container element
   *
   * Finally, the directive should have its own controller for
   * handling all of the notifications from the notification service
   */
  function link(scope, element, attrs) {
    var position = attrs.notifications;
    position = position.split(' ');
    element.addClass('dr-notification-container');
    for (var i = 0; i < position.length; i++) {
      element.addClass(position[i]);
    }
  }

  return {
    restrict: 'A',
    scope: {},
    templateUrl: 'views/includes/notifications.html',
    link: link,
    controller: ['$scope',
      function NotificationsCtrl($scope) {
        $scope.queue = notification.getQueue();

        $scope.removeNotification = function(noti) {
          $scope.queue.splice($scope.queue.indexOf(noti), 1);
        };
      }
    ]

  };
});

'use strict';

var breadcrumbs = require('intervaluecore/breadcrumbs.js');
var constants = require('intervaluecore/constants.js');

angular.module('copayApp.services')
    .factory('profileService', function profileServiceFactory($rootScope, $location, $timeout, $filter, $log, lodash, storageService, bwcService, configService, pushNotificationsService, isCordova, gettext, gettextCatalog, nodeWebkit, uxLanguage) {

        var root = {};

        root.profile = null;
        root.focusedClient = null;
        root.walletClients = {};

        root.assetMetadata = {};

        root.Utils = bwcService.getUtils();

        root.formatAmount = function (amount, asset, opts) {
            var config = configService.getSync().wallet.settings;
            //if (config.unitCode == 'byte') return amount;

            //TODO : now only works for english, specify opts to change thousand separator and decimal separator
            if (asset === 'blackbytes' || asset === constants.BLACKBYTES_ASSET)
                return this.Utils.formatAmount(amount, config.bbUnitCode, opts);
            else if (asset === 'base' || asset === 'bytes')
                return this.Utils.formatAmount(amount, config.unitCode, opts);
            else if (root.assetMetadata[asset]) {
                var decimals = root.assetMetadata[asset].decimals || 0;
                return (amount / Math.pow(10, decimals)).toLocaleString([], {maximumFractionDigits: decimals});
            }
            else
                return amount;
        };
        //
        root.formatAmountWithUnit = function (amount, asset, opts) {
            return root.formatAmount(amount, asset, opts) + ' ' + root.getUnitName(asset);
        };
        //
        root.formatAmountWithUnitIfShort = function (amount, asset, opts) {
            var str = root.formatAmount(amount, asset, opts);
            var unit = root.getUnitName(asset);
            if (unit.length <= 8)
                str += ' ' + unit;
            return str;
        };

        //
        root.getUnitName = function (asset) {
            var config = configService.getSync().wallet.settings;
            if (asset === 'blackbytes' || asset === constants.BLACKBYTES_ASSET)
                return config.bbUnitName;
            else if (asset === 'base' || asset === 'bytes')
                return config.unitName.toUpperCase();
            else if (root.assetMetadata[asset])
                return root.assetMetadata[asset].name;
            else
                return "of " + asset;
        };

        //
        root.getAmountInSmallestUnits = function (amount, asset) {
            var config = configService.getSync().wallet.settings;
            if (asset === 'base')
                amount *= config.unitValue;     //
            else if (asset === constants.BLACKBYTES_ASSET)
                amount *= config.bbUnitValue;   //
            else if (root.assetMetadata[asset])
                amount *= Math.pow(10, root.assetMetadata[asset].decimals || 0);
            return Math.round(amount);
        };

        //
        root.getAmountInDisplayUnits = function (amount, asset) {
            var config = configService.getSync().wallet.settings;
            if (asset === 'base')
                amount /= config.unitValue;
            else if (asset === constants.BLACKBYTES_ASSET)
                amount /= config.bbUnitValue;
            else if (root.assetMetadata[asset])
                amount /= Math.pow(10, root.assetMetadata[asset].decimals || 0);
            return amount;
        };

        root._setFocus = function (walletId, cb) {
            $log.debug('Set focus:', walletId);

            // Set local object
            if (walletId)
                root.focusedClient = root.walletClients[walletId];
            else
                root.focusedClient = [];

            if (lodash.isEmpty(root.focusedClient)) {
                root.focusedClient = root.walletClients[lodash.keys(root.walletClients)[0]];
            }

            // Still nothing?
            if (lodash.isEmpty(root.focusedClient)) {
                $rootScope.$emit('Local/NoWallets');
            } else {
                $rootScope.$emit('Local/NewFocusedWallet');
            }

            return cb();
        };

        root.setAndStoreFocus = function (walletId, cb) {
            root._setFocus(walletId, function () {
                storageService.storeFocusedWalletId(walletId, cb);
            });
        };

        root.setWalletClient = function (credentials) {
            if (root.walletClients[credentials.walletId] && root.walletClients[credentials.walletId].started)
                return;

            var client = bwcService.getClient(JSON.stringify(credentials));

            client.credentials.xPrivKey = root.profile.xPrivKey;
            client.credentials.mnemonic = root.profile.mnemonic;
            client.credentials.xPrivKeyEncrypted = root.profile.xPrivKeyEncrypted;
            client.credentials.mnemonicEncrypted = root.profile.mnemonicEncrypted;

            root.walletClients[credentials.walletId] = client;

            root.walletClients[credentials.walletId].started = true;

            client.initialize({}, function (err) {
                if (err) {
                    // impossible
                    return;
                }
            });
        };

        root.setWalletClients = function () {
            var credentials = root.profile.credentials;
            lodash.each(credentials, function (credentials) {
                root.setWalletClient(credentials);
            });
            $rootScope.$emit('Local/WalletListUpdated');
        };


        function saveTempKeys(tempDeviceKey, prevTempDeviceKey, onDone) {
            $timeout(function () {
                console.log("will save temp device keys");//, tempDeviceKey, prevTempDeviceKey);
                root.profile.tempDeviceKey = tempDeviceKey.toString('base64');
                if (prevTempDeviceKey)
                    root.profile.prevTempDeviceKey = prevTempDeviceKey.toString('base64');
                storageService.storeProfile(root.profile, function (err) {
                    onDone(err);
                });
            });
        }

        function unlockWalletAndInitDevice() {
            // wait till the wallet fully loads
            breadcrumbs.add('unlockWalletAndInitDevice');
            //Hide the mainSection
            var mainSectionElement = angular.element(document.querySelector('#mainSection'));
            mainSectionElement.css('visibility', 'hidden');

            var removeListener = $rootScope.$on('Local/BalanceUpdated', function () {
                removeListener();
                breadcrumbs.add('unlockWalletAndInitDevice BalanceUpdated');
                root.insistUnlockFC(null, function () {
                    breadcrumbs.add('unlockWalletAndInitDevice unlocked');

                    //After unlock, make mainSection visible again
                    var mainSectionElement = angular.element(document.querySelector('#mainSection'));
                    mainSectionElement.css('visibility', 'visible');

                    if (!root.focusedClient.credentials.xPrivKey)
                        throw Error("xPrivKey still not set after unlock");
                    console.log('unlocked: ' + root.focusedClient.credentials.xPrivKey);
                    var config = configService.getSync();
                    root.focusedClient.initDeviceProperties(
                        root.focusedClient.credentials.xPrivKey, root.profile.my_device_address, config.hub, config.deviceName);
                    $rootScope.$emit('Local/BalanceUpdatedAndWalletUnlocked');
                });
            });
        }

        root.bindProfile = function (profile, cb) {
            breadcrumbs.add('bindProfile');
            root.profile = profile;
            configService.get(function (err) {
                $log.debug('Preferences read');
                if (err)
                    return cb(err);
                root.setWalletClients();
                storageService.getFocusedWalletId(function (err, focusedWalletId) {
                    if (err)
                        return cb(err);
                    root._setFocus(focusedWalletId, function () {
                        console.log("focusedWalletId", focusedWalletId);
                        var Wallet = require('intervaluecore/wallet.js');
                        var device = require('intervaluecore/device.js');
                        var config = configService.getSync();
                        var firstWc = root.walletClients[lodash.keys(root.walletClients)[0]];
                        if (root.profile.xPrivKeyEncrypted) {
                            console.log('priv key is encrypted, will wait for UI and request password');
                            // assuming bindProfile is called on encrypted keys only at program startup
                            unlockWalletAndInitDevice();
                            device.setDeviceAddress(root.profile.my_device_address);
                        }
                        else if (root.profile.xPrivKey)
                            root.focusedClient.initDeviceProperties(profile.xPrivKey, root.profile.my_device_address, config.hub, config.deviceName);
                        else
                            throw Error("neither xPrivKey nor xPrivKeyEncrypted");
                        //var tempDeviceKey = device.genPrivKey();
                        //saveTempKeys(tempDeviceKey, null, function(){});
                        var tempDeviceKey = Buffer.from(profile.tempDeviceKey, 'base64');
                        var prevTempDeviceKey = profile.prevTempDeviceKey ? Buffer.from(profile.prevTempDeviceKey, 'base64') : null;
                        device.setTempKeys(tempDeviceKey, prevTempDeviceKey, saveTempKeys);
                        $rootScope.$emit('Local/ProfileBound');
                        Wallet.readAssetMetadata(null, function (assocAssetMetadata) {
                            for (var asset in assocAssetMetadata) {
                                if (!root.assetMetadata[asset])
                                    root.assetMetadata[asset] = assocAssetMetadata[asset];
                            }
                        });
                        return cb();
                    });
                });
            });
        };

        root.loadAndBindProfile = function (cb) {
            breadcrumbs.add('loadAndBindProfile');
            storageService.getDisclaimerFlag(function (err, val) {
                if (!val) {
                    breadcrumbs.add('Non agreed disclaimer');
                    return cb(new Error('NONAGREEDDISCLAIMER: Non agreed disclaimer'));
                } else {
                    storageService.getProfile(function (err, profile) {
                        if (err) {
                            $rootScope.$emit('Local/DeviceError', err);
                            return cb(err);
                        }
                        if (!profile) {
                            breadcrumbs.add('no profile');
                            return cb(new Error('NOPROFILE: No profile'));
                        } else {
                            $log.debug('Profile read');
                            return root.bindProfile(profile, cb);
                        }

                    });
                }
            });
        };


        root._seedWallet = function (opts, cb) {
            opts = opts || {};

            var walletClient = bwcService.getClient();
            var network = opts.networkName || 'livenet';


            if (opts.mnemonic) {
                try {
                    opts.mnemonic = root._normalizeMnemonic(opts.mnemonic);
                    walletClient.seedFromMnemonic(opts.mnemonic, {
                        network: network,
                        passphrase: opts.passphrase,
                        account: opts.account || 0,
                        derivationStrategy: opts.derivationStrategy || 'BIP44',
                    });

                } catch (ex) {
                    $log.info(ex);
                    return cb(gettext('Could not create: Invalid wallet seed'));
                }
            } else if (opts.extendedPrivateKey) {
                try {
                    walletClient.seedFromExtendedPrivateKey(opts.extendedPrivateKey, opts.account || 0);
                } catch (ex) {
                    $log.warn(ex);
                    return cb(gettext('Could not create using the specified extended private key'));
                }
            } else if (opts.extendedPublicKey) {
                try {
                    walletClient.seedFromExtendedPublicKey(opts.extendedPublicKey, opts.externalSource, opts.entropySource, {
                        account: opts.account || 0,
                        derivationStrategy: opts.derivationStrategy || 'BIP44',
                    });
                } catch (ex) {
                    $log.warn("Creating wallet from Extended Public Key Arg:", ex, opts);
                    return cb(gettext('Could not create using the specified extended public key'));
                }
            } else {
                var lang = uxLanguage.getCurrentLanguage();
                console.log("will seedFromRandomWithMnemonic for language " + lang);
                try {
                    walletClient.seedFromRandomWithMnemonic({
                        network: network,
                        passphrase: opts.passphrase,
                        language: lang,
                        account: opts.account || 0,
                    });
                } catch (e) {
                    $log.info('Error creating seed: ' + e.message);
                    if (e.message.indexOf('language') > 0) {
                        $log.info('Using default language for mnemonic');
                        walletClient.seedFromRandomWithMnemonic({
                            network: network,
                            passphrase: opts.passphrase,
                            account: opts.account || 0,
                        });
                    } else {
                        return cb(e);
                    }
                }
            }
            return cb(null, walletClient);
        };


        root._createNewProfile = function (opts, cb) {
            console.log("_createNewProfile");
            if (opts.noWallet)
                return cb(null, Profile.create());
            root._seedWallet({}, function (err, walletClient) {
                if (err)
                    return cb(err);
                var config = configService.getSync();
                require('intervaluecore/wallet.js'); // load hub/ message handlers
                var device = require('intervaluecore/device.js');
                var tempDeviceKey = device.genPrivKey();
                // initDeviceProperties sets my_device_address needed by walletClient.createWallet
                walletClient.initDeviceProperties(walletClient.credentials.xPrivKey, null, config.hub, config.deviceName);
                var walletName = gettextCatalog.getString('InterValue');     //默认钱包名称
                walletClient.createWallet(walletName, 1, 1, {
                    //	isSingleAddress: true,
                    network: 'livenet'
                }, function (err) {
                    if (err)
                        return cb(gettext('Error creating wallet') + ": " + err);
                    console.log("created wallet, client: ", JSON.stringify(walletClient));
                    var xPrivKey = walletClient.credentials.xPrivKey;
                    var mnemonic = walletClient.credentials.mnemonic;
                    console.log("mnemonic: " + mnemonic + ', xPrivKey: ' + xPrivKey);
                    var p = Profile.create({
                        credentials: [JSON.parse(walletClient.export())],
                        xPrivKey: xPrivKey,
                        mnemonic: mnemonic,
                        tempDeviceKey: tempDeviceKey.toString('base64'),
                        my_device_address: device.getMyDeviceAddress()
                    });
                    device.setTempKeys(tempDeviceKey, null, saveTempKeys);
                    return cb(null, p);
                });
            });
        };

        // create additional wallet (the first wallet is created in _createNewProfile())
        root.createWallet = function (opts, cb) {
            $log.debug('Creating Wallet:', opts);
            if (!root.focusedClient.credentials.xPrivKey) { // locked
                root.unlockFC(null, function (err) {
                    if (err)
                        return cb(err.message);
                    root.createWallet(opts, cb);
                });
                return console.log('need password to create new wallet');
            }
            var walletDefinedByKeys = require('intervaluecore/wallet_defined_by_keys.js');
            walletDefinedByKeys.readNextAccount(function (account) {
                console.log("next account = " + account);
                if (!opts.extendedPrivateKey && !opts.mnemonic) {
                    if (!root.focusedClient.credentials.xPrivKey)
                        throw Error("no root.focusedClient.credentials.xPrivKey");
                    $log.debug("reusing xPrivKey from focused client");
                    opts.extendedPrivateKey = root.focusedClient.credentials.xPrivKey;
                    opts.mnemonic = root.profile.mnemonic;
                    opts.account = account;
                }
                root._seedWallet(opts, function (err, walletClient) {
                    if (err)
                        return cb(err);

                    walletClient.createWallet(opts.name, opts.m, opts.n, {
                        network: opts.networkName,
                        account: opts.account,
                        cosigners: opts.cosigners,
                        isSingleAddress: opts.isSingleAddress
                    }, function (err) {
                        $timeout(function () {
                            if (err)
                                return cb(gettext('Error creating wallet') + ": " + err);
                            root._addWalletClient(walletClient, opts, cb);
                        });
                    });
                });
            });
        };


        root.getClient = function (walletId) {
            return root.walletClients[walletId];
        };

        root.deleteWallet = function (opts, cb) {
            var client = opts.client || root.focusedClient;
            var walletId = client.credentials.walletId;
            $log.debug('Deleting Wallet:', client.credentials.walletName);
            breadcrumbs.add('Deleting Wallet: ' + client.credentials.walletName);

            root.profile.credentials = lodash.reject(root.profile.credentials, {
                walletId: walletId
            });

            delete root.walletClients[walletId];
            root.focusedClient = null;

            storageService.clearBackupFlag(walletId, function (err) {
                if (err) $log.warn(err);
            });

            $timeout(function () {
                root.setWalletClients();
                root.setAndStoreFocus(null, function () {
                    storageService.storeProfile(root.profile, function (err) {
                        if (err) return cb(err);
                        return cb();
                    });
                });
            });
        };

        root.setMetaData = function (walletClient, addressBook, cb) {
            storageService.getAddressbook(walletClient.credentials.network, function (err, localAddressBook) {
                var localAddressBook1 = {};
                try {
                    localAddressBook1 = JSON.parse(localAddressBook);
                } catch (ex) {
                    $log.warn(ex);
                }
                var mergeAddressBook = lodash.merge(addressBook, localAddressBook1);
                storageService.setAddressbook(walletClient.credentials.network, JSON.stringify(addressBook), function (err) {
                    if (err) return cb(err);
                    return cb(null);
                });
            });
        }

        root._addWalletClient = function (walletClient, opts, cb) {
            var walletId = walletClient.credentials.walletId;

            // check if exists
            var w = lodash.find(root.profile.credentials, {'walletId': walletId});
            if (w)
                return cb(gettext('Wallet already in InterValue' + ": ") + w.walletName);

            root.profile.credentials.push(JSON.parse(walletClient.export()));
            root.setWalletClients();

            // assign wallet color based on first character of walletId
            var color = configService.colorOpts[walletId.charCodeAt(0) % configService.colorOpts.length];
            var configOpts = {colorFor: {}};
            configOpts.colorFor[walletId] = color;
            configService.set(configOpts, function (err) {
                root.setAndStoreFocus(walletId, function () {
                    storageService.storeProfile(root.profile, function (err) {
                        var config = configService.getSync();
                        return cb(err, walletId);
                    });
                });
            });
        };


        root.importWallet = function (str, opts, cb) {

            var walletClient = bwcService.getClient();

            $log.debug('Importing Wallet:', opts);
            try {
                walletClient.import(str, {
                    compressed: opts.compressed,
                    password: opts.password
                });
            } catch (err) {
                return cb(gettext('Could not import. Check input file and password'));
            }

            str = JSON.parse(str);

            var addressBook = str.addressBook || {};

            root._addWalletClient(walletClient, opts, function (err, walletId) {
                if (err) return cb(err);
                root.setMetaData(walletClient, addressBook, function (error) {
                    if (error) console.log(error);
                    return cb(err, walletId);
                });
            });
        };


        root.importExtendedPrivateKey = function (xPrivKey, opts, cb) {
            var walletClient = bwcService.getClient();
            $log.debug('Importing Wallet xPrivKey');

            walletClient.importFromExtendedPrivateKey(xPrivKey, function (err) {
                if (err)
                    return cb(gettext('Could not import') + ": " + err);

                root._addWalletClient(walletClient, opts, cb);
            });
        };

        root._normalizeMnemonic = function (words) {
            var isJA = words.indexOf('\u3000') > -1;
            var wordList = words.split(/[\u3000\s]+/);

            return wordList.join(isJA ? '\u3000' : ' ');
        };


        root.importMnemonic = function (words, opts, cb) {

            var walletClient = bwcService.getClient();

            $log.debug('Importing Wallet Mnemonic');

            words = root._normalizeMnemonic(words);
            walletClient.importFromMnemonic(words, {
                network: opts.networkName,
                passphrase: opts.passphrase,
                account: opts.account || 0,
            }, function (err) {
                if (err)
                    return cb(gettext('Could not import') + ": " + err);

                root._addWalletClient(walletClient, opts, cb);
            });
        };


        root.importExtendedPublicKey = function (opts, cb) {

            var walletClient = bwcService.getClient();
            $log.debug('Importing Wallet XPubKey');

            walletClient.importFromExtendedPublicKey(opts.extendedPublicKey, opts.externalSource, opts.entropySource, {
                account: opts.account || 0,
                derivationStrategy: opts.derivationStrategy || 'BIP44',
            }, function (err) {
                if (err) {

                    // in HW wallets, req key is always the same. They can't addAccess.
                    if (err.code == 'NOT_AUTHORIZED')
                        err.code = 'WALLET_DOES_NOT_EXIST';

                    return cb(gettext('Could not import') + ": " + err);
                }

                root._addWalletClient(walletClient, opts, cb);
            });
        };


        root.create = function (opts, cb) {
            $log.info('Creating profile', opts);
            var defaults = configService.getDefaults();

            configService.get(function (err) {
                root._createNewProfile(opts, function (err, p) {
                    if (err) return cb(err);

                    root.bindProfile(p, function (err) {
                        storageService.storeNewProfile(p, function (err) {
                            root.setSingleAddressFlag(true);
                            return cb(err);
                        });
                    });
                });
            });
        };


        root.updateCredentialsFC = function (cb) {
            var fc = root.focusedClient;

            var newCredentials = lodash.reject(root.profile.credentials, {
                walletId: fc.credentials.walletId
            });
            newCredentials.push(JSON.parse(fc.export()));
            root.profile.credentials = newCredentials;
            //root.profile.my_device_address = device.getMyDeviceAddress();

            storageService.storeProfile(root.profile, cb);
        };

        root.clearMnemonic = function (cb) {
            delete root.profile.mnemonic;
            delete root.profile.mnemonicEncrypted;
            for (var wid in root.walletClients)
                root.walletClients[wid].clearMnemonic();
            storageService.storeProfile(root.profile, cb);
        };

        root.setPrivateKeyEncryptionFC = function (password, cb) {
            var fc = root.focusedClient;
            $log.debug('Encrypting private key for', fc.credentials.walletName);

            fc.setPrivateKeyEncryption(password);
            if (!fc.credentials.xPrivKeyEncrypted)
                throw Error("no xPrivKeyEncrypted after setting encryption");
            root.profile.xPrivKeyEncrypted = fc.credentials.xPrivKeyEncrypted;
            root.profile.mnemonicEncrypted = fc.credentials.mnemonicEncrypted;
            delete root.profile.xPrivKey;
            delete root.profile.mnemonic;
            root.lockFC();
            for (var wid in root.walletClients) {
                root.walletClients[wid].credentials.xPrivKeyEncrypted = root.profile.xPrivKeyEncrypted;
                delete root.walletClients[wid].credentials.xPrivKey;
            }
            storageService.storeProfile(root.profile, function () {
                $log.debug('Wallet encrypted');
                return cb();
            });
            /*root.updateCredentialsFC(function() {
                $log.debug('Wallet encrypted');
                    return cb();
            });*/
        };


        root.disablePrivateKeyEncryptionFC = function (cb) {
            var fc = root.focusedClient;
            $log.debug('Disabling private key encryption for', fc.credentials.walletName);

            try {
                fc.disablePrivateKeyEncryption();
            } catch (e) {
                return cb(e);
            }
            if (!fc.credentials.xPrivKey)
                throw Error("no xPrivKey after disabling encryption");
            root.profile.xPrivKey = fc.credentials.xPrivKey;
            root.profile.mnemonic = fc.credentials.mnemonic;
            delete root.profile.xPrivKeyEncrypted;
            delete root.profile.mnemonicEncrypted;
            for (var wid in root.walletClients) {
                root.walletClients[wid].credentials.xPrivKey = root.profile.xPrivKey;
                delete root.walletClients[wid].credentials.xPrivKeyEncrypted;
            }
            storageService.storeProfile(root.profile, function () {
                $log.debug('Wallet encryption disabled');
                return cb();
            });
            /*root.updateCredentialsFC(function() {
                $log.debug('Wallet encryption disabled');
                    return cb();
            });*/
        };

        root.lockFC = function () {
            var fc = root.focusedClient;
            try {
                fc.lock();
            } catch (e) {
            }
            ;
        };

        root.unlockFC = function (error_message, cb) {
            $log.debug('Wallet is encrypted');
            $rootScope.$emit('Local/NeedsPassword', false, error_message, function (err2, password) {
                if (err2 || !password) {
                    return cb({
                        message: (err2 || gettext('Password needed'))
                    });
                }
                var fc = root.focusedClient;
                try {
                    fc.unlock(password);
                    breadcrumbs.add('unlocked ' + fc.credentials.walletId);
                } catch (e) {
                    $log.debug(e);
                    return cb({
                        message: gettext('Wrong password')
                    });
                }
                var autolock = function () {
                    if (root.bKeepUnlocked) {
                        console.log("keeping unlocked");
                        breadcrumbs.add("keeping unlocked");
                        $timeout(autolock, 30 * 1000);
                        return;
                    }
                    console.log('time to auto-lock wallet', fc.credentials);
                    if (fc.hasPrivKeyEncrypted()) {
                        $log.debug('Locking wallet automatically');
                        try {
                            fc.lock();
                            breadcrumbs.add('locked ' + fc.credentials.walletId);
                        } catch (e) {
                        }
                        ;
                    }
                    ;
                };
                $timeout(autolock, 30 * 1000);
                return cb();
            });
        };

        // continue to request password until the correct password is entered
        root.insistUnlockFC = function (error_message, cb) {
            root.unlockFC(error_message, function (err) {
                if (!err)
                    return cb();
                $timeout(function () {
                    root.insistUnlockFC(err.message, cb);
                }, 1000);
            });
        };

        root.getWallets = function (network) {
            if (!root.profile) return [];

            var config = configService.getSync();
            config.colorFor = config.colorFor || {};
            config.aliasFor = config.aliasFor || {};
            var ret = lodash.map(root.profile.credentials, function (c) {
                return {
                    m: c.m,
                    n: c.n,
                    is_complete: (c.publicKeyRing && c.publicKeyRing.length === c.n),
                    name: config.aliasFor[c.walletId] || c.walletName,
                    id: c.walletId,
                    network: c.network,
                    color: config.colorFor[c.walletId] || '#2C3E50'
                };
            });
            ret = lodash.filter(ret, function (w) {
                return (w.network == network && w.is_complete);
            });
            return lodash.sortBy(ret, 'name');
        };


        root.requestTouchid = function (cb) {
            var fc = root.focusedClient;
            var config = configService.getSync();
            config.touchIdFor = config.touchIdFor || {};
            if (window.touchidAvailable && config.touchIdFor[fc.credentials.walletId])
                $rootScope.$emit('Local/RequestTouchid', cb);
            else
                return cb();
        };

        root.replaceProfile = function (xPrivKey, mnemonic, myDeviceAddress, cb) {
            var device = require('intervaluecore/device.js');

            root.profile.credentials = [];
            root.profile.xPrivKey = xPrivKey;
            root.profile.mnemonic = mnemonic;
            root.profile.my_device_address = myDeviceAddress;
            device.setNewDeviceAddress(myDeviceAddress);

            storageService.storeProfile(root.profile, function () {
                return cb();
            });
        };

        root.setSingleAddressFlag = function (newValue) {
            var fc = root.focusedClient;
            fc.isSingleAddress = newValue;
            var walletId = fc.credentials.walletId;
            var config = configService.getSync();
            var oldValue = config.isSingleAddress || false;

            var opts = {
                isSingleAddress: {}
            };
            opts.isSingleAddress[walletId] = newValue;
            configService.set(opts, function (err) {
                if (err) {
                    fc.isSingleAddress = oldValue;
                    $rootScope.$emit('Local/DeviceError', err);
                    return;
                }
                $rootScope.$emit('Local/SingleAddressFlagUpdated');
            });
        }


        return root;
    });

'use strict';
angular.module('copayApp.services')
.factory('pushNotificationsService', function($http, $rootScope, $log, isMobile, $timeout, storageService, configService, lodash, isCordova) {
	var root = {};
	var defaults = configService.getDefaults();
	var usePushNotifications = isCordova && !isMobile.Windows() && isMobile.Android();
	var projectNumber;
	var _ws;
	
	var eventBus = require('intervaluecore/event_bus.js');	
	
	function sendRequestEnableNotification(ws, registrationId) {
		var network = require('intervaluecore/network.js');
		network.sendRequest(ws, 'hub/enable_notification', registrationId, false, function(ws, request, response) {
			if (!response || (response && response !== 'ok')) return $log.error('Error sending push info');
		});
	}
	
	window.onNotification = function(data) {
		if (data.event === 'registered') {
			storageService.setPushInfo(projectNumber, data.regid, true, function() {
				sendRequestEnableNotification(_ws, data.regid);
			});
		}
		else {
			return false;
		}
	};
	
	eventBus.on('receivedPushProjectNumber', function(ws, data) {
		if (!usePushNotifications) return;
		_ws = ws;
		if (data && data.projectNumber !== undefined) {
			$timeout(function(){
				storageService.getPushInfo(function(err, pushInfo) {
					var config = configService.getSync();
					projectNumber = data.projectNumber + "";
					if (pushInfo && projectNumber === "0") {
						root.pushNotificationsUnregister(function() {

						});
					}
					else if (projectNumber && config.pushNotifications.enabled) {
						root.pushNotificationsInit();
					}
				});
			});
		}
	});
	
	root.pushNotificationsInit = function() {
		if (!usePushNotifications) return;
		
		window.plugins.pushNotification.register(function(data) {
			},
			function(e) {
				alert('err= ' + e);
			}, {
				"senderID": projectNumber,
				"ecb": "onNotification"
			});
		
		configService.set({pushNotifications: {enabled: true}}, function(err) {
			if (err) $log.debug(err);
		});
	};
	
	function disable_notification() {
		storageService.getPushInfo(function(err, pushInfo) {
			storageService.removePushInfo(function() {
				var network = require('intervaluecore/network.js');
				network.sendRequest(_ws, 'hub/disable_notification', pushInfo.registrationId, false, function(ws, request, response) {
					if (!response || (response && response !== 'ok')) return $log.error('Error sending push info');
				});
			});
		});
		configService.set({pushNotifications: {enabled: false}}, function(err) {
			if (err) $log.debug(err);
		});
	}
	
	root.pushNotificationsUnregister = function() {
		if (!usePushNotifications) return;
		window.plugins.pushNotification.unregister(function() {
			disable_notification();
		}, function() {
			disable_notification();
		});
	};
	
	return root;
	
});

'use strict';
angular.module('copayApp.services')
  .factory('sjcl', function bitcoreFactory(bwcService) {
    var sjcl = bwcService.getSJCL();
    return sjcl;
  });

'use strict';
angular.module('copayApp.services')
  .factory('storageService', function(logHeader, fileStorageService, localStorageService, sjcl, $log, lodash, isCordova) {

    var root = {};

    // File storage is not supported for writting according to 
    // https://github.com/apache/cordova-plugin-file/#supported-platforms
    var shouldUseFileStorage = isCordova && !isMobile.Windows();
    $log.debug('Using file storage:', shouldUseFileStorage);


    var storage = shouldUseFileStorage ? fileStorageService : localStorageService;

    var getUUID = function(cb) {
      // TO SIMULATE MOBILE
      //return cb('hola');
      if (!window || !window.plugins || !window.plugins.uniqueDeviceID)
        return cb(null);

      window.plugins.uniqueDeviceID.get(
        function(uuid) {
          return cb(uuid);
        }, cb);
    };

    var encryptOnMobile = function(text, cb) {

      // UUID encryption is disabled.
      return cb(null, text);
      //
      // getUUID(function(uuid) {
      //   if (uuid) {
      //     $log.debug('Encrypting profile');
      //     text = sjcl.encrypt(uuid, text);
      //   }
      //   return cb(null, text);
      // });
    };


    var decryptOnMobile = function(text, cb) {
      var json;
      try {
        json = JSON.parse(text);
      } catch (e) {};

      if (!json) return cb('Could not access storage')

      if (!json.iter || !json.ct) {
        $log.debug('Profile is not encrypted');
        return cb(null, text);
      }

      $log.debug('Profile is encrypted');
      getUUID(function(uuid) {
        $log.debug('Device UUID:' + uuid);
        if (!uuid)
          return cb('Could not decrypt storage: could not get device ID');

        try {
          text = sjcl.decrypt(uuid, text);

          $log.info('Migrating to unencrypted profile');
          return storage.set('profile', text, function(err) {
            return cb(err, text);
          });
        } catch(e) {
          $log.warn('Decrypt error: ', e);
          return cb('Could not decrypt storage: device ID mismatch');
        };
        return cb(null, text);
      });
    };

    // on mobile, the storage keys are files, we have to avoid slashes in filenames
    function getSafeWalletId(walletId){
        return walletId.replace(/[\/+=]/g, '');
    }

    root.storeNewProfile = function(profile, cb) {
      encryptOnMobile(profile.toObj(), function(err, x) {
        storage.create('profile', x, cb);
      });
    };

    root.storeProfile = function(profile, cb) {
      encryptOnMobile(profile.toObj(), function(err, x) {
        storage.set('profile', x, cb);
      });
    };

    root.getProfile = function(cb) {
      storage.get('profile', function(err, str) {
        //console.log("prof="+str+", err="+err);
        if (err || !str)
          return cb(err);

        decryptOnMobile(str, function(err, str) {
          if (err) return cb(err);
          var p, err;
          try {
            p = Profile.fromString(str);
          } catch (e) {
            $log.debug('Could not read profile:', e);
            err = new Error('Could not read profile:' + e);
          }
          return cb(err, p);
        });
      });
    };

    root.deleteProfile = function(cb) {
      storage.remove('profile', cb);
    };

    root.storeFocusedWalletId = function(id, cb) {
      storage.set('focusedWalletId', id || '', cb);
    };

    root.getFocusedWalletId = function(cb) {
      storage.get('focusedWalletId', cb);
    };

    root.setBackupFlag = function(walletId, cb) {
      storage.set('backup-' + getSafeWalletId(walletId), Date.now(), cb);
    };

    root.getBackupFlag = function(walletId, cb) {
      storage.get('backup-' + getSafeWalletId(walletId), cb);
    };

    root.clearBackupFlag = function(walletId, cb) {
      storage.remove('backup-' + getSafeWalletId(walletId), cb);
    };

    root.getConfig = function(cb) {
      storage.get('config', cb);
    };

    root.storeConfig = function(val, cb) {
      $log.debug('Storing Preferences', val);
      storage.set('config', val, cb);
    };

    root.clearConfig = function(cb) {
      storage.remove('config', cb);
    };

    root.setDisclaimerFlag = function(cb) {
      storage.set('agreeDisclaimer', true, cb);
    };

    root.getDisclaimerFlag = function(cb) {
      storage.get('agreeDisclaimer', cb);
    };

    root.setRemotePrefsStoredFlag = function(cb) {
      storage.set('remotePrefStored', true, cb);
    };

    root.getRemotePrefsStoredFlag = function(cb) {
      storage.get('remotePrefStored', cb);
    };

    root.setAddressbook = function(network, addressbook, cb) {
      storage.set('addressbook-' + network, addressbook, cb);
    };

    root.getAddressbook = function(network, cb) {
      storage.get('addressbook-' + network, cb);
    };

    root.removeAddressbook = function(network, cb) {
      storage.remove('addressbook-' + network, cb);
    };

    root.setPushInfo = function(projectNumber, registrationId, enabled, cb) {
      storage.set('pushToken', JSON.stringify({projectNumber: projectNumber, registrationId: registrationId, enabled: enabled}), cb);
    };

    root.getPushInfo = function(cb) {
      storage.get('pushToken', function(err, data) {
      	err ? cb(err) : cb(null, (data ? JSON.parse(data) : data));
	  });
    };
      
    root.removePushInfo = function(cb){
      storage.remove('pushToken', cb);
    };

    return root;
  });

'use strict';

/*  
 * This is a modification from https://github.com/angular/angular.js/blob/master/src/ngTouch/swipe.js
 */


angular.module('copayApp.services')
  .factory('$swipemodified', [
  function() {
    // The total distance in any direction before we make the call on swipe vs. scroll.
    var MOVE_BUFFER_RADIUS = 10;

    var POINTER_EVENTS = {
      'touch': {
        start: 'touchstart',
        move: 'touchmove',
        end: 'touchend',
        cancel: 'touchcancel'
      }
    };

    function getCoordinates(event) {
      var originalEvent = event.originalEvent || event;
      var touches = originalEvent.touches && originalEvent.touches.length ? originalEvent.touches : [originalEvent];
      var e = (originalEvent.changedTouches && originalEvent.changedTouches[0]) || touches[0];

      return {
        x: e.clientX,
        y: e.clientY
      };
    }

    function getEvents(pointerTypes, eventType) {
      var res = [];
      angular.forEach(pointerTypes, function(pointerType) {
        var eventName = POINTER_EVENTS[pointerType][eventType];
        if (eventName) {
          res.push(eventName);
        }
      });
      return res.join(' ');
    }

    return {
      /**
       * @ngdoc method
       * @name $swipe#bind
       *
       * @description
       * The main method of `$swipe`. It takes an element to be watched for swipe motions, and an
       * object containing event handlers.
       * The pointer types that should be used can be specified via the optional
       * third argument, which is an array of strings `'mouse'` and `'touch'`. By default,
       * `$swipe` will listen for `mouse` and `touch` events.
       *
       * The four events are `start`, `move`, `end`, and `cancel`. `start`, `move`, and `end`
       * receive as a parameter a coordinates object of the form `{ x: 150, y: 310 }`.
       *
       * `start` is called on either `mousedown` or `touchstart`. After this event, `$swipe` is
       * watching for `touchmove` or `mousemove` events. These events are ignored until the total
       * distance moved in either dimension exceeds a small threshold.
       *
       * Once this threshold is exceeded, either the horizontal or vertical delta is greater.
       * - If the horizontal distance is greater, this is a swipe and `move` and `end` events follow.
       * - If the vertical distance is greater, this is a scroll, and we let the browser take over.
       *   A `cancel` event is sent.
       *
       * `move` is called on `mousemove` and `touchmove` after the above logic has determined that
       * a swipe is in progress.
       *
       * `end` is called when a swipe is successfully completed with a `touchend` or `mouseup`.
       *
       * `cancel` is called either on a `touchcancel` from the browser, or when we begin scrolling
       * as described above.
       *
       */
      bind: function(element, eventHandlers, pointerTypes) {
        // Absolute total movement, used to control swipe vs. scroll.
        var totalX, totalY;
        // Coordinates of the start position.
        var startCoords;
        // Last event's position.
        var lastPos;
        // Whether a swipe is active.
        var active = false;

        pointerTypes = pointerTypes || ['touch'];
        element.on(getEvents(pointerTypes, 'start'), function(event) {
          startCoords = getCoordinates(event);
          active = true;
          totalX = 0;
          totalY = 0;
          lastPos = startCoords;
          eventHandlers['start'] && eventHandlers['start'](startCoords, event);
        });
        var events = getEvents(pointerTypes, 'cancel');
        if (events) {
          element.on(events, function(event) {
            active = false;
            eventHandlers['cancel'] && eventHandlers['cancel'](event);
          });
        }

        element.on(getEvents(pointerTypes, 'move'), function(event) {
          if (!active) return;

          // Android will send a touchcancel if it thinks we're starting to scroll.
          // So when the total distance (+ or - or both) exceeds 10px in either direction,
          // we either:
          // - On totalX > totalY, we send preventDefault() and treat this as a swipe.
          // - On totalY > totalX, we let the browser handle it as a scroll.

          if (!startCoords) return;
          var coords = getCoordinates(event);

          totalX += Math.abs(coords.x - lastPos.x);
          totalY += Math.abs(coords.y - lastPos.y);

          lastPos = coords;

          if (totalX < MOVE_BUFFER_RADIUS && totalY < MOVE_BUFFER_RADIUS) {
            return;
          }

          // One of totalX or totalY has exceeded the buffer, so decide on swipe vs. scroll.
          if (totalY > totalX) {
            // Allow native scrolling to take over.
            active = false;
            eventHandlers['cancel'] && eventHandlers['cancel'](event);
            return;
          } else {

            // Prevent the browser from scrolling.
            event.preventDefault();
            eventHandlers['move'] && eventHandlers['move'](coords, event);
          }
        });

        element.on(getEvents(pointerTypes, 'end'), function(event) {
          if (!active) return;
          active = false;
          eventHandlers['end'] && eventHandlers['end'](getCoordinates(event), event);
        });
      }
    };
  }
]);



'use strict';

var constants = require('intervaluecore/constants.js');

angular.module('copayApp.services').factory('txFormatService', function (profileService, configService, lodash) {
	var root = {};

	var formatAmountStr = function (amount, asset) {
		if (!amount) return;
		if (asset !== "base" && asset !== constants.BLACKBYTES_ASSET && !profileService.assetMetadata[asset])
			return amount;
		return profileService.formatAmountWithUnit(amount, asset);
	};

	// 更改代码 交易小费单位是 GA
	var formatFeeStr = function (fee) {
		if (!fee) return;
		return fee/1000000000000000000 + ' INVE';
	};

	root.processTx = function (tx) {
		if (!tx) return;

		var outputs = tx.outputs ? tx.outputs.length : 0;
		if (outputs > 1 && tx.action != 'received') {
			tx.hasMultiplesOutputs = true;
			tx.recipientCount = outputs;
			tx.amount = lodash.reduce(tx.outputs, function (total, o) {
				o.amountStr = formatAmountStr(o.amount, tx.asset);
				return total + o.amount;
			}, 0);
		}

		tx.amountStr = formatAmountStr(tx.amount, tx.asset);
		tx.feeStr = formatFeeStr(tx.fee || tx.fees);

		return tx;
	};

	return root;
});

'use strict';

angular.module('copayApp.services').factory('txStatus', function($modal, lodash, profileService, $timeout) {
  var root = {};

  root.notify = function(txp, cb) {
    var fc = profileService.focusedClient;
    var status = txp.status;
    var type;
    var INMEDIATE_SECS = 10;

    if (status == 'broadcasted') {
      type = 'broadcasted';
    } else {
        throw Error("unsupported status");
        /*
      var n = txp.actions.length;
      var action = lodash.find(txp.actions, {
        copayerId: fc.credentials.copayerId
      });

      if (!action)  {
        type = 'created';
      } else if (action.type == 'accept') {
        // created and accepted at the same time?
        if ( n == 1 && action.createdOn - txp.createdOn < INMEDIATE_SECS ) {
          type = 'created';
        } else {
          type = 'accepted';
        }
      } else if (action.type == 'reject') {
        type = 'rejected';
      } else {
        throw new Error('Unknown type:' + type);
      }
        */
    }

    openModal(type, txp, cb);
  };

  root._templateUrl = function(type, txp) {
    return 'views/modals/tx-status.html';
  };

  var openModal = function(type, txp, cb) {
    var ModalInstanceCtrl = function($scope, $modalInstance) {
      $scope.type = type;
      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
      if (cb) $timeout(cb, 100);
    };
    var modalInstance = $modal.open({
      templateUrl: root._templateUrl(type, txp),
      windowClass: 'popup-tx-status full',
      controller: ModalInstanceCtrl,
    });

    modalInstance.result.finally(function() {
      var m = angular.element(document.getElementsByClassName('reveal-modal'));
      m.addClass('hideModal');
    });
  };

  return root;
});

'use strict';

var UriHandler = function() {};

UriHandler.prototype.register = function() {
  var base = window.location.origin + '/';
  var url = base + '#/uri-payment/%s';

  if(navigator.registerProtocolHandler) {
    navigator.registerProtocolHandler('bitcoin', url, 'Copay');
  }
};

angular.module('copayApp.services').value('uriHandler', new UriHandler());

'use strict';
angular.module('copayApp.services')
    .factory('uxLanguage', function languageService($log, lodash, gettextCatalog, amMoment, configService) {
        var root = {};

        // 设置语言列表，仅保留英文和中文，刘星修改
        root.availableLanguages = [{
            name: 'English',
            isoCode: 'en',
            // }, {
            //   name: 'Français',
            //   isoCode: 'fr_FR',
            // }, {
            //   name: 'Italiano',
            //   isoCode: 'it_IT',
            // }, {
            //   name: 'Deutsch',
            //   isoCode: 'de_DE',
            // }, {
            //   name: 'Español',
            //   isoCode: 'es_ES',
            // }, {
            //   name: 'Português',
            //   isoCode: 'pt_PT',
            // }, {
            //   name: 'Nederlands',
            //   isoCode: 'nl_NL',
            // }, {
            //   name: 'Svenska',
            //   isoCode: 'sv_SE',
            // }, {
            //   name: 'Polski',
            //   isoCode: 'pl_PL',
            // }, {
            //   name: 'Magyar',
            //   isoCode: 'hu_HU',
            // }, {
            //   name: 'Shqip',
            //   isoCode: 'sq_AL',
            // }, {
            //   name: 'Ελληνικά',
            //   isoCode: 'el_GR',
            // }, {
            //   name: '日本語',
            //   isoCode: 'ja_jp',
            //   useIdeograms: true,
        }, {
            name: '中文',
            isoCode: 'zh_CN',
            useIdeograms: true,
            // }, {
            //   name: '한국어',
            //   isoCode: 'ko_KR',
            // }, {
            //   name: 'Pусский',
            //   isoCode: 'ru_RU',
            // }, {
            //   name: 'Bahasa Indonesia',
            //   isoCode: 'id_ID',
            // }, {
            //   name: 'Türk',
            //   isoCode: 'tr_TR',
        }];

        root.currentLanguage = null;

        root._detect = function () {
            // Auto-detect browser language
            var userLang, androidLang;

            if (navigator && navigator.userAgent && (androidLang = navigator.userAgent.match(/android.*\W(\w\w)-(\w\w)\W/i))) {
                userLang = androidLang[1];
            } else {
                // works for iOS and Android 4.x
                userLang = navigator.userLanguage || navigator.language;
            }
            userLang = userLang ? (userLang.split('-', 1)[0] || 'en') : 'en';

            for (var i = 0; i < root.availableLanguages.length; i++) {
                var isoCode = root.availableLanguages[i].isoCode;
                if (userLang === isoCode.substr(0, 2))
                    return isoCode;
            }

            return 'en';
        };

        root._set = function (lang) {
            $log.debug('Setting default language: ' + lang);
            gettextCatalog.setCurrentLanguage(lang);
            if (lang !== 'en')
                gettextCatalog.loadRemote("languages/" + lang + ".json");
            amMoment.changeLocale(lang);
            root.currentLanguage = lang;
        };

        root.getCurrentLanguage = function () {
            return root.currentLanguage;
        };

        root.getCurrentLanguageName = function () {
            return root.getName(root.currentLanguage);
        };

        root.getCurrentLanguageInfo = function () {
            return lodash.find(root.availableLanguages, {
                'isoCode': root.currentLanguage
            });
        };

        root.getLanguages = function () {
            return root.availableLanguages;
        };

        root.init = function () {
            root._set(root._detect());
        };

        root.update = function () {
            var userLang = configService.getSync().wallet.settings.defaultLanguage;

            if (!userLang) {
                userLang = root._detect();
            }

            if (userLang != gettextCatalog.getCurrentLanguage()) {
                root._set(userLang);
            }
            return userLang;
        };

        root.getName = function (lang) {
            return lodash.result(lodash.find(root.availableLanguages, {
                'isoCode': lang
            }), 'name');
        };

        return root;
    });

'use strict';


angular.module('copayApp.services').factory('witnessListService', function($state, $rootScope, go) {
    var root = {};
    
    console.log("witnessListService");

    
    root.currentWitness = null;


    return root;
});

'use strict';

angular.module('copayApp.controllers').controller('acceptCorrespondentInvitationController',
  function($scope, $rootScope, $timeout, configService, profileService, isCordova, go, correspondentListService) {
	
	var self = this;
	console.log("acceptCorrespondentInvitationController");
	
	var fc = profileService.focusedClient;
	$scope.backgroundColor = fc.backgroundColor;
	
	$scope.beforeQrCodeScan = function() {
		console.log("beforeQrCodeScan");
		$scope.error = null;
	};

	$scope.onQrCodeScanned = function(data, pairingCodeForm) {
		console.log("onQrCodeScanned", data);
		handleCode(data);
	};


	$scope.pair = function() {
		$scope.error = null;
		handleCode($scope.code);
	};

	function handleCode(code){
		var conf = require('intervaluecore/conf.js');
		var re = new RegExp('^'+conf.program+':', 'i');
		code = code.replace(re, '');
		var matches = code.match(/^([\w\/+]+)@([\w.:\/-]+)#([\w\/+-]+)$/);
		if (!matches)
			return setError("Invalid pairing code");
		var pubkey = matches[1];
		var hub = matches[2];
		var pairing_secret = matches[3];
		if (pubkey.length !== 44)
			return setError("Invalid pubkey length");
		//if (pairing_secret.length !== 12)
		//    return setError("Invalid pairing secret length");
		console.log(pubkey, hub, pairing_secret);
		self.setOngoingProcess("pairing");
		correspondentListService.acceptInvitation(hub, pubkey, pairing_secret, function(err){
			self.setOngoingProcess();
			if (err)
				$scope.error = err;
			// acceptInvitation() will already open chat window
			/*else
				go.path('correspondentDevices');*/
		});
	}
	
	function setError(error){
		$scope.error = error;
	}

	this.setOngoingProcess = function(name) {
		var self = this;

		if (isCordova) {
			if (name) {
				window.plugins.spinnerDialog.hide();
				window.plugins.spinnerDialog.show(null, name + '...', true);
			} else {
				window.plugins.spinnerDialog.hide();
			}
		} else {
			$scope.onGoingProcess = name;
			$timeout(function() {
				$rootScope.$apply();
			});
		};
	};
	
  });

'use strict';

angular.module('copayApp.controllers').controller('approveNewWitnesses', function($scope, $modalInstance, $document, autoUpdatingWitnessesList){
  $scope.addWitnesses = autoUpdatingWitnessesList.addWitnesses;
  $scope.delWitnesses = autoUpdatingWitnessesList.delWitnesses;


  $scope.replace = function(){
    var oldWitnesses = $scope.delWitnesses;
    var newWitnesses = $scope.addWitnesses;

    var n = 0, l = newWitnesses.length;

    function replaceWitness(n, oldWitnesses, newWitnesses){
	  var myWitnesses = require('intervaluecore/my_witnesses.js');
      myWitnesses.replaceWitness(oldWitnesses[n], newWitnesses[n], function(err){

        if (l < n) {
          replaceWitness(n++, oldWitnesses, newWitnesses)
        } else {
          $modalInstance.close('closed result');
        }
      });
    }

    replaceWitness(n, oldWitnesses, newWitnesses);
  };

  $scope.later = function(){
    $modalInstance.close('closed result');
  };
});

'use strict';

/*

This is incomplete!
To do:
- modify bitcore to accept string indexes
- add app column to my_addresses table
- add choice of cosigners when m<n
- implement signAuthRequest()
- update handling of "sign" command in cosigners so that they accept auth requests, not just payments
- post the result to site url
- allow to change keys of the wallet, update definitions for all apps/domains saved so far
- send the chain of key changes with the response

*/

var ecdsaSig = require('intervaluecore/signature.js');

angular.module('copayApp.controllers').controller('authConfirmationController',
  function($scope, $timeout, configService, profileService, go, authService) {
    
    function extractDomainFromUrl(url){
        var domain_with_path = url.replace(/^https?:\/\//i, '');
        var domain = domain_with_path.replace(/\/.*$/, '');
        domain = domain.replace(/^www\./i, '');
        return domain;
    }
    
    var self = this;
	var bbWallet = require('intervaluecore/wallet.js');
    
    // the wallet to sign with
    $scope.walletId = profileService.focusedClient.credentials.walletId;
    
    var objRequest = authService.objRequest;
    if (!objRequest)
        throw Error("no request");
    
    var app_name;
    if (objRequest.app)
        app_name = objRequest.app;
    else if (objRequest.url)
        app_name = extractDomainFromUrl(objRequest.url);
    else
        throw Error("neither app nor url");
    
    if (objRequest.question)
        $scope.question = objRequest.question;
    else
        $scope.question = "Log in to "+app_name+"?";
    
    var arrSigningDeviceAddresses = []; // todo allow to choose the devices that are to sign
    
    $scope.yes = function() {
        console.log("yes");
        var credentials = lodash.find(profileService.profile.credentials, {walletId: $scope.walletId});
        if (!credentials)
            throw Error("unknown wallet: "+$scope.walletId);
        var coin = (credentials.network == 'livenet' ? "0" : "1");

        var signWithLocalPrivateKey = function(wallet_id, account, is_change, address_index, text_to_sign, handleSig){
            var path = "m/44'/" + coin + "'/" + account + "'/"+is_change+"/"+address_index;
            var xPrivKey = new Bitcore.HDPrivateKey.fromString(profileService.focusedClient.credentials.xPrivKey); // todo unlock the key if encrypted
            var privateKey = xPrivKey.derive(path).privateKey;
            //var privKeyBuf = privateKey.toBuffer();
            var privKeyBuf = privateKey.bn.toBuffer({size:32}); // https://github.com/bitpay/bitcore-lib/issues/47
            handleSig(ecdsaSig.sign(text_to_sign, privKeyBuf));
        };

        // create a new app/domain-bound address if not created already
        bbWallet.issueOrSelectAddressForApp(credentials.walletId, app_name, function(address){
            bbWallet.signAuthRequest(credentials.walletId, objRequest, arrSigningDeviceAddresses, signWithLocalPrivateKey, function(err){
                go.walletHome();
            });
        });
    };

    $scope.no = function() {
        // do nothing
        console.log("no");
        go.walletHome();
    };


  });

'use strict';

angular.module('copayApp.controllers').controller('wordsController',
  function($rootScope, $scope, $timeout, profileService, go, gettext, confirmDialog, notification, $log, isCordova) {

    var msg = gettext('Are you sure you want to delete the backup words?');
    var successMsg = gettext('Backup words deleted');
    var self = this;
    self.show = false;
    var fc = profileService.focusedClient;
	
	if (!isCordova){
		var desktopApp = require('intervaluecore/desktop_app.js'+'');
		self.appDataDir = desktopApp.getAppDataDir();
	}
	self.isCordova = isCordova;


    if (fc.isPrivKeyEncrypted()) self.credentialsEncrypted = true;
    else {
      setWords(fc.getMnemonic());
    }
    if (fc.credentials && !fc.credentials.mnemonicEncrypted && !fc.credentials.mnemonic) {
      self.deleted = true;
    }

    self.toggle = function() {
      self.error = "";
      if (!self.credentialsEncrypted) {
        if (!self.show)
          $rootScope.$emit('Local/BackupDone');
        self.show = !self.show;
      }

      if (self.credentialsEncrypted)
        self.passwordRequest();

      $timeout(function() {
        $scope.$apply();
      }, 1);
    };

    self.delete = function() {
      confirmDialog.show(msg, function(ok) {
        if (ok) {
          fc.clearMnemonic();
          profileService.clearMnemonic(function() {
            self.deleted = true;
            notification.success(successMsg);
            go.walletHome();
          });
        }
      });
    };

    $scope.$on('$destroy', function() {
      profileService.lockFC();
    });

    function setWords(words) {
      if (words) {
        self.mnemonicWords = words.split(/[\u3000\s]+/);
        self.mnemonicHasPassphrase = fc.mnemonicHasPassphrase();
        self.useIdeograms = words.indexOf("\u3000") >= 0;
      }
    };

    self.passwordRequest = function() {
      try {
        setWords(fc.getMnemonic());
      } catch (e) {
        if (e.message && e.message.match(/encrypted/) && fc.isPrivKeyEncrypted()) {
          self.credentialsEncrypted = true;

          $timeout(function() {
            $scope.$apply();
          }, 1);

          profileService.unlockFC(null, function(err) {
            if (err) {
              self.error = gettext('Could not decrypt') +': '+ err.message;
              $log.warn('Error decrypting credentials:', self.error); //TODO
              return;
            }
            if (!self.show && self.credentialsEncrypted)
              self.show = !self.show;
            self.credentialsEncrypted = false;
            setWords(fc.getMnemonic());
            $rootScope.$emit('Local/BackupDone');
          });
        }
      }
    }
  });

'use strict';

angular.module('copayApp.controllers').controller('botController',
  function($stateParams, $scope, $rootScope, $timeout, configService, profileService, isCordova, go, correspondentListService) {
	
	var self = this;
	var bots = require('intervaluecore/bots.js');
	var fc = profileService.focusedClient;
	$scope.backgroundColor = fc.backgroundColor;
	$scope.$root = $rootScope;
	
	var id = $stateParams.id;

	bots.getBotByID(id, function(bot){
		bot.description = correspondentListService.escapeHtmlAndInsertBr(bot.description);
		$scope.bot = bot;
		$timeout(function(){
			$scope.$digest();
		});
	})

	$scope.pair = function(bot) {
		var matches = bot.pairing_code.match(/^([\w\/+]+)@([\w.:\/-]+)#([\w\/+-]+)$/);
		var pubkey = matches[1];
		var hub = matches[2];
		var pairing_secret = matches[3];
		$scope.index.setOngoingProcess("pairing", true);
		correspondentListService.acceptInvitation(hub, pubkey, pairing_secret, function(err){
			$scope.index.setOngoingProcess("pairing", false);
		});
	}

	$scope.open = function(bot) {
		correspondentListService.setCurrentCorrespondent(bot.device_address, function(){
			go.path('correspondentDevices.correspondentDevice');
		});
	}
});
'use strict';

angular.module('copayApp.controllers').controller('copayersController',
  function($scope, $rootScope, $timeout, $log, $modal, profileService, go, notification, isCordova, gettext, gettextCatalog, animationService) {
    var self = this;

    var delete_msg = gettextCatalog.getString('Are you sure you want to delete this wallet?');
    var accept_msg = gettextCatalog.getString('Accept');
    var cancel_msg = gettextCatalog.getString('Cancel');
    var confirm_msg = gettextCatalog.getString('Confirm');
    
    self.init = function() {
      var fc = profileService.focusedClient;
      if (fc.isComplete()) {
        $log.debug('Wallet Complete...redirecting')
        go.walletHome();
        return;
      }
      self.loading = false;
      self.isCordova = isCordova;
	  $rootScope.$emit('Local/BalanceUpdated', {});
	  if(self.isCordova && !wallet.clientCompleteLoaded()) wallet.showCompleteClient();
    };

    var _modalDeleteWallet = function() {
      var ModalInstanceCtrl = function($scope, $modalInstance, $sce, gettext) {
        $scope.title = $sce.trustAsHtml(delete_msg);;
          $scope.yes_icon = 'fi-trash';
          $scope.yes_button_class = 'warning';
          $scope.cancel_button_class = 'light-gray outline';
        $scope.loading = false;

        $scope.ok = function() {
          $scope.loading = true;
          $modalInstance.close(accept_msg);
        };
        $scope.cancel = function() {
          $modalInstance.dismiss(cancel_msg);
        };
      };

      var modalInstance = $modal.open({
        templateUrl: 'views/modals/confirmation.html',
        windowClass: animationService.modalAnimated.slideUp,
        controller: ModalInstanceCtrl
      });

      modalInstance.result.finally(function() {
        var m = angular.element(document.getElementsByClassName('reveal-modal'));
        m.addClass(animationService.modalAnimated.slideOutDown);
      });

      modalInstance.result.then(function(ok) {
        if (ok) {
          _deleteWallet();
        }
      });
    };

    var _deleteWallet = function() {
      var fc = profileService.focusedClient;
      $timeout(function() {
        var fc = profileService.focusedClient;
        var walletName = fc.credentials.walletName;

        profileService.deleteWallet({}, function(err) {
          if (err) {
            this.error = err.message || err;
            console.log(err);
            $timeout(function() {
              $scope.$digest();
            });
          } else {
            go.walletHome();
            $timeout(function() {
              notification.success(gettextCatalog.getString('Success'), gettextCatalog.getString('The wallet "{{walletName}}" was deleted', {walletName: walletName}));
            });
          }
        });
      }, 100);
    };

    self.deleteWallet = function() {
      var fc = profileService.focusedClient;
      if (isCordova) {
        navigator.notification.confirm(
          delete_msg,
          function(buttonIndex) {
            if (buttonIndex == 1) {
              _deleteWallet();
            }
          },
          confirm_msg, [accept_msg, cancel_msg]
        );
      } else {
        _modalDeleteWallet();
      }
    };
 

  });

'use strict';


var constants = require('intervaluecore/constants.js');

angular.module('copayApp.controllers').controller('correspondentDeviceController',
  function($scope, $rootScope, $timeout, $sce, $modal, configService, profileService, animationService, isCordova, go, correspondentListService, addressService, lodash, $deepStateRedirect, $state, backButton, gettext) {
	
	var async = require('async');
	var chatStorage = require('intervaluecore/chat_storage.js');
	var self = this;
	console.log("correspondentDeviceController");
	var ValidationUtils = require('intervaluecore/validation_utils.js');
	var objectHash = require('intervaluecore/object_hash.js');
	var db = require('intervaluecore/db.js');
	var network = require('intervaluecore/network.js');
	var device = require('intervaluecore/device.js');
	var eventBus = require('intervaluecore/event_bus.js');
	var conf = require('intervaluecore/conf.js');
	var storage = require('intervaluecore/storage.js');
	var breadcrumbs = require('intervaluecore/breadcrumbs.js');
	
	var fc = profileService.focusedClient;
	var chatScope = $scope;
	var indexScope = $scope.index;
	$rootScope.tab = $scope.index.tab = 'chat';
	var correspondent = correspondentListService.currentCorrespondent;
	$scope.correspondent = correspondent;
//	var myPaymentAddress = indexScope.shared_address;
	if (document.chatForm && document.chatForm.message)
		document.chatForm.message.focus();
	
	if (!correspondentListService.messageEventsByCorrespondent[correspondent.device_address])
		correspondentListService.messageEventsByCorrespondent[correspondent.device_address] = [];
	$scope.messageEvents = correspondentListService.messageEventsByCorrespondent[correspondent.device_address];

	$scope.$watch("correspondent.my_record_pref", function(pref, old_pref) {
		if (pref == old_pref) return;
		var device = require('intervaluecore/device.js');
		device.sendMessageToDevice(correspondent.device_address, "chat_recording_pref", pref, {
			ifOk: function(){
				device.updateCorrespondentProps(correspondent);
				var oldState = (correspondent.peer_record_pref && !correspondent.my_record_pref);
				var newState = (correspondent.peer_record_pref && correspondent.my_record_pref);
				if (newState != oldState) {
					var message = {
						type: 'system',
						message: JSON.stringify({state: newState}),
						timestamp: Math.floor(Date.now() / 1000),
						chat_recording_status: true
					};
					$scope.autoScrollEnabled = true;
					$scope.messageEvents.push(correspondentListService.parseMessage(message));
					$timeout(function(){
						$scope.$digest();
					});
					chatStorage.store(correspondent.device_address, JSON.stringify({state: newState}), 0, 'system');
				}
				/*if (!pref) {
					chatStorage.purge(correspondent.device_address);
				}*/
			},
			ifError: function(){
				// ignore
			}
		});
	});

	var removeNewMessagesDelim = function() {
		for (var i in $scope.messageEvents) {
        	if ($scope.messageEvents[i].new_message_delim) {
        		$scope.messageEvents.splice(i, 1);
        	}
        }
	};

	$scope.$watch("newMessagesCount['" + correspondent.device_address +"']", function(counter) {
		if (!$scope.newMsgCounterEnabled && $state.is('correspondentDevices.correspondentDevice')) {
			$scope.newMessagesCount[$scope.correspondent.device_address] = 0;			
		}
	});

	$scope.$on('$stateChangeStart', function(evt, toState, toParams, fromState) {
	    if (toState.name === 'correspondentDevices.correspondentDevice') {
	        $rootScope.tab = $scope.index.tab = 'chat';
	        $scope.newMessagesCount[correspondentListService.currentCorrespondent.device_address] = 0;
	    } else
	    	removeNewMessagesDelim();
	});

	$scope.send = function() {
		$scope.error = null;
		if (!$scope.message)
			return;
		setOngoingProcess("sending");
		var message = lodash.clone($scope.message); // save in var as $scope.message may disappear while we are sending the message over the network
		device.sendMessageToDevice(correspondent.device_address, "text", message, {
			ifOk: function(){
				setOngoingProcess();
				//$scope.messageEvents.push({bIncoming: false, message: $sce.trustAsHtml($scope.message)});
				$scope.autoScrollEnabled = true;
				var msg_obj = {
					bIncoming: false, 
					message: correspondentListService.formatOutgoingMessage(message), 
					timestamp: Math.floor(Date.now() / 1000)
				};
				correspondentListService.checkAndInsertDate($scope.messageEvents, msg_obj);
				$scope.messageEvents.push(msg_obj);
				$scope.message = "";
				$timeout(function(){
					$scope.$apply();
				});
				if (correspondent.my_record_pref && correspondent.peer_record_pref) chatStorage.store(correspondent.device_address, message, 0);
			},
			ifError: function(error){
				setOngoingProcess();
				setError(error);
			}
		});
	};
	
	$scope.insertMyAddress = function(){
		if (!profileService.focusedClient.credentials.isComplete())
			return $rootScope.$emit('Local/ShowErrorAlert', "The wallet is not approved yet");
		readMyPaymentAddress(appendMyPaymentAddress);
	//	issueNextAddressIfNecessary(appendMyPaymentAddress);
	};
	
	$scope.requestPayment = function(){
		if (!profileService.focusedClient.credentials.isComplete())
			return $rootScope.$emit('Local/ShowErrorAlert', "The wallet is not approved yet");
		readMyPaymentAddress(showRequestPaymentModal);
	//	issueNextAddressIfNecessary(showRequestPaymentModal);
	};
	
	$scope.sendPayment = function(address, amount, asset){
		console.log("will send payment to "+address);
		if (asset && $scope.index.arrBalances.filter(function(balance){ return (balance.asset === asset); }).length === 0){
			console.log("i do not own anything of asset "+asset);
			return;
		}
		backButton.dontDeletePath = true;
		go.send(function(){
			//$rootScope.$emit('Local/SetTab', 'send', true);
			$rootScope.$emit('paymentRequest', address, amount, asset, correspondent.device_address);
		});
	};

	$scope.showPayment = function(asset){
		console.log("will show payment in asset "+asset);
		if (!asset)
			throw Error("no asset in showPayment");
		if (asset && $scope.index.arrBalances.filter(function(balance){ return (balance.asset === asset); }).length === 0){
			console.log("i do not own anything of asset "+asset);
			return;
		}
		var assetIndex = lodash.findIndex($scope.index.arrBalances, {asset: asset});
		if (assetIndex < 0)
			throw Error("failed to find asset index of asset "+asset);
		$scope.index.assetIndex = assetIndex;
		go.history();
	};
	

	
	
	$scope.offerContract = function(address){
		var walletDefinedByAddresses = require('intervaluecore/wallet_defined_by_addresses.js');
		$rootScope.modalOpened = true;
		var fc = profileService.focusedClient;
		$scope.oracles = configService.oracles;
		
		var ModalInstanceCtrl = function($scope, $modalInstance) {
			var config = configService.getSync();
			var configWallet = config.wallet;
			var walletSettings = configWallet.settings;
			$scope.unitValue = walletSettings.unitValue;
			$scope.unitName = walletSettings.unitName;
			$scope.color = fc.backgroundColor;
			$scope.bWorking = false;
			$scope.arrRelations = ["=", ">", "<", ">=", "<=", "!="];
			$scope.arrParties = [{value: 'me', display_value: "I"}, {value: 'peer', display_value: "the peer"}];
			$scope.arrPeerPaysTos = [{value: 'me', display_value: "to me"}, {value: 'contract', display_value: "to this contract"}];
			$scope.arrAssetInfos = indexScope.arrBalances.map(function(b){
				var info = {asset: b.asset, is_private: b.is_private};
				if (b.asset === 'base')
					info.displayName = walletSettings.unitName;
				else if (b.asset === constants.BLACKBYTES_ASSET)
					info.displayName = walletSettings.bbUnitName;
				else if (profileService.assetMetadata[b.asset])
					info.displayName = profileService.assetMetadata[b.asset].name;
				else
					info.displayName = 'of '+b.asset.substr(0, 4);
				return info;
			});
			$scope.arrPublicAssetInfos = $scope.arrAssetInfos.filter(function(b){ return !b.is_private; });
			var contract = {
				timeout: 4,
				myAsset: 'base',
				peerAsset: 'base',
				peer_pays_to: 'contract',
				relation: '>',
				expiry: 7,
				data_party: 'me',
				expiry_party: 'peer'
			};
			$scope.contract = contract;

			
			$scope.onDataPartyUpdated = function(){
				console.log('onDataPartyUpdated');
				contract.expiry_party = (contract.data_party === 'me') ? 'peer' : 'me';
			};
			
			$scope.onExpiryPartyUpdated = function(){
				console.log('onExpiryPartyUpdated');
				contract.data_party = (contract.expiry_party === 'me') ? 'peer' : 'me';
			};
			
			
			$scope.payAndOffer = function() {
				console.log('payAndOffer');
				$scope.error = '';
				
				if (fc.isPrivKeyEncrypted()) {
					profileService.unlockFC(null, function(err) {
						if (err){
							$scope.error = err.message;
							$timeout(function(){
								$scope.$apply();
							});
							return;
						}
						$scope.payAndOffer();
					});
					return;
				}
				
				profileService.requestTouchid(function(err) {
					if (err) {
						profileService.lockFC();
						$scope.error = err;
						$timeout(function() {
							$scope.$digest();
						}, 1);
						return;
					}
					
					if ($scope.bWorking)
						return console.log('already working');
					
					var my_amount = contract.myAmount;
					if (contract.myAsset === "base")
						my_amount *= walletSettings.unitValue;
					if (contract.myAsset === constants.BLACKBYTES_ASSET)
						my_amount *= walletSettings.bbUnitValue;
					if (profileService.assetMetadata[contract.myAsset])
						my_amount *= Math.pow(10, profileService.assetMetadata[contract.myAsset].decimals || 0);
					my_amount = Math.round(my_amount);
					
					var peer_amount = contract.peerAmount;
					if (contract.peerAsset === "base")
						peer_amount *= walletSettings.unitValue;
					if (contract.peerAsset === constants.BLACKBYTES_ASSET)
						throw Error("peer asset cannot be blackbytes");
					if (profileService.assetMetadata[contract.peerAsset])
						peer_amount *= Math.pow(10, profileService.assetMetadata[contract.peerAsset].decimals || 0);
					peer_amount = Math.round(peer_amount);
					
					if (my_amount === peer_amount && contract.myAsset === contract.peerAsset && contract.peer_pays_to === 'contract'){
						$scope.error = "The amounts are equal, you cannot require the peer to pay to the contract.  Please either change the amounts slightly or fund the entire contract yourself and require the peer to pay his half to you.";
						$timeout(function() {
							$scope.$digest();
						}, 1);
						return;
					}
					
					var fnReadMyAddress = (contract.peer_pays_to === 'contract') ? readMyPaymentAddress : issueNextAddress;
					fnReadMyAddress(function(my_address){
						var arrSeenCondition = ['seen', {
							what: 'output', 
							address: (contract.peer_pays_to === 'contract') ? 'this address' : my_address, 
							asset: contract.peerAsset, 
							amount: peer_amount
						}];
						readLastMainChainIndex(function(err, last_mci){
							if (err){
								$scope.error = err;
								$timeout(function() {
									$scope.$digest();
								}, 1);
								return;
							}
							var arrExplicitEventCondition = 
								['in data feed', [[contract.oracle_address], contract.feed_name, contract.relation, contract.feed_value+'', last_mci]];
							var arrEventCondition = arrExplicitEventCondition;
							var data_address = (contract.data_party === 'me') ? my_address : address;
							var expiry_address = (contract.expiry_party === 'me') ? my_address : address;
							var data_device_address = (contract.data_party === 'me') ? device.getMyDeviceAddress() : correspondent.device_address;
							var expiry_device_address = (contract.expiry_party === 'me') ? device.getMyDeviceAddress() : correspondent.device_address;
							var arrDefinition = ['or', [
								['and', [
									arrSeenCondition,
									['or', [
										['and', [
											['address', data_address],
											arrEventCondition
										]],
										['and', [
											['address', expiry_address],
											['in data feed', [[configService.TIMESTAMPER_ADDRESS], 'timestamp', '>', Date.now() + Math.round(contract.expiry*24*3600*1000)]]
										]]
									]]
								]],
								['and', [
									['address', my_address],
									['not', arrSeenCondition],
									['in data feed', [[configService.TIMESTAMPER_ADDRESS], 'timestamp', '>', Date.now() + Math.round(contract.timeout*3600*1000)]]
								]]
							]];
							var assocSignersByPath = {
								'r.0.1.0.0': {
									address: data_address,
									member_signing_path: 'r',
									device_address: data_device_address
								},
								'r.0.1.1.0': {
									address: expiry_address,
									member_signing_path: 'r',
									device_address: expiry_device_address
								},
								'r.1.0': {
									address: my_address,
									member_signing_path: 'r',
									device_address: device.getMyDeviceAddress()
								}
							};
							walletDefinedByAddresses.createNewSharedAddress(arrDefinition, assocSignersByPath, {
								ifError: function(err){
									$scope.bWorking = false;
									$scope.error = err;
									$timeout(function(){
										$scope.$digest();
									});
								},
								ifOk: function(shared_address){
									composeAndSend(shared_address, arrDefinition, assocSignersByPath, my_address);
								}
							});
						});
					});
					
					// compose and send
					function composeAndSend(shared_address, arrDefinition, assocSignersByPath, my_address){
						var arrSigningDeviceAddresses = []; // empty list means that all signatures are required (such as 2-of-2)
						if (fc.credentials.m < fc.credentials.n)
							indexScope.copayers.forEach(function(copayer){
								if (copayer.me || copayer.signs)
									arrSigningDeviceAddresses.push(copayer.device_address);
							});
						else if (indexScope.shared_address)
							arrSigningDeviceAddresses = indexScope.copayers.map(function(copayer){ return copayer.device_address; });
						profileService.bKeepUnlocked = true;
						var opts = {
							shared_address: indexScope.shared_address,
							asset: contract.myAsset,
							to_address: shared_address,
							amount: my_amount,
							arrSigningDeviceAddresses: arrSigningDeviceAddresses,
							recipient_device_address: correspondent.device_address
						};
						fc.sendMultiPayment(opts, function(err){
							// if multisig, it might take very long before the callback is called
							//self.setOngoingProcess();
							$scope.bWorking = false;
							profileService.bKeepUnlocked = false;
							if (err){
								if (err.match(/device address/))
									err = "This is a private asset, please send it only by clicking links from chat";
								if (err.match(/no funded/))
									err = "Not enough spendable funds, make sure all your funds are confirmed";
								if ($scope)
									$scope.error = err;
								return;
							}
							$rootScope.$emit("NewOutgoingTx");
							eventBus.emit('sent_payment', correspondent.device_address, my_amount, contract.myAsset, true);
							var paymentRequestCode;
							if (contract.peer_pays_to === 'contract'){
								var arrPayments = [{address: shared_address, amount: peer_amount, asset: contract.peerAsset}];
								var assocDefinitions = {};
								assocDefinitions[shared_address] = {
									definition: arrDefinition,
									signers: assocSignersByPath
								};
								var objPaymentRequest = {payments: arrPayments, definitions: assocDefinitions};
								var paymentJson = JSON.stringify(objPaymentRequest);
								var paymentJsonBase64 = Buffer(paymentJson).toString('base64');
								paymentRequestCode = 'payment:'+paymentJsonBase64;
							}
							else
								paymentRequestCode = 'intervalue:'+my_address+'?amount='+peer_amount+'&asset='+encodeURIComponent(contract.peerAsset);
							var paymentRequestText = '[your share of payment to the contract]('+paymentRequestCode+')';
							device.sendMessageToDevice(correspondent.device_address, 'text', paymentRequestText);
							var body = correspondentListService.formatOutgoingMessage(paymentRequestText);
							correspondentListService.addMessageEvent(false, correspondent.device_address, body);
							if (correspondent.my_record_pref && correspondent.peer_record_pref) chatStorage.store(correspondent.device_address, body, 0, 'html');
							if (contract.peer_pays_to === 'me')
								issueNextAddress(); // make sure the address is not reused
						});
						$modalInstance.dismiss('cancel');
					}
					
				});
			}; // payAndOffer
			

			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			};
		};
		
		
		var modalInstance = $modal.open({
			templateUrl: 'views/modals/offer-contract.html',
			windowClass: animationService.modalAnimated.slideUp,
			controller: ModalInstanceCtrl,
			scope: $scope
		});

		var disableCloseModal = $rootScope.$on('closeModal', function() {
			modalInstance.dismiss('cancel');
		});

		modalInstance.result.finally(function() {
			$rootScope.modalOpened = false;
			disableCloseModal();
			var m = angular.element(document.getElementsByClassName('reveal-modal'));
			m.addClass(animationService.modalAnimated.slideOutDown);
		});
	};
	
	
	

	$scope.sendMultiPayment = function(paymentJsonBase64){
		var walletDefinedByAddresses = require('intervaluecore/wallet_defined_by_addresses.js');
		var paymentJson = Buffer(paymentJsonBase64, 'base64').toString('utf8');
		console.log("multi "+paymentJson);
		var objMultiPaymentRequest = JSON.parse(paymentJson);
		$rootScope.modalOpened = true;
		var self = this;
		var fc = profileService.focusedClient;
		var ModalInstanceCtrl = function($scope, $modalInstance) {
			var config = configService.getSync();
			var configWallet = config.wallet;
			var walletSettings = configWallet.settings;
			$scope.unitValue = walletSettings.unitValue;
			$scope.unitName = walletSettings.unitName;
			$scope.color = fc.backgroundColor;
			$scope.bDisabled = true;
			var assocSharedDestinationAddresses = {};
			var createMovementLines = function(){
				$scope.arrMovements = objMultiPaymentRequest.payments.map(function(objPayment){
					var text = correspondentListService.getAmountText(objPayment.amount, objPayment.asset || 'base') + ' to ' + objPayment.address;
					if (assocSharedDestinationAddresses[objPayment.address])
						text += ' (smart address, see below)';
					return text;
				});
			};
			if (objMultiPaymentRequest.definitions){
				var arrAllMemberAddresses = [];
				var arrFuncs = [];
				var assocMemberAddressesByDestAddress = {};
				for (var destinationAddress in objMultiPaymentRequest.definitions){
					var arrDefinition = objMultiPaymentRequest.definitions[destinationAddress].definition;
					var arrMemberAddresses = extractAddressesFromDefinition(arrDefinition);
					assocMemberAddressesByDestAddress[destinationAddress] = arrMemberAddresses;
					arrAllMemberAddresses = arrAllMemberAddresses.concat(arrMemberAddresses);
					arrFuncs.push(function(cb){
						walletDefinedByAddresses.validateAddressDefinition(arrDefinition, cb);
					});
				}
				arrAllMemberAddresses = lodash.uniq(arrAllMemberAddresses);
				if (arrAllMemberAddresses.length === 0)
					throw Error("no member addresses in "+paymentJson);
				var findMyAddresses = function(cb){
					db.query(
						"SELECT address FROM my_addresses WHERE address IN(?) \n\
						UNION \n\
						SELECT shared_address AS address FROM shared_addresses WHERE shared_address IN(?)",
						[arrAllMemberAddresses, arrAllMemberAddresses],
						function(rows){
							var arrMyAddresses = rows.map(function(row){ return row.address; });
							for (var destinationAddress in assocMemberAddressesByDestAddress){
								var arrMemberAddresses = assocMemberAddressesByDestAddress[destinationAddress];
								if (lodash.intersection(arrMemberAddresses, arrMyAddresses).length > 0)
									assocSharedDestinationAddresses[destinationAddress] = true;
							}
							createMovementLines();
							$scope.arrHumanReadableDefinitions = [];
							for (var destinationAddress in objMultiPaymentRequest.definitions){
								var arrDefinition = objMultiPaymentRequest.definitions[destinationAddress].definition;
								var assocSignersByPath = objMultiPaymentRequest.definitions[destinationAddress].signers;
								var arrPeerAddresses = walletDefinedByAddresses.getPeerAddressesFromSigners(assocSignersByPath);
								if (lodash.difference(arrPeerAddresses, arrAllMemberAddresses).length !== 0)
									throw Error("inconsistent peer addresses");
								$scope.arrHumanReadableDefinitions.push({
									destinationAddress: destinationAddress,
									humanReadableDefinition: correspondentListService.getHumanReadableDefinition(arrDefinition, arrMyAddresses, [], arrPeerAddresses)
								});
							}
							cb();
						}
					);
				};
				var checkDuplicatePayment = function(cb){
					var objFirstPayment = objMultiPaymentRequest.payments[0];
					db.query(
						"SELECT 1 FROM outputs JOIN unit_authors USING(unit) JOIN my_addresses ON unit_authors.address=my_addresses.address \n\
						WHERE outputs.address=? AND amount=? LIMIT 1",
						[objFirstPayment.address, objFirstPayment.amount],
						function(rows){
							$scope.bAlreadyPaid = (rows.length > 0);
							cb();
						}
					);
				};
				arrFuncs.push(findMyAddresses);
				arrFuncs.push(checkDuplicatePayment);
				async.series(arrFuncs, function(err){
					if (err)
						$scope.error = err;
					else
						$scope.bDisabled = false;
					$timeout(function(){
						$scope.$apply();
					});
				});
			}
			else
				$scope.bDisabled = false;
			
			function insertSharedAddress(shared_address, arrDefinition, signers, cb){
				db.query("SELECT 1 FROM shared_addresses WHERE shared_address=?", [shared_address], function(rows){
					if (rows.length > 0){
						console.log('shared address '+shared_address+' already known');
						return cb();
					}
					walletDefinedByAddresses.handleNewSharedAddress({address: shared_address, definition: arrDefinition, signers: signers}, {
						ifOk: cb,
						ifError: function(err){
							throw Error('failed to create shared address '+shared_address+': '+err);
						}
					});
				});
			}

			
			$scope.pay = function() {
				console.log('pay');
				
				if (fc.isPrivKeyEncrypted()) {
					profileService.unlockFC(null, function(err) {
						if (err){
							$scope.error = err.message;
							$timeout(function(){
								$scope.$apply();
							});
							return;
						}
						$scope.pay();
					});
					return;
				}
				
				profileService.requestTouchid(function(err) {
					if (err) {
						profileService.lockFC();
						$scope.error = err;
						$timeout(function() {
							$scope.$digest();
						}, 1);
						return;
					}
					
					// create shared addresses
					var arrFuncs = [];
					for (var destinationAddress in assocSharedDestinationAddresses){
						(function(){ // use self-invoking function to isolate scope of da and make it different in different iterations
							var da = destinationAddress;
							arrFuncs.push(function(cb){
								var objDefinitionAndSigners = objMultiPaymentRequest.definitions[da];
								insertSharedAddress(da, objDefinitionAndSigners.definition, objDefinitionAndSigners.signers, cb);
							});
						})();
					}
					async.series(arrFuncs, function(){
						// shared addresses inserted, now pay
						var assocOutputsByAsset = {};
						objMultiPaymentRequest.payments.forEach(function(objPayment){
							var asset = objPayment.asset || 'base';
							if (!assocOutputsByAsset[asset])
								assocOutputsByAsset[asset] = [];
							assocOutputsByAsset[asset].push({address: objPayment.address, amount: objPayment.amount});
						});
						var arrNonBaseAssets = Object.keys(assocOutputsByAsset).filter(function(asset){ return (asset !== 'base'); });
						if (arrNonBaseAssets.length > 1){
							$scope.error = 'more than 1 non-base asset not supported';
							$timeout(function(){
								$scope.$apply();
							});
							return;
						}
						var asset = (arrNonBaseAssets.length > 0) ? arrNonBaseAssets[0] : null;
						var arrBaseOutputs = assocOutputsByAsset['base'] || [];
						var arrAssetOutputs = asset ? assocOutputsByAsset[asset] : null;
						var arrSigningDeviceAddresses = []; // empty list means that all signatures are required (such as 2-of-2)
						if (fc.credentials.m < fc.credentials.n)
							indexScope.copayers.forEach(function(copayer){
								if (copayer.me || copayer.signs)
									arrSigningDeviceAddresses.push(copayer.device_address);
							});
						else if (indexScope.shared_address)
							arrSigningDeviceAddresses = indexScope.copayers.map(function(copayer){ return copayer.device_address; });
						var current_multi_payment_key = require('crypto').createHash("sha256").update(paymentJson).digest('base64');
						if (current_multi_payment_key === indexScope.current_multi_payment_key){
							$rootScope.$emit('Local/ShowErrorAlert', "This payment is already under way");
							$modalInstance.dismiss('cancel');
							return;
						}
						indexScope.current_multi_payment_key = current_multi_payment_key;
						var recipient_device_address = lodash.clone(correspondent.device_address);
						fc.sendMultiPayment({
							asset: asset,
							arrSigningDeviceAddresses: arrSigningDeviceAddresses,
							recipient_device_address: recipient_device_address,
							base_outputs: arrBaseOutputs,
							asset_outputs: arrAssetOutputs
						}, function(err){ // can take long if multisig
							delete indexScope.current_multi_payment_key;
							if (err){
								if (chatScope){
									setError(err);
									$timeout(function() {
										chatScope.$apply();
									});
								}
								return;
							}
							$rootScope.$emit("NewOutgoingTx");
							var assocPaymentsByAsset = correspondentListService.getPaymentsByAsset(objMultiPaymentRequest);
							var bToSharedAddress = objMultiPaymentRequest.payments.some(function(objPayment){
								return assocSharedDestinationAddresses[objPayment.address];
							});
							for (var asset in assocPaymentsByAsset)
								eventBus.emit('sent_payment', recipient_device_address, assocPaymentsByAsset[asset], asset, bToSharedAddress);
						});
						$modalInstance.dismiss('cancel');
					});
				});
			}; // pay
			

			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			};
		};
		
		function extractAddressesFromDefinition(arrDefinition){
			var assocAddresses = {};
			function parse(arrSubdefinition){
				var op = arrSubdefinition[0];
				switch(op){
					case 'address':
					case 'cosigned by':
						assocAddresses[arrSubdefinition[1]] = true;
						break;
					case 'or':
					case 'and':
						arrSubdefinition[1].forEach(parse);
						break;
					case 'r of set':
						arrSubdefinition[1].set.forEach(parse);
						break;
					case 'weighted and':
						arrSubdefinition[1].set.forEach(function(arg){
							parse(arg.value);
						});
						break;
				}
			}
			parse(arrDefinition);
			return Object.keys(assocAddresses);
		}
		
		var modalInstance = $modal.open({
			templateUrl: 'views/modals/multi-payment.html',
			windowClass: animationService.modalAnimated.slideUp,
			controller: ModalInstanceCtrl,
			scope: $scope
		});

		var disableCloseModal = $rootScope.$on('closeModal', function() {
			modalInstance.dismiss('cancel');
		});

		modalInstance.result.finally(function() {
			$rootScope.modalOpened = false;
			disableCloseModal();
			var m = angular.element(document.getElementsByClassName('reveal-modal'));
			m.addClass(animationService.modalAnimated.slideOutDown);
		});
	};
	

	
	$scope.sendVote = function(voteJsonBase64){
		var voteJson = Buffer(voteJsonBase64, 'base64').toString('utf8');
		console.log("vote "+voteJson);
		var objVote = JSON.parse(voteJson);
		$rootScope.modalOpened = true;
		var self = this;
		var fc = profileService.focusedClient;
		
		var ModalInstanceCtrl = function($scope, $modalInstance) {
			$scope.choice = objVote.choice;
			$scope.color = fc.backgroundColor;
			$scope.bDisabled = true;
			setPollQuestion(true);
			
			function setPollQuestion(bFirstAttempt){
				db.query("SELECT question FROM polls WHERE unit=?", [objVote.poll_unit], function(rows){
					if (rows.length > 1)
						throw Error("more than 1 poll?");
					if (rows.length === 0){
						if (conf.bLight && bFirstAttempt){
							$scope.question = '[Fetching the question...]';
							network.requestProofsOfJointsIfNewOrUnstable([objVote.poll_unit], function(err){
								if (err){
									$scope.error = err;
									return scopeApply();
								}
								setPollQuestion();
							});
						}
						else
							$scope.question = '[No such poll: '+objVote.poll_unit+']';
					}
					else{
						$scope.question = rows[0].question;
						$scope.bDisabled = false;
					}
					scopeApply();
				});
			}
			
			function scopeApply(){
				$timeout(function(){
					$scope.$apply();
				});
			}

			function readVotingAddresses(handleAddresses){
				if (indexScope.shared_address)
					return handleAddresses([indexScope.shared_address]);
				db.query(
					"SELECT address, SUM(amount) AS total FROM my_addresses JOIN outputs USING(address) \n\
					WHERE wallet=? AND is_spent=0 AND asset IS NULL GROUP BY address ORDER BY total DESC LIMIT 16", 
					[fc.credentials.walletId], 
					function(rows){
						var arrAddresses = rows.map(function(row){ return row.address; });
						handleAddresses(arrAddresses);
					}
				);
			}
			
			$scope.vote = function() {
				console.log('vote');
				
				if (fc.isPrivKeyEncrypted()) {
					profileService.unlockFC(null, function(err) {
						if (err){
							$scope.error = err.message;
							return scopeApply();
						}
						$scope.vote();
					});
					return;
				}
				
				profileService.requestTouchid(function(err) {
					if (err) {
						profileService.lockFC();
						$scope.error = err;
						return scopeApply();
					}
					
					readVotingAddresses(function(arrAddresses){
						if (arrAddresses.length === 0){
							$scope.error = "Cannot vote, no funded addresses.";
							return scopeApply();
						}
						var payload = {unit: objVote.poll_unit, choice: objVote.choice};
						var objMessage = {
							app: 'vote',
							payload_location: "inline",
							payload_hash: objectHash.getBase64Hash(payload),
							payload: payload
						};

						var arrSigningDeviceAddresses = []; // empty list means that all signatures are required (such as 2-of-2)
						if (fc.credentials.m < fc.credentials.n)
							indexScope.copayers.forEach(function(copayer){
								if (copayer.me || copayer.signs)
									arrSigningDeviceAddresses.push(copayer.device_address);
							});
						else if (indexScope.shared_address)
							arrSigningDeviceAddresses = indexScope.copayers.map(function(copayer){ return copayer.device_address; });
						var current_vote_key = require('crypto').createHash("sha256").update(voteJson).digest('base64');
						if (current_vote_key === indexScope.current_vote_key){
							$rootScope.$emit('Local/ShowErrorAlert', "This vote is already under way");
							$modalInstance.dismiss('cancel');
							return;
						}
						var recipient_device_address = lodash.clone(correspondent.device_address);
						indexScope.current_vote_key = current_vote_key;
						fc.sendMultiPayment({
							arrSigningDeviceAddresses: arrSigningDeviceAddresses,
							paying_addresses: arrAddresses,
							signing_addresses: arrAddresses,
							shared_address: indexScope.shared_address,
							change_address: arrAddresses[0],
							messages: [objMessage]
						}, function(err){ // can take long if multisig
							delete indexScope.current_vote_key;
							if (err){
								if (chatScope){
									setError(err);
									$timeout(function() {
										chatScope.$apply();
									});
								}
								return;
							}
							var body = 'voted:'+objVote.choice;
							device.sendMessageToDevice(recipient_device_address, 'text', body);
							correspondentListService.addMessageEvent(false, recipient_device_address, body);
							$rootScope.$emit("NewOutgoingTx");
						});
						$modalInstance.dismiss('cancel');
					});
					
				});
			}; // vote
			

			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			};
		};
		
		
		var modalInstance = $modal.open({
			templateUrl: 'views/modals/vote.html',
			windowClass: animationService.modalAnimated.slideUp,
			controller: ModalInstanceCtrl,
			scope: $scope
		});

		var disableCloseModal = $rootScope.$on('closeModal', function() {
			modalInstance.dismiss('cancel');
		});

		modalInstance.result.finally(function() {
			$rootScope.modalOpened = false;
			disableCloseModal();
			var m = angular.element(document.getElementsByClassName('reveal-modal'));
			m.addClass(animationService.modalAnimated.slideOutDown);
		});
		
	}; // sendVote
	
	
	
	
	// send a command to the bot
	$scope.sendCommand = function(command, description){
		console.log("will send command "+command);
		$scope.message = command;
		$scope.send();
	};
	
	$scope.openExternalLink = function(url){
		if (typeof nw !== 'undefined')
			nw.Shell.openExternal(url);
		else if (isCordova)
			cordova.InAppBrowser.open(url, '_system');
	};

	$scope.editCorrespondent = function() {
		go.path('correspondentDevices.correspondentDevice.editCorrespondentDevice');
	};

	$scope.loadMoreHistory = function(cb) {
		correspondentListService.loadMoreHistory(correspondent, cb);
	}

	$scope.autoScrollEnabled = true;
	$scope.loadMoreHistory(function(){
		for (var i in $scope.messageEvents) {
			var message = $scope.messageEvents[i];
			if (message.chat_recording_status) {
				return;
			}
		}
		breadcrumbs.add("correspondent with empty chat opened: " + correspondent.device_address);
		var message = {
			type: 'system',
			bIncoming: false,
			message: JSON.stringify({state: (correspondent.peer_record_pref && correspondent.my_record_pref ? true : false)}),
			timestamp: Math.floor(+ new Date() / 1000),
			chat_recording_status: true
		};
		chatStorage.store(correspondent.device_address, message.message, 0, 'system');
		$scope.messageEvents.push(correspondentListService.parseMessage(message));
	});

	function setError(error){
		console.log("send error:", error);
		$scope.error = error;
	}
	
	function readLastMainChainIndex(cb){
		if (conf.bLight){
			network.requestFromLightVendor('get_last_mci', null, function(ws, request, response){
				response.error ? cb(response.error) : cb(null, response);
			});
		}
		else
			storage.readLastMainChainIndex(function(last_mci){
				cb(null, last_mci);
			})
	}
	
	function readMyPaymentAddress(cb){
	//	if (indexScope.shared_address)
	//		return cb(indexScope.shared_address);
		addressService.getAddress(profileService.focusedClient.credentials.walletId, false, function(err, address) {
			cb(address);
		});
	}
	
	function issueNextAddress(cb){
		var walletDefinedByKeys = require('intervaluecore/wallet_defined_by_keys.js');
		walletDefinedByKeys.issueNextAddress(profileService.focusedClient.credentials.walletId, 0, function(addressInfo){
			if (cb)
				cb(addressInfo.address);
		});
	}
	
	/*
	function issueNextAddressIfNecessary(onDone){
		if (myPaymentAddress) // do not issue new address
			return onDone();
		var walletDefinedByKeys = require('intervaluecore/wallet_defined_by_keys.js');
		walletDefinedByKeys.issueOrSelectNextAddress(fc.credentials.walletId, 0, function(addressInfo){
			myPaymentAddress = addressInfo.address; // cache it in case we need to insert again
			onDone();
			$scope.$apply();
		});
	}*/
	
	function appendText(text){
		if (!$scope.message)
			$scope.message = '';
		if ($scope.message && $scope.message.charAt($scope.message.length - 1) !== ' ')
			$scope.message += ' ';
		$scope.message += text;
		$scope.message += ' ';
		if (!document.chatForm || !document.chatForm.message) // already gone
			return;
		var msgField = document.chatForm.message;
		$timeout(function(){$rootScope.$digest()});
		msgField.selectionStart = msgField.selectionEnd = msgField.value.length;
	}
	
	function appendMyPaymentAddress(myPaymentAddress){
		appendText(myPaymentAddress);
	}
	
	function showRequestPaymentModal(myPaymentAddress){
		$rootScope.modalOpened = true;
		var self = this;
		var fc = profileService.focusedClient;
		var ModalInstanceCtrl = function($scope, $modalInstance) {
			var config = configService.getSync();
			var configWallet = config.wallet;
			var walletSettings = configWallet.settings;
			$scope.unitValue = walletSettings.unitValue;
			$scope.unitName = walletSettings.unitName;
			$scope.bbUnitValue = walletSettings.bbUnitValue;
			$scope.bbUnitName = walletSettings.bbUnitName;
			$scope.color = fc.backgroundColor;
			$scope.isCordova = isCordova;
			$scope.buttonLabel = 'Request payment';
			//$scope.selectedAsset = $scope.index.arrBalances[$scope.index.assetIndex];
			//console.log($scope.index.arrBalances.length+" assets, current: "+$scope.asset);

			Object.defineProperty($scope,
				"_customAmount", {
				get: function() {
					return $scope.customAmount;
				},
				set: function(newValue) {
					$scope.customAmount = newValue;
				},
				enumerable: true,
				configurable: true
			});

			$scope.submitForm = function(form) {
				if ($scope.index.arrBalances.length === 0)
					return console.log('showRequestPaymentModal: no balances yet');
				var amount = form.amount.$modelValue;
				//var asset = form.asset.$modelValue;
				var asset = $scope.index.arrBalances[$scope.index.assetIndex].asset;
				if (!asset)
					throw Error("no asset");
				var amountInSmallestUnits = profileService.getAmountInSmallestUnits(amount, asset);
				var params = 'amount='+amountInSmallestUnits;
				if (asset !== 'base')
					params += '&asset='+encodeURIComponent(asset);
				var units = profileService.getUnitName(asset);
				appendText('['+amount+' '+units+'](intervalue:'+myPaymentAddress+'?'+params+')');
				$modalInstance.dismiss('cancel');
			};

			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			};
		};

		var modalInstance = $modal.open({
			templateUrl: 'views/modals/customized-amount.html',
			windowClass: animationService.modalAnimated.slideUp,
			controller: ModalInstanceCtrl,
			scope: $scope
		});

		var disableCloseModal = $rootScope.$on('closeModal', function() {
			modalInstance.dismiss('cancel');
		});

		modalInstance.result.finally(function() {
			$rootScope.modalOpened = false;
			disableCloseModal();
			var m = angular.element(document.getElementsByClassName('reveal-modal'));
			m.addClass(animationService.modalAnimated.slideOutDown);
		});
	}
	

	
	function parsePrivateProfile(objPrivateProfile, onDone){
		function handleJoint(objJoint){
			var attestor_address = objJoint.unit.authors[0].address;
			var payload;
			objJoint.unit.messages.forEach(function(message){
				if (message.app !== 'attestation' || message.payload_hash !== objPrivateProfile.payload_hash)
					return;
				payload = message.payload;
			});
			if (!payload)
				return onDone("no such payload hash in this unit");
			var hidden_profile = {};
			var bHasHiddenFields = false;
			for (var field in objPrivateProfile.src_profile){
				var value = objPrivateProfile.src_profile[field];
				if (ValidationUtils.isArrayOfLength(value, 2))
					hidden_profile[field] = objectHash.getBase64Hash(value);
				else if (ValidationUtils.isStringOfLength(value, constants.HASH_LENGTH)){
					hidden_profile[field] = value;
					bHasHiddenFields = true;
				}
				else
					return onDone("invalid src profile");
			}
			if (objectHash.getBase64Hash(hidden_profile) !== payload.profile.profile_hash)
				return onDone("wrong profile hash");
			db.query(
				"SELECT 1 FROM my_addresses WHERE address=? UNION SELECT 1 FROM shared_addresses WHERE shared_address=?", 
				[payload.address, payload.address],
				function(rows){
					var bMyAddress = (rows.length > 0);
					if (bMyAddress && bHasHiddenFields){
						console.log("profile of my address but has hidden fields");
						bMyAddress = false;
					}
					onDone(null, payload.address, attestor_address, bMyAddress);
				}
			);
		}
		storage.readJoint(db, objPrivateProfile.unit, {
			ifNotFound: function(){
				eventBus.once('saved_unit-'+objPrivateProfile.unit, handleJoint);
				if (conf.bLight)
					network.requestHistoryFor([objPrivateProfile.unit], []);
			},
			ifFound: handleJoint
		});
	}
	
	function checkIfPrivateProfileExists(objPrivateProfile, handleResult){
		db.query("SELECT 1 FROM private_profiles WHERE unit=? AND payload_hash=?", [objPrivateProfile.unit, objPrivateProfile.payload_hash], function(rows){
			handleResult(rows.length > 0);
		});
	}
	
	function getDisplayField(field){
		switch (field){
			case 'first_name': return gettext('First name');
			case 'last_name': return gettext('Last name');
			case 'dob': return gettext('Date of birth');
			case 'country': return gettext('Country');
			case 'us_state': return gettext('US state');
			case 'id_number': return gettext('ID number');
			case 'id_type': return gettext('ID type');
			case 'id_subtype': return gettext('ID subtype');
			default: return field;
		}
	}
	
	$scope.acceptPrivateProfile = function(privateProfileJsonBase64){
		$rootScope.modalOpened = true;
		var privateProfileJson = Buffer(privateProfileJsonBase64, 'base64').toString('utf8');
		var objPrivateProfile = JSON.parse(privateProfileJson);
		var fc = profileService.focusedClient;
		var ModalInstanceCtrl = function($scope, $modalInstance) {
			$scope.color = fc.backgroundColor;
			var openProfile = {};
			for (var field in objPrivateProfile.src_profile)
				if (Array.isArray(objPrivateProfile.src_profile[field]))
					openProfile[field] = objPrivateProfile.src_profile[field][0];
			$scope.openProfile = openProfile;
			$scope.bDisabled = true;
			$scope.buttonLabel = gettext('Verifying the profile...');
			parsePrivateProfile(objPrivateProfile, function(error, address, attestor_address, bMyAddress){
				if (!$scope)
					return;
				if (error){
					$scope.error = error;
					$scope.buttonLabel = gettext('Bad profile');
					$timeout(function() {
						$rootScope.$apply();
					});
					return;
				}
				$scope.address = address;
				$scope.attestor_address = attestor_address;
				$scope.bMyAddress = bMyAddress;
				if (!bMyAddress)
					return $timeout(function() {
						$rootScope.$apply();
					});
				checkIfPrivateProfileExists(objPrivateProfile, function(bExists){
					if (bExists)
						$scope.buttonLabel = gettext('Already saved');
					else{
						$scope.buttonLabel = gettext('Store');
						$scope.bDisabled = false;
					}
					$timeout(function() {
						$rootScope.$apply();
					});
				});
			});
			
			$scope.getDisplayField = getDisplayField;

			$scope.store = function() {
				if (!$scope.bMyAddress)
					throw Error("not my address");
				db.query(
					"INSERT "+db.getIgnore()+" INTO private_profiles (unit, payload_hash, attestor_address, address, src_profile) VALUES(?,?,?,?,?)", 
					[objPrivateProfile.unit, objPrivateProfile.payload_hash, $scope.attestor_address, $scope.address, JSON.stringify(objPrivateProfile.src_profile)], 
					function(res){
						var private_profile_id = res.insertId;
						var arrQueries = [];
						for (var field in objPrivateProfile.src_profile){
							var arrValueAndBlinding = objPrivateProfile.src_profile[field];
							db.addQuery(arrQueries, "INSERT INTO private_profile_fields (private_profile_id, field, value, blinding) VALUES(?,?,?,?)", 
								[private_profile_id, field, arrValueAndBlinding[0], arrValueAndBlinding[1] ]);
						}
						async.series(arrQueries, function(){
							$timeout(function(){
								$modalInstance.dismiss('cancel');
							});
						});
					}
				);
			};

			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			};
		};

		var modalInstance = $modal.open({
			templateUrl: 'views/modals/accept-profile.html',
			windowClass: animationService.modalAnimated.slideUp,
			controller: ModalInstanceCtrl,
			scope: $scope
		});

		var disableCloseModal = $rootScope.$on('closeModal', function() {
			modalInstance.dismiss('cancel');
		});

		modalInstance.result.finally(function() {
			$rootScope.modalOpened = false;
			disableCloseModal();
			var m = angular.element(document.getElementsByClassName('reveal-modal'));
			m.addClass(animationService.modalAnimated.slideOutDown);
		});
	};
	
	
	
	$scope.choosePrivateProfile = function(fields_list){
		$rootScope.modalOpened = true;
		var arrFields = fields_list ? fields_list.split(',') : [];
		var fc = profileService.focusedClient;
		var ModalInstanceCtrl = function($scope, $modalInstance) {
			$scope.color = fc.backgroundColor;
			$scope.requested = !!fields_list;
			$scope.bDisabled = true;
			var sql = fields_list
				? "SELECT private_profiles.*, COUNT(*) AS c FROM private_profile_fields JOIN private_profiles USING(private_profile_id) \n\
					WHERE field IN(?) GROUP BY private_profile_id HAVING c=?"
				: "SELECT * FROM private_profiles";
			var params = fields_list ? [arrFields, arrFields.length] : [];
			readMyPaymentAddress(function(current_address){
				db.query(sql, params, function(rows){
					var arrProfiles = [];
					async.eachSeries(
						rows,
						function(row, cb){
							var profile = row;
							db.query(
								"SELECT field, value, blinding FROM private_profile_fields WHERE private_profile_id=? ORDER BY rowid", 
								[profile.private_profile_id], 
								function(vrows){
									profile.entries = vrows;
									var assocValuesByField = {};
									profile.entries.forEach(function(entry){
										entry.editable = !fields_list;
										if (arrFields.indexOf(entry.field) >= 0)
											entry.provided = true;
										assocValuesByField[entry.field] = entry.value;
									});
									if (fields_list){
										profile._label = assocValuesByField[arrFields[0]];
										if (arrFields[1])
											profile._label += ' ' + assocValuesByField[arrFields[1]];
									}
									else{
										profile._label = profile.entries[0].value;
										if (profile.entries[1])
											profile._label += ' ' + profile.entries[1].value;
									}
									profile.bCurrentAddress = (profile.address === current_address);
									arrProfiles.push(profile);
									cb();
								}
							);
						},
						function(){
							// add date if duplicate labels
							var assocLabels = {};
							var assocDuplicateLabels = {};
							arrProfiles.forEach(function(profile){
								if (assocLabels[profile._label])
									assocDuplicateLabels[profile._label] = true;
								assocLabels[profile._label] = true;
							});
							arrProfiles.forEach(function(profile){
								if (assocDuplicateLabels[profile._label])
									profile._label += ' ' + profile.creation_date;
							});
							// sort profiles: current address first
							arrProfiles.sort(function(p1, p2){
								if (p1.bCurrentAddress && !p2.bCurrentAddress)
									return -1;
								if (!p1.bCurrentAddress && p2.bCurrentAddress)
									return 1;
								return (p1.creation_date > p2.creation_date) ? -1 : 1; // newest first
							});
							$scope.arrProfiles = arrProfiles;
							$scope.selected_profile = arrProfiles[0];
							$scope.bDisabled = false;
							if (arrProfiles.length === 0){
								if (!fields_list)
									$scope.noProfiles = true;
								else
									db.query("SELECT 1 FROM private_profiles LIMIT 1", function(rows2){
										if (rows2.length > 0)
											return;
										$scope.noProfiles = true;
										$timeout(function() {
											$rootScope.$apply();
										});
									});
							}
							$timeout(function() {
								$rootScope.$apply();
							});
						}
					);
				});
			});
			
			$scope.getDisplayField = getDisplayField;
			
			$scope.noFieldsProvided = function(){
				var entries = $scope.selected_profile.entries;
				for (var i=0; i<entries.length; i++)
					if (entries[i].provided)
						return false;
				return true;
			};
			
			$scope.send = function() {
				var profile = $scope.selected_profile;
				if (!profile)
					throw Error("no selected profile");
				var objPrivateProfile = {
					unit: profile.unit,
					payload_hash: profile.payload_hash,
					src_profile: {}
				};
				profile.entries.forEach(function(entry){
					var value = [entry.value, entry.blinding];
					objPrivateProfile.src_profile[entry.field] = entry.provided ? value : objectHash.getBase64Hash(value);
				});
				console.log('will send '+JSON.stringify(objPrivateProfile));
				var privateProfileJsonBase64 = Buffer.from(JSON.stringify(objPrivateProfile)).toString('base64');
				appendText('[Private profile](profile:'+privateProfileJsonBase64+')');
				$modalInstance.dismiss('cancel');
			};

			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			};
		};

		var modalInstance = $modal.open({
			templateUrl: 'views/modals/choose-profile.html',
			windowClass: animationService.modalAnimated.slideUp,
			controller: ModalInstanceCtrl,
			scope: $scope
		});

		var disableCloseModal = $rootScope.$on('closeModal', function() {
			modalInstance.dismiss('cancel');
		});

		modalInstance.result.finally(function() {
			$rootScope.modalOpened = false;
			disableCloseModal();
			var m = angular.element(document.getElementsByClassName('reveal-modal'));
			m.addClass(animationService.modalAnimated.slideOutDown);
		});
	};
	
	

	function setOngoingProcess(name) {
		if (isCordova) {
			if (name) {
				window.plugins.spinnerDialog.hide();
				window.plugins.spinnerDialog.show(null, name + '...', true);
			} else {
				window.plugins.spinnerDialog.hide();
			}
		} else {
			$scope.onGoingProcess = name;
			$timeout(function() {
				$rootScope.$apply();
			});
		}
	};

	$scope.goToCorrespondentDevices = function() {
		$deepStateRedirect.reset('correspondentDevices');
		go.path('correspondentDevices');
	}
}).directive('sendPayment', function($compile){
	console.log("sendPayment directive");
	return {
		replace: true,
		//scope: {address: '@'},
		//template: '<a ng-click="sendPayment(address)">{{address}}</a>',
		//template: '<a ng-click="console.log(789)">{{address}} 88</a>',
		link: function($scope, element, attrs){
			console.log("link called", attrs, element);
			//element.attr('ng-click', "console.log(777)");
			//element.removeAttr('send-payment');
			//$compile(element)($scope);
			//$compile(element.contents())($scope);
			//element.replaceWith($compile('<a ng-click="sendPayment(\''+attrs.address+'\')">'+attrs.address+'</a>')(scope));
			//element.append($compile('<a ng-click="console.log(123456)">'+attrs.address+' 99</a>')($scope));
			element.bind('click', function(){
				console.log('clicked', attrs);
				$scope.sendPayment(attrs.address);
			});
		}
	};
}).directive('dynamic', function ($compile) {
	return {
		restrict: 'A',
		replace: true,
		link: function (scope, ele, attrs) {
			scope.$watch(attrs.dynamic, function(html) {
				ele.html(html);
				$compile(ele.contents())(scope);
			});
		}
	};
}).directive('scrollBottom', function ($timeout) { // based on http://plnkr.co/edit/H6tFjw1590jHT28Uihcx?p=preview
	return {
		link: function (scope, element) {
			scope.$watchCollection('messageEvents', function (newCollection) {
				if (newCollection)
					$timeout(function(){
						if (scope.autoScrollEnabled)
							element[0].scrollTop = element[0].scrollHeight;
					}, 100);
			});
		}
	}
}).directive('bindToHeight', function ($window) {
	return {
		restrict: 'A',
		link: function (scope, elem, attrs) {
			var attributes = scope.$eval(attrs['bindToHeight']);
			var targetElem = angular.element(document.querySelector(attributes[1]));

			// Watch for changes
			scope.$watch(function () {
				return targetElem[0].clientHeight;
			},
			function (newValue, oldValue) {
				if (newValue != oldValue && newValue != 0) {
					elem.css(attributes[0], newValue + 'px');
					//elem[0].scrollTop = elem[0].scrollHeight;
				}
			});
		}
	};
}).directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown", function onNgEnterKeydown(e) {
            if(e.which === 13 && !e.shiftKey) {
                scope.$apply(function(){
                    scope.$eval(attrs.ngEnter, {'e': e});
                });
                e.preventDefault();
            }
        });
    };
}).directive('whenScrolled', ['$timeout', function($timeout) {
	function ScrollPosition(node) {
	    this.node = node;
	    this.previousScrollHeightMinusTop = 0;
	    this.readyFor = 'up';
	}

	ScrollPosition.prototype.restore = function () {
	    if (this.readyFor === 'up') {
	        this.node.scrollTop = this.node.scrollHeight
	            - this.previousScrollHeightMinusTop;
	    }
	}

	ScrollPosition.prototype.prepareFor = function (direction) {
	    this.readyFor = direction || 'up';
	    this.previousScrollHeightMinusTop = this.node.scrollHeight
	        - this.node.scrollTop;
	}

    return function(scope, elm, attr) {
        var raw = elm[0];

        var chatScrollPosition = new ScrollPosition(raw);
        
        $timeout(function() {
            raw.scrollTop = raw.scrollHeight;
        });
        
        elm.bind('scroll', function() {
        	if (raw.scrollTop + raw.offsetHeight != raw.scrollHeight) 
        		scope.autoScrollEnabled = false;
        	else 
        		scope.autoScrollEnabled = true;
            if (raw.scrollTop <= 20 && !scope.loadingHistory) { // load more items before you hit the top
                scope.loadingHistory = true;
                chatScrollPosition.prepareFor('up');
            	scope[attr.whenScrolled](function(){
            		scope.$digest();
                	chatScrollPosition.restore();
                	scope.loadingHistory = false;
                });
            }
        });
    };
}]);

'use strict';

angular.module('copayApp.controllers').controller('correspondentDevicesController',
  function($scope, $timeout, configService, profileService, go, correspondentListService, $state, $rootScope) {
	
	var self = this;
	
	var wallet = require('intervaluecore/wallet.js');
	var bots = require('intervaluecore/bots.js');
	var mutex = require('intervaluecore/mutex.js');
	$scope.editCorrespondentList = false;
	$scope.selectedCorrespondentList = {};
	var fc = profileService.focusedClient;
	$scope.backgroundColor = fc.backgroundColor;

	$scope.state = $state;

	$scope.hideRemove = true;

	var listScrollTop = 0;

	$scope.$on('$stateChangeStart', function(evt, toState, toParams, fromState) {
	    if (toState.name === 'correspondentDevices') {
	        $scope.readList();
	    	setTimeout(function(){document.querySelector('[ui-view=chat]').scrollTop = listScrollTop;$rootScope.$emit('Local/SetTab', 'chat', true);}, 5);
	    }
	});

	$scope.showCorrespondent = function(correspondent) {
		console.log("showCorrespondent", correspondent);
		correspondentListService.currentCorrespondent = correspondent;
		listScrollTop = document.querySelector('[ui-view=chat]').scrollTop;
		go.path('correspondentDevices.correspondentDevice');
	};

	$scope.showBot = function(bot) {
		$state.go('correspondentDevices.bot', {id: bot.id});
	};

	$scope.toggleEditCorrespondentList = function() {
		$scope.editCorrespondentList = !$scope.editCorrespondentList;
		$scope.selectedCorrespondentList = {};
	};

	$scope.toggleSelectCorrespondentList = function(addr) {
		$scope.selectedCorrespondentList[addr] = $scope.selectedCorrespondentList[addr] ? false : true;
	};

	$scope.newMsgByAddressComparator = function(correspondent) {
	      return (-$scope.newMessagesCount[correspondent.device_address]||correspondent.name.toLowerCase());
	};

	$scope.beginAddCorrespondent = function() {
		console.log("beginAddCorrespondent");
		listScrollTop = document.querySelector('[ui-view=chat]').scrollTop;
		go.path('correspondentDevices.addCorrespondentDevice');
	};


	$scope.readList = function() {
		$scope.error = null;
		correspondentListService.list(function(err, ab) {
			if (err) {
				$scope.error = err;
				return;
			}

			wallet.readDeviceAddressesUsedInSigningPaths(function(arrNotRemovableDeviceAddresses) {

				// add a new property indicating whether the device can be removed or not
				
				var length = ab.length;
				for (var i = 0; i < length; i++) {
 				 	corrDev = ab[i];

				 	corrDevAddr = corrDev.device_address;
					
				 	var ix = arrNotRemovableDeviceAddresses.indexOf(corrDevAddr);
					
					// device is removable when not in list
				 	corrDev.removable = (ix == -1);
				}
			});
		
			$scope.list = ab;

			bots.load(function(err, rows){
				if (err) $scope.botsError = err.toString();
				$scope.bots = rows;
				$timeout(function(){
					$scope.$digest();
				});
			});
		});
	};
	
	$scope.hideRemoveButton = function(removable){
		return $scope.hideRemove || !removable;
	}

	$scope.remove = function(device_address) {
		mutex.lock(["remove_device"], function(unlock){
			// check to be safe
			wallet.determineIfDeviceCanBeRemoved(device_address, function(bRemovable) {
				if (!bRemovable) {
					unlock();
					return console.log('device '+device_address+' is not removable');
				}
				var device = require('intervaluecore/device.js');

				// send message to paired device
				// this must be done before removing the device
				device.sendMessageToDevice(device_address, "removed_paired_device", "removed");

				// remove device
				device.removeCorrespondentDevice(device_address, function() {
					unlock();
					$scope.hideRemove = true;
					correspondentListService.currentCorrespondent = null;
					$scope.readList();
					$rootScope.$emit('Local/SetTab', 'chat', true);
					setTimeout(function(){document.querySelector('[ui-view=chat]').scrollTop = listScrollTop;}, 5);
				});
			});
		});
	};

	$scope.cancel = function() {
		console.log("cancel clicked");
		go.walletHome();
	};

  });

'use strict';

angular.module('copayApp.controllers').controller('createController',
  function($scope, $rootScope, $location, $timeout, $log, lodash, go, profileService, configService, isCordova, gettext, isMobile, derivationPathHelper, correspondentListService) {

	var self = this;
	var defaults = configService.getDefaults();
	this.isWindowsPhoneApp = isMobile.Windows() && isCordova;
	$scope.account = 1;

	var defaults = configService.getDefaults();
	$scope.derivationPath = derivationPathHelper.default;

	// ng-repeat defined number of times instead of repeating over array?
	this.getNumber = function(num) {
		return new Array(num);
	}

	var updateRCSelect = function(n) {
		$scope.totalCosigners = n;
		self.RCValues = lodash.range(1, n + 1);
		if ($scope.requiredCosigners > n || !$scope.requiredCosigners)
			$scope.requiredCosigners = parseInt(n / 2 + 1);
	};

	var updateSeedSourceSelect = function(n) {
		self.seedOptions = [{
			id: 'new',
			label: gettext('New Random Seed')
		}, {
			id: 'set',
			label: gettext('Specify Seed...')
		}];
		$scope.seedSource = self.seedOptions[0];
	};

	this.TCValues = lodash.range(2, defaults.limits.totalCosigners + 1);
	$scope.totalCosigners = defaults.wallet.totalCosigners;
	this.cosigners = [];//Array($scope.totalCosigners);
	for (var i=0; i<$scope.totalCosigners-1; i++)
		this.cosigners.push({});
	correspondentListService.list(function(err, ab){
		self.candidate_cosigners = ab;
		$scope.$digest();
	});
	
	/*
	$scope.$watch(function(){return $scope.totalCosigners;}, function(newVal, oldVal){
		console.log("watch "+oldVal+" "+newVal);
		if (newVal > oldVal)
			for (var i=oldVal; i<newVal-1; i++)
				self.cosigners.push({});
		else
			self.cosigners.length = newVal-1;
	}, true);*/

	this.setTotalCosigners = function(tc) {
		var oldLen = self.cosigners.length;
		var newLen = tc-1;
		if (newLen > oldLen)
			for (var i=oldLen; i<newLen; i++)
				self.cosigners.push({});
		else if (newLen < oldLen)
			self.cosigners.length = newLen;
		
		updateRCSelect(tc);
		updateSeedSourceSelect(tc);
		self.seedSourceId = $scope.seedSource.id;
	};
	
	this.setMultisig = function(){
		this.setTotalCosigners(3);
		$scope.requiredCosigners = 2;
	};
	
	this.onCorrespondentSelected = function(device_address){
		console.log(device_address);
		if (device_address === "new")
			go.path('correspondentDevices.addCorrespondentDevice');
	};


	this.setSeedSource = function(src) {
		self.seedSourceId = $scope.seedSource.id;

		$timeout(function() {
			$rootScope.$apply();
		});
	};

	function setError(error){
		self.error = gettext(error);
	}
	
	this.create = function(form) {
		if (form && form.$invalid) {
			this.error = gettext('Please enter the required fields');
			return;
		}
		if (self.cosigners.length !== $scope.totalCosigners - 1)
			return setError("invalid number of cosigners");

		var opts = {
			m: $scope.requiredCosigners,
			n: $scope.totalCosigners,
			name: form.walletName.$modelValue,
			networkName: 'livenet',
			cosigners: [],
			isSingleAddress: $scope.isSingleAddress
		};
		if ($scope.totalCosigners > 1){
			opts.cosigners = lodash.uniq(self.cosigners.map(function(cosigner){ return cosigner.device_address; }));
			if (opts.cosigners.length !== $scope.totalCosigners - 1)
				return setError("Please select different co-signers");
			for (var i=0; i<opts.cosigners.length; i++)
				if (!opts.cosigners[i] || opts.cosigners[i].length !== 33)
					return setError("Please fill all co-signers");
		}
		/*
		var setSeed = self.seedSourceId == 'set';
		if (setSeed) {

			var words = form.privateKey.$modelValue || '';
			if (words.indexOf(' ') == -1 && words.indexOf('prv') == 1 && words.length > 108)
				opts.extendedPrivateKey = words;
			else
				opts.mnemonic = words;

			opts.passphrase = form.passphrase.$modelValue;

			var pathData = derivationPathHelper.parse($scope.derivationPath);
			if (!pathData) {
				this.error = gettext('Invalid derivation path');
				return;
			}

			opts.account = pathData.account;
			opts.networkName = pathData.networkName;
			opts.derivationStrategy = pathData.derivationStrategy;

		}
		else
			opts.passphrase = form.createPassphrase.$modelValue;

		if (setSeed && !opts.mnemonic && !opts.extendedPrivateKey) {
			this.error = gettext('Please enter the wallet seed');
			return;
		}
		*/
	  
		self._create(opts);
	};
	

	this._create = function(opts) {
		self.loading = true;
		$timeout(function() {
			profileService.createWallet(opts, function(err, walletId) {
				self.loading = false;
				if (err) {
					$log.warn(err);
					self.error = err;
					$timeout(function() {
						$rootScope.$apply();
					});
					return;
				}

				//if (opts.mnemonic || opts.externalSource || opts.extendedPrivateKey) {
				if (opts.externalSource) {
					if (opts.n == 1) {
						$rootScope.$emit('Local/WalletImported', walletId);
					}
				}
				/*if (opts.n > 1)
					$rootScope.$emit('Local/ShowAlert', "Please approve wallet creation on other devices", 'fi-key', function(){
						go.walletHome();
					});*/

				if (opts.isSingleAddress) {
					profileService.setSingleAddressFlag(true);
				}
			});
		}, 100);
	}

	this.formFocus = function(what) {
		if (!this.isWindowsPhoneApp) 
			return;

		if (what && what == 'my-name') {
			this.hideWalletName = true;
			this.hideTabs = true;
		} else if (what && what == 'wallet-name') {
			this.hideTabs = true;
		} else {
			this.hideWalletName = false;
			this.hideTabs = false;
		}
		$timeout(function() {
			$rootScope.$digest();
		}, 1);
	};

	$scope.$on("$destroy", function() {
		$rootScope.hideWalletNavigation = false;
	});

	updateSeedSourceSelect(1);
	self.setSeedSource('new');
  });

'use strict';

angular.module('copayApp.controllers').controller('disclaimerController',
  function($scope, $timeout, storageService, applicationService, gettextCatalog, isCordova, uxLanguage, go, $rootScope) {

	if (!isCordova && process.platform === 'win32' && navigator.userAgent.indexOf('Windows NT 5.1') >= 0)
		$rootScope.$emit('Local/ShowAlert', "Windows XP is not supported", 'fi-alert', function() {
			process.exit();
		});
	
    $scope.agree = function() {
      if (isCordova) {
        window.plugins.spinnerDialog.show(null, gettextCatalog.getString('Loading...'), true);
      }
      $scope.loading = true;
      $timeout(function() {
        storageService.setDisclaimerFlag(function(err) {
            $timeout(function() {
                if (isCordova)
                    window.plugins.spinnerDialog.hide();
                // why reload the page?
                //applicationService.restart();
                go.walletHome();
            }, 1000);
        });
      }, 100);
    };
    
    $scope.init = function() {
      storageService.getDisclaimerFlag(function(err, val) {
        $scope.lang = uxLanguage.currentLanguage;
        $scope.agreed = val;
        $timeout(function() {
          $scope.$digest();
        }, 1);
      });
    };
  });

'use strict';

angular.module('copayApp.controllers').controller('editCorrespondentDeviceController',
  function($scope, $rootScope, $timeout, configService, profileService, isCordova, go, correspondentListService, $modal, animationService) {
	
	var self = this;
	
	var fc = profileService.focusedClient;
	$scope.backgroundColor = fc.backgroundColor;
	var correspondent = correspondentListService.currentCorrespondent;
	$scope.correspondent = correspondent;
	$scope.name = correspondent.name;
	$scope.hub = correspondent.hub;

	$scope.save = function() {
		$scope.error = null;
		correspondent.name = $scope.name;
		correspondent.hub = $scope.hub;
		var device = require('intervaluecore/device.js');
		device.updateCorrespondentProps(correspondent, function(){
			go.path('correspondentDevices.correspondentDevice');
		});
	};

	$scope.purge_chat = function() {
      var ModalInstanceCtrl = function($scope, $modalInstance, $sce, gettext) {
        $scope.title = $sce.trustAsHtml('Delete the whole chat history with ' + correspondent.name + '?');

        $scope.ok = function() {
          $modalInstance.close(true);
          go.path('correspondentDevices.correspondentDevice');

        };
        $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
          go.path('correspondentDevices.correspondentDevice.editCorrespondentDevice');
        };
      };

      var modalInstance = $modal.open({
        templateUrl: 'views/modals/confirmation.html',
        windowClass: animationService.modalAnimated.slideUp,
        controller: ModalInstanceCtrl
      });

      modalInstance.result.finally(function() {
        var m = angular.element(document.getElementsByClassName('reveal-modal'));
        m.addClass(animationService.modalAnimated.slideOutDown);
      });

      modalInstance.result.then(function(ok) {
        if (ok) {
          	var chatStorage = require('intervaluecore/chat_storage.js');
			chatStorage.purge(correspondent.device_address);
			correspondentListService.messageEventsByCorrespondent[correspondent.device_address] = [];
        }
        
      });
	}

	function setError(error){
		$scope.error = error;
	}

	
});

'use strict';

angular.module('copayApp.controllers').controller('exportController',
	function($rootScope, $scope, $timeout, $log, $filter, backupService, storageService, fileSystemService, isCordova, isMobile, gettextCatalog, notification) {

		var async = require('async');
		var crypto = require('crypto');
		var conf = require('intervaluecore/conf');
		var zip;
		if (isCordova) {
			var JSZip = require("jszip");
			zip = new JSZip();
		} else {
			var _zip = require('zip' + '');
			zip = null;
		}

		var self = this;
		self.error = null;
		self.success = null;
		self.password = null;
		self.repeatpassword = null;
		self.exporting = false;
		self.isCordova = isCordova;
		self.bCompression = false;
		self.connection = null;

		function addDBAndConfToZip(cb) {
			var dbDirPath = fileSystemService.getDatabaseDirPath() + '/';
			fileSystemService.readdir(dbDirPath, function(err, listFilenames) {
				if (err) return cb(err);
				listFilenames = listFilenames.filter(function(name) {
					return (name == 'conf.json' || /\.sqlite/.test(name));
				});
				if(isCordova) {
					async.forEachSeries(listFilenames, function(name, callback) {
						fileSystemService.readFile(dbDirPath + '/' + name, function(err, data) {
							if (err) return callback(err);
							zip.file(name, data);
							callback();
						});
					}, cb);
				}else{
					async.forEachSeries(listFilenames, function(name, callback) {
						fileSystemService.getPath(dbDirPath + '/' + name, function(err, path) {
							if (err) return callback(err);
							zip.file(name, path);
							callback();
						});
					}, cb);
				}
			});
		}

		function checkValueFileAndChangeStatusExported() {
			$timeout(function() {
				var inputFile = document.getElementById('nwExportInputFile');
				var value = inputFile ? inputFile.value : null;
				if(!value && self.exporting){
					self.exporting = false;
					$timeout(function() {
						$rootScope.$apply();
					});
				}
				if(!value && self.connection){
					self.connection.release();
					self.connection = false;
				}
				window.removeEventListener('focus', checkValueFileAndChangeStatusExported, true);
			}, 1000);
		}


		function saveFile(file, cb) {
			var backupFilename = 'InterValueBackup-' + $filter('date')(Date.now(), 'yyyy-MM-dd-HH-mm-ss') + '.encrypted';
			if (!isCordova) {
				var inputFile = document.getElementById('nwExportInputFile');
				inputFile.setAttribute("nwsaveas", backupFilename);
				inputFile.click();
				window.addEventListener('focus', checkValueFileAndChangeStatusExported, true);
				inputFile.onchange = function() {
					cb(this.value);
				};
			}
			else {
				fileSystemService.cordovaWriteFile((isMobile.iOS() ? window.cordova.file.documentsDirectory : window.cordova.file.externalRootDirectory), 'InterValue', backupFilename, file, function(err) {
					cb(err);
				});
			}
		}

		function encrypt(buffer, password) {
			password = Buffer.from(password);
			var cipher = crypto.createCipheriv('aes-256-ctr', crypto.pbkdf2Sync(password, '', 100000, 32, 'sha512'), crypto.createHash('sha1').update(password).digest().slice(0, 16));
			var arrChunks = [];
			var CHUNK_LENGTH = 2003;
			for (var offset = 0; offset < buffer.length; offset += CHUNK_LENGTH) {
				arrChunks.push(cipher.update(buffer.slice(offset, Math.min(offset + CHUNK_LENGTH, buffer.length)), 'utf8'));
			}
			arrChunks.push(cipher.final());
			return Buffer.concat(arrChunks);
		}

		function showError(text) {
			self.exporting = false;
			self.error = text;
			$timeout(function() {
				$rootScope.$apply();
			});
			return false;
		}

		self.walletExportPC = function(connection) {
			self.connection = connection;
			saveFile(null, function(path) {
				if(!path) return;
				var password = Buffer.from(self.password);
				var cipher = crypto.createCipheriv('aes-256-ctr', crypto.pbkdf2Sync(password, '', 100000, 32, 'sha512'), crypto.createHash('sha1').update(password).digest().slice(0, 16));
				zip = new _zip(path, {
					compressed: self.bCompression ? 6 : 0,
					cipher: cipher
				});
				storageService.getProfile(function(err, profile) {
					storageService.getConfig(function(err, config) {
						zip.text('profile', JSON.stringify(profile));
						zip.text('config', config);
						if (conf.bLight) zip.text('light', 'true');
						addDBAndConfToZip(function(err) {
							if (err) return showError(err);
							zip.end(function() {
								connection.release();
								self.connection = null;
								self.exporting = false;
								$timeout(function() {
									$rootScope.$apply();
									notification.success(gettextCatalog.getString('Success'), gettextCatalog.getString('Export completed successfully', {}));
								});
							});
						});
					})
				})
			})
		};

		self.walletExportCordova = function(connection) {
			storageService.getProfile(function(err, profile) {
				storageService.getConfig(function(err, config) {
					zip.file('profile', JSON.stringify(profile));
					zip.file('config', config);
					zip.file('light', 'true');
					addDBAndConfToZip(function(err) {
						if (err) return showError(err);
						var zipParams = {type: "nodebuffer", compression: 'DEFLATE', compressionOptions: {level: 9}};
						zip.generateAsync(zipParams).then(function(zipFile) {
							saveFile(encrypt(zipFile, self.password), function(err) {
								connection.release();
								if (err) return showError(err);
								self.exporting = false;
								$timeout(function() {
									$rootScope.$apply();
									notification.success(gettextCatalog.getString('Success'), gettextCatalog.getString('Export completed successfully', {}));
								});
							})
						}, function(err) {
							showError(err);
						})
					});
				});
			});
		};

		self.walletExport = function() {
			self.exporting = true;
			self.error = '';
			var db = require('intervaluecore/db');
			db.takeConnectionFromPool(function(connection) {
				if (isCordova) {
					self.walletExportCordova(connection);
				} else {
					self.walletExportPC(connection);
				}
			});
		}
	});
(function(window){var svgSprite='<svg><symbol id="icon-iconfuzhi" viewBox="0 0 1024 1024"><path d="M363.868753 600.282672"  ></path><path d="M512.851902 960.992991 215.02375 960.992991c-44.966121 0-84.409458-38.276768-84.409458-81.926918 0-99.942223 103.813391-247.438509 209.579249-297.758568 12.917194-6.169513 28.41926-0.664126 34.583656 12.283768 6.158257 12.942777 0.652869 28.426423-12.283768 34.58468-95.242178 45.308929-179.981141 178.034812-179.981141 250.89012 0 15.154141 16.10377 30.02892 32.511461 30.02892l297.827129 0c14.33038 0 25.947975 11.618619 25.947975 25.948999C538.799878 949.373349 527.182282 960.992991 512.851902 960.992991z"  ></path><path d="M661.836075 600.282672"  ></path><path d="M810.679032 960.992991 512.851902 960.992991c-14.33038 0-25.948999-11.618619-25.948999-25.947975 0-14.33038 11.618619-25.948999 25.948999-25.948999l297.827129 0c16.408715 0 32.511461-14.874779 32.511461-30.02892 0-72.854285-84.738963-205.580169-179.981141-250.89012-12.936637-6.158257-18.441001-21.640879-12.283768-34.58468 6.157233-12.935614 21.63474-18.453281 34.583656-12.283768 105.763812 50.320059 209.579249 197.816345 209.579249 297.758568C895.08849 922.715199 855.646176 960.992991 810.679032 960.992991z"  ></path><path d="M663.678026 600.282672"  ></path><path d="M516.741489 577.773006c-140.664693 0-255.103072-114.438379-255.103072-255.103072 0-140.659577 114.438379-255.096932 255.103072-255.096932 140.659577 0 255.096932 114.438379 255.096932 255.103072C771.838422 463.33565 657.401066 577.773006 516.741489 577.773006zM516.741489 119.470999c-112.048959 0-203.206098 91.157139-203.206098 203.199958 0 112.049982 91.157139 203.206098 203.206098 203.206098 112.042819 0 203.198935-91.156116 203.198935-203.198935C719.940424 210.627115 628.784308 119.470999 516.741489 119.470999z"  ></path><path d="M663.678026 600.282672"  ></path><path d="M370.520243 335.644433c-7.16519 0-12.974499-5.809309-12.974499-12.974499 0-87.779206 71.41654-159.188582 159.195745-159.188582 7.16519 0 12.975523 5.809309 12.975523 12.974499s-5.810333 12.974499-12.975523 12.974499c-73.474408 0-133.246747 59.772338-133.246747 133.240607C383.494743 329.835124 377.685433 335.644433 370.520243 335.644433z"  ></path><path d="M525.015943 176.233793"  ></path><path d="M397.438313 375.113353c0 7.240915-5.872754 13.113669-13.113669 13.113669-7.234775 0-13.107529-5.872754-13.107529-13.113669 0-7.234775 5.872754-13.107529 13.107529-13.107529C391.565559 362.004801 397.438313 367.877555 397.438313 375.113353z"  ></path></symbol><symbol id="icon-mimayaochi" viewBox="0 0 1024 1024"><path d="M322.812685 208.079082c-5.846148 0-11.260461-3.726881-13.163811-9.572006-2.349511-7.264451 1.647523-15.053857 8.91095-17.403369 5.009084-1.619894 10.099009-3.051499 15.269775-4.306072 7.440459-1.728364 14.893198 2.794649 16.674775 10.207479 1.795902 7.42511-2.781346 14.892175-10.207479 16.688077-4.483104 1.066285-8.897647 2.308579-13.231349 3.712555C325.647243 207.862141 324.216661 208.079082 322.812685 208.079082z"  ></path><path d="M187.069071 394.682038c-7.628748 0-13.824867-6.183839-13.824867-13.82589 0-72.812329 36.899398-139.375328 98.695836-178.056302 6.467295-4.063549 14.999622-2.092661 19.050891 4.387937 4.050246 6.467295 2.092661 15.000646-4.374634 19.050891-53.68162 33.592073-85.721337 91.40478-85.721337 154.618497C200.893938 388.498198 194.710099 394.682038 187.069071 394.682038z"  ></path><path d="M819.206242 957.482027c-11.570523 0-22.223141-7.291057-26.123984-18.657942l-17.254989-50.063209-35.710316-2.134617c-6.764054-0.3776-13.137205-3.239787-17.917068-8.046257l-52.615335-52.601009c-8.019651-8.018627-10.329253-20.116153-5.846148-30.512944l8.262174-19.117406-3.685949-3.15997-10.828626 7.830339c-11.002588 7.938809-26.13831 6.751774-35.737946-2.862187L510.253728 666.655336c-40.410362 18.11866-84.559884 27.624151-128.85881 27.624151-173.749206 0-315.096445-141.347239-315.096445-315.097468 0-173.763532 141.347239-315.124074 315.096445-315.124074 173.764556 0 315.1384 141.360542 315.1384 315.124074 0 42.205241-8.344039 83.155908-24.816199 122.026194l266.531356 266.551822c4.508687 4.483104 7.316639 10.395768 7.965415 16.741289l11.949146 117.16549c1.417279 13.878079-7.749498 26.65201-21.373797 29.756721l-111.425765 25.355481C823.29742 957.26611 821.244668 957.482027 819.206242 957.482027zM753.859955 832.054363l43.716664 2.592035c11.180644 0.649799 20.860097 7.993045 24.51944 18.579147l15.189957 44.12087 63.374376-14.419408-8.464789-83.034135L618.993315 526.69877c-8.4126-8.411577-10.505261-21.252023-5.198395-31.890314 18.199501-36.495192 27.435862-75.392084 27.435862-115.626437 0-143.263891-116.571972-259.821537-259.835863-259.821537-143.249565 0-259.794931 116.557646-259.794931 259.821537 0 143.250588 116.545366 259.794931 259.794931 259.794931 42.799782 0 83.681888-10.17985 121.513518-30.243815 10.706853-5.710049 23.910573-3.725858 32.511461 4.875031l108.781542 108.788705 9.357112-6.751774c10.341532-7.473205 24.450878-6.865361 34.131355 1.37737l35.737946 30.512944c9.222035 7.884574 12.245905 20.845771 7.440459 31.998785l-8.91095 20.60427L753.859955 832.054363z"  ></path></symbol><symbol id="icon-gengduo" viewBox="0 0 1024 1024"><path d="M508.296143 61.083194c-248.65522 0-450.915783 202.260563-450.915783 450.915783 0 248.614288 202.260563 450.91783 450.915783 450.91783 248.614288 0 450.916806-202.303542 450.916806-450.91783C959.21295 263.343757 756.910431 61.083194 508.296143 61.083194zM508.296143 899.629411c-213.756385 0-387.628388-173.914982-387.628388-387.630435 0-213.756385 173.873026-387.629411 387.628388-387.629411 213.716476 0 387.630435 173.873026 387.630435 387.629411C895.925554 725.71443 722.011596 899.629411 508.296143 899.629411z"  ></path><path d="M313.162908 452.668707c-32.755008 0-59.33027 26.53433-59.33027 59.33027 0 32.757055 26.575262 59.332317 59.33027 59.332317 32.756031 0 59.331293-26.575262 59.331293-59.332317C372.494201 479.202013 345.918939 452.668707 313.162908 452.668707z"  ></path><path d="M508.296143 452.668707c-32.755008 0-59.33027 26.53433-59.33027 59.33027 0 32.757055 26.575262 59.332317 59.33027 59.332317 32.757055 0 59.331293-26.575262 59.331293-59.332317C567.627437 479.202013 541.052175 452.668707 508.296143 452.668707z"  ></path><path d="M703.430402 452.668707c-32.756031 0-59.33027 26.53433-59.33027 59.33027 0 32.757055 26.575262 59.332317 59.33027 59.332317 32.755008 0 59.33027-26.575262 59.33027-59.332317C762.761696 479.202013 736.18541 452.668707 703.430402 452.668707z"  ></path></symbol><symbol id="icon-xingmingyonghumingnicheng" viewBox="0 0 1024 1024"><path d="M652.3 562.7C741.6 513.3 802 418.2 802 309c0-160.2-129.8-290-290-290-160.2 0-290 129.8-290 290 0 109.2 60.4 204.3 149.7 253.7C184 622.2 48 797.7 48 1005l58 0c0-224.2 181.8-406 406-406 224.2 0 406 181.8 406 406l58 0C976 797.7 840 622.2 652.3 562.7zM280 309c0-128.1 103.9-232 232-232 128.1 0 232 103.9 232 232 0 128.1-103.9 232-232 232C383.9 541 280 437.1 280 309z"  ></path></symbol><symbol id="icon-iconset0108" viewBox="0 0 1024 1024"><path d="M896 477.866667c-34.133333-29.866667-93.866667-93.866667-17.066667-145.066667 76.8-55.466667 110.933333-119.466667 34.133333-213.333333 0 0-85.333333-132.266667-401.066667-21.333333C174.933333 221.866667 64 379.733333 46.933333 558.933333c-17.066667 174.933333 38.4 349.866667 268.8 401.066667 230.4 51.2 524.8-64 601.6-243.2S930.133333 507.733333 896 477.866667zM878.933333 699.733333c-55.466667 128-251.733333 230.4-448 230.4 0 0 0 0 0 0-38.4 0-72.533333-4.266667-102.4-12.8-174.933333-38.4-256-157.866667-238.933333-354.133333 12.8-119.466667 68.266667-290.133333 443.733333-422.4 81.066667-29.866667 149.333333-42.666667 209.066667-42.666667 106.666667 0 140.8 46.933333 140.8 46.933333l0 0 0 0c25.6 34.133333 38.4 59.733333 34.133333 81.066667-4.266667 25.6-21.333333 46.933333-59.733333 72.533333-42.666667 29.866667-55.466667 64-55.466667 89.6-4.266667 59.733333 51.2 110.933333 68.266667 123.733333 4.266667 4.266667 8.533333 4.266667 8.533333 8.533333C904.533333 541.866667 934.4 563.2 878.933333 699.733333z"  ></path><path d="M686.933333 533.333333c-55.466667 0-102.4 46.933333-102.4 102.4s46.933333 102.4 102.4 102.4c55.466667 0 102.4-46.933333 102.4-102.4S746.666667 533.333333 686.933333 533.333333zM686.933333 699.733333c-34.133333 0-64-29.866667-64-64 0-34.133333 29.866667-64 64-64 34.133333 0 64 29.866667 64 64C750.933333 674.133333 721.066667 699.733333 686.933333 699.733333z"  ></path><path d="M439.466667 806.4m-64 0a1.5 1.5 0 1 0 128 0 1.5 1.5 0 1 0-128 0Z"  ></path><path d="M251.733333 640m-64 0a1.5 1.5 0 1 0 128 0 1.5 1.5 0 1 0-128 0Z"  ></path><path d="M311.466667 409.6m-64 0a1.5 1.5 0 1 0 128 0 1.5 1.5 0 1 0-128 0Z"  ></path><path d="M520.533333 285.866667m-64 0a1.5 1.5 0 1 0 128 0 1.5 1.5 0 1 0-128 0Z"  ></path><path d="M750.933333 221.866667m-64 0a1.5 1.5 0 1 0 128 0 1.5 1.5 0 1 0-128 0Z"  ></path></symbol><symbol id="icon-gengduo1" viewBox="0 0 1024 1024"><path d="M0 544C0 563.2 6.4 576 12.8 595.2c6.4 12.8 12.8 25.6 25.6 38.4 12.8 12.8 25.6 19.2 38.4 25.6 19.2 6.4 32 12.8 51.2 12.8s32-6.4 51.2-12.8c12.8-6.4 25.6-12.8 38.4-25.6 12.8-12.8 19.2-25.6 25.6-38.4C249.6 576 256 563.2 256 544S249.6 512 243.2 492.8C236.8 480 230.4 467.2 217.6 454.4 204.8 441.6 192 435.2 179.2 428.8 160 422.4 147.2 416 128 416S96 422.4 76.8 428.8C64 435.2 51.2 441.6 38.4 454.4 25.6 467.2 19.2 480 12.8 492.8 6.4 512 0 524.8 0 544L0 544z"  ></path><path d="M384 544C384 563.2 390.4 576 396.8 595.2c6.4 12.8 12.8 25.6 25.6 38.4 12.8 12.8 25.6 19.2 38.4 25.6 19.2 6.4 32 12.8 51.2 12.8s32-6.4 51.2-12.8c12.8-6.4 25.6-12.8 38.4-25.6 12.8-12.8 19.2-25.6 25.6-38.4C633.6 576 640 563.2 640 544S633.6 512 627.2 492.8C620.8 480 614.4 467.2 601.6 454.4 588.8 441.6 576 435.2 563.2 428.8 544 422.4 531.2 416 512 416S480 422.4 460.8 428.8C448 435.2 435.2 441.6 422.4 454.4 409.6 467.2 403.2 480 396.8 492.8 390.4 512 384 524.8 384 544L384 544z"  ></path><path d="M768 544c0 19.2 6.4 32 12.8 51.2 6.4 12.8 12.8 32 25.6 38.4 12.8 12.8 25.6 19.2 38.4 25.6 19.2 6.4 32 12.8 51.2 12.8s32-6.4 51.2-12.8c12.8-6.4 32-12.8 38.4-25.6 12.8-12.8 19.2-25.6 25.6-38.4C1017.6 576 1024 563.2 1024 544S1017.6 512 1011.2 492.8c-6.4-12.8-12.8-32-25.6-38.4-12.8-12.8-25.6-19.2-38.4-25.6-19.2-6.4-32-12.8-51.2-12.8s-32 6.4-51.2 12.8c-12.8 6.4-32 12.8-38.4 25.6-12.8 12.8-19.2 25.6-25.6 38.4C774.4 512 768 524.8 768 544L768 544z"  ></path></symbol><symbol id="icon-miyao" viewBox="0 0 1024 1024"><path d="M819.2 307.2c0 172.8-140.8 307.2-307.2 307.2-172.8 0-307.2-140.8-307.2-307.2C204.8 140.8 339.2 0 512 0S819.2 140.8 819.2 307.2L819.2 307.2zM512 57.6c-140.8 0-249.6 115.2-249.6 249.6 0 134.4 108.8 256 249.6 256s256-115.2 256-249.6S652.8 57.6 512 57.6L512 57.6z"  ></path><path d="M480 595.2l64 0L544 1024l-64 0L480 595.2 480 595.2z"  ></path><path d="M512 704l192 0 0 64L512 768 512 704 512 704z"  ></path><path d="M512 832l192 0 0 64L512 896 512 832 512 832z"  ></path></symbol><symbol id="icon-09jingshi" viewBox="0 0 1024 1024"><path d="M849.12 928.704 174.88 928.704c-45.216 0-81.536-17.728-99.68-48.64-18.144-30.912-15.936-71.296 6.08-110.752L421.472 159.648c22.144-39.744 55.072-62.528 90.304-62.528s68.128 22.752 90.336 62.464l340.544 609.792c22.016 39.456 24.288 79.808 6.112 110.72C930.656 911.008 894.304 928.704 849.12 928.704zM511.808 161.12c-11.2 0-24.032 11.104-34.432 29.696L137.184 800.544c-10.656 19.136-13.152 36.32-6.784 47.168 6.368 10.816 22.592 17.024 44.48 17.024l674.24 0c21.92 0 38.112-6.176 44.48-17.024 6.336-10.816 3.872-28-6.816-47.136L546.24 190.816C535.872 172.224 522.976 161.12 511.808 161.12z"  ></path><path d="M512 640c-17.664 0-32-14.304-32-32l0-288c0-17.664 14.336-32 32-32s32 14.336 32 32l0 288C544 625.696 529.664 640 512 640z"  ></path><path d="M512 752.128m-48 0a1.5 1.5 0 1 0 96 0 1.5 1.5 0 1 0-96 0Z"  ></path></symbol><symbol id="icon-you" viewBox="0 0 1024 1024"><path d="M511.609097 961.619254"  ></path><path d="M662.268422 511.010463 280.997835 892.299469c-14.785751 14.808264-14.785751 38.796608 0 53.562916 14.788821 14.807241 38.776142 14.807241 53.584406 0l408.226518-408.230612c14.789844-14.790868 14.789844-38.777165 0-53.585429-1.01512-1.020236-2.099824-1.976004-3.206018-2.843768L333.797365 75.350129c-14.808264-14.788821-38.795585-14.788821-53.607942 0-14.762215 14.808264-14.762215 38.796608 0 53.585429L662.268422 511.010463 662.268422 511.010463 662.268422 511.010463zM662.268422 511.010463"  ></path></symbol><symbol id="icon-duoyuyan" viewBox="0 0 1024 1024"><path d="M848.805886 805.572222c70.998007-81.260745 109.779266-184.217628 109.779266-293.14448 0-119.204939-46.421262-231.277434-130.713041-315.569212C744.876861 113.862257 634.94103 67.61598 517.788843 66.213028c-1.924839-0.599657-10.290367-0.592494-12.227486 0.01535C388.878868 67.945485 279.434224 114.159016 196.73471 196.85853 113.863281 279.730982 67.630307 389.460106 66.095347 506.415818c-0.428765 1.64957-0.436952 8.601912-0.021489 10.226922 1.082658 117.628024 47.364751 228.058113 130.660852 311.354214 84.291778 84.291778 196.36325 130.713041 315.569212 130.713041 119.204939 0 231.277434-46.421262 315.569212-130.713041 6.139837-6.139837 12.054547-12.444427 17.789155-18.871813 0.50756-0.453325 1.001817-0.928139 1.471514-1.440815C847.750857 807.012014 848.295256 806.299793 848.805886 805.572222zM107.447151 532.043499l187.501418 0c1.322112 65.678862 9.253758 127.264499 22.505573 182.112688-61.690014 16.687054-100.819197 38.371936-121.076566 51.906184C144.30971 701.336206 111.676475 620.35687 107.447151 532.043499zM195.881272 259.408121c20.090571 13.556761 59.242266 35.461653 121.340579 52.260248-12.998035 54.127781-20.827351 114.778116-22.243607 179.432649L107.525945 491.101018C112.076588 403.731134 144.437623 323.612399 195.881272 259.408121zM917.081898 491.099994 729.628576 491.099994c-1.415232-64.630996-9.240455-125.260865-22.229281-179.37432 61.95505-16.693194 101.235682-38.444591 121.56673-52.020794C880.270505 323.860039 912.537396 403.866211 917.081898 491.099994zM688.677908 491.099994 532.167319 491.099994 532.167319 335.061149c52.209082-1.094938 97.103572-6.453992 135.272893-14.033621C680.000272 373.163955 687.286212 430.896844 688.677908 491.099994zM532.167319 294.115598 532.167319 109.918435c36.84107 10.398838 72.779583 49.205679 100.926644 110.015649 8.810666 19.035542 16.645099 39.641859 23.464411 61.521169C621.531626 288.227494 580.261687 293.062616 532.167319 294.115598zM491.223814 110.273523l0 183.805236c-47.504944-1.12666-88.378863-6.001691-123.120109-12.802584 6.807033-21.812795 14.623046-42.35976 23.409153-61.344137C419.351903 159.792333 454.809463 121.175827 491.223814 110.273523zM491.223814 335.040682l0 156.059312L335.928912 491.099994c1.391696-60.213383 8.679683-117.955482 21.243837-170.099073C395.008472 328.536548 439.487499 333.887416 491.223814 335.040682zM335.893096 532.043499l155.330718 0 0 158.667719c-51.609425 1.194198-96.019891 6.563486-133.821845 14.103206C344.576873 651.927913 337.193719 593.243349 335.893096 532.043499zM491.223814 731.672118l0 182.909843c-36.415374-10.902304-71.871911-49.51881-99.709933-109.659539-8.679683-18.752086-16.409738-39.034015-23.157419-60.551074C402.9964 737.645157 443.773106 732.820268 491.223814 731.672118zM532.167319 914.937049 532.167319 731.608673c47.904033 1.025353 89.103364 5.862521 124.116809 12.656251-6.755868 21.555945-14.497179 41.87369-23.190165 60.656475C604.946902 865.73137 569.008388 904.538211 532.167319 914.937049zM532.167319 690.660052 532.167319 532.043499l156.546406 0c-1.298576 61.096497-8.66024 119.68487-21.445428 172.502819C629.154233 697.013761 584.319096 691.710988 532.167319 690.660052zM729.659275 532.043499l187.501418 0c-4.221138 88.138386-36.732599 168.973436-88.620363 233.635131-20.469194-13.668301-59.635215-35.298947-121.30374-51.868321C720.43724 659.049101 728.33921 597.585237 729.659275 532.043499zM801.518906 228.742704c-18.329461 11.570523-52.309366 29.355585-104.858186 43.493583-19.295462-63.056128-46.110177-115.004267-78.06189-150.97655C689.00025 140.410913 751.833297 178.097234 801.518906 228.742704zM406.007991 121.259738c-31.905664 35.920094-58.690704 87.768973-77.979002 150.702304-52.40351-14.241352-86.370113-32.099069-104.581893-43.587728C273.076422 177.914062 335.777463 140.364865 406.007991 121.259738zM223.917816 796.963147c18.284435-11.535731 52.098565-29.230742 104.332207-43.335994 19.271926 62.60485 45.976124 114.186645 77.757968 149.968593C335.99952 884.550994 273.472442 847.181899 223.917816 796.963147zM618.59883 903.595746c31.801287-35.803437 58.517765-87.426165 77.792761-150.08218 51.984978 14.023388 85.972047 31.631418 104.533798 43.208081C751.3329 847.061149 688.718841 884.521319 618.59883 903.595746z"  ></path></symbol><symbol id="icon-erweima" viewBox="0 0 1024 1024"><path d="M899.9 93.8l0 312.8L587 406.6 587 93.8 899.9 93.8M430.6 93.8l0 312.8L117.8 406.6 117.8 93.8 430.6 93.8M430.6 563l0 312.8L117.8 875.8 117.8 563 430.6 563M899.9 41.6 587 41.6c-28.8 0-52.1 23.3-52.1 52.1l0 312.8c0 28.8 23.3 52.1 52.1 52.1l312.8 0c28.8 0 52.1-23.3 52.1-52.1L951.9 93.8C952 65 928.7 41.6 899.9 41.6L899.9 41.6zM430.6 41.6 117.8 41.6C89 41.6 65.6 65 65.6 93.8l0 312.8c0 28.8 23.3 52.1 52.1 52.1l312.8 0c28.8 0 52.1-23.3 52.1-52.1L482.6 93.8C482.7 65 459.4 41.6 430.6 41.6L430.6 41.6zM912.9 510.9c-21.6 0-39.1 17.5-39.1 39.1l0 182.5c0 21.6 17.5 39.1 39.1 39.1 21.6 0 39.1-17.5 39.1-39.1L952 550C952 528.4 934.5 510.9 912.9 510.9L912.9 510.9zM756.5 510.9c-21.6 0-39.1 17.5-39.1 39.1l0 338.9c0 21.6 17.5 39.1 39.1 39.1 21.6 0 39.1-17.5 39.1-39.1L795.6 550C795.6 528.4 778.1 510.9 756.5 510.9L756.5 510.9zM600.1 510.9c-21.6 0-39.1 17.5-39.1 39.1l0 52.1c0 21.6 17.5 39.1 39.1 39.1s39.1-17.5 39.1-39.1L639.2 550C639.2 528.4 621.7 510.9 600.1 510.9L600.1 510.9zM430.6 510.9 117.8 510.9c-28.8 0-52.1 23.3-52.1 52.1l0 312.8c0 28.8 23.3 52.1 52.1 52.1l312.8 0c28.8 0 52.1-23.3 52.1-52.1L482.7 563C482.7 534.2 459.4 510.9 430.6 510.9L430.6 510.9zM600.1 693.4c-21.6 0-39.1 17.5-39.1 39.1l0 156.4c0 21.6 17.5 39.1 39.1 39.1s39.1-17.5 39.1-39.1L639.2 732.5C639.2 710.9 621.7 693.4 600.1 693.4L600.1 693.4zM912.9 823.7c-21.6 0-39.1 17.5-39.1 39.1l0 26.1c0 21.6 17.5 39.1 39.1 39.1 21.6 0 39.1-17.5 39.1-39.1l0-26.1C952 841.2 934.5 823.7 912.9 823.7L912.9 823.7z"  ></path></symbol><symbol id="icon-shuru" viewBox="0 0 1024 1024"><path d="M384 256 512 256 512 192 192 192 192 256 320 256 320 768 192 768 192 832 512 832 512 768 384 768 384 256ZM127.619858 0 1024 0 1024 1024 127.619858 1024C57.137357 1024 0 966.751117 0 896.380141L0 127.619858C0 57.137357 57.24888 0 127.619858 0ZM64 896.380141C64 931.452058 94.568632 960 132.164133 960L1024 960 1024 64 132.164133 64C94.587084 64 64 92.530723 64 127.619858L64 896.380141Z"  ></path></symbol><symbol id="icon-zuo" viewBox="0 0 1024 1024"><path d="M258.407 492.516l450.066-450.066c10.233-10.342 27.098-10.342 37.462 0 10.342 10.364 10.342 27.207 0 37.506l-432.044 432.044 432.044 432.044c10.342 10.364 10.342 27.142 0 37.506-10.364 10.364-27.229 10.364-37.462 0l-450.066-450.022c-5.389-5.346-7.811-12.48-7.614-19.527-0.196-7.047 2.247-14.138 7.614-19.484z"  ></path></symbol><symbol id="icon-wangzhi" viewBox="0 0 1024 1024"><path d="M201.335495 603.006713c1.973958 0 3.974521-0.193405 5.979178-0.581238 16.999163-3.285836 28.115338-19.723204 24.830525-36.722366-3.382027-17.529235-5.102205-35.599799-5.102205-53.701063 0-90.140996 42.502-170.541141 108.514459-222.223221 5.633301 15.357779 15.283078 31.56695 31.639604 37.693484 2.657526 0.99977 5.142114 2.004657 7.540743 2.969635 12.81077 5.157463 26.059516 10.499122 48.323589 10.499122 0.061398 0 0.122797 0 0.184195 0 3.622504 0.714268 11.555174 8.121981 17.202801 15.7231 2.918469 15.396665 6.367011 36.793998 6.367011 44.895513 0 12.713556 2.325975 26.794249 4.377704 39.222303 0.907673 5.478781 1.795902 10.80509 2.407839 15.683191 1.520633 12.172227 9.453303 21.63167 20.692275 24.682146 2.729158 0.744967 5.336542 1.102101 7.856945 1.102101 17.472953 0 30.66644-17.131169 49.415456-41.48688 3.566222-4.64274 8.335852-10.835789 10.494005-13.243629 1.209548-0.806365 2.734274-1.683339 4.397147-2.693342 12.805654-7.744381 34.242895-20.702508 37.508265-43.527352 1.096984-7.642051 0.887206-19.284205 0.459464-37.660738-0.234337-9.923-0.596588-25.391297-0.163729-33.349549 5.300726-4.427846 16.457834-11.943007 27.100218-18.192338l53.429887-15.028275c54.399981 36.07052 96.261391 90.635253 115.26828 155.963121 4.836145 16.631796 22.223141 26.172079 38.84982 21.345144 16.621563-4.836145 26.177196-22.233374 21.340027-38.854936-42.532699-146.204873-178.687682-248.315482-331.101977-248.315482-190.121082 0-344.794837 154.678872-344.794837 344.799954 0 22.079878 2.101871 44.150546 6.244214 65.598021C173.49031 592.589456 186.617281 603.006713 201.335495 603.006713zM593.370239 242.907309c-1.805112 0.561795-3.545756 1.306762-5.187139 2.240017-45.461401 25.916253-50.782593 39.222303-52.782134 44.222177-3.872191 9.668197-3.954055 23.610744-3.203972 55.491849 0.193405 8.438183 0.479931 20.49887 0.24457 26.426883-2.99931 2.775206-9.606799 6.77531-13.019525 8.836249-3.877307 2.346441-7.254218 4.468778-9.596566 6.223748-3.361561 2.51017-6.453992 5.825682-10.866489 11.285021-0.852414-18.407232-6.984065-49.854455-8.284687-56.373938-0.617054-3.091408-1.795902-6.045693-3.469008-8.723685-4.571109-7.315616-29.125341-43.808762-63.537082-43.808762-12.672624 0-18.621103-2.39249-29.416983-6.744611-1.938142-0.780783-3.928472-1.582031-6.009877-2.387373-2.240017-3.462868-5.04183-11.425214-6.77531-19.108197 38.359656-19.553335 81.755002-30.592762 127.680984-30.592762C538.211988 229.892901 566.552453 234.43331 593.370239 242.907309z"  ></path><path d="M957.527053 409.325549c-5.478781-23.600511-25.946952-40.752146-60.812017-50.986231-13.866822-4.080945-28.360931 3.856841-32.42141 17.703197-4.060479 13.846356 3.867074 28.355815 17.708314 32.416294 21.097504 6.193049 24.589025 12.619412 24.620747 12.621459 1.638313 21.585621-111.772666 105.686041-377.078101 167.325913-265.38116 61.669548-404.239717 36.129872-412.218436 16.172331-0.005117-0.081864 0.341784-8.866948 21.360494-26.549679 11.040451-9.28548 12.458753-25.76378 3.173273-36.804231-9.290597-11.050684-25.76378-12.479219-36.804231-3.173273-31.544437 26.539446-44.538379 52.884464-38.624692 78.291111 8.885368 38.231743 55.085596 58.750055 140.971685 62.454424 0.314155 0.663102 0.64366 1.321088 1.00898 1.970888 61.047378 108.574834 176.284959 176.030156 300.736389 176.030156 183.829795 0 334.733691-143.290497 344.29751-326.523705C932.524612 488.061798 966.605825 448.414823 957.527053 409.325549zM496.471328 793.812387l24.594141-20.357654 43.547819-5.030573c8.535397-0.989537 16.039301-6.101975 20.075221-13.69286l9.402137-17.703197 8.90788 18.294668-6.009877 24.898063c-27.662013 9.018398-57.192583 13.885242-87.840604 13.885242C504.907465 794.107099 500.682233 794.002722 496.471328 793.812387zM656.68424 752.652965c0.049119-4.03899-0.816598-8.06263-2.607384-11.746532l-35.471886-72.913637c-4.300956-8.836249-13.198603-14.509459-23.024389-14.69263-10.06524-0.061398-18.921955 5.183046-23.533996 13.866822l-27.059286 50.935066-37.604456 4.347005c-5.02034 0.581238-9.764388 2.602268-13.662161 5.825682l-57.149605 47.303352c-2.540869 2.101871-4.576225 4.587482-6.102998 7.300266-59.482743-17.325597-112.223944-53.952796-149.262512-104.638175 76.699869-3.872191 167.07725-17.317411 260.160251-38.938847 90.823542-21.106714 175.904289-48.055482 245.520833-77.534887C772.558317 642.825604 723.913411 711.457728 656.68424 752.652965z"  ></path></symbol><symbol id="icon-choose" viewBox="0 0 1024 1024"><path d="M512 64C262.4 64 64 262.4 64 512s198.4 448 448 448 448-198.4 448-448S761.6 64 512 64zM512 908.8c-217.6 0-396.8-179.2-396.8-396.8S294.4 115.2 512 115.2s396.8 179.2 396.8 396.8S729.6 908.8 512 908.8z"  ></path></symbol><symbol id="icon-xuanze" viewBox="0 0 1024 1024"><path d="M512.024381 0C229.205333 0 0 229.205333 0 512.024381 0 794.770286 229.205333 1024 512.024381 1024 794.770286 1024 1024 794.770286 1024 512.024381 1024 229.205333 794.770286 0 512.024381 0M849.603048 353.328762l-385.462857 385.462857c-9.411048 9.411048-21.723429 14.09219-34.06019 14.09219s-24.697905-4.681143-34.084571-14.09219l-221.622857-221.647238c-18.822095-18.822095-18.822095-49.322667 0-68.120381 18.822095-18.846476 49.322667-18.846476 68.144762 0l187.562667 187.562667 351.378286-351.402667c18.822095-18.822095 49.322667-18.822095 68.144762 0C868.425143 304.006095 868.425143 334.506667 849.603048 353.328762"  ></path></symbol><symbol id="icon-bieming" viewBox="0 0 1024 1024"><path d="M154.31168 715.41248c-65.529856-110.850048-38.70208-276.215808 30.267392-378.749952 9.975808-14.973952 30.246912-18.911232 44.819456-9.136128 7.156736 4.977664 11.73504 12.054528 13.513728 19.750912l0.520192 0c1.139712 6.037504 2.479104 11.435008 4.158464 16.632832 6.956032-24.128512 16.632832-46.578688 29.106176-68.4288 36.924416-65.091584 96.91648-119.387136 160.987136-144.136192 16.852992-6.436864 35.98336 2.499584 42.001408 19.151872 3.039232 8.096768 2.518016 17.052672-0.39936 24.109056-6.757376 15.193088-11.9552 28.926976-16.633856 43.480064 47.7184-43.480064 108.151808-81.123328 170.023936-104.613888C760.998912 85.215232 907.533312 99.76832 962.428928 245.362688c6.457344 16.852992-2.280448 35.764224-19.131392 42.020864l-3.018752 1.03936c-109.07136 29.1072-149.532672 99.815424-187.79648 167.005184-53.77536 93.7984-103.913472 181.358592-282.033152 178.460672 12.054528 5.397504 27.747328 11.435008 48.037888 17.870848 17.051648 5.197824 26.528768 23.310336 21.629952 40.361984-2.69824 9.136128-9.15456 15.593472-16.53248 19.131392-81.743872 46.798848-225.65888 79.444992-318.216192 42.841088-12.694528 18.711552-32.545792 59.273216-19.151872 121.884672l0.44032 0.420864 89.519104 0c10.615808 0 19.350528 8.935424 19.350528 19.550208 0 10.596352-8.735744 19.132416-19.350528 19.132416l-96.715776 0-18.591744 0-2.399232 0c-16.55296 2.07872-31.82592-8.955904-35.78368-25.588736C104.894464 804.851712 133.4016 745.977856 154.31168 715.41248L154.31168 715.41248zM392.444928 915.08224 392.444928 915.08224c-10.594304 0-19.550208-8.536064-19.550208-19.132416 0-10.614784 8.955904-19.550208 19.550208-19.550208l338.287616 0c11.136 0 19.871744 8.935424 19.871744 19.550208 0 10.596352-8.735744 19.132416-19.871744 19.132416L392.444928 915.08224 392.444928 915.08224zM209.327104 681.086976 209.327104 681.086976c41.901056 45.759488 166.065152 16.013312 216.822784 0.41984-27.667456-17.472512-42.860544-35.14368-50.757632-50.957312-11.534336-23.090176-17.99168-72.367104 27.667456-66.35008 198.091776 25.389056 243.750912-54.695936 292.629504-140.796928 40.660992-71.128064 83.50208-145.594368 190.833664-185.736192C783.868928 68.363264 487.083008 259.096576 435.825664 375.344128c-4.59776 12.894208-16.55296 22.670336-31.106048 22.670336-17.792 0-32.545792-14.972928-32.545792-33.065984 0 0 2.2784-47.198208 17.272832-108.150784-21.850112 20.390912-41.302016 44.300288-56.495104 70.72768-27.027456 47.418368-39.182336 100.854784-25.867264 149.532672l0 0c3.71712 13.734912-1.160192 27.86816-13.314048 35.765248-14.772224 9.775104-34.643968 6.03648-44.819456-9.137152-14.572544-21.849088-30.485504-43.060224-42.860544-66.76992C178.540544 511.383552 168.225792 609.958912 209.327104 681.086976L209.327104 681.086976z"  ></path></symbol><symbol id="icon-xingming" viewBox="0 0 1024 1024"><path d="M513.849114 185.163163l417.004439 0c12.765745 0 25.530466 8.509814 25.530466 25.530466l0 0 0 591.464843c0 12.765745-12.765745 25.530466-25.530466 25.530466l0 0L513.849114 827.688939l0-51.061956 391.472949 0L905.322064 236.225119 513.849114 236.225119 513.849114 185.163163 513.849114 185.163163zM513.849114 644.718721l263.818571 0c12.765745 0 21.275559-8.509814 21.275559-21.275559 0-8.509814-8.509814-21.275559-21.275559-21.275559l-263.818571 0L513.849114 644.718721 513.849114 644.718721zM513.849114 517.064342l263.818571 0c12.765745 0 21.275559-8.509814 21.275559-17.020652 0-12.765745-8.509814-21.275559-21.275559-21.275559l-263.818571 0L513.849114 517.064342 513.849114 517.064342zM513.849114 393.665895l263.818571 0c12.765745 0 21.275559-8.509814 21.275559-21.275559s-8.509814-21.275559-21.275559-21.275559l-263.818571 0L513.849114 393.665895zM92.589768 185.163163l421.259346 0 0 51.061956L118.120234 236.225119l0 540.402887 395.72888 0 0 51.061956L92.589768 827.689962c-12.765745 0-25.530466-12.765745-25.530466-25.530466L67.059302 210.694653C67.058278 193.674001 79.824023 185.163163 92.589768 185.163163L92.589768 185.163163zM513.849114 351.113753 245.774613 351.113753c-12.765745 0-21.275559 8.509814-21.275559 21.275559s8.509814 21.275559 21.275559 21.275559l268.074501 0L513.849114 351.113753 513.849114 351.113753zM513.849114 478.768131 245.774613 478.768131c-12.765745 0-21.275559 8.509814-21.275559 21.275559 0 8.509814 8.509814 17.020652 21.275559 17.020652l268.074501 0L513.849114 478.768131 513.849114 478.768131zM513.849114 602.167602 245.774613 602.167602c-12.765745 0-21.275559 12.765745-21.275559 21.275559 0 12.765745 8.509814 21.275559 21.275559 21.275559l268.074501 0L513.849114 602.167602z"  ></path></symbol><symbol id="icon-yanse" viewBox="0 0 1037 1024"><path d="M168.910848 577.874944m-28.672 0a28 28 0 1 0 57.344 0 28 28 0 1 0-57.344 0Z"  ></path><path d="M229.326848 433.05472m-44.964864 0a43.911 43.911 0 1 0 89.929728 0 43.911 43.911 0 1 0-89.929728 0Z"  ></path><path d="M408.513536 315.220992m-58.020864 0a56.661 56.661 0 1 0 116.041728 0 56.661 56.661 0 1 0-116.041728 0Z"  ></path><path d="M642.842624 315.220992m-72.868864 0a71.161 71.161 0 1 0 145.737728 0 71.161 71.161 0 1 0-145.737728 0Z"  ></path><path d="M1012.110336 244.247552l-0.77312-0.671744c-10.673152-9.270272-26.843136-8.132608-36.113408 2.541568L589.09696 690.716672l-48.813056 95.97952 87.571456-60.961792 386.797568-445.37344C1023.9232 269.686784 1022.784512 253.5168 1012.110336 244.247552z"  ></path><path d="M945.957888 491.52c-13.732864 0-24.981504 10.60352-26.02496 24.06912l-0.086016-0.006144c0 0-36.182016 191.830016-193.878016 294.228992-170.133504 110.475264-364.883968 60.75904-401.06496-3.069952-19.881984-35.075072-50.176-94.208-67.412992-108.545024-46.288896-38.500352-163.328 14.848-187.904-43.52-45.676544-108.48256 62.123008-389.632 329.387008-459.264 186.98752-49.563648 346.205184 10.143744 426.067968 76.672l0-0.01024c4.4288 3.77856 10.171392 6.065152 16.449536 6.065152 14.00832 0 25.363456-11.355136 25.363456-25.363456 0-8.409088-4.094976-15.858688-10.397696-20.473856C822.82496 204.030976 610.65728 41.769984 314.32192 174.932992c-323.584 145.408-344.064 448.512-276.48 524.288s166.500352 15.837184 188.416 40.96c13.995008 16.043008 32.228352 58.630144 56.148992 97.281024 34.644992 55.977984 207.919104 173.529088 472.23296 16.723968 158.611456-94.096384 215.380992-310.782976 217.428992-334.505984l-0.08704-0.007168c0.052224-0.673792 0.08704-1.353728 0.08704-2.040832C972.069888 503.211008 960.37888 491.52 945.957888 491.52z"  ></path></symbol><symbol id="icon-amount1" viewBox="0 0 1024 1024"><path d="M512 18.5c-272.111 0-493.5 221.321-493.5 493.568 0 272.111 221.389 493.5 493.5 493.5 272.179 0 493.568-221.321 493.568-493.5 0-272.247-221.457-493.568-493.568-493.568zM512 937.233c-234.496 0-425.233-190.805-425.233-425.233 0-234.564 190.737-425.301 425.233-425.301 234.564 0 425.301 190.805 425.301 425.301 0 234.496-190.805 425.233-425.301 425.233zM631.057 254.703l-78.165 143.906c-20.821 39.049-33.587 65.058-38.229 77.756h-1.365c-13.722-31.13-52.497-104.994-116.326-221.662h-73.387l136.602 234.701h-112.026v52.019h131.209v71.202h-131.209v52.77h131.209v103.97h65.263v-103.97h126.635v-52.77h-126.635v-71.202h126.635v-52.019h-108.681l137.967-234.701h-69.495z"  ></path></symbol><symbol id="icon-duihua" viewBox="0 0 1024 1024"><path d="M397.312 331.776c-167.936 0-303.104 114.688-303.104 253.952 0 73.728 36.864 135.168 94.208 184.32l-24.576 86.016c-4.096 16.384 12.288 32.768 28.672 28.672l126.976-49.152c24.576 4.096 49.152 8.192 77.824 8.192 167.936 0 303.104-114.688 303.104-253.952S565.248 331.776 397.312 331.776zM397.312 802.816c-20.48 0-45.056-4.096-69.632-8.192-4.096 0-4.096 0-8.192 0-4.096 0-8.192 0-12.288 4.096l-98.304 36.864L225.28 778.24c4.096-16.384 0-28.672-12.288-40.96-49.152-40.96-77.824-94.208-77.824-155.648C135.168 466.944 253.952 368.64 397.312 368.64c147.456 0 262.144 98.304 262.144 217.088S544.768 802.816 397.312 802.816z"  ></path><path d="M925.696 397.312c0-139.264-135.168-253.952-303.104-253.952-122.88 0-229.376 65.536-278.528 155.648 16.384 0 28.672-4.096 45.056-4.096 45.056-65.536 131.072-114.688 233.472-114.688 147.456 0 262.144 98.304 262.144 217.088 0 57.344-28.672 114.688-77.824 155.648-12.288 8.192-16.384 24.576-12.288 36.864l16.384 57.344-77.824-28.672c0 12.288-4.096 24.576-8.192 36.864l102.4 40.96c16.384 8.192 32.768-8.192 28.672-28.672l-24.576-86.016C888.832 536.576 925.696 471.04 925.696 397.312z"  ></path></symbol><symbol id="icon-shezhi" viewBox="0 0 1024 1024"><path d="M929.792 442.368c0-8.192-8.192-16.384-16.384-16.384-45.056-12.288-81.92-36.864-102.4-77.824-24.576-40.96-28.672-86.016-16.384-131.072 4.096-8.192 0-16.384-8.192-24.576-40.96-36.864-90.112-65.536-139.264-81.92-8.192-4.096-16.384 0-24.576 4.096-32.768 32.768-73.728 53.248-118.784 53.248-45.056 0-86.016-20.48-118.784-53.248C380.928 110.592 372.736 110.592 364.544 114.688c-53.248 16.384-98.304 45.056-139.264 81.92C217.088 200.704 217.088 208.896 217.088 217.088 229.376 262.144 225.28 307.2 204.8 348.16c-24.576 40.96-61.44 69.632-102.4 77.824-8.192 0-16.384 8.192-16.384 16.384-4.096 28.672-8.192 53.248-8.192 81.92s4.096 53.248 8.192 81.92c0 8.192 8.192 16.384 16.384 16.384 45.056 12.288 81.92 36.864 102.4 77.824 24.576 40.96 28.672 86.016 16.384 131.072-4.096 8.192 0 16.384 8.192 24.576 40.96 36.864 90.112 65.536 139.264 81.92 4.096 0 4.096 0 8.192 0 4.096 0 12.288-4.096 16.384-8.192 32.768-32.768 73.728-53.248 118.784-53.248 45.056 0 86.016 20.48 118.784 53.248 4.096 8.192 16.384 8.192 24.576 4.096 53.248-16.384 98.304-45.056 139.264-81.92 8.192-4.096 8.192-16.384 8.192-24.576-12.288-45.056-8.192-90.112 16.384-131.072 24.576-40.96 61.44-69.632 102.4-77.824 8.192 0 16.384-8.192 16.384-16.384 4.096-28.672 8.192-53.248 8.192-81.92C937.984 499.712 933.888 471.04 929.792 442.368zM888.832 585.728c-49.152 16.384-90.112 49.152-118.784 94.208-24.576 45.056-32.768 98.304-20.48 151.552-32.768 24.576-65.536 45.056-102.4 61.44-36.864-36.864-86.016-57.344-139.264-57.344-53.248 0-102.4 20.48-139.264 57.344-36.864-16.384-73.728-36.864-102.4-61.44 12.288-53.248 4.096-106.496-20.48-151.552-24.576-45.056-69.632-77.824-118.784-94.208-4.096-20.48-4.096-40.96-4.096-61.44 0-20.48 0-40.96 4.096-61.44C172.032 450.56 212.992 417.792 241.664 368.64c24.576-45.056 32.768-98.304 20.48-151.552C294.912 192.512 327.68 172.032 364.544 159.744c36.864 36.864 86.016 57.344 139.264 57.344 53.248 0 102.4-20.48 139.264-57.344 36.864 16.384 73.728 36.864 102.4 61.44C737.28 270.336 745.472 323.584 770.048 368.64c24.576 45.056 69.632 77.824 118.784 94.208 4.096 20.48 4.096 40.96 4.096 61.44C892.928 544.768 892.928 565.248 888.832 585.728z"  ></path><path d="M507.904 380.928c-77.824 0-143.36 65.536-143.36 147.456 0 81.92 65.536 147.456 143.36 147.456 8.192 0 16.384 0 24.576-4.096 12.288-4.096 20.48-12.288 16.384-24.576 0-4.096-4.096-12.288-8.192-12.288-4.096-4.096-8.192-4.096-16.384-4.096-8.192 0-12.288 0-16.384 0-57.344 0-102.4-45.056-102.4-102.4s45.056-102.4 102.4-102.4 102.4 45.056 102.4 102.4c0 4.096 0 12.288 0 16.384-4.096 12.288 4.096 24.576 16.384 24.576 4.096 0 12.288 0 16.384-4.096 4.096-4.096 8.192-8.192 8.192-12.288 0-8.192 4.096-16.384 4.096-24.576 0-40.96-16.384-73.728-40.96-102.4C581.632 393.216 544.768 380.928 507.904 380.928z"  ></path></symbol><symbol id="icon-dituleiduankou" viewBox="0 0 1024 1024"><path d="M0 64l0 832 960 0L960 64 0 64zM896 832 64 832 64 128l832 0L896 832zM832 384l-128 0L704 256l-64 0L640 192 320 192l0 64L256 256l0 128L128 384l0 384 704 0L832 384zM768 704 192 704 192 448l64 0 64 0L320 384 320 320l64 0L384 256l192 0 0 64 64 0 0 64 0 64 64 0 64 0L768 704zM256 512l64 0 0 128L256 640 256 512zM384 512l64 0 0 128L384 640 384 512zM512 512l64 0 0 128L512 640 512 512zM640 512l64 0 0 128-64 0L640 512z"  ></path></symbol><symbol id="icon-tishi" viewBox="0 0 1024 1024"><path d="M512 960.16002C264.886903 960.16002 63.83998 759.112074 63.83998 512S264.886903 63.83998 512 63.83998s448.16002 201.046922 448.16002 448.16002S759.112074 960.16002 512 960.16002zM512 116.564809c-218.038922 0-395.435191 177.396269-395.435191 395.435191s177.396269 395.435191 395.435191 395.435191 395.435191-177.396269 395.435191-395.435191S730.037898 116.564809 512 116.564809zM614.408391 650.53724l-2.488681-3.591805-7.813966-3.481288-3.591805 0c-4.175089 0-8.743128 1.103124-23.032576 8.113795l-22.89136 15.454994c-6.269797 3.970428-13.218046 7.309476-20.701484 9.925047-7.877411 2.788509-16.195867 4.993734-24.687262 6.554276-5.875824 1.086751-10.570753 1.859347-15.659655 1.591241-7.104815-0.850367-9.106402-3.638877-9.830903-4.678556-2.12643-2.977821-2.867304-8.55484-2.111081-15.7231 1.118474-10.508331 4.111644-24.923646 8.885368-42.85197 4.91494-18.35402 9.705036-34.297131 14.289448-47.783283 4.599761-13.469779 10.020214-27.538193 16.274662-42.300408 6.160303-14.588253 11.106965-25.160029 14.69877-31.461549 3.292999-5.828752 8.239662-12.288884 14.745842-19.298532 6.160303-6.727215 20.590967-22.481014 12.272511-37.620829-4.52199-8.160867-12.461823-13.060457-24.923646-13.848403-6.081509 0-12.808724 1.323135-20.543895 4.0175-8.066723 2.820232-13.186324 4.963035-15.186887 6.096858-2.064009 1.118474-5.26184 3.182482-19.361977 14.730493-14.005992 11.422144-17.960047 16.006556-20.039405 19.992333-2.032286 3.844561-3.608178 9.263991-4.773723 23.190165-0.441045 5.183046-2.426259 15.502066-9.594519 35.762505l-20.307512 65.049528-16.353456 44.884256c-4.222161 15.329127-5.813403 28.609595-4.867868 40.551578 0.88209 11.610432 3.214205 22.450315 6.931876 32.1707 4.096295 10.791787 9.783831 19.59836 16.873296 26.152637 7.766894 7.215332 17.361413 11.7056 27.948539 13.233396 2.882654 0.51984 6.065136 0.803295 9.531074 0.803295 8.712429 0 18.857487-1.74883 31.052227-5.372358 15.124466-4.505617 27.601638-9.042957 38.078247-13.848403 10.523681-4.742001 20.418029-10.271948 29.476335-16.432251 8.207939-5.655813 16.699334-11.720949 25.411763-18.258852 11.169387-8.397251 18.243503-16.999163 21.694091-26.387997C616.708783 667.804509 620.001783 658.635685 614.408391 650.53724zM483.34845 373.872083c5.251607 4.391007 11.774161 6.791683 19.562545 7.245008 9.149381 0.905626 21.875217-4.573155 38.131459-16.48444 16.213263-11.910261 24.819269-21.37482 25.724895-28.485775 0.905626-7.108908-1.49505-18.068518-7.202029-32.967856-5.749958-14.854313-11.094686-24.365944-16.122189-28.485775-5.070482-4.121877-11.004635-6.386454-17.841344-6.839779-13.314237-0.453325-25.181519 5.615904-35.732829 18.160615-10.506285 12.589736-17.254989 22.687722-20.24202 30.206976-2.989077 7.562233-4.439102 12.951987-4.439102 16.122189-0.453325 5.523807 1.1328 12.725836 4.801353 21.645996C473.655693 362.910427 478.094796 369.56908 483.34845 373.872083z"  ></path></symbol><symbol id="icon-qianbao" viewBox="0 0 1024 1024"><path d="M959.104 852.673v0.005c0 58.886-47.734 106.62-106.615 106.62l-0.005 0.006H170.09c-0.005 0-0.005-0.006-0.01-0.006-58.88 0-106.615-47.734-106.615-106.624V212.932c0-47.108 38.189-85.297 85.303-85.297h344.83l87.397-62.575c10.956-3.976 23.066 1.656 27.052 12.573l18.181 50h162.287c47.104 0 85.293 38.19 85.293 85.303v63.972h0.005c47.108 0 85.297 38.188 85.297 85.301l-0.006 490.464z m-810.336-682.39h-0.005c-23.555 0-42.65 40.42-42.65 63.975s19.095 42.65 42.655 42.65h30.817-21.326 4.039c0.274-0.113 0.45-0.343 0.733-0.45l255.506-106.175h-269.77z m449.475 3.85l-22.64-62.354-0.03 21.336-0.005-0.005-75.954 37.173h-0.19L264.008 276.91h385.173l-50.938-102.776z m232.92 38.804c0-23.559-19.1-42.654-42.649-42.654H641.737l52.335 106.625h137.091v-63.971z m42.649 106.625H148.768c-0.01 0-0.01-0.01-0.016-0.01-15.616 0-30.05-4.503-42.639-11.826v544.952c0 35.332 28.646 63.97 63.977 63.97h682.39c35.337 0 63.975-28.64 63.975-63.97V703.4h-85.298c-47.108 0-85.297-38.183-85.297-85.297 0-47.104 38.189-85.298 85.297-85.298h85.298V362.209c0-23.557-19.094-42.647-42.643-42.647z m42.643 341.19v-85.298h-85.298c-23.554 0-42.648 19.094-42.648 42.649 0 23.56 19.094 42.649 42.648 42.649h85.298z m-85.298-63.975h42.65v42.648h-42.65v-42.648z m0 0" fill="" ></path></symbol><symbol id="icon-cuo" viewBox="0 0 1024 1024"><path d="M959.824 908.231l-394.991-394.991 394.979-394.985-53.782-53.782-394.979 394.985-394.979-394.985-53.782 53.782 394.979 394.985-394.979 394.985 53.782 53.776 394.979-394.979 394.991 394.985z" fill="#231815" ></path></symbol><symbol id="icon-tongxunlu" viewBox="0 0 1024 1024"><path d="M820.672 3.52H246.08a128 128 0 0 0-128 128v118.464l-0.064 0.32v4.096h0.832c2.048 14.4 13.888 25.6 28.8 25.6s26.88-11.2 28.928-25.6h0.384v-1.92c0.064-0.704 0.448-1.408 0.448-2.176s-0.384-1.472-0.448-2.24V160a96 96 0 0 1 96-96h520.768a96 96 0 0 1 96 96v702.784a96 96 0 0 1-96 96H272.96a96 96 0 0 1-96-96V763.52c0.064-0.768 0.448-1.472 0.448-2.24a29.568 29.568 0 1 0-59.136-1.28h-0.192v0.96l-0.064 0.32V892.48a128 128 0 0 0 128 128h574.656a128 128 0 0 0 128-128V131.52a128 128 0 0 0-128-128z" fill="" ></path><path d="M85.376 377.6h128a32 32 0 0 0 0-64h-128a32 32 0 0 0 0 64zM245.376 668.288a32 32 0 0 0-32-32h-128a32 32 0 0 0 0 64h128a32 32 0 0 0 32-32zM118.08 457.024v104.704a29.632 29.632 0 1 0 59.264 0V456.96a29.632 29.632 0 1 0-59.264 0zM294.272 743.488s-4.928 35.52 26.112 37.504c13.952 0.896 25.024-10.432 27.136-23.808h0.192c8.64-107.2 91.264-185.344 200.64-185.344 109.44 0 191.744 78.144 200.32 185.344h0.512c2.112 13.376 13.248 24.96 27.2 23.808 35.008-3.008 26.048-37.44 26.048-37.44A256.96 256.96 0 0 0 636.8 532.544a160.32 160.32 0 1 0-176.768 0 256.96 256.96 0 0 0-165.696 210.944z m145.28-347.648a108.8 108.8 0 1 1 217.6 0 108.8 108.8 0 0 1-217.6 0z" fill="" ></path></symbol><symbol id="icon-jiaoyi" viewBox="0 0 1332 1024"><path d="M1300.327 167.491c-17.198 0-31.14 13.677-31.14 30.548v54.269C1178.437 101.334 1011.06 0 819.466 0 570.428 0 362.32 171.19 310.274 400.115c-1.767 3.835-2.808 8.06-2.808 12.542 0 16.871 13.942 30.548 31.14 30.548s31.14-13.677 31.14-30.548h0.001C415.913 210.69 599.663 59.733 819.468 59.733s403.555 150.957 449.72 352.924c0 16.871 13.942 30.548 31.141 30.548 17.198 0 31.14-13.677 31.14-30.548V198.04c-0.003-16.871-13.944-30.548-31.142-30.548zM1300.327 580.792c-17.198 0-31.14 13.678-31.14 30.55v0.002c-46.166 201.967-229.916 352.923-449.721 352.923-219.806 0-403.558-150.957-449.722-352.925 0-16.872-13.942-30.55-31.14-30.55-17.197 0-31.14 13.678-31.14 30.55V825.96c0 16.87 13.941 30.548 31.14 30.548 17.198 0 31.14-13.677 31.14-30.548v-54.268C460.494 922.665 627.87 1024 819.466 1024c249.04 0 457.143-171.19 509.19-400.115 1.77-3.835 2.809-8.06 2.809-12.543 0.001-16.872-13.94-30.55-31.138-30.55z" fill="" ></path><path d="M998.583 666.13c-0.024 0-0.046 0.008-0.071 0.008v-0.42H859.529v-84.484h138.983v-0.449c0.024 0 0.046 0.007 0.07 0.007 16.65 0 30.145-13.496 30.145-30.144 0-16.649-13.496-30.145-30.144-30.145-0.024 0-0.046 0.007-0.071 0.007v-0.007H880.16L1009.978 281.5l-0.047-0.025c4.74-6.447 7.628-14.333 7.628-22.949 0-21.492-17.422-38.913-38.913-38.913-16.81 0-30.999 10.718-36.439 25.647h-0.287S829.677 464.464 824.492 479.257h-1.558C815.667 460.83 700.302 245.26 700.302 245.26h-0.294c-5.28-14.906-19.357-25.647-36.073-25.647-21.214 0-38.41 17.197-38.41 38.41a38.24 38.24 0 0 0 6.549 21.459l-0.192 0.102 129.152 240.92H640.348c-16.648 0-30.144 13.496-30.144 30.145s13.496 30.145 30.144 30.145v0.442h143.264v84.484H640.348v0.412c-16.648 0-30.144 13.496-30.144 30.144 0 16.649 13.496 30.145 30.144 30.145v0.418h143.264v121.467h0.826a38.035 38.035 0 0 0-0.796 7.714c0 20.909 16.95 37.858 37.859 37.858 20.908 0 37.858-16.95 37.858-37.858 0-2.644-0.28-5.222-0.796-7.714h0.967V726.838h138.983v-0.425c0.024 0 0.046 0.007 0.071 0.007 16.649 0 30.145-13.496 30.145-30.145-0.002-16.648-13.498-30.145-30.146-30.145z" fill="" ></path></symbol><symbol id="icon-tianjia" viewBox="0 0 1024 1024"><path d="M512 966.4c-61.32736 0-120.83968-12.02048-176.88448-35.7248-54.11456-22.88896-102.70592-55.648-144.42496-97.36576-41.71904-41.71904-74.4768-90.3104-97.36576-144.42368C69.6192 632.8384 57.6 573.32608 57.6 512c0-61.32736 12.0192-120.83968 35.7248-176.88448 22.88896-54.11456 55.64672-102.70592 97.36576-144.42496 41.71904-41.71904 90.3104-74.47808 144.42496-97.36576C391.16032 69.6192 450.67264 57.6 512 57.6c61.32736 0 120.83968 12.0192 176.88448 35.7248 54.11328 22.88896 102.70592 55.64672 144.42496 97.36576 41.71904 41.71904 74.47808 90.3104 97.36448 144.42496C954.37952 391.16032 966.4 450.67264 966.4 512c0 81.4272-21.80096 161.32096-63.0464 231.04256-10.79808 18.2528-34.34752 24.29696-52.6016 13.49888-18.2528-10.79808-24.29568-34.3488-13.49888-52.6016C871.49824 646.05184 889.6 579.67872 889.6 512c0-208.20992-169.39136-377.6-377.6-377.6-208.20992 0-377.6 169.39008-377.6 377.6 0 208.20864 169.39008 377.6 377.6 377.6 58.304 0 114.1888-12.91776 166.1056-38.39232 19.04256-9.34016 42.048-1.47968 51.38944 17.55776 9.34272 19.03872 1.48096 42.048-17.55776 51.38944C649.4016 950.8416 582.13248 966.4 512 966.4z" fill="" ></path><path d="M736 550.4H288c-21.20704 0-38.4-17.19296-38.4-38.4s17.19296-38.4 38.4-38.4h448c21.20704 0 38.4 17.19296 38.4 38.4s-17.19296 38.4-38.4 38.4z" fill="" ></path><path d="M512 774.4c-21.20704 0-38.4-17.19296-38.4-38.4V288c0-21.20704 17.19296-38.4 38.4-38.4s38.4 17.19296 38.4 38.4v448c0 21.20704-17.19296 38.4-38.4 38.4z" fill="" ></path></symbol><symbol id="icon-qianbao1" viewBox="0 0 1024 1024"><path d="M899.992 0.008h-776C55.624 0.008 0 55.632 0 124.016v775.968c0 68.368 55.624 124.008 123.992 124.008h776c68.368 0 124.008-55.64 124.008-124.008V124.016C1024 55.632 968.36 0.008 899.992 0.008z m59.336 617.16H774.408c-98.616 0-157.504-39.312-157.504-105.152 0-57.976 47.176-105.16 105.16-105.16h237.272v210.312z m-59.336 342.144h-776c-32.72 0-59.32-26.616-59.32-59.328V124.016c0-32.72 26.6-59.336 59.32-59.336h776c32.72 0 59.336 26.616 59.336 59.336v218.168H722.056c-93.632 0-169.832 76.192-169.832 169.832 0 78.344 58.192 169.824 222.176 169.824h184.92v218.152c0.008 32.704-26.608 59.32-59.328 59.32z" fill="#888888" ></path><path d="M757.608 557.832a45.816 45.816 0 1 0 0-91.64 45.816 45.816 0 1 0 0 91.64z" fill="#888888" ></path></symbol><symbol id="icon--huifubeifen" viewBox="0 0 1024 1024"><path d="M924.0064 665.489067l-85.162667-540.808534a21.333333 21.333333 0 0 0-21.077333-18.013866h-605.866667a21.333333 21.333333 0 0 0-21.034666 17.757866l-92.433067 544a20.855467 20.855467 0 0 0-0.213333 4.872534c-0.008533 0.290133-0.085333 0.554667-0.085334 0.836266v230.4a21.333333 21.333333 0 0 0 21.333334 21.333334h785.066666a21.333333 21.333333 0 0 0 21.333334-21.333334V674.133333c0-3.080533-0.682667-5.9904-1.860267-8.644266zM229.905067 149.333333h569.6256l79.2832 503.466667H648.183467a21.333333 21.333333 0 0 0-20.9408 17.271467c-8.209067 42.376533-54.929067 89.591467-108.842667 89.591466S417.7664 712.448 409.557333 670.071467A21.333333 21.333333 0 0 0 388.608 652.8H144.366933l85.538134-503.466667z m653.294933 733.866667h-742.4v-187.733333h231.534933c18.756267 54.2208 75.332267 106.862933 146.065067 106.862933s127.300267-52.650667 146.056533-106.862933H883.2v187.733333z"  ></path><path d="M445.713067 564.957867a21.316267 21.316267 0 0 0 36.411733-15.086934V464.554667c71.9104-8.8832 123.562667 2.397867 152.465067 33.066666 26.6496 28.288 30.1824 68.701867 28.458666 97.6128a21.333333 21.333333 0 0 0 36.8896 15.8208c28.091733-30.1056 64.913067-97.493333 60.9792-145.6896-6.4512-78.9504-42.717867-183.338667-278.801066-187.895466v-82.491734a21.333333 21.333333 0 0 0-36.411734-15.086933L268.279467 357.3504a21.316267 21.316267 0 0 0 0 30.165333l177.4336 177.442134zM439.466667 246.5024V298.666667a21.333333 21.333333 0 0 0 21.333333 21.333333h5.137067c168.448 0 243.950933 44.5184 252.458666 148.855467 1.416533 17.288533-6.391467 42.103467-17.92 65.339733-5.623467-22.877867-16.187733-46.037333-34.824533-65.8176-30.8992-32.7936-77.585067-49.425067-138.752-49.425067-18.4576 0-38.528 0.938667-60.433067 4.078934-0.938667-0.017067-2.372267-0.622933-4.6336-0.622934h-1.083733c-11.767467 0-21.290667 10.760533-21.290667 22.528v53.444267L313.540267 372.437333 439.466667 246.5024z"  ></path></symbol><symbol id="icon-backup" viewBox="0 0 1024 1024"><path d="M224.9 67.1v119.8H79.1v770h720V837.1H945v-770H224.9z m524.2 839.8h-620v-670h620v670z m145.8-119.8H799V186.9H274.9v-69.8h620v670z" fill="" ></path></symbol><symbol id="icon-id" viewBox="0 0 1024 1024"><path d="M421.738667 348.032l-234.666667-0.021333a21.333333 21.333333 0 0 1 0-42.666667l234.666667 0.021333a21.333333 21.333333 0 0 1 0 42.666667zM485.738667 433.365333h-298.666667a21.333333 21.333333 0 0 1 0-42.666666h298.666667a21.333333 21.333333 0 0 1 0 42.666666zM357.738667 517.397333h-170.666667a21.333333 21.333333 0 0 1 0-42.666666h170.666667a21.333333 21.333333 0 0 1 0 42.666666zM710.72 687.744c-70.592 0-128-57.408-128-128s57.408-128 128-128 128 57.408 128 128-57.408 128-128 128z m0-213.333333c-47.061333 0-85.333333 38.272-85.333333 85.333333s38.272 85.333333 85.333333 85.333333 85.333333-38.272 85.333333-85.333333c0-47.04-38.272-85.333333-85.333333-85.333333z" fill="#666666" ></path><path d="M892.053333 856.96h-42.666666c0-82.325333-62.208-149.333333-138.666667-149.333333s-138.666667 67.008-138.666667 149.333333h-42.666666c0-105.877333 81.344-192 181.333333-192s181.333333 86.122667 181.333333 192z" fill="#666666" ></path><path d="M891.221333 860.928h-725.333333c-47.061333 0-85.333333-38.272-85.333333-85.333333v-116.906667a21.333333 21.333333 0 1 1 42.666666 0v116.906667c0 23.530667 19.136 42.666667 42.666667 42.666666h725.333333c23.530667 0 42.666667-19.136 42.666667-42.666666v-554.666667c0-23.530667-19.136-42.666667-42.666667-42.666667h-725.333333c-23.530667 0-42.666667 19.136-42.666667 42.666667v245.781333a21.333333 21.333333 0 0 1-42.666666 0V220.928c0-47.061333 38.272-85.333333 85.333333-85.333333h725.333333c47.061333 0 85.333333 38.272 85.333334 85.333333v554.666667c0 47.061333-38.272 85.333333-85.333334 85.333333z" fill="#666666" ></path><path d="M100.778667 562.709333m-32 0a32 32 0 1 0 64 0 32 32 0 1 0-64 0Z" fill="#666666" ></path></symbol><symbol id="icon-saoyisao" viewBox="0 0 1025 1024"><path d="M308.6 953.2h-75.6c-89 0-161.2-72.4-161.2-161.2v-79.4c0-19.6-15.8-35.4-35.4-35.4S1 693 1 712.6V792c0 128 104.2 232 232.2 232h75.6c19.6 0 35.4-15.8 35.4-35.4-0.2-19.6-16-35.4-35.6-35.4zM989.4 677c-19.6 0-35.4 15.8-35.4 35.4V792c0 89-72.4 161.2-161.2 161.2h-75.6c-19.6 0-35.4 15.8-35.4 35.4 0 19.6 15.8 35.4 35.4 35.4h75.6c128 0 232-104 232-232v-79.4c0.2-19.6-15.8-35.6-35.4-35.6zM792.8 0h-75.6c-19.6 0-35.4 15.8-35.4 35.4 0 19.6 15.8 35.4 35.4 35.4h75.6c89 0 161.2 72.4 161.2 161.2v72c0 19.6 15.8 35.4 35.4 35.4s35.4-15.8 35.4-35.4v-71.8c0.2-128-104-232.2-232-232.2zM36.4 343.2c19.6 0 35.4-15.8 35.4-35.4v-75.6c0-89 72.4-161.2 161.2-161.2h75.6c19.4 0 35.4-15.8 35.4-35.4C344 15.8 328.2 0 308.6 0h-75.6C105 0 1 104.2 1 232.2v75.6c0 19.6 15.8 35.4 35.4 35.4zM989.4 472.6H36.4C16.8 472.6 1 488.4 1 508c0 19.6 15.8 35.4 35.4 35.4h953.2c19.6 0 35.4-15.8 35.4-35.4 0-19.4-16-35.4-35.6-35.4z" fill="" ></path></symbol><symbol id="icon-lajitong" viewBox="0 0 1024 1024"><path d="M930.9 186.2H791.3V93.1c0-51.2-41.9-93.1-93.1-93.1H325.8c-51.2 0-93.1 41.9-93.1 93.1v93.1H93.1C41.9 186.2 0 228.1 0 279.3v93.1c0 51.2 41.9 93.1 93.1 93.1v418.9c0 76.8 62.8 139.6 139.6 139.6h558.5c76.8 0 139.6-62.8 139.6-139.6V465.5c51.2 0 93.1-41.9 93.1-93.1v-93.1c0.1-51.2-41.8-93.1-93-93.1zM279.3 93.1c0-25.7 20.9-46.5 46.5-46.5h372.4c25.7 0 46.5 20.9 46.5 46.5v93.1H279.3V93.1z m605.1 791.3c0 51.3-41.8 93.1-93.1 93.1H232.7c-51.3 0-93.1-41.8-93.1-93.1V465.5h186.2v325.8h46.5V465.5h279.3v325.8h46.5V465.5h186.2v418.9z m93.1-512c0 25.7-20.9 46.5-46.5 46.5H93.1c-25.7 0-46.5-20.9-46.5-46.5v-93.1c0-25.7 20.9-46.5 46.5-46.5h837.7c25.7 0 46.5 20.9 46.5 46.5v93.1z"  ></path></symbol><symbol id="icon-shezhi1" viewBox="0 0 1024 1024"><path d="M879.744 782.976c-4.864-1.344-13.696-3.136-22.08-6.144-40.064-14.272-82.432 15.552-81.344 57.856 0.192 7.552 2.112 15.36 4.8 22.528 11.584 31.296 1.024 61.376-28.16 77.888a477.952 477.952 0 0 1-106.944 44.288c-31.744 8.96-60.992-5.12-74.624-35.84-15.168-34.048-54.336-47.424-86.208-29.184a62.336 62.336 0 0 0-26.176 30.4c-11.008 25.216-35.072 40.256-61.696 36.864-12.928-1.6-25.536-6.144-38.016-10.24a461.632 461.632 0 0 1-80.704-35.904c-29.824-16.768-40.384-46.656-28.352-78.72 9.28-24.704 5.056-47.36-13.696-65.92-18.432-18.176-40.832-22.144-64.96-13.12-32.64 12.032-62.208 1.6-79.168-28.608a485.376 485.376 0 0 1-43.776-105.792 60.48 60.48 0 0 1 34.88-74.56c19.072-8.384 31.744-22.272 36.416-42.688a59.712 59.712 0 0 0-35.392-69.376c-18.368-8.064-30.912-21.056-36.48-40.448a58.56 58.56 0 0 1-0.064-32.192 481.344 481.344 0 0 1 44.672-108.8c16.512-29.44 46.72-40.256 78.336-28.16 37.248 14.272 75.968-7.168 82.944-46.272a59.52 59.52 0 0 0-3.712-32.64c-12.352-31.872-1.536-61.888 28.352-78.72A481.088 481.088 0 0 1 386.176 45.184a60.48 60.48 0 0 1 72.896 35.136c9.152 20.672 24.32 33.856 46.784 37.376 28.672 4.48 53.76-9.6 65.472-36.352 8.64-19.584 22.656-32.96 43.712-36.8 9.536-1.728 20.288-1.472 29.696 0.96a447.616 447.616 0 0 1 108.16 44.352c29.184 16.448 40 46.656 28.032 77.824-15.168 39.424 8.896 79.488 50.88 83.52 8.832 0.832 18.496-0.896 26.944-3.904 33.984-12.096 62.912-1.856 80.512 29.632 18.176 32.64 32.32 66.944 42.624 102.912 9.6 33.6-3.712 62.528-35.584 76.864-38.656 17.344-49.472 65.6-21.184 96.192 5.952 6.4 13.888 11.712 21.824 15.424 30.848 14.4 44.416 43.2 35.072 76.16a471.36 471.36 0 0 1-44.992 107.328c-11.776 20.352-29.824 30.336-57.28 31.168z m44.608-383.36c-8.96-32.896-21.952-64-38.4-93.824-2.048-3.776-4.288-1.92-6.784-1.088-22.784 8.192-46.08 10.048-69.76 4.416A120.768 120.768 0 0 1 723.2 149.504c1.728-4.864 0.832-7.04-3.648-9.088-18.112-8.128-35.904-17.088-54.208-24.704-12.032-5.056-24.768-8.448-36.8-12.48-23.296 48.128-59.968 75.584-113.024 75.584-53.312 0-90.048-27.584-113.024-75.2a414.72 414.72 0 0 0-96.32 39.936c17.344 49.984 11.008 95.488-26.752 133.12-37.696 37.568-83.2 44.096-132.928 26.56-17.344 30.72-30.784 62.72-39.872 96.384 47.36 22.848 74.816 59.2 75.136 112.064 0.32 53.632-27.2 90.56-75.2 113.792 9.28 33.856 22.656 66.048 40 96.384 48.192-16.96 92.48-11.52 129.728 23.488 40.32 37.76 47.68 84.352 29.888 136.128 30.592 17.344 62.656 30.848 96.384 39.872 23.232-47.808 59.904-75.2 112.96-75.136 53.376 0 89.984 27.776 112.896 75.2a419.2 419.2 0 0 0 96.32-39.936c-17.472-49.984-10.88-95.296 26.496-132.864 37.632-37.76 83.136-44.16 133.184-26.816a414.08 414.08 0 0 0 39.872-96.384c-48.192-23.36-75.648-60.48-75.136-114.112 0.448-52.544 27.776-88.768 75.2-111.68z m0 0"  ></path><path d="M515.52 300.032c26.688 0.32 52.416 5.504 77.248 15.232 16.64 6.464 24.448 23.296 18.496 39.232-6.016 16.192-23.232 23.808-40.256 17.216a151.36 151.36 0 0 0-196.48 85.184c-36.16 91.328 23.872 193.472 120.96 205.888a151.68 151.68 0 0 0 170.88-136.448 152.96 152.96 0 0 0-10.176-69.568 30.016 30.016 0 0 1 15.744-39.424 30.08 30.08 0 0 1 40.32 16.96c13.44 33.28 18.752 67.904 13.568 103.36-12.736 86.976-60.672 146.88-143.552 175.744-123.904 43.072-257.408-39.744-276.48-169.472-17.088-116.416 63.232-224.768 179.072-241.28 10.112-1.472 20.48-1.792 30.656-2.624z m0 0"  ></path></symbol><symbol id="icon-fl-renminbi" viewBox="0 0 1024 1024"><path d="M783.6119140625001 167.56542968750006L575.0254882812499 463.25761718749993H739.4169921875v65.36689453125H547.9103515625v90.02460937500001H739.4169921875v66.18427734375001H547.9103515625v131.08710937499998H449.38144531250003V684.8333984374999H250.86464843749997v-66.18427734375001h198.516796875V528.6245117187499H250.86464843749997v-65.36689453125h169.3740234375L213.64560546874998 167.56542968750006h111.08935546875c96.53642578125 146.85029296874998 155.141015625 240.00644531250003 175.921875 279.39638671875h1.9924804687499997c7.046191406249999-16.225488281249998 26.33115234375-48.89091796875 57.786328125000004-97.9962890625L678.5711914062499 167.56542968750006h105.04072265625001z"  ></path></symbol><symbol id="icon-bianji" viewBox="0 0 1024 1024"><path d="M482.3 96H155.4C122.6 96 96 122.6 96 155.4v713.1c0 32.8 26.6 59.4 59.4 59.4h713.1c32.8 0 59.4-26.6 59.4-59.4V541.7c0-7.6-2.9-15.2-8.7-21-5.8-5.8-13.4-8.7-21-8.7s-15.2 2.9-21 8.7c-5.8 5.8-8.7 13.4-8.7 21v326.9H155.4V155.4h326.9c7.6 0 15.2-2.9 21-8.7 5.8-5.8 8.7-13.4 8.7-21s-2.9-15.2-8.7-21c-5.8-5.8-13.4-8.7-21-8.7z"  ></path><path d="M838.9 155.4c4.6 0 13.4 1.1 21 8.7 11.6 11.6 11.6 30.4 0 42L515 551l-53.4 11.6 11.5-53.7 344.8-344.8c7.5-7.5 16.4-8.7 21-8.7m0-59.4c-22.8 0-45.6 8.7-63 26.1L431.1 466.9c-8.1 8.1-13.7 18.4-16.1 29.6l-21.5 100.8c-2.6 18.2 11.6 33.9 29.3 33.9 1.4 0 2.8-0.1 4.3-0.3l100.6-21.8c11.2-2.4 21.4-8 29.4-16.1l344.8-344.8c34.8-34.8 34.8-91.3 0-126.1-17.4-17.4-40.2-26.1-63-26.1z"  ></path></symbol><symbol id="icon-icon-" viewBox="0 0 1024 1024"><path d="M860.16 184.32H163.84a122.88 122.88 0 0 0-122.88 122.88v40.96a122.88 122.88 0 0 0 122.88 122.88h696.32a122.88 122.88 0 0 0 122.88-122.88v-40.96a122.88 122.88 0 0 0-122.88-122.88z m81.92 163.84a81.92 81.92 0 0 1-81.92 81.92H163.84a81.92 81.92 0 0 1-81.92-81.92v-40.96a81.92 81.92 0 0 1 81.92-81.92h696.32a81.92 81.92 0 0 1 81.92 81.92zM860.16 552.96H163.84a122.88 122.88 0 0 0-122.88 122.88v40.96a122.88 122.88 0 0 0 122.88 122.88h696.32a122.88 122.88 0 0 0 122.88-122.88v-40.96a122.88 122.88 0 0 0-122.88-122.88z m81.92 163.84a81.92 81.92 0 0 1-81.92 81.92H163.84a81.92 81.92 0 0 1-81.92-81.92v-40.96a81.92 81.92 0 0 1 81.92-81.92h696.32a81.92 81.92 0 0 1 81.92 81.92z"  ></path><path d="M184.32 266.24a61.44 61.44 0 1 0 61.44 61.44 61.44 61.44 0 0 0-61.44-61.44z m0 81.92a20.48 20.48 0 1 1 20.48-20.48 20.48 20.48 0 0 1-20.48 20.48zM839.68 634.88a61.44 61.44 0 1 0 61.44 61.44 61.44 61.44 0 0 0-61.44-61.44z m0 81.92a20.48 20.48 0 1 1 20.48-20.48 20.48 20.48 0 0 1-20.48 20.48zM204.8 614.4a81.92 81.92 0 0 0-79.0528 102.4h43.8272A40.96 40.96 0 0 1 163.84 696.32a40.96 40.96 0 0 1 40.96-40.96h81.92v-40.96zM860.16 327.68a40.96 40.96 0 0 1-5.7344 20.48h43.8272A81.92 81.92 0 0 0 819.2 245.76v40.96a40.96 40.96 0 0 1 40.96 40.96zM737.28 245.76h40.96v40.96h-40.96z"  ></path></symbol><symbol id="icon-erji-anquanshebei" viewBox="0 0 1024 1024"><path d="M512 185.6c-76.8 0-140.8 64-140.8 140.8v32h-44.8c-19.2 0-32 12.8-32 32v300.8c0 19.2 12.8 32 32 32h364.8c19.2 0 32-12.8 32-32V390.4c0-19.2-12.8-32-32-32h-38.4v-32c0-76.8-64-140.8-140.8-140.8zM428.8 326.4c0-44.8 32-76.8 76.8-76.8s76.8 32 76.8 76.8v32H428.8v-32z m230.4 96v236.8H358.4V422.4h300.8z" fill="" ></path><path d="M998.4 128C704-38.4 320-38.4 25.6 128c-6.4 6.4-12.8 19.2-12.8 32L32 384c0 19.2 19.2 32 32 32 19.2 0 32-19.2 32-32l-19.2-211.2C345.6 25.6 678.4 25.6 947.2 172.8l-38.4 448c-12.8 153.6-281.6 288-390.4 332.8C403.2 908.8 140.8 768 128 620.8c0-19.2-19.2-32-32-32-32 6.4-44.8 19.2-38.4 38.4 19.2 230.4 428.8 390.4 448 396.8h25.6c19.2-6.4 422.4-166.4 448-396.8l44.8-467.2c-12.8-12.8-19.2-25.6-25.6-32z" fill="" ></path></symbol><symbol id="icon-icon--" viewBox="0 0 1024 1024"><path d="M665.6 486.4h-128v-128c0-15.36-10.24-25.6-25.6-25.6s-25.6 10.24-25.6 25.6v128h-128c-15.36 0-25.6 10.24-25.6 25.6s10.24 25.6 25.6 25.6h128v128c0 15.36 10.24 25.6 25.6 25.6s25.6-10.24 25.6-25.6v-128h128c15.36 0 25.6-10.24 25.6-25.6 0-12.8-10.24-25.6-25.6-25.6zM512 102.4C286.72 102.4 102.4 286.72 102.4 512s184.32 409.6 409.6 409.6 409.6-184.32 409.6-409.6S737.28 102.4 512 102.4z m0 768c-197.12 0-358.4-161.28-358.4-358.4S314.88 153.6 512 153.6s358.4 161.28 358.4 358.4-161.28 358.4-358.4 358.4z"  ></path></symbol><symbol id="icon-icon-1" viewBox="0 0 1024 1024"><path d="M992 1002.66666667H32c-19.2 0-32-12.8-32-32s12.8-32 32-32h960c19.2 0 32 12.8 32 32s-12.8 32-32 32zM121.6 455.46666667c-6.4 0-9.6 0-12.8-3.2-12.8-3.2-22.4-12.8-28.8-22.4L3.2 276.26666667C-3.2 260.26666667 3.2 241.06666667 19.2 234.66666667c16-6.4 35.2 0 41.6 16L128 385.06666667l137.6-70.4c16-9.6 35.2-3.2 44.8 12.8 9.6 16 3.2 35.2-12.8 44.8l-153.6 80c-6.4 3.2-16 3.2-22.4 3.2z" fill="#000000" ></path><path d="M512 842.66666667c-102.4 0-201.6-38.4-278.4-108.8-12.8-12.8-12.8-32-3.2-44.8 12.8-12.8 32-12.8 44.8-3.2 64 57.6 150.4 92.8 236.8 92.8 195.2 0 352-156.8 352-352S707.2 74.66666667 512 74.66666667c-172.8 0-316.8 121.6-345.6 291.2-3.2 19.2-19.2 28.8-38.4 25.6-16-3.2-28.8-19.2-25.6-38.4C137.6 154.66666667 310.4 10.66666667 512 10.66666667c230.4 0 416 185.6 416 416s-185.6 416-416 416z" fill="#000000" ></path></symbol><symbol id="icon-tubiaolunkuo-" viewBox="0 0 1024 1024"><path d="M512 1024c-281.6 0-512-230.4-512-512s230.4-512 512-512 512 230.4 512 512-230.4 512-512 512zM512 32C249.6 32 32 249.6 32 512s211.2 480 480 480 480-211.2 480-480S774.4 32 512 32z m243.2 742.4c-6.4 0-12.8 0-12.8-6.4L512 537.6l-236.8 217.6c-12.8 12.8-19.2 12.8-32 0-6.4-6.4-6.4-19.2 0-25.6L486.4 512 256 281.6c-6.4-6.4-6.4-19.2 0-25.6 6.4-6.4 19.2-6.4 25.6 0L512 486.4l236.8-217.6c12.8-12.8 19.2-12.8 32 0 6.4 6.4 6.4 19.2 0 25.6L537.6 512l230.4 230.4c6.4 6.4 6.4 19.2 0 25.6-6.4 6.4-6.4 6.4-12.8 6.4z" fill="" ></path></symbol><symbol id="icon-icon-test" viewBox="0 0 1024 1024"><path d="M422.4 546.133333H234.666667a29.866667 29.866667 0 0 1 0-59.733333h247.466666v-34.133333H234.666667c-35.345067 0-64 28.654933-64 64 0 35.345067 28.654933 64 64 64h187.733333v-34.133334z" fill="#666666" ></path><path d="M482.133333 452.266667H234.666667a29.866667 29.866667 0 0 1 0-59.733334h341.333333a29.853867 29.853867 0 0 1 26.363733 15.812267l30.097067-16.1024A63.982933 63.982933 0 0 0 576 358.4H234.666667c-35.345067 0-64 28.654933-64 64 0 35.345067 28.654933 64 64 64h247.466666v-34.133333z" fill="#666666" ></path><path d="M234.666667 298.666667a29.866667 29.866667 0 0 0 0 59.733333h341.333333a29.866667 29.866667 0 0 0 0-59.733333H234.666667z m0-34.133334h341.333333c35.345067 0 64 28.654933 64 64 0 35.345067-28.654933 64-64 64H234.666667c-35.345067 0-64-28.654933-64-64 0-35.345067 28.654933-64 64-64z" fill="#666666" ></path><path d="M234.666667 204.8a29.866667 29.866667 0 0 0 0 59.733333h341.333333a29.866667 29.866667 0 0 0 0-59.733333H234.666667z m0-34.133333h341.333333c35.345067 0 64 28.654933 64 64 0 35.345067-28.654933 64-64 64H234.666667c-35.345067 0-64-28.654933-64-64 0-35.345067 28.654933-64 64-64z" fill="#666666" ></path><path d="M661.333333 910.933333c137.851733 0 249.6-111.748267 249.6-249.6S799.185067 411.733333 661.333333 411.733333 411.733333 523.4816 411.733333 661.333333s111.748267 249.6 249.6 249.6z m0 27.733334c-153.169067 0-277.333333-124.164267-277.333333-277.333334s124.164267-277.333333 277.333333-277.333333 277.333333 124.164267 277.333334 277.333333-124.164267 277.333333-277.333334 277.333334z" fill="#666666" ></path><path d="M661.333333 846.122667c102.058667 0 184.789333-82.730667 184.789334-184.789334s-82.730667-184.789333-184.789334-184.789333-184.789333 82.730667-184.789333 184.789333 82.730667 184.789333 184.789333 184.789334z m0 27.584c-117.290667 0-212.373333-95.082667-212.373333-212.373334S544.042667 448.96 661.333333 448.96 873.706667 544.042667 873.706667 661.333333 778.624 873.706667 661.333333 873.706667z" fill="#666666" ></path><path d="M694.9376 607.944533h49.924267a13.909333 13.909333 0 0 1 0 27.8272h-69.614934v27.8272h69.614934a13.909333 13.909333 0 1 1 0 27.822934h-69.614934v58.474666a13.909333 13.909333 0 1 1-27.8272 0v-58.474666h-69.614933a13.909333 13.909333 0 1 1 0-27.8272h69.614933v-27.822934h-69.614933a13.909333 13.909333 0 0 1 0-27.8272h49.088l-25.3184-25.314133a13.909333 13.909333 0 0 1 19.677867-19.677867l39.662933 39.662934 39.658667-39.662934a13.909333 13.909333 0 0 1 19.677866 19.677867l-25.314133 25.314133z" fill="#666666" ></path></symbol><symbol id="icon-icon-test1" viewBox="0 0 1024 1024"><path d="M324.266667 539.306667c118.762667 0 215.04-96.277333 215.04-215.04 0-118.762667-96.277333-215.04-215.04-215.04-118.762667 0-215.04 96.277333-215.04 215.04 0 118.762667 96.277333 215.04 215.04 215.04z m0 23.893333c-131.959467 0-238.933333-106.973867-238.933334-238.933333s106.973867-238.933333 238.933334-238.933334 238.933333 106.973867 238.933333 238.933334-106.973867 238.933333-238.933333 238.933333z" fill="#666666" ></path><path d="M324.266667 483.473067c87.927467 0 159.2064-71.278933 159.2064-159.2064S412.194133 165.060267 324.266667 165.060267 165.060267 236.3392 165.060267 324.266667 236.3392 483.473067 324.266667 483.473067z m0 23.761066c-101.051733 0-182.967467-81.92-182.967467-182.967466 0-101.051733 81.92-182.967467 182.967467-182.967467 101.051733 0 182.967467 81.92 182.967466 182.967467 0 101.051733-81.92 182.967467-182.967466 182.967466z" fill="#666666" ></path><path d="M353.216 278.272h43.012267a11.989333 11.989333 0 0 1 0 23.9744H336.256v23.970133h59.976533a11.989333 11.989333 0 0 1 0 23.9744H336.256v50.376534a11.989333 11.989333 0 0 1-23.970133 0V350.190933H252.305067a11.989333 11.989333 0 1 1 0-23.9744H312.277333v-23.9744H252.305067a11.989333 11.989333 0 0 1 0-23.970133h42.286933l-21.8112-21.8112a11.989333 11.989333 0 1 1 16.951467-16.951467l34.176 34.171734 34.167466-34.176a11.989333 11.989333 0 1 1 16.951467 16.955733l-21.8112 21.8112z" fill="#666666" ></path><path d="M699.733333 914.773333c118.762667 0 215.04-96.277333 215.04-215.04 0-118.762667-96.277333-215.04-215.04-215.04-118.762667 0-215.04 96.277333-215.04 215.04 0 118.762667 96.277333 215.04 215.04 215.04z m0 23.893334c-131.959467 0-238.933333-106.973867-238.933333-238.933334s106.973867-238.933333 238.933333-238.933333 238.933333 106.973867 238.933334 238.933333-106.973867 238.933333-238.933334 238.933334z" fill="#666666" ></path><path d="M697.518933 857.301333c88.2432 0 159.778133-71.5392 159.778134-159.7824 0-88.238933-71.534933-159.773867-159.778134-159.773866-88.238933 0-159.773867 71.534933-159.773866 159.773866 0 88.2432 71.534933 159.778133 159.773866 159.778134z m0 23.8464c-101.410133 0-183.624533-82.2144-183.624533-183.6288 0-101.410133 82.2144-183.624533 183.624533-183.624533 101.418667 0 183.6288 82.2144 183.6288 183.624533 0 101.418667-82.2144 183.6288-183.6288 183.6288z" fill="#666666" ></path><path d="M710.971733 796.0064c23.317333-5.7984 40.9472-26.376533 41.821867-51.477333 1.0624-30.378667-22.826667-55.867733-53.3504-56.9344a12.228267 12.228267 0 0 0-1.194667 0.017066 12.228267 12.228267 0 0 0-1.194666-0.098133c-15.927467-0.554667-28.3904-13.853867-27.835734-29.704533 0.554667-15.850667 13.909333-28.245333 29.841067-27.690667 15.9232 0.554667 28.386133 13.853867 27.835733 29.704533a11.9936 11.9936 0 0 0 11.5968 12.373334 11.9936 11.9936 0 0 0 12.433067-11.5328c0.8832-25.262933-16.2688-46.993067-39.953067-52.906667v-11.042133a12.023467 12.023467 0 1 0-24.046933 0v10.615466c-23.159467 4.936533-40.878933 25.015467-41.7408 49.6384-1.015467 29.056 21.832533 53.44 51.0336 54.459734 0.401067 0.0128 0.802133 0.008533 1.194667-0.017067 0.392533 0.0512 0.789333 0.085333 1.194666 0.1024 17.2544 0.597333 30.754133 15.010133 30.1568 32.1792-0.597333 17.169067-15.074133 30.600533-32.328533 29.994667-17.2544-0.597333-30.754133-15.005867-30.1568-32.1792a11.9936 11.9936 0 0 0-11.5968-12.373334 11.9936 11.9936 0 0 0-12.433067 11.537067c-0.96 27.434667 18.427733 50.88 44.672 55.953067v10.551466a12.023467 12.023467 0 1 0 24.0512 0v-11.170133z" fill="#666666" ></path><path d="M810.666667 349.866667V264.533333c0-28.2752-22.9248-51.2-51.2-51.2h-98.133334a17.066667 17.066667 0 1 0 0 34.133334h98.133334a17.066667 17.066667 0 0 1 17.066666 17.066666v85.333334h-26.990933a8.533333 8.533333 0 0 0-6.173867 14.4256l44.0576 46.1568a8.533333 8.533333 0 0 0 12.347734 0l44.0576-46.1568A8.533333 8.533333 0 0 0 837.6576 349.866667H810.666667zM214.724267 673.3568v85.333333c0 28.2752 22.9248 51.2 51.2 51.2h98.133333a17.066667 17.066667 0 1 0 0-34.133333h-98.133333a17.066667 17.066667 0 0 1-17.066667-17.066667v-85.333333h26.990933a8.533333 8.533333 0 0 0 6.173867-14.4256l-44.0576-46.1568a8.533333 8.533333 0 0 0-12.347733 0l-44.0576 46.1568a8.533333 8.533333 0 0 0 6.173866 14.421333h26.990934z" fill="#666666" ></path></symbol><symbol id="icon-dizhi" viewBox="0 0 1024 1024"><path d="M512 531.2c-76.8 0-138.666667-61.866667-138.666667-138.666667s61.866667-138.666667 138.666667-138.666666 138.666667 61.866667 138.666667 138.666666-61.866667 138.666667-138.666667 138.666667z m0-224c-46.933333 0-85.333333 38.4-85.333333 85.333333s38.4 85.333333 85.333333 85.333334 85.333333-38.4 85.333333-85.333334-38.4-85.333333-85.333333-85.333333z" fill="" ></path><path d="M512 864c-6.4 0-12.8-2.133333-19.2-8.533333-2.133333-2.133333-38.4-36.266667-83.2-85.333334-108.8-115.2-174.933333-202.666667-196.266667-256-14.933333-38.4-23.466667-78.933333-23.466666-121.6C189.866667 213.333333 334.933333 70.4 512 70.4s322.133333 145.066667 322.133333 322.133333c0 44.8-8.533333 85.333333-25.6 125.866667-23.466667 53.333333-87.466667 138.666667-194.133333 253.866667-46.933333 49.066667-83.2 85.333333-83.2 85.333333-6.4 4.266667-12.8 6.4-19.2 6.4z m0-740.266667c-149.333333 0-268.8 121.6-268.8 268.8 0 36.266667 6.4 70.4 19.2 102.4 19.2 46.933333 85.333333 132.266667 185.6 241.066667 25.6 27.733333 49.066667 51.2 64 66.133333 14.933333-14.933333 38.4-38.4 64-66.133333 100.266667-108.8 164.266667-189.866667 185.6-236.8 14.933333-34.133333 21.333333-68.266667 21.333333-104.533333C780.8 243.2 661.333333 123.733333 512 123.733333z" fill="" ></path><path d="M512 953.6c-162.133333 0-337.066667-36.266667-337.066667-115.2 0-85.333333 192-108.8 251.733334-113.066667 8.533333 0 17.066667 2.133333 21.333333 8.533334 25.6 27.733333 49.066667 51.2 64 66.133333 14.933333-14.933333 38.4-38.4 64-66.133333 6.4-6.4 12.8-8.533333 21.333333-8.533334 59.733333 4.266667 251.733333 27.733333 251.733334 113.066667 0 78.933333-174.933333 115.2-337.066667 115.2z m-93.866667-172.8c-132.266667 12.8-187.733333 46.933333-189.866666 57.6 2.133333 19.2 100.266667 61.866667 283.733333 61.866667 181.333333 0 281.6-44.8 283.733333-61.866667-2.133333-12.8-57.6-46.933333-189.866666-57.6-42.666667 44.8-74.666667 76.8-74.666667 76.8-10.666667 10.666667-27.733333 10.666667-36.266667 0-2.133333-2.133333-34.133333-32-76.8-76.8z" fill="" ></path></symbol></svg>';var script=function(){var scripts=document.getElementsByTagName("script");return scripts[scripts.length-1]}();var shouldInjectCss=script.getAttribute("data-injectcss");var ready=function(fn){if(document.addEventListener){if(~["complete","loaded","interactive"].indexOf(document.readyState)){setTimeout(fn,0)}else{var loadFn=function(){document.removeEventListener("DOMContentLoaded",loadFn,false);fn()};document.addEventListener("DOMContentLoaded",loadFn,false)}}else if(document.attachEvent){IEContentLoaded(window,fn)}function IEContentLoaded(w,fn){var d=w.document,done=false,init=function(){if(!done){done=true;fn()}};var polling=function(){try{d.documentElement.doScroll("left")}catch(e){setTimeout(polling,50);return}init()};polling();d.onreadystatechange=function(){if(d.readyState=="complete"){d.onreadystatechange=null;init()}}}};var before=function(el,target){target.parentNode.insertBefore(el,target)};var prepend=function(el,target){if(target.firstChild){before(el,target.firstChild)}else{target.appendChild(el)}};function appendSvg(){var div,svg;div=document.createElement("div");div.innerHTML=svgSprite;svgSprite=null;svg=div.getElementsByTagName("svg")[0];if(svg){svg.setAttribute("aria-hidden","true");svg.style.position="absolute";svg.style.width=0;svg.style.height=0;svg.style.overflow="hidden";prepend(svg,document.body)}}if(shouldInjectCss&&!window.__iconfont__svg__cssinject__){window.__iconfont__svg__cssinject__=true;try{document.write("<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>")}catch(e){console&&console.log(e)}}ready(appendSvg)})(window)
'use strict';

angular.module('copayApp.controllers').controller('importController',
	function($scope, $rootScope, $location, $timeout, $log, storageService, fileSystemService, isCordova, isMobile) {
		
		var JSZip = require("jszip");
		var async = require('async');
		var crypto = require('crypto');
		var conf = require('intervaluecore/conf');
		var userAgent = navigator.userAgent;
		
		if(isCordova) {
			var zip = new JSZip();
		}else{
			var unzip = require('unzip' + '');
		}
		
		var self = this;
		self.importing = false;
		self.password = '';
		self.error = '';
		self.iOs = isMobile.iOS();
		self.android = isMobile.Android() && window.cordova;
		self.arrBackupFiles = [];
		self.androidVersion = isMobile.Android() ? parseFloat(userAgent.slice(userAgent.indexOf("Android")+8)) : null;
		self.oldAndroidFilePath = null;
		self.oldAndroidFileName = '';
		
		function generateListFilesForIos() {
			var backupDirPath = window.cordova.file.documentsDirectory + '/InterValue/';
			fileSystemService.readdir(backupDirPath, function(err, listFilenames) {
				if (listFilenames){
					listFilenames.forEach(function(name) {
						var dateNow = parseInt(name.split(' ')[1]);
						self.arrBackupFiles.push({
							name: name.replace(dateNow, new Date(dateNow).toLocaleString()),
							originalName: name,
							time: dateNow
						})
					});
				}
				$timeout(function() {
					$rootScope.$apply();
				});
			});
		}
		
		if (self.iOs) generateListFilesForIos();
		
		function writeDBAndFileStorageMobile(zip, cb) {
			var db = require('intervaluecore/db');
			var dbDirPath = fileSystemService.getDatabaseDirPath() + '/';
			db.close(function() {
				async.forEachOfSeries(zip.files, function(objFile, key, callback) {
					if (key == 'profile') {
						zip.file(key).async('string').then(function(data) {
							storageService.storeProfile(Profile.fromString(data), callback);
						});
					}
					else if (key == 'config') {
						zip.file(key).async('string').then(function(data) {
							storageService.storeConfig(data, callback);
						});
					}
					else if (/\.sqlite/.test(key)) {
						zip.file(key).async('nodebuffer').then(function(data) {
							fileSystemService.cordovaWriteFile(dbDirPath, null, key, data, callback);
						});
					}
					else {
						callback();
					}
				}, function(err) {
					if (err) return cb(err);
					return cb();
				});
			});
		}
		
		function writeDBAndFileStoragePC(cb) {
			var db = require('intervaluecore/db');
			var dbDirPath = fileSystemService.getDatabaseDirPath() + '/';
			db.close(function() {
				async.series([
					function(callback) {
						fileSystemService.readFile(dbDirPath + 'temp/' + 'profile', function(err, data) {
							if(err) return callback(err);
							storageService.storeProfile(Profile.fromString(data.toString()), callback)
						});
					},
					function(callback) {
						fileSystemService.readFile(dbDirPath + 'temp/' + 'config', function(err, data) {
							if(err) return callback(err);
							storageService.storeConfig(data.toString(), callback);
						});
					},
					function(callback) {
						fileSystemService.readdir(dbDirPath + 'temp/', function(err, fileNames) {
							fileNames = fileNames.filter(function(name){ return /\.sqlite/.test(name); });
							async.forEach(fileNames, function(name, callback2) {
								fileSystemService.nwMoveFile(dbDirPath + 'temp/' + name, dbDirPath + name, callback2);
							}, function(err) {
								if(err) return callback(err);
								callback();
							})
						});
					},
					function(callback) {
						var existsConfJson = fileSystemService.nwExistsSync(dbDirPath + 'temp/conf.json');
						var existsLight = fileSystemService.nwExistsSync(dbDirPath + 'temp/light');
						if(existsConfJson){
							fileSystemService.nwMoveFile(dbDirPath + 'temp/conf.json', dbDirPath + 'conf.json', callback);
						}else if(existsLight && !existsConfJson){
							fileSystemService.nwWriteFile(dbDirPath + 'conf.json', JSON.stringify({bLight: true}, null, '\t'), callback);
						}else if(!existsLight && conf.bLight){
							var _conf = require(dbDirPath + 'conf.json');
							_conf.bLight = false;
							fileSystemService.nwWriteFile(dbDirPath + 'conf.json', JSON.stringify(_conf, null, '\t'), callback);
						}else{
							callback();
						}
					},
					function(callback) {
						fileSystemService.readdir(dbDirPath + 'temp/', function(err, fileNames) {
							async.forEach(fileNames, function(name, callback2) {
								fileSystemService.nwUnlink(dbDirPath + 'temp/' + name, callback2);
							}, function(err) {
								if(err) return callback(err);
								fileSystemService.nwRmDir(dbDirPath + 'temp/', function() {
									callback();
								});
							})
						});
					}
				], function(err) {
					cb(err);
				})
			});
		}
		
		function decrypt(buffer, password) {
			password = Buffer.from(password);
			var decipher = crypto.createDecipheriv('aes-256-ctr', crypto.pbkdf2Sync(password, '', 100000, 32, 'sha512'), crypto.createHash('sha1').update(password).digest().slice(0, 16));
			var arrChunks = [];
			var CHUNK_LENGTH = 2003;
			for (var offset = 0; offset < buffer.length; offset += CHUNK_LENGTH) {
				arrChunks.push(decipher.update(buffer.slice(offset, Math.min(offset + CHUNK_LENGTH, buffer.length)), 'utf8'));
			}
			arrChunks.push(decipher.final());
			return Buffer.concat(arrChunks);
		}
		
		function showError(text) {
			self.importing = false;
			self.error = text;
			$timeout(function() {
				$rootScope.$apply();
			});
			return false;
		}
		
		function unzipAndWriteFiles(data, password) {
			if(isCordova) {
				zip.loadAsync(decrypt(data, password)).then(function(zip) {
					if (!zip.file('light')) {
						self.importing = false;
						self.error = 'Mobile version supports only light wallets.';
						$timeout(function() {
							$rootScope.$apply();
						});
					}
					else {
						writeDBAndFileStorageMobile(zip, function(err) {
							if (err) return showError(err);
							self.importing = false;
							$rootScope.$emit('Local/ShowAlert', "Import successfully completed, please restart the application.", 'fi-check', function() {
								if (navigator && navigator.app)
									navigator.app.exitApp();
								else if (process.exit)
									process.exit();
							});
						});
					}
				}, function(err) {
					showError('Incorrect password or file');
				})
			}else {
				password = Buffer.from(password);
				var decipher = crypto.createDecipheriv('aes-256-ctr', crypto.pbkdf2Sync(password, '', 100000, 32, 'sha512'), crypto.createHash('sha1').update(password).digest().slice(0, 16));
				data.pipe(decipher).pipe(unzip.Extract({ path: fileSystemService.getDatabaseDirPath() + '/temp/' })).on('error', function(err) {
					if(err.message === "Invalid signature in zip file"){
						showError('Incorrect password or file');
					}else{
						showError(err);
					}
				}).on('finish', function() {
					setTimeout(function() {
						writeDBAndFileStoragePC(function(err) {
							if (err) return showError(err);
							self.importing = false;
							$rootScope.$emit('Local/ShowAlert', "Import successfully completed, please restart the application.", 'fi-check', function() {
								if (navigator && navigator.app)
									navigator.app.exitApp();
								else if (process.exit)
									process.exit();
							});
						});
					}, 100);
				});
			}
		}
		
		self.oldAndroidInputFileClick = function() {
			if(isMobile.Android() && self.androidVersion < 5) {
				window.plugins.mfilechooser.open([], function(uri) {
					self.oldAndroidFilePath = 'file://' + uri;
					self.oldAndroidFileName = uri.split('/').pop();
					$timeout(function() {
						$rootScope.$apply();
					});
				}, function(error) {
					alert(error);
				});
			}
		};
		
		self.walletImport = function() {
			self.error = '';
			if(isMobile.Android() && self.androidVersion < 5){
				self.importing = true;
				fileSystemService.readFile(self.oldAndroidFilePath, function(err, data) {
					unzipAndWriteFiles(data, self.password);
				})
			}
			else if ($scope.file){
				self.importing = true;
				fileSystemService.readFileFromForm($scope.file, function(err, data) {
					if (err) return showError(err);
					unzipAndWriteFiles(data, self.password);
				});
			}
		};
		
		self.iosWalletImportFromFile = function(fileName) {
			$rootScope.$emit('Local/NeedsPassword', false, null, function(err, password) {
				if (password) {
					var backupDirPath = window.cordova.file.documentsDirectory + '/InterValue/';
					fileSystemService.readFile(backupDirPath + fileName, function(err, data) {
						if (err) return showError(err);
						unzipAndWriteFiles(data, password);
					})
				}
			});
		};
		
		$scope.getFile = function() {
			$timeout(function() {
				$rootScope.$apply();
			});
		};
	});
'use strict';

var async = require('async');
var constants = require('intervaluecore/constants.js');
var mutex = require('intervaluecore/mutex.js');
var eventBus = require('intervaluecore/event_bus.js');
var objectHash = require('intervaluecore/object_hash.js');
var ecdsaSig = require('intervaluecore/signature.js');
var breadcrumbs = require('intervaluecore/breadcrumbs.js');
var Bitcore = require('bitcore-lib');
var EventEmitter = require('events').EventEmitter;

angular.module('copayApp.controllers').controller('indexController', function ($rootScope, $scope, $log, $filter, $timeout, lodash, go, profileService, configService, isCordova, storageService, addressService, gettext, gettextCatalog, amMoment, nodeWebkit, addonManager, txFormatService, uxLanguage, $state, isMobile, addressbookService, notification, animationService, $modal, bwcService, backButton, pushNotificationsService) {
	breadcrumbs.add('index.js');
	var self = this;
	self.BLACKBYTES_ASSET = constants.BLACKBYTES_ASSET;
	self.isCordova = isCordova;
	self.isSafari = isMobile.Safari();
	self.onGoingProcess = {};
	self.historyShowLimit = 10;
	self.updatingTxHistory = {};
	self.bSwipeSuspended = false;
	self.arrBalances = [];
	self.assetIndex = 0;
	self.$state = $state;
	self.usePushNotifications = isCordova && !isMobile.Windows() && isMobile.Android();

	/*
    console.log("process", process.env);
    var os = require('os');
    console.log("os", os);
    //console.log("os homedir="+os.homedir());
    console.log("release="+os.release());
    console.log("hostname="+os.hostname());
    //console.log(os.userInfo());
    */


	function updatePublicKeyRing(walletClient, onDone) {
		var walletDefinedByKeys = require('intervaluecore/wallet_defined_by_keys.js');
		walletDefinedByKeys.readCosigners(walletClient.credentials.walletId, function (arrCosigners) {
			var arrApprovedDevices = arrCosigners.filter(function (cosigner) {
				return cosigner.approval_date;
			}).map(function (cosigner) {
				return cosigner.device_address;
			});
			console.log("approved devices: " + arrApprovedDevices.join(", "));
			walletClient.credentials.addPublicKeyRing(arrApprovedDevices);

			// save it to profile
			var credentialsIndex = lodash.findIndex(profileService.profile.credentials, {walletId: walletClient.credentials.walletId});
			if (credentialsIndex < 0)
				throw Error("failed to find our credentials in profile");
			profileService.profile.credentials[credentialsIndex] = JSON.parse(walletClient.export());
			console.log("saving profile: " + JSON.stringify(profileService.profile));
			storageService.storeProfile(profileService.profile, function () {
				if (onDone)
					onDone();
			});
		});
	}

	function sendBugReport(error_message, error_object) {
		var conf = require('intervaluecore/conf.js');
		var network = require('intervaluecore/network.js');
		var bug_sink_url = conf.WS_PROTOCOL + (conf.bug_sink_url || configService.getSync().hub);
		network.findOutboundPeerOrConnect(bug_sink_url, function (err, ws) {
			if (err)
				return;
			breadcrumbs.add('bugreport');
			var description = error_object.stack || JSON.stringify(error_object, null, '\t');
			if (error_object.bIgnore)
				description += "\n(ignored)";
			description += "\n\nBreadcrumbs:\n" + breadcrumbs.get().join("\n") + "\n\n";
			description += "UA: " + navigator.userAgent + "\n";
			description += "Language: " + (navigator.userLanguage || navigator.language) + "\n";
			description += "Program: " + conf.program + ' ' + conf.program_version + ' ' + (conf.bLight ? 'light' : 'full') + "\n";
			network.sendJustsaying(ws, 'bugreport', {message: error_message, exception: description});
		});
	}

	self.sendBugReport = sendBugReport;

	if (isCordova && constants.version === '1.0') {
		var db = require('intervaluecore/db.js');
		db.query("SELECT 1 FROM units WHERE version!=? LIMIT 1", [constants.version], function (rows) {
			if (rows.length > 0) {
				self.showErrorPopup("Looks like you have testnet data.  Please remove the app and reinstall.", function () {
					if (navigator && navigator.app) // android
						navigator.app.exitApp();
					// ios doesn't exit
				});
			}
		});
	}

	eventBus.on('nonfatal_error', function (error_message, error_object) {
		console.log('nonfatal error stack', error_object.stack);
		error_object.bIgnore = true;
		sendBugReport(error_message, error_object);
	});

	eventBus.on('uncaught_error', function (error_message, error_object) {
		if (error_message.indexOf('ECONNREFUSED') >= 0 || error_message.indexOf('host is unreachable') >= 0) {
			$rootScope.$emit('Local/ShowAlert', "Error connecting to TOR", 'fi-alert', function () {
				go.path('preferencesGlobal.preferencesTor');
			});
			return;
		}
		if (error_message.indexOf('ttl expired') >= 0 || error_message.indexOf('general SOCKS server failure') >= 0) // TOR error after wakeup from sleep
			return;
		console.log('stack', error_object.stack);
		sendBugReport(error_message, error_object);
		if (error_object && error_object.bIgnore)
			return;
		self.showErrorPopup(error_message, function () {
			var db = require('intervaluecore/db.js');
			db.close();
			if (self.isCordova && navigator && navigator.app) // android
				navigator.app.exitApp();
			else if (process.exit) // nwjs
				process.exit();
			// ios doesn't exit
		});
		if (isCordova) wallet.showCompleteClient();
	});

	function readLastDateString(cb) {
		var conf = require('intervaluecore/conf.js');
		if (conf.storage !== 'sqlite')
			return cb();
		var db = require('intervaluecore/db.js');
		db.query(
			"SELECT int_value FROM unit_authors JOIN data_feeds USING(unit) \n\
            WHERE address=? AND feed_name='timestamp' \n\
            ORDER BY unit_authors.rowid DESC LIMIT 1",
			[configService.TIMESTAMPER_ADDRESS],
			function (rows) {
				if (rows.length === 0)
					return cb();
				var ts = rows[0].int_value;
				cb('at ' + $filter('date')(ts, 'short'));
			}
		);
	}

	function readSyncPercent(cb) {
		var db = require('intervaluecore/db.js');
		db.query("SELECT COUNT(1) AS count_left FROM catchup_chain_balls", function (rows) {
			var count_left = rows[0].count_left;
			if (count_left === 0)
				return cb("0%");
			if (catchup_balls_at_start === -1)
				catchup_balls_at_start = count_left;
			var percent = ((catchup_balls_at_start - count_left) / catchup_balls_at_start * 100).toFixed(3);
			cb(percent + '%');
		});
	}

	function readSyncProgress(cb) {
		readLastDateString(function (strProgress) {
			strProgress ? cb(strProgress) : readSyncPercent(cb);
		});
	}

	function setSyncProgress() {
		readSyncProgress(function (strProgress) {
			self.syncProgress = strProgress;
			$timeout(function () {
				$rootScope.$apply();
			});
		});
	}

	eventBus.on('rates_updated', function () {
		$timeout(function () {
			$rootScope.$apply();
		});
	});
	eventBus.on('started_db_upgrade', function () {
		$timeout(function () {
			if (self.bUpgradingDb === undefined)
				self.bUpgradingDb = true;
			$rootScope.$apply();
		}, 100);
	});
	eventBus.on('finished_db_upgrade', function () {
		$timeout(function () {
			self.bUpgradingDb = false;
			$rootScope.$apply();
		});
	});

	var catchup_balls_at_start = -1;
	eventBus.on('catching_up_started', function () {
		self.setOngoingProcess('Syncing', true);
		setSyncProgress();
	});
	eventBus.on('catchup_next_hash_tree', function () {
		setSyncProgress();
	});
	eventBus.on('catching_up_done', function () {
		catchup_balls_at_start = -1;
		self.setOngoingProcess('Syncing', false);
		self.syncProgress = "";
	});
	eventBus.on('unhandled_private_payments_left', function (count_left) { // light only
		var bChanged = (self.count_unhandled_private_payments !== count_left);
		self.count_unhandled_private_payments = count_left;
		if (bChanged)
			self.setOngoingProcess('handling_private', count_left > 0);
	});
	eventBus.on('refresh_light_started', function () {
		console.log('refresh_light_started');
		self.setOngoingProcess('Syncing', true);
	});
	eventBus.on('refresh_light_done', function () {
		console.log('refresh_light_done');
		self.setOngoingProcess('Syncing', false);
	});

	eventBus.on("confirm_on_other_devices", function () {
		$rootScope.$emit('Local/ShowAlert', "Transaction created.\nPlease approve it on the other devices.", 'fi-key', function () {
			go.walletHome();
		});
	});

	eventBus.on("refused_to_sign", function (device_address) {
		var device = require('intervaluecore/device.js');
		device.readCorrespondent(device_address, function (correspondent) {
			notification.success(gettextCatalog.getString('Refused'), correspondent.name + " refused to sign the transaction");
		});
	});

	/*
    eventBus.on("transaction_sent", function(){
        self.updateAll();
        self.updateTxHistory();
    });*/

	eventBus.on("new_my_transactions", function () {
		breadcrumbs.add('new_my_transactions');
		self.updateAll();
		self.updateTxHistory();
	});

	eventBus.on("my_transactions_became_stable", function () {
		breadcrumbs.add('my_transactions_became_stable');
		self.updateAll();
		self.updateTxHistory();
	});

	eventBus.on("maybe_new_transactions", function () {
		breadcrumbs.add('maybe_new_transactions');
		self.updateAll();
		self.updateTxHistory();
	});

	eventBus.on("wallet_approved", function (walletId, device_address) {
		console.log("wallet_approved " + walletId + " by " + device_address);
		var client = profileService.walletClients[walletId];
		if (!client) // already deleted (maybe declined by another device) or not present yet
			return;
		var walletName = client.credentials.walletName;
		updatePublicKeyRing(client);
		var device = require('intervaluecore/device.js');
		device.readCorrespondent(device_address, function (correspondent) {
			notification.success(gettextCatalog.getString('Success'), "Wallet " + walletName + " approved by " + correspondent.name);
		});
	});

	eventBus.on("wallet_declined", function (walletId, device_address) {
		var client = profileService.walletClients[walletId];
		if (!client) // already deleted (maybe declined by another device)
			return;
		var walletName = client.credentials.walletName;
		var device = require('intervaluecore/device.js');
		device.readCorrespondent(device_address, function (correspondent) {
			notification.info(gettextCatalog.getString('Declined'), "Wallet " + walletName + " declined by " + (correspondent ? correspondent.name : 'peer'));
		});
		profileService.deleteWallet({client: client}, function (err) {
			if (err)
				console.log(err);
		});
	});

	eventBus.on("wallet_completed", function (walletId) {
		console.log("wallet_completed " + walletId);
		var client = profileService.walletClients[walletId];
		if (!client) // impossible
			return;
		var walletName = client.credentials.walletName;
		updatePublicKeyRing(client, function () {
			if (!client.isComplete())
				throw Error("not complete");
			notification.success(gettextCatalog.getString('Success'), "Wallet " + walletName + " is ready");
			$rootScope.$emit('Local/WalletCompleted');
		});
	});

	// in arrOtherCosigners, 'other' is relative to the initiator
	eventBus.on("create_new_wallet", function (walletId, arrWalletDefinitionTemplate, arrDeviceAddresses, walletName, arrOtherCosigners, isSingleAddress) {
		var device = require('intervaluecore/device.js');
		var walletDefinedByKeys = require('intervaluecore/wallet_defined_by_keys.js');
		device.readCorrespondentsByDeviceAddresses(arrDeviceAddresses, function (arrCorrespondentInfos) {
			// my own address is not included in arrCorrespondentInfos because I'm not my correspondent
			var arrNames = arrCorrespondentInfos.map(function (correspondent) {
				return correspondent.name;
			});
			var name_list = arrNames.join(", ");
			var question = gettextCatalog.getString('Create new wallet ' + walletName + ' together with ' + name_list + ' ?');
			requestApproval(question, {
				ifYes: function () {
					console.log("===== YES CLICKED")
					var createNewWallet = function () {
						walletDefinedByKeys.readNextAccount(function (account) {
							var walletClient = bwcService.getClient();
							if (!profileService.focusedClient.credentials.xPrivKey)
								throw Error("no profileService.focusedClient.credentials.xPrivKeyin createNewWallet");
							walletClient.seedFromExtendedPrivateKey(profileService.focusedClient.credentials.xPrivKey, account);
							//walletClient.seedFromMnemonic(profileService.profile.mnemonic, {account: account});
							walletDefinedByKeys.approveWallet(
								walletId, walletClient.credentials.xPubKey, account, arrWalletDefinitionTemplate, arrOtherCosigners,
								function () {
									walletClient.credentials.walletId = walletId;
									walletClient.credentials.network = 'livenet';
									var n = arrDeviceAddresses.length;
									var m = arrWalletDefinitionTemplate[1].required || n;
									walletClient.credentials.addWalletInfo(walletName, m, n);
									updatePublicKeyRing(walletClient);
									profileService._addWalletClient(walletClient, {}, function () {
										if (isSingleAddress) {
											profileService.setSingleAddressFlag(true);
										}
										console.log("switched to newly approved wallet " + walletId);
									});
								}
							);
						});
					};
					if (profileService.focusedClient.credentials.xPrivKey)
						createNewWallet();
					else
						profileService.insistUnlockFC(null, createNewWallet);
				},
				ifNo: function () {
					console.log("===== NO CLICKED")
					walletDefinedByKeys.cancelWallet(walletId, arrDeviceAddresses, arrOtherCosigners);
				}
			});
		});
	});

	// units that were already approved or rejected by user.
	// if there are more than one addresses to sign from, we won't pop up confirmation dialog for each address, instead we'll use the already obtained approval
	var assocChoicesByUnit = {};

	// objAddress is local wallet address, top_address is the address that requested the signature,
	// it may be different from objAddress if it is a shared address
	eventBus.on("signing_request", function (objAddress, top_address, objUnit, assocPrivatePayloads, from_address, signing_path) {

		function createAndSendSignature() {
			var coin = "0";
			var path = "m/44'/" + coin + "'/" + objAddress.account + "'/" + objAddress.is_change + "/" + objAddress.address_index;
			console.log("path " + path);
			// focused client might be different from the wallet this signature is for, but it doesn't matter as we have a single key for all wallets
			if (profileService.focusedClient.isPrivKeyEncrypted()) {
				console.log("priv key is encrypted, will be back after password request");
				return profileService.insistUnlockFC(null, function () {
					createAndSendSignature();
				});
			}
			var xPrivKey = new Bitcore.HDPrivateKey.fromString(profileService.focusedClient.credentials.xPrivKey);
			var privateKey = xPrivKey.derive(path).privateKey;
			console.log("priv key:", privateKey);
			//var privKeyBuf = privateKey.toBuffer();
			var privKeyBuf = privateKey.bn.toBuffer({size: 32}); // https://github.com/bitpay/bitcore-lib/issues/47
			console.log("priv key buf:", privKeyBuf);
			var buf_to_sign = objectHash.getUnitHashToSign(objUnit);
			var signature = ecdsaSig.sign(buf_to_sign, privKeyBuf);
			bbWallet.sendSignature(from_address, buf_to_sign.toString("base64"), signature, signing_path, top_address);
			console.log("sent signature " + signature);
		}

		function refuseSignature() {
			var buf_to_sign = objectHash.getUnitHashToSign(objUnit);
			bbWallet.sendSignature(from_address, buf_to_sign.toString("base64"), "[refused]", signing_path, top_address);
			console.log("refused signature");
		}

		var bbWallet = require('intervaluecore/wallet.js');
		var walletDefinedByKeys = require('intervaluecore/wallet_defined_by_keys.js');
		var unit = objUnit.unit;
		var credentials = lodash.find(profileService.profile.credentials, {walletId: objAddress.wallet});
		mutex.lock(["signing_request-" + unit], function (unlock) {

			// apply the previously obtained decision.
			// Unless the priv key is encrypted in which case the password request would have appeared from nowhere
			if (assocChoicesByUnit[unit] && !profileService.focusedClient.isPrivKeyEncrypted()) {
				if (assocChoicesByUnit[unit] === "approve")
					createAndSendSignature();
				else if (assocChoicesByUnit[unit] === "refuse")
					refuseSignature();
				return unlock();
			}

			walletDefinedByKeys.readChangeAddresses(objAddress.wallet, function (arrChangeAddressInfos) {
				var arrAuthorAddresses = objUnit.authors.map(function (author) {
					return author.address;
				});
				var arrChangeAddresses = arrChangeAddressInfos.map(function (info) {
					return info.address;
				});
				arrChangeAddresses = arrChangeAddresses.concat(arrAuthorAddresses);
				arrChangeAddresses.push(top_address);
				var arrPaymentMessages = objUnit.messages.filter(function (objMessage) {
					return (objMessage.app === "payment");
				});
				if (arrPaymentMessages.length === 0)
					throw Error("no payment message found");
				var assocAmountByAssetAndAddress = {};
				// exclude outputs paying to my change addresses
				async.eachSeries(
					arrPaymentMessages,
					function (objMessage, cb) {
						var payload = objMessage.payload;
						if (!payload)
							payload = assocPrivatePayloads[objMessage.payload_hash];
						if (!payload)
							throw Error("no inline payload and no private payload either, message=" + JSON.stringify(objMessage));
						var asset = payload.asset || "base";
						if (!payload.outputs)
							throw Error("no outputs");
						if (!assocAmountByAssetAndAddress[asset])
							assocAmountByAssetAndAddress[asset] = {};
						payload.outputs.forEach(function (output) {
							if (arrChangeAddresses.indexOf(output.address) === -1) {
								if (!assocAmountByAssetAndAddress[asset][output.address])
									assocAmountByAssetAndAddress[asset][output.address] = 0;
								assocAmountByAssetAndAddress[asset][output.address] += output.amount;
							}
						});
						cb();
					},
					function () {
						var config = configService.getSync().wallet.settings;

						var arrDestinations = [];
						for (var asset in assocAmountByAssetAndAddress) {
							var formatted_asset = isCordova ? asset : ("<span class='small'>" + asset + '</span><br/>');
							var currency = "of asset " + formatted_asset;
							var assetIndex = lodash.findIndex(self.arrBalances, {asset: asset});
							var assetInfo = self.arrBalances[assetIndex];
							if (asset === 'base')
								currency = config.unitName;
							else if (asset === constants.BLACKBYTES_ASSET)
								currency = config.bbUnitName;
							else if (assetInfo.name)
								currency = assetInfo.name;
							for (var address in assocAmountByAssetAndAddress[asset]) {
								var formatted_amount = profileService.formatAmount(assocAmountByAssetAndAddress[asset][address], asset);
								arrDestinations.push(formatted_amount + " " + currency + " to " + address);
							}
						}
						var dest = (arrDestinations.length > 0) ? arrDestinations.join(", ") : "to myself";
						var question = gettextCatalog.getString('Sign transaction spending ' + dest + ' from wallet ' + credentials.walletName + '?');
						requestApproval(question, {
							ifYes: function () {
								createAndSendSignature();
								assocChoicesByUnit[unit] = "approve";
								unlock();
							},
							ifNo: function () {
								// do nothing
								console.log("===== NO CLICKED");
								refuseSignature();
								assocChoicesByUnit[unit] = "refuse";
								unlock();
							}
						});
					}
				); // eachSeries
			});
		});
	});


	var accept_msg = gettextCatalog.getString('Yes');
	var cancel_msg = gettextCatalog.getString('No');
	var confirm_msg = gettextCatalog.getString('Confirm');

	var _modalRequestApproval = function (question, callbacks) {
		var ModalInstanceCtrl = function ($scope, $modalInstance, $sce, gettext) {
			$scope.title = $sce.trustAsHtml(question);
			$scope.yes_icon = 'fi-check';
			$scope.yes_button_class = 'primary';
			$scope.cancel_button_class = 'warning';
			$scope.cancel_label = 'No';
			$scope.loading = false;

			$scope.ok = function () {
				$scope.loading = true;
				$modalInstance.close(accept_msg);
			};
			$scope.cancel = function () {
				$modalInstance.dismiss(cancel_msg);
			};
		};

		var modalInstance = $modal.open({
			templateUrl: 'views/modals/confirmation.html',
			windowClass: animationService.modalAnimated.slideUp,
			controller: ModalInstanceCtrl
		});

		modalInstance.result.finally(function () {
			var m = angular.element(document.getElementsByClassName('reveal-modal'));
			m.addClass(animationService.modalAnimated.slideOutDown);
		});

		modalInstance.result.then(callbacks.ifYes, callbacks.ifNo);
	};

	var requestApproval = function (question, callbacks) {
		if (isCordova) {
			navigator.notification.confirm(
				question,
				function (buttonIndex) {
					if (buttonIndex == 1)
						callbacks.ifYes();
					else
						callbacks.ifNo();
				},
				confirm_msg, [accept_msg, cancel_msg]
			);
		} else {
			_modalRequestApproval(question, callbacks);
		}
	};


	self.openSubwalletModal = function () {
		$rootScope.modalOpened = true;
		var fc = profileService.focusedClient;

		var ModalInstanceCtrl = function ($scope, $modalInstance) {
			$scope.color = fc.backgroundColor;
			$scope.indexCtl = self;
			var arrSharedWallets = [];
			$scope.mainWalletBalanceInfo = self.arrMainWalletBalances[self.assetIndex];
			$scope.asset = $scope.mainWalletBalanceInfo.asset;
			var asset = $scope.asset;
			var assetInfo = self.arrBalances[self.assetIndex];
			var assocSharedByAddress = assetInfo.assocSharedByAddress;
			for (var sa in assocSharedByAddress) {
				var objSharedWallet = {};
				objSharedWallet.shared_address = sa;
				objSharedWallet.total = assocSharedByAddress[sa];
				if (asset === 'base' || asset === constants.BLACKBYTES_ASSET || $scope.mainWalletBalanceInfo.name)
					objSharedWallet.totalStr = profileService.formatAmountWithUnit(assocSharedByAddress[sa], asset);
				arrSharedWallets.push(objSharedWallet);
			}
			$scope.arrSharedWallets = arrSharedWallets;

			var walletDefinedByAddresses = require('intervaluecore/wallet_defined_by_addresses.js');
			async.eachSeries(
				arrSharedWallets,
				function (objSharedWallet, cb) {
					walletDefinedByAddresses.readSharedAddressCosigners(objSharedWallet.shared_address, function (cosigners) {
						objSharedWallet.shared_address_cosigners = cosigners.map(function (cosigner) {
							return cosigner.name;
						}).join(", ");
						objSharedWallet.creation_ts = cosigners[0].creation_ts;
						cb();
					});
				},
				function () {
					arrSharedWallets.sort(function (o1, o2) {
						return (o2.creation_ts - o1.creation_ts);
					});
					$timeout(function () {
						$scope.$apply();
					});
				}
			);

			$scope.cancel = function () {
				breadcrumbs.add('openSubwalletModal cancel');
				$modalInstance.dismiss('cancel');
			};

			$scope.selectSubwallet = function (shared_address) {
				self.shared_address = shared_address;
				if (shared_address) {
					walletDefinedByAddresses.determineIfHasMerkle(shared_address, function (bHasMerkle) {
						self.bHasMerkle = bHasMerkle;
						walletDefinedByAddresses.readSharedAddressCosigners(shared_address, function (cosigners) {
							self.shared_address_cosigners = cosigners.map(function (cosigner) {
								return cosigner.name;
							}).join(", ");
							$timeout(function () {
								$rootScope.$apply();
							});
						});
					});
				}
				else
					self.bHasMerkle = false;
				self.updateAll();
				self.updateTxHistory();
				$modalInstance.close();
			};
		};

		var modalInstance = $modal.open({
			templateUrl: 'views/modals/select-subwallet.html',
			windowClass: animationService.modalAnimated.slideUp,
			controller: ModalInstanceCtrl,
		});

		var disableCloseModal = $rootScope.$on('closeModal', function () {
			breadcrumbs.add('openSubwalletModal on closeModal');
			modalInstance.dismiss('cancel');
		});

		modalInstance.result.finally(function () {
			$rootScope.modalOpened = false;
			disableCloseModal();
			var m = angular.element(document.getElementsByClassName('reveal-modal'));
			m.addClass(animationService.modalAnimated.slideOutDown);
		});

	};


	self.goHome = function () {
		go.walletHome();
	};

	self.menu = [{
		'title': gettext('Home'),
		'icon': 'icon-home',
		'link': 'walletHome'
	}, {
		'title': gettext('Tranctions'),
		'icon': 'icon-jiaoyi',
		'link': 'send'
	}, {
		'title': gettext('Message'),
		'icon': 'icon-duihua',
		'new_state': 'correspondentDevices',
		'link': 'chat'
	},{
		'title': gettext('Wallet'),
		'icon': 'icon-qianbao1',
		'link': 'wallet'
	}];

	self.addonViews = addonManager.addonViews();
	self.menu = self.menu.concat(addonManager.addonMenuItems());
	self.menuItemSize = self.menu.length > 5 ? 2 : 3;
	self.txTemplateUrl = addonManager.txTemplateUrl() || 'views/includes/transaction.html';

	self.tab = 'walletHome';


	self.setOngoingProcess = function (processName, isOn) {
		$log.debug('onGoingProcess', processName, isOn);
		self[processName] = isOn;
		self.onGoingProcess[processName] = isOn;

		var name;
		self.anyOnGoingProcess = lodash.any(self.onGoingProcess, function (isOn, processName) {
			if (isOn)
				name = name || processName;
			return isOn;
		});
		// The first one
		self.onGoingProcessName = name;
		$timeout(function () {
			$rootScope.$apply();
		});
	};

	self.setFocusedWallet = function () {
		var fc = profileService.focusedClient;
		if (!fc) return;

		breadcrumbs.add('setFocusedWallet ' + fc.credentials.walletId);

		// Clean status
		self.totalBalanceBytes = null;
		self.lockedBalanceBytes = null;
		self.availableBalanceBytes = null;
		self.pendingAmount = null;
		self.spendUnconfirmed = null;

		self.totalBalanceStr = null;
		self.availableBalanceStr = null;
		self.lockedBalanceStr = null;

		self.arrBalances = [];
		self.assetIndex = 0;
		self.shared_address = null;
		self.bHasMerkle = false;

		self.txHistory = [];
		self.completeHistory = [];
		self.txProgress = 0;
		self.historyShowShowAll = false;
		self.balanceByAddress = null;
		self.pendingTxProposalsCountForUs = null;
		self.setSpendUnconfirmed();

		$timeout(function () {
			//$rootScope.$apply();
			self.hasProfile = true;
			self.noFocusedWallet = false;
			self.onGoingProcess = {};

			// Credentials Shortcuts
			self.m = fc.credentials.m;
			self.n = fc.credentials.n;
			self.network = fc.credentials.network;
			self.requiresMultipleSignatures = fc.credentials.m > 1;
			//self.isShared = fc.credentials.n > 1;
			self.walletName = fc.credentials.walletName;
			self.walletId = fc.credentials.walletId;
			self.isComplete = fc.isComplete();
			self.canSign = fc.canSign();
			self.isPrivKeyExternal = fc.isPrivKeyExternal();
			self.isPrivKeyEncrypted = fc.isPrivKeyEncrypted();
			self.externalSource = fc.getPrivKeyExternalSourceName();
			self.account = fc.credentials.account;

			self.txps = [];
			self.copayers = [];
			self.updateColor();
			self.updateAlias();
			self.updateSingleAddressFlag();
			self.setAddressbook();

			console.log("reading cosigners");
			var walletDefinedByKeys = require('intervaluecore/wallet_defined_by_keys.js');
			walletDefinedByKeys.readCosigners(self.walletId, function (arrCosignerInfos) {
				self.copayers = arrCosignerInfos;
				$timeout(function () {
					$rootScope.$digest();
				});
			});

			self.needsBackup = false;
			self.singleAddressWallet = false;
			self.openWallet();
			/*if (fc.isPrivKeyExternal()) {
                self.needsBackup = false;
                self.openWallet();
            } else {
                storageService.getBackupFlag('all', function(err, val) {
                  self.needsBackup = self.network == 'testnet' ? false : !val;
                  self.openWallet();
                });
            }*/
		});
	};


	self.setTab = function (tab, reset, tries, switchState) {
		console.log("setTab", tab, reset, tries, switchState);
		tries = tries || 0;

		var changeTab = function (tab) {
			if (document.querySelector('.tab-in.tab-view')) {
				var el = angular.element(document.querySelector('.tab-in.tab-view'));
				el.removeClass('tab-in').addClass('tab-out');
				var old = document.getElementById('menu-' + self.tab);
				if (old) {
					old.className = '';
				}
			}

			if (document.getElementById(tab)) {
				var el = angular.element(document.getElementById(tab));
				el.removeClass('tab-out').addClass('tab-in');
				var newe = document.getElementById('menu-' + tab);
				if (newe) {
					newe.className = 'active';
				}
			}

			$rootScope.tab = self.tab = tab;
			$rootScope.$emit('Local/TabChanged', tab);
		};

		// check if the whole menu item passed
		if (typeof tab == 'object') {
			if (!tab.new_state) backButton.clearHistory();
			if (tab.open) {
				if (tab.link) {
					$rootScope.tab = self.tab = tab.link;
				}
				tab.open();
				return;
			} else if (tab.new_state) {
				changeTab(tab.link);
				$rootScope.tab = self.tab = tab.link;
				go.path(tab.new_state);
				return;
			} else {
				return self.setTab(tab.link, reset, tries, switchState);
			}
		}
		console.log("current tab " + self.tab + ", requested to set tab " + tab + ", reset=" + reset);
		if (self.tab === tab && !reset)
			return;

		if (!document.getElementById('menu-' + tab) && ++tries < 5) {
			console.log("will retry setTab later:", tab, reset, tries, switchState);
			return $timeout(function () {
				self.setTab(tab, reset, tries, switchState);
			}, (tries === 1) ? 10 : 300);
		}

		if (!self.tab || !$state.is('walletHome'))
			$rootScope.tab = self.tab = 'walletHome';

		if (switchState && !$state.is('walletHome')) {
			go.path('walletHome', function () {
				changeTab(tab);
			});
			return;
		}

		changeTab(tab);
	};


	self.updateAll = function (opts) {
		opts = opts || {};

		var fc = profileService.focusedClient;
		if (!fc)
			return breadcrumbs.add('updateAll no fc');

		if (!fc.isComplete())
			return breadcrumbs.add('updateAll not complete yet');

		// reconnect if lost connection
		var device = require('intervaluecore/device.js');
		device.loginToHub();

		$timeout(function () {

			if (!opts.quiet)
				self.setOngoingProcess('updatingStatus', true);

			$log.debug('Updating Status:', fc.credentials.walletName);
			if (!opts.quiet)
				self.setOngoingProcess('updatingStatus', false);


			fc.getBalance(self.shared_address, function (err, assocBalances, assocSharedBalances) {
				if (err)
					throw "impossible getBal";
				$log.debug('updateAll Wallet Balance:', assocBalances, assocSharedBalances);
				self.setBalance(assocBalances, assocSharedBalances);
				// Notify external addons or plugins
				$rootScope.$emit('Local/BalanceUpdated', assocBalances);
				if (!self.isPrivKeyEncrypted)
					$rootScope.$emit('Local/BalanceUpdatedAndWalletUnlocked');
			});

			self.otherWallets = lodash.filter(profileService.getWallets(self.network), function (w) {
				return (w.id != self.walletId || self.shared_address);
			});


			//$rootScope.$apply();

			if (opts.triggerTxUpdate) {
				$timeout(function () {
					breadcrumbs.add('triggerTxUpdate');
					self.updateTxHistory();
				}, 1);
			}
		});
	};

	self.setSpendUnconfirmed = function () {
		self.spendUnconfirmed = configService.getSync().wallet.spendUnconfirmed;
	};


	self.updateBalance = function () {
		var fc = profileService.focusedClient;
		$timeout(function () {
			self.setOngoingProcess('updatingBalance', true);
			$log.debug('Updating Balance');
			fc.getBalance(self.shared_address, function (err, assocBalances, assocSharedBalances) {
				self.setOngoingProcess('updatingBalance', false);
				if (err)
					throw "impossible error from getBalance";
				$log.debug('updateBalance Wallet Balance:', assocBalances, assocSharedBalances);
				self.setBalance(assocBalances, assocSharedBalances);
			});
		});
	};


	self.openWallet = function () {
		console.log("index.openWallet called");
		var fc = profileService.focusedClient;
		breadcrumbs.add('openWallet ' + fc.credentials.walletId);
		$timeout(function () {
			//$rootScope.$apply();
			self.setOngoingProcess('openingWallet', true);
			self.updateError = false;
			fc.openWallet(function onOpenedWallet(err, walletStatus) {
				self.setOngoingProcess('openingWallet', false);
				if (err)
					throw "impossible error from openWallet";
				$log.debug('Wallet Opened');
				self.updateAll(lodash.isObject(walletStatus) ? {
					walletStatus: walletStatus
				} : null);
				//$rootScope.$apply();
			});
		});
	};


	self.processNewTxs = function (txs) {
		var config = configService.getSync().wallet.settings;
		var now = Math.floor(Date.now() / 1000);
		var ret = [];

		lodash.each(txs, function (tx) {
			tx = txFormatService.processTx(tx);

			// no future transactions...
			if (tx.time > now)
				tx.time = now;
			ret.push(tx);
		});

		return ret;
	};

	self.updateAlias = function () {
		var config = configService.getSync();
		config.aliasFor = config.aliasFor || {};
		self.alias = config.aliasFor[self.walletId];
		var fc = profileService.focusedClient;
		fc.alias = self.alias;
	};

	self.updateColor = function () {
		var config = configService.getSync();
		config.colorFor = config.colorFor || {};
		self.backgroundColor = config.colorFor[self.walletId] || '#4A90E2';
		var fc = profileService.focusedClient;
		fc.backgroundColor = self.backgroundColor;
	};

	self.updateSingleAddressFlag = function () {
		var config = configService.getSync();
		config.isSingleAddress = config.isSingleAddress || {};
		self.isSingleAddress = config.isSingleAddress[self.walletId];
		var fc = profileService.focusedClient;
		fc.isSingleAddress = self.isSingleAddress;
	};

	self.setBalance = function (assocBalances, assocSharedBalances) {
		if (!assocBalances) return;
		var config = configService.getSync().wallet.settings;

		// Selected unit
		self.unitValue = config.unitValue;
		self.unitName = config.unitName;
		self.bbUnitName = config.bbUnitName;

		self.arrBalances = [];
		for (var asset in assocBalances) {
			var balanceInfo = assocBalances[asset];
			balanceInfo.asset = asset;
			balanceInfo.total = balanceInfo.stable + balanceInfo.pending;
			if (assocSharedBalances[asset]) {
				balanceInfo.shared = 0;
				balanceInfo.assocSharedByAddress = {};
				for (var sa in assocSharedBalances[asset]) {
					var total_on_shared_address = (assocSharedBalances[asset][sa].stable || 0) + (assocSharedBalances[asset][sa].pending || 0);
					balanceInfo.shared += total_on_shared_address;
					balanceInfo.assocSharedByAddress[sa] = total_on_shared_address;
				}
			}
			if (balanceInfo.name)
				profileService.assetMetadata[asset] = {decimals: balanceInfo.decimals, name: balanceInfo.name};
			if (asset === "base" || asset == self.BLACKBYTES_ASSET || balanceInfo.name) {
				balanceInfo.totalStr = profileService.formatAmountWithUnit(balanceInfo.total, asset);
				balanceInfo.totalStrWithoutUnit = profileService.formatAmount(balanceInfo.total, asset);
				balanceInfo.stableStr = profileService.formatAmountWithUnit(balanceInfo.stable, asset);
				balanceInfo.pendingStr = profileService.formatAmountWithUnitIfShort(balanceInfo.pending, asset);
				if (typeof balanceInfo.shared === 'number')
					balanceInfo.sharedStr = profileService.formatAmountWithUnitIfShort(balanceInfo.shared, asset);
				if (!balanceInfo.name) {
					if (asset === "base")
						balanceInfo.name = self.unitName;
					else if (asset === self.BLACKBYTES_ASSET)
						balanceInfo.name = self.bbUnitName;
				}
			}
			self.arrBalances.push(balanceInfo);
		}
		self.assetIndex = self.assetIndex || 0;
		if (!self.arrBalances[self.assetIndex]) // if no such index in the subwallet, reset to bytes
			self.assetIndex = 0;
		if (!self.shared_address)
			self.arrMainWalletBalances = self.arrBalances;
		if (isCordova) wallet.showCompleteClient();
		console.log('========= setBalance done, balances: ' + JSON.stringify(self.arrBalances));
		breadcrumbs.add('setBalance done, balances: ' + JSON.stringify(self.arrBalances));

		/*
      // SAT
      if (self.spendUnconfirmed) {
        self.totalBalanceBytes = balance.totalAmount;
        self.lockedBalanceBytes = balance.lockedAmount || 0;
        self.availableBalanceBytes = balance.availableAmount || 0;
        self.pendingAmount = null;
      } else {
        self.totalBalanceBytes = balance.totalConfirmedAmount;
        self.lockedBalanceBytes = balance.lockedConfirmedAmount || 0;
        self.availableBalanceBytes = balance.availableConfirmedAmount || 0;
        self.pendingAmount = balance.totalAmount - balance.totalConfirmedAmount;
      }

      //STR
      self.totalBalanceStr = profileService.formatAmount(self.totalBalanceBytes) + ' ' + self.unitName;
      self.lockedBalanceStr = profileService.formatAmount(self.lockedBalanceBytes) + ' ' + self.unitName;
      self.availableBalanceStr = profileService.formatAmount(self.availableBalanceBytes) + ' ' + self.unitName;

      if (self.pendingAmount) {
        self.pendingAmountStr = profileService.formatAmount(self.pendingAmount) + ' ' + self.unitName;
      } else {
        self.pendingAmountStr = null;
      }
        */
		$timeout(function () {
			$rootScope.$apply();
		});
	};


	this.csvHistory = function () {

		function saveFile(name, data) {
			var chooser = document.querySelector(name);
			chooser.addEventListener("change", function (evt) {
				var fs = require('fs');
				fs.writeFile(this.value, data, function (err) {
					if (err) {
						$log.debug(err);
					}
				});
			}, false);
			chooser.click();
		}

		function formatDate(date) {
			var dateObj = new Date(date);
			if (!dateObj) {
				$log.debug('Error formating a date');
				return 'DateError'
			}
			if (!dateObj.toJSON()) {
				return '';
			}

			return dateObj.toJSON();
		}

		function formatString(str) {
			if (!str) return '';

			if (str.indexOf('"') !== -1) {
				//replace all
				str = str.replace(new RegExp('"', 'g'), '\'');
			}

			//escaping commas
			str = '\"' + str + '\"';

			return str;
		}

		var step = 6;
		var unique = {};


		if (isCordova) {
			$log.info('CSV generation not available in mobile');
			return;
		}
		var isNode = nodeWebkit.isDefined();
		var fc = profileService.focusedClient;
		var c = fc.credentials;
		if (!fc.isComplete()) return;
		var self = this;
		var allTxs = [];

		$log.debug('Generating CSV from History');
		self.setOngoingProcess('generatingCSV', true);

		$timeout(function () {
			fc.getTxHistory(self.arrBalances[self.assetIndex].asset, self.shared_address, function (txs) {
				self.setOngoingProcess('generatingCSV', false);
				$log.debug('Wallet Transaction History:', txs);

				var data = txs;
				var filename = 'InterValue-' + (self.alias || self.walletName) + '.csv';
				var csvContent = '';

				if (!isNode) csvContent = 'data:text/csv;charset=utf-8,';
				csvContent += 'Date,Destination,Note,Amount,Currency,Spot Value,Total Value,Tax Type,Category\n';

				var _amount, _note;
				var dataString;
				data.forEach(function (it, index) {
					var amount = it.amount;

					if (it.action == 'moved')
						amount = 0;

					_amount = (it.action == 'sent' ? '-' : '') + amount;
					_note = formatString((it.message ? it.message : '') + ' unit: ' + it.unit);

					if (it.action == 'moved')
						_note += ' Moved:' + it.amount

					dataString = formatDate(it.time * 1000) + ',' + formatString(it.addressTo) + ',' + _note + ',' + _amount/10000000000000000 + ',INVE,,,,';
					csvContent += dataString + "\n";

				});

				if (isNode) {
					saveFile('#export_file', csvContent);
				} else {
					var encodedUri = encodeURI(csvContent);
					var link = document.createElement("a");
					link.setAttribute("href", encodedUri);
					link.setAttribute("download", filename);
					link.click();
				}
				$timeout(function () {
					$rootScope.$apply();
				});
			});
		});
	};


	self.updateLocalTxHistory = function (client, cb) {
		var walletId = client.credentials.walletId;
		if (self.arrBalances.length === 0)
			return console.log('updateLocalTxHistory: no balances yet');
		breadcrumbs.add('index: ' + self.assetIndex + '; balances: ' + JSON.stringify(self.arrBalances));
		if (!client.isComplete())
			return console.log('fc incomplete yet');
		client.getTxHistory(self.arrBalances[self.assetIndex].asset, self.shared_address, function onGotTxHistory(txs) {
			var newHistory = self.processNewTxs(txs);
			$log.debug('Tx History synced. Total Txs: ' + newHistory.length);

			if (walletId == profileService.focusedClient.credentials.walletId) {
				self.completeHistory = newHistory;
				self.txHistory = newHistory.slice(0, self.historyShowLimit);
				self.historyShowShowAll = newHistory.length >= self.historyShowLimit;
			}

			return cb();
		});
	}

	self.showAllHistory = function () {
		self.historyShowShowAll = false;
		self.historyRendering = true;
		$timeout(function () {
			$rootScope.$apply();
			$timeout(function () {
				self.historyRendering = false;
				self.txHistory = self.completeHistory;
			}, 100);
		}, 100);
	};


	self.updateHistory = function () {
		var fc = profileService.focusedClient;
		var walletId = fc.credentials.walletId;

		if (!fc.isComplete() || self.arrBalances.length === 0 || self.updatingTxHistory[walletId]) return;

		$log.debug('Updating Transaction History');
		self.txHistoryError = false;
		self.updatingTxHistory[walletId] = true;

		$timeout(function onUpdateHistoryTimeout() {
			self.updateLocalTxHistory(fc, function (err) {
				self.updatingTxHistory[walletId] = false;
				if (err)
					self.txHistoryError = true;
				$timeout(function () {
					$rootScope.$apply();
				});
			});
		});
	};

	self.updateTxHistory = lodash.debounce(function () {
		self.updateHistory();
	}, 1000);

//  self.throttledUpdateHistory = lodash.throttle(function() {
//    self.updateHistory();
//  }, 5000);

//    self.onMouseDown = function(){
//        console.log('== mousedown');
//        self.oldAssetIndex = self.assetIndex;
//    };

	self.onClick = function () {
		console.log('== click');
		self.oldAssetIndex = self.assetIndex;
	};

	// for light clients only
	self.updateHistoryFromNetwork = lodash.throttle(function () {
		setTimeout(function () {
			if (self.assetIndex !== self.oldAssetIndex) // it was a swipe
				return console.log("== swipe");
			console.log('== updateHistoryFromNetwork');
			var lightWallet = require('intervaluecore/light_wallet.js');
			lightWallet.refreshLightClientHistory();
		}, 500);
	}, 5000);

	self.showPopup = function (msg, msg_icon, cb) {
		$log.warn('Showing ' + msg_icon + ' popup:' + msg);
		self.showAlert = {
			msg: msg.toString(),
			msg_icon: msg_icon,
			close: function (err) {
				self.showAlert = null;
				if (cb) return cb(err);
			},
		};
		$timeout(function () {
			$rootScope.$apply();
		});
	};

	self.showErrorPopup = function (msg, cb) {
		$log.warn('Showing err popup:' + msg);
		self.showPopup(msg, 'fi-alert', cb);
	};

	self.recreate = function (cb) {
		var fc = profileService.focusedClient;
		self.setOngoingProcess('recreating', true);
		fc.recreateWallet(function (err) {
			self.setOngoingProcess('recreating', false);

			if (err)
				throw "impossible err from recreateWallet";

			profileService.setWalletClients();
			$timeout(function () {
				$rootScope.$emit('Local/WalletImported', self.walletId);
			}, 100);
		});
	};

	self.openMenu = function () {
		backButton.menuOpened = true;
		go.swipe(true);
	};

	self.closeMenu = function () {
		backButton.menuOpened = false;
		go.swipe();
	};

	self.swipeRight = function () {
		if (!self.bSwipeSuspended)
			self.openMenu();
		else
			console.log('ignoring swipe');
	};

	self.suspendSwipe = function () {
		if (self.arrBalances.length <= 1)
			return;
		self.bSwipeSuspended = true;
		console.log('suspending swipe');
		$timeout(function () {
			self.bSwipeSuspended = false;
			console.log('resuming swipe');
		}, 100);
	};

	self.retryScan = function () {
		var self = this;
		self.startScan(self.walletId);
	}

	self.startScan = function (walletId) {
		$log.debug('Scanning wallet ' + walletId);
		var c = profileService.walletClients[walletId];
		if (!c.isComplete()) return;
		/*
      if (self.walletId == walletId)
        self.setOngoingProcess('scanning', true);

      c.startScan({
        includeCopayerBranches: true,
      }, function(err) {
        if (err && self.walletId == walletId) {
          self.setOngoingProcess('scanning', false);
          self.handleError(err);
          $rootScope.$apply();
        }
      });
        */
	};

	self.setUxLanguage = function () {
		var userLang = uxLanguage.update();
		self.defaultLanguageIsoCode = userLang;
		self.defaultLanguageName = uxLanguage.getName(userLang);
	};


	self.setAddressbook = function (ab) {
		if (ab) {
			self.addressbook = ab;
			return;
		}

		addressbookService.list(function (err, ab) {
			if (err) {
				$log.error('Error getting the addressbook');
				return;
			}
			self.addressbook = ab;
		});
	};


	function getNumberOfSelectedSigners() {
		var count = 1; // self
		self.copayers.forEach(function (copayer) {
			if (copayer.signs)
				count++;
		});
		return count;
	}

	self.isEnoughSignersSelected = function () {
		if (self.m === self.n)
			return true;
		return (getNumberOfSelectedSigners() >= self.m);
	};

	self.getWallets = function () {
		return profileService.getWallets('livenet');
	};


	$rootScope.$on('Local/ClearHistory', function (event) {
		$log.debug('The wallet transaction history has been deleted');
		self.txHistory = self.completeHistory = [];
		self.updateHistory();
	});

	$rootScope.$on('Local/AddressbookUpdated', function (event, ab) {
		self.setAddressbook(ab);
	});

	// UX event handlers
	$rootScope.$on('Local/ColorUpdated', function (event) {
		self.updateColor();
		$timeout(function () {
			$rootScope.$apply();
		});
	});

	$rootScope.$on('Local/AliasUpdated', function (event) {
		self.updateAlias();
		$timeout(function () {
			$rootScope.$apply();
		});
	});

	$rootScope.$on('Local/SingleAddressFlagUpdated', function (event) {
		self.updateSingleAddressFlag();
		$timeout(function () {
			$rootScope.$apply();
		});
	});

	$rootScope.$on('Local/SpendUnconfirmedUpdated', function (event) {
		self.setSpendUnconfirmed();
		self.updateAll();
	});

	$rootScope.$on('Local/ProfileBound', function () {
	});

	$rootScope.$on('Local/NewFocusedWallet', function () {
		self.setUxLanguage();
	});

	$rootScope.$on('Local/LanguageSettingUpdated', function () {
		self.setUxLanguage();
	});

	$rootScope.$on('Local/UnitSettingUpdated', function (event) {
		breadcrumbs.add('UnitSettingUpdated');
		self.updateAll();
		self.updateTxHistory();
	});

	$rootScope.$on('Local/NeedFreshHistory', function (event) {
		breadcrumbs.add('NeedFreshHistory');
		self.updateHistory();
	});


	$rootScope.$on('Local/WalletCompleted', function (event) {
		self.setFocusedWallet();
		go.walletHome();
	});

//  self.debouncedUpdate = lodash.throttle(function() {
//    self.updateAll({
//      quiet: true
//    });
//    self.updateTxHistory();
//  }, 4000, {
//    leading: false,
//    trailing: true
//  });

	$rootScope.$on('Local/Resume', function (event) {
		$log.debug('### Resume event');
		var lightWallet = require('intervaluecore/light_wallet.js');
		lightWallet.refreshLightClientHistory();
		//self.debouncedUpdate();
	});

	$rootScope.$on('Local/BackupDone', function (event) {
		self.needsBackup = false;
		$log.debug('Backup done');
		storageService.setBackupFlag('all', function (err) {
			if (err)
				return $log.warn("setBackupFlag failed: " + JSON.stringify(err));
			$log.debug('Backup done stored');
		});
	});

	$rootScope.$on('Local/DeviceError', function (event, err) {
		self.showErrorPopup(err, function () {
			if (self.isCordova && navigator && navigator.app) {
				navigator.app.exitApp();
			}
		});
	});


	$rootScope.$on('Local/WalletImported', function (event, walletId) {
		self.needsBackup = false;
		storageService.setBackupFlag(walletId, function () {
			$log.debug('Backup done stored');
			addressService.expireAddress(walletId, function (err) {
				$timeout(function () {
					self.txHistory = self.completeHistory = [];
					self.startScan(walletId);
				}, 500);
			});
		});
	});

	$rootScope.$on('NewIncomingTx', function () {
		self.updateAll({
			walletStatus: null,
			untilItChanges: true,
			triggerTxUpdate: true,
		});
	});


	$rootScope.$on('NewOutgoingTx', function () {
		breadcrumbs.add('NewOutgoingTx');
		self.updateAll({
			walletStatus: null,
			untilItChanges: true,
			triggerTxUpdate: true,
		});
	});

	lodash.each(['NewTxProposal', 'TxProposalFinallyRejected', 'TxProposalRemoved', 'NewOutgoingTxByThirdParty',
		'Local/NewTxProposal', 'Local/TxProposalAction'
	], function (eventName) {
		$rootScope.$on(eventName, function (event, untilItChanges) {
			self.updateAll({
				walletStatus: null,
				untilItChanges: untilItChanges,
				triggerTxUpdate: true,
			});
		});
	});

	$rootScope.$on('ScanFinished', function () {
		$log.debug('Scan Finished. Updating history');
		self.updateAll({
			walletStatus: null,
			triggerTxUpdate: true,
		});
	});


	$rootScope.$on('Local/NoWallets', function (event) {
		$timeout(function () {
			self.hasProfile = true;
			self.noFocusedWallet = true;
			self.isComplete = null;
			self.walletName = null;
			go.path('preferencesGlobal.import');
		});
	});

	$rootScope.$on('Local/NewFocusedWallet', function () {
		console.log('on Local/NewFocusedWallet');
		self.setFocusedWallet();
		//self.updateTxHistory();
		go.walletHome();
	});

	$rootScope.$on('Local/SetTab', function (event, tab, reset, swtichToHome) {
		console.log("SetTab " + tab + ", reset " + reset);
		self.setTab(tab, reset, null, swtichToHome);
	});

	$rootScope.$on('Local/RequestTouchid', function (event, cb) {
		window.plugins.touchid.verifyFingerprint(
			gettextCatalog.getString('Scan your fingerprint please'),
			function (msg) {
				// OK
				return cb();
			},
			function (msg) {
				// ERROR
				return cb(gettext('Invalid Touch ID'));
			}
		);
	});

	$rootScope.$on('Local/ShowAlert', function (event, msg, msg_icon, cb) {
		self.showPopup(msg, msg_icon, cb);
	});

	$rootScope.$on('Local/ShowErrorAlert', function (event, msg, cb) {
		self.showErrorPopup(msg, cb);
	});

	$rootScope.$on('Local/NeedsPassword', function (event, isSetup, error_message, cb) {
		console.log('NeedsPassword');
		self.askPassword = {
			isSetup: isSetup,
			error: error_message,
			callback: function (err, pass) {
				self.askPassword = null;
				return cb(err, pass);
			},
		};
		$timeout(function () {
			$rootScope.$apply();
		});
	});

	lodash.each(['NewCopayer', 'CopayerUpdated'], function (eventName) {
		$rootScope.$on(eventName, function () {
			// Re try to open wallet (will triggers)
			self.setFocusedWallet();
		});
	});

	$rootScope.$on('Local/NewEncryptionSetting', function () {
		var fc = profileService.focusedClient;
		self.isPrivKeyEncrypted = fc.isPrivKeyEncrypted();
		$timeout(function () {
			$rootScope.$apply();
		});
	});

	$rootScope.$on('Local/pushNotificationsReady', function () {
		self.usePushNotifications = true;
		$timeout(function () {
			$rootScope.$apply();
		});
	});
});

'use strict';

var eventBus = require('intervaluecore/event_bus.js');

angular.module('copayApp.controllers').controller('inviteCorrespondentDeviceController',
  function($scope, $timeout, profileService, go, isCordova, correspondentListService, gettextCatalog) {
    
    var self = this;
    
    function onPaired(peer_address){
        correspondentListService.setCurrentCorrespondent(peer_address, function(bAnotherCorrespondent){
            go.path('correspondentDevices.correspondentDevice');
        });
    }
    
    var conf = require('intervaluecore/conf.js');
    $scope.protocol = conf.program;
    $scope.isCordova = isCordova;
    var fc = profileService.focusedClient;
    $scope.color = fc.backgroundColor;
    

    $scope.$on('qrcode:error', function(event, error){
        console.log(error);
    });
    
    $scope.copyCode = function() {
        console.log("copyCode");
        //$scope.$digest();
        if (isCordova) {
            window.cordova.plugins.clipboard.copy($scope.code);
            window.plugins.toast.showShortCenter(gettextCatalog.getString('Copied to clipboard'));
        }
    };

    $scope.onTextClick = function ($event) {
        console.log("onTextClick");
        $event.target.select();
    };
    
    $scope.error = null;
    correspondentListService.startWaitingForPairing(function(pairingInfo){
        console.log("beginAddCorrespondent " + pairingInfo.pairing_secret);
        $scope.code = pairingInfo.device_pubkey + "@" + pairingInfo.hub + "#" + pairingInfo.pairing_secret;

        function determineQRcodeVersionFromString( inputtext ) {
            // maximum characters per QR code version using ECC level m
            // source: http://www.qrcode.com/en/about/version.html
            var maxCharsforQRVersion = [0,14,26,42,62,84,106,122,152,180,213];
            var qrversion = 5;
            // find lowest version number that has enough space for our text
            for (var i = (maxCharsforQRVersion.length-1); i > 0 ; i--) {
                if ( maxCharsforQRVersion[i] >= inputtext.length)
                {
                    qrversion = i;
                }
            }

            return qrversion;
        }

        var qrstring = $scope.protocol + ":" +$scope.code;  //as passed to the qr generator in inviteCorrespondentDevice.html
        $scope.qr_version = determineQRcodeVersionFromString( qrstring );

        $scope.$digest();
        //$timeout(function(){$scope.$digest();}, 100);
        var eventName = 'paired_by_secret-'+pairingInfo.pairing_secret;
        eventBus.once(eventName, onPaired);
        $scope.$on('$destroy', function() {
            console.log("removing listener for pairing by our secret");
            eventBus.removeListener(eventName, onPaired);
        });
    });

    $scope.cancelAddCorrespondent = function() {
        go.path('correspondentDevices');
    };



  });

'use strict';

angular.module('copayApp.controllers').controller('newVersionIsAvailable', function($scope, $modalInstance, go, newVersion){

  $scope.version = newVersion.version;
	
  $scope.openDownloadLink = function(){
    var link = '';
    if (navigator && navigator.app) {
      link = 'https://play.google.com/store/apps/details?id=org.intervalue.wallet';
	  if (newVersion.version.match('t$'))
		  link += '.testnet';
    }
    else {
      link = 'https://github.com/intervalue-hashnet/intervalue/releases/tag/v' + newVersion.version;
    }
    go.openExternalLink(link);
    $modalInstance.close('closed result');
  };

  $scope.later = function(){
    $modalInstance.close('closed result');
  };
});

/*

This should be rewritten!
- accept the private key
- derive its address
- find all outputs to this address (requires full node or light/get_history)
- spend them to one of my own addresses

*/

angular.module('copayApp.controllers').controller('paperWalletController',
  function($scope, $http, $timeout, $log, configService, profileService, go, addressService, txStatus, bitcore) {
    self = this;
    var fc = profileService.focusedClient;
    var rawTx;

    self.onQrCodeScanned = function(data) {
      $scope.inputData = data;
      self.onData(data);
    }

    self.onData = function(data) {
      self.error = '';
      self.scannedKey = data;
      self.isPkEncrypted = (data.charAt(0) == '6');
    }

    self._scanFunds = function(cb) {
      function getPrivateKey(scannedKey, isPkEncrypted, passphrase, cb) {
        if (!isPkEncrypted) return cb(null, scannedKey);
        fc.decryptBIP38PrivateKey(scannedKey, passphrase, null, cb);
      };

      function getBalance(privateKey, cb) {
        fc.getBalanceFromPrivateKey(privateKey, cb);
      };

      function checkPrivateKey(privateKey) {
        try {
          new bitcore.PrivateKey(privateKey, 'livenet');
        } catch (err) {
          return false;
        }
        return true;
      }

      getPrivateKey(self.scannedKey, self.isPkEncrypted, $scope.passphrase, function(err, privateKey) {
        if (err) return cb(err);
        if (!checkPrivateKey(privateKey)) return cb(new Error('Invalid private key'));

        getBalance(privateKey, function(err, balance) {
          if (err) return cb(err);
          return cb(null, privateKey, balance);
        });
      });
    }

    self.scanFunds = function() {
	  self.error = 'Unimplemented';
	  return;
		
      self.scanning = true;
      self.privateKey = '';
      self.balanceBytes = 0;
      self.error = '';

      $timeout(function() {
        self._scanFunds(function(err, privateKey, balance) {
          self.scanning = false;
          if (err) {
            $log.error(err);
            self.error = err.message || err.toString();
          } else {
            self.privateKey = privateKey;
            self.balanceBytes = balance;
            var config = configService.getSync().wallet.settings;
            self.balance = profileService.formatAmount(balance) + ' ' + config.unitName;
          }

          $scope.$apply();
        });
      }, 100);
    }

    self._sweepWallet = function(cb) {
      addressService.getAddress(fc.credentials.walletId, true, function(err, destinationAddress) {
        if (err) return cb(err);

        fc.buildTxFromPrivateKey(self.privateKey, destinationAddress, null, function(err, tx) {
          if (err) return cb(err);

          fc.broadcastRawTx({
            rawTx: tx.serialize(),
            network: 'livenet'
          }, function(err, txid) {
            if (err) return cb(err);
            return cb(null, destinationAddress, txid);
          });
        });
      });
    };

    self.sweepWallet = function() {
      self.sending = true;
      self.error = '';

      $timeout(function() {
        self._sweepWallet(function(err, destinationAddress, txid) {
          self.sending = false;

          if (err) {
            self.error = err.message || err.toString();
            $log.error(err);
          } else {
            txStatus.notify({
              status: 'broadcasted'
            }, function() {
              go.walletHome();
            });
          }

          $scope.$apply();
        });
      }, 100);
    }
  });

'use strict';

angular.module('copayApp.controllers').controller('passwordController',
  function($rootScope, $scope, $timeout, profileService, notification, go, gettext) {

    var self = this;

    var pass1;

    self.isVerification = false;
	
	var fc = profileService.focusedClient;
	self.bHasMnemonic = (fc.credentials && fc.credentials.mnemonic);

    document.getElementById("passwordInput").focus();

    self.close = function(cb) {
      return cb(gettext('No password given'));
    };

    self.set = function(isSetup, cb) {
      self.error = false;

      if (isSetup && !self.isVerification) {
        document.getElementById("passwordInput").focus();
        self.isVerification = true;
        pass1 = self.password;
        self.password = null;
        $timeout(function() {
          $rootScope.$apply();
        })
        return;
      }
      if (isSetup) {
        if (pass1 != self.password) {
          self.error = gettext('Passwords do not match');
          self.isVerification = false;
          self.password = null;
          pass1 = null;

          return;
        }
      }
      return cb(null, self.password);
    };

  });
'use strict';
angular.module('copayApp.controllers').controller('paymentUriController',
  function($rootScope, $stateParams, $location, $timeout, profileService, configService, lodash, bitcore, go) {

    function strip(number) {
      return (parseFloat(number.toPrecision(12)));
    };

    // Build bitcoinURI with querystring
    this.checkBitcoinUri = function() {
      var query = [];
      angular.forEach($location.search(), function(value, key) {
        query.push(key + "=" + value);
      });
      var queryString = query ? query.join("&") : null;
      this.bitcoinURI = $stateParams.data + (queryString ? '?' + queryString : '');

      var URI = bitcore.URI;
      var isUriValid = URI.isValid(this.bitcoinURI);
      if (!URI.isValid(this.bitcoinURI)) {
        this.error = true;
        return;
      }
      var uri = new URI(this.bitcoinURI);

      if (uri && uri.address) {
        var config = configService.getSync().wallet.settings;
        var unitValue = config.unitValue;
        var unitName = config.unitName;

        if (uri.amount) {
          uri.amount = strip(uri.amount / unitValue) + ' ' + unitName;
        }
        uri.network = uri.address.network.name;
        this.uri = uri;
      }
    };

    this.getWallets = function(network) {
      return profileService.getWallets(network);
    };

    this.selectWallet = function(wid) {
      var self = this;
      if (wid != profileService.focusedClient.credentials.walletId) {
        profileService.setAndStoreFocus(wid, function() {});
      }
      go.send();
      $timeout(function() {
        $rootScope.$emit('paymentUri', self.bitcoinURI);
      }, 100);
    };
  });

'use strict';

angular.module('copayApp.controllers')
	.controller('preferencesController',
		function($scope, $rootScope, $filter, $timeout, $modal, $log, lodash, configService, profileService, uxLanguage, $q) {

			this.init = function() {
				var config = configService.getSync();
				this.unitName = config.wallet.settings.unitName;
				this.currentLanguageName = uxLanguage.getCurrentLanguageName();
				$scope.spendUnconfirmed = config.wallet.spendUnconfirmed;
				var fc = profileService.focusedClient;
				if (!fc)
					return;
				
				if (window.touchidAvailable) {
					var walletId = fc.credentials.walletId;
					this.touchidAvailable = true;
					config.touchIdFor = config.touchIdFor || {};
					$scope.touchid = config.touchIdFor[walletId];
				}
				
				//$scope.encrypt = fc.hasPrivKeyEncrypted();
				this.externalSource = null;

				$scope.numCosigners = fc.credentials.n;
				var walletDefinedByKeys = require('intervaluecore/wallet_defined_by_keys.js');
				var db = require('intervaluecore/db.js');
				walletDefinedByKeys.readAddresses(fc.credentials.walletId, {}, function(addresses) {
					$scope.numAddresses = addresses.length;
					db.query(
						"SELECT 1 FROM private_profiles WHERE address=? UNION SELECT 1 FROM attestations WHERE address=?", 
						[addresses[0], addresses[0]], 
						function(rows){
							$scope.bHasAttestations = (rows.length > 0);
							$scope.bEditable = ($scope.numAddresses === 1 && $scope.numCosigners === 1 && !$scope.bHasAttestations);
							$timeout(function(){
								$rootScope.$apply();
							});
						}
					);
				});
				// TODO externalAccount
				//this.externalIndex = fc.getExternalIndex();
			};
	
			var unwatchSpendUnconfirmed = $scope.$watch('spendUnconfirmed', function(newVal, oldVal) {
				if (newVal == oldVal) return;
				var opts = {
					wallet: {
						spendUnconfirmed: newVal
					}
				};
				configService.set(opts, function(err) {
					$rootScope.$emit('Local/SpendUnconfirmedUpdated');
					if (err) $log.debug(err);
				});
			});

			var unwatchRequestTouchid = $scope.$watch('touchid', function(newVal, oldVal) {
				if (newVal == oldVal || $scope.touchidError) {
					$scope.touchidError = false;
					return;
				}
				var walletId = profileService.focusedClient.credentials.walletId;

				var opts = {
					touchIdFor: {}
				};
				opts.touchIdFor[walletId] = newVal;

				$rootScope.$emit('Local/RequestTouchid', function(err) {
					if (err) {
						$log.debug(err);
						$timeout(function() {
							$scope.touchidError = true;
							$scope.touchid = oldVal;
						}, 100);
					}
					else {
						configService.set(opts, function(err) {
							if (err) {
								$log.debug(err);
								$scope.touchidError = true;
								$scope.touchid = oldVal;
							}
						});
					}
				});
			});

			$scope.$on('$destroy', function() {
				unwatchSpendUnconfirmed();
				unwatchRequestTouchid();
			});

			$scope.$watch('index.isSingleAddress', function(newValue, oldValue) {
				if (oldValue == newValue) return;
				profileService.setSingleAddressFlag(newValue);
			});
		});
'use strict';

angular.module('copayApp.controllers').controller('preferencesAbout',
  function() {});

'use strict';

angular.module('copayApp.controllers').controller('preferencesAdvancedController',
  function($scope) {

  });
'use strict';

// 别名设置控制器
angular.module('copayApp.controllers').controller('preferencesAliasController',
    function ($scope, $timeout, configService, profileService, go) {
        var config = configService.getSync();
        var fc = profileService.focusedClient;
        var walletId = fc.credentials.walletId;

        var config = configService.getSync();
        config.aliasFor = config.aliasFor || {};
        this.alias = config.aliasFor[walletId] || fc.credentials.walletName;

        // 保存设置
        this.save = function () {
            var self = this;
            var opts = {
                aliasFor: {}
            };
            opts.aliasFor[walletId] = self.alias;

            configService.set(opts, function (err) {
                if (err) {
                    $scope.$emit('Local/DeviceError', err);
                    return;
                }
                $scope.$emit('Local/AliasUpdated');
                $timeout(function () {
                    go.path('preferences');
                }, 50);
            });

        };
    });

'use strict';

angular.module('copayApp.controllers').controller('preferencesBbUnitController',
  function($rootScope, $scope, $log, configService, go) {
    var config = configService.getSync();
    this.bbUnitName = config.wallet.settings.bbUnitName;
    this.unitOpts = [
      // TODO : add Satoshis to bitcore-wallet-client formatAmount()
      // {
      //     name: 'Satoshis (100,000,000 satoshis = 1BTC)',
      //     shortName: 'SAT',
      //     value: 1,
      //     decimals: 0,
      //     code: 'sat',
      //   }, 
      /*{
        name: 'bits (1,000,000 bits = 1BTC)',
        shortName: 'bits',
        value: 100,
        decimals: 2,
        code: 'bit',
      }*/
      // TODO : add mBTC to bitcore-wallet-client formatAmount()
      // ,{
      //   name: 'mBTC (1,000 mBTC = 1BTC)',
      //   shortName: 'mBTC',
      //   value: 100000,
      //   decimals: 5,
      //   code: 'mbtc',
      // }
      /*, {
        name: 'BTC',
        shortName: 'BTC',
        value: 100000000,
        decimals: 8,
        code: 'btc',
      }
      , */{
        name: 'blackbytes',
        shortName: 'blackbytes',
        value: 1,
        decimals: 0,
        code: 'one'
      }
      , {
        name: 'kBlackBytes (1,000 blackbytes)',
        shortName: 'kBB',
        value: 1000,
        decimals: 3,
        code: 'kilo'
      }
      , {
        name: 'MBlackBytes (1,000,000 blackbytes)',
        shortName: 'MBB',
        value: 1000000,
        decimals: 6,
        code: 'mega'
      }
      , {
        name: 'GBlackBytes (1,000,000,000 blackbytes)',
        shortName: 'GBB',
        value: 1000000000,
        decimals: 9,
        code: 'giga'
      }
    ];

    this.save = function(newUnit) {
      var opts = {
        wallet: {
          settings: {
            bbUnitName: newUnit.shortName,
            bbUnitValue: newUnit.value,
	          bbUnitDecimals: newUnit.decimals,
            bbUnitCode: newUnit.code
          }
        }
      };
      this.unitName = newUnit.shortName;

      configService.set(opts, function(err) {
        if (err) $log.warn(err);
        $scope.$emit('Local/UnitSettingUpdated');
        go.preferencesGlobal();
      });

    };
    
    go.onBackButton = function(){
        console.log('units backbutton');
    };
    //console.log('topbar: '+$scope.topbar);
  });

'use strict';

// 钱包颜色设置控制器
angular.module('copayApp.controllers').controller('preferencesColorController',
    function ($scope, configService, profileService, go) {
        var config = configService.getSync();
        this.colorOpts = configService.colorOpts;

        var fc = profileService.focusedClient;
        var walletId = fc.credentials.walletId;

        var config = configService.getSync();
        config.colorFor = config.colorFor || {};
        this.color = config.colorFor[walletId] || '#7A8C9E';   // 默认灰色

        // 保存颜色设置
        this.save = function (color) {
            var self = this;
            var opts = {
                colorFor: {}
            };
            opts.colorFor[walletId] = color || this.color;

            configService.set(opts, function (err) {
                if (err) {
                    $scope.$emit('Local/DeviceError', err);
                    return;
                }
                self.color = color;
                $scope.$emit('Local/ColorUpdated');
            });

        };
    });

'use strict';

angular.module('copayApp.controllers').controller('preferencesDeleteWalletController',
  function($scope, $rootScope, $filter, $timeout, $modal, $log, storageService, notification, profileService, isCordova, go, gettext, gettextCatalog, animationService) {
    this.isCordova = isCordova;
    this.error = null;

    var delete_msg = gettextCatalog.getString('Are you sure you want to delete this wallet?');
    var accept_msg = gettextCatalog.getString('Accept');
    var cancel_msg = gettextCatalog.getString('Cancel');
    var confirm_msg = gettextCatalog.getString('Confirm');

    var _modalDeleteWallet = function() {
      var ModalInstanceCtrl = function($scope, $modalInstance, $sce, gettext) {
        $scope.title = $sce.trustAsHtml(delete_msg);
        $scope.loading = false;

        $scope.ok = function() {
          $scope.loading = true;
          $modalInstance.close(accept_msg);

        };
        $scope.cancel = function() {
          $modalInstance.dismiss(cancel_msg);
        };
      };

      var modalInstance = $modal.open({
        templateUrl: 'views/modals/confirmation.html',
        windowClass: animationService.modalAnimated.slideUp,
        controller: ModalInstanceCtrl
      });

      modalInstance.result.finally(function() {
        var m = angular.element(document.getElementsByClassName('reveal-modal'));
        m.addClass(animationService.modalAnimated.slideOutDown);
      });

      modalInstance.result.then(function(ok) {
        if (ok) {
          _deleteWallet();
        }
      });
    };

    var _deleteWallet = function() {
      var fc = profileService.focusedClient;
      var name = fc.credentials.walletName;
      var walletName = (fc.alias || '') + ' [' + name + ']';
      var self = this;

      profileService.deleteWallet({}, function(err) {
        if (err) {
          self.error = err.message || err;
        } else {
          notification.success(gettextCatalog.getString('Success'), gettextCatalog.getString('The wallet "{{walletName}}" was deleted', {
            walletName: walletName
          }));
        }
      });
    };

    this.deleteWallet = function() {
	  if (profileService.profile.credentials.length === 1 || profileService.getWallets().length === 1)
		  return $rootScope.$emit('Local/ShowErrorAlert', "Can't delete the last remaining wallet");
      if (isCordova) {
        navigator.notification.confirm(
          delete_msg,
          function(buttonIndex) {
            if (buttonIndex == 1) {
              _deleteWallet();
            }
          },
          confirm_msg, [accept_msg, cancel_msg]
        );
      } else {
        _modalDeleteWallet();
      }
    };
  });

'use strict';

// 设备名设置控制类
angular.module('copayApp.controllers').controller('preferencesDeviceNameController',
    function ($scope, $timeout, configService, go) {
        var config = configService.getSync();
        this.deviceName = config.deviceName;

        this.save = function () {
            var self = this;
            var device = require('intervaluecore/device.js');
            device.setDeviceName(self.deviceName);
            var opts = {deviceName: self.deviceName};

            configService.set(opts, function (err) {
                if (err) {
                    $scope.$emit('Local/DeviceError', err);
                    return;
                }
                $timeout(function () {
                    go.path('preferencesGlobal');
                }, 50);
            });

        };
    });

'use strict';

angular.module('copayApp.controllers').controller('preferencesEditWitnessController',
  function($scope, $timeout, go, witnessListService) {
    
    var self = this;
    this.witness = witnessListService.currentWitness;

    this.save = function() {
        var new_address = this.witness.trim();
        if (new_address === witnessListService.currentWitness)
            return goBack();
		var myWitnesses = require('intervaluecore/my_witnesses.js');
        myWitnesses.replaceWitness(witnessListService.currentWitness, new_address, function(err){
            console.log(err);
            if (err)
                return setError(err);
            goBack();
        });
    };
    
    function setError(error){
        self.error = error;
        $timeout(function(){
            $scope.$apply();
        }, 100);
    }

    function goBack(){
        go.path('preferencesGlobal.preferencesWitnesses');
    }
  });

'use strict';

angular.module('copayApp.controllers').controller('preferencesEmailController',
  function($scope, go, profileService, gettext, $log) {
    this.save = function(form) {
      var self = this;
      this.error = null;

      var fc = profileService.focusedClient;
      this.saving = true;
      $scope.$emit('Local/EmailSettingUpdated', self.email, function() {
        self.saving = false;
        go.path('preferencesGlobal');
      });
    };
  });

'use strict';

// ȫ������ģ��
angular.module('copayApp.controllers').controller('preferencesGlobalController',
    function ($scope, $rootScope, $log, configService, uxLanguage, pushNotificationsService, profileService) {

        var conf = require('intervaluecore/conf.js');

        $scope.encrypt = !!profileService.profile.xPrivKeyEncrypted;

        this.init = function () {
            var config = configService.getSync();
            this.unitName = config.wallet.settings.unitName;
            this.bbUnitName = config.wallet.settings.bbUnitName;
            this.deviceName = config.deviceName;
            this.myDeviceAddress = require('intervaluecore/device.js').getMyDeviceAddress();
            this.hub = config.hub;
            this.currentLanguageName = uxLanguage.getCurrentLanguageName();
            this.torEnabled = conf.socksHost && conf.socksPort;
            $scope.pushNotifications = config.pushNotifications.enabled;
        };

        var unwatchPushNotifications = $scope.$watch('pushNotifications', function (newVal, oldVal) {
            if (newVal == oldVal) return;
            var opts = {
                pushNotifications: {
                    enabled: newVal
                }
            };
            configService.set(opts, function (err) {
                if (opts.pushNotifications.enabled)
                    pushNotificationsService.pushNotificationsInit();
                else
                    pushNotificationsService.pushNotificationsUnregister();
                if (err) $log.debug(err);
            });
        });

        var unwatchEncrypt = $scope.$watch('encrypt', function (val) {
            var fc = profileService.focusedClient;
            if (!fc) return;

            if (val && !fc.hasPrivKeyEncrypted()) {
                $rootScope.$emit('Local/NeedsPassword', true, null, function (err, password) {
                    if (err || !password) {
                        $scope.encrypt = false;
                        return;
                    }
                    profileService.setPrivateKeyEncryptionFC(password, function () {
                        $rootScope.$emit('Local/NewEncryptionSetting');
                        $scope.encrypt = true;
                    });
                });
            } else {
                if (!val && fc.hasPrivKeyEncrypted()) {
                    profileService.unlockFC(null, function (err) {
                        if (err) {
                            $scope.encrypt = true;
                            return;
                        }
                        profileService.disablePrivateKeyEncryptionFC(function (err) {
                            $rootScope.$emit('Local/NewEncryptionSetting');
                            if (err) {
                                $scope.encrypt = true;
                                $log.error(err);
                                return;
                            }
                            $scope.encrypt = false;
                        });
                    });
                }
            }
        });

        $scope.$on('$destroy', function () {
            unwatchPushNotifications();
            unwatchEncrypt();
        });
    });

'use strict';
//Hub设置
angular.module('copayApp.controllers').controller('preferencesHubController',
    function ($scope, $timeout, configService, go, autoUpdatingWitnessesList) {
        var config = configService.getSync();
        var initHubEdit = false;
        this.hub = config.hub || 'inve07.hashproject.net';     // 默认Hub设置，刘星修改

        this.currentAutoUpdWitnessesList = autoUpdatingWitnessesList.autoUpdate;
        $scope.autoUpdWitnessesList = autoUpdatingWitnessesList.autoUpdate;

        // 保存Hub设置
        this.save = function () {
            var self = this;
            var device = require('intervaluecore/device.js');
            var lightWallet = require('intervaluecore/light_wallet.js');
            self.hub = self.hub.replace(/^wss?:\/\//i, '').replace(/^https?:\/\//i, '');
            device.setDeviceHub(self.hub);
            lightWallet.setLightVendorHost(self.hub);
            var opts = {hub: self.hub};

            configService.set(opts, function (err) {
                if (err) {
                    $scope.$emit('Local/DeviceError', err);
                    return;
                }
                $timeout(function () {
                    go.path('preferencesGlobal');
                }, 50);
            });
            if (this.currentAutoUpdWitnessesList != $scope.autoUpdWitnessesList) {
                autoUpdatingWitnessesList.setAutoUpdate($scope.autoUpdWitnessesList);
            }
        };

        var unwatchEditHub = $scope.$watch(angular.bind(this, function () {
            return this.hub;
        }), function () {
            if (initHubEdit) {
                $scope.autoUpdWitnessesList = false;
            }
            else {
                initHubEdit = true;
            }
        });

        $scope.$on('$destroy', function () {
            unwatchEditHub();
        });
    });

'use strict';

// 钱包信息设置控制器
angular.module('copayApp.controllers').controller('preferencesInformation',
    function ($scope, $log, $timeout, isMobile, gettextCatalog, lodash, profileService, storageService, go, configService) {
        var constants = require('intervaluecore/constants.js');
        var fc = profileService.focusedClient;
        var c = fc.credentials;

        this.init = function () {
            var basePath = c.getBaseAddressDerivationPath();
            var config = configService.getSync().wallet.settings;

            $scope.walletName = c.walletName;
            $scope.walletId = c.walletId;
            $scope.network = c.network;
            $scope.derivationStrategy = c.derivationStrategy || 'BIP44';
            $scope.basePath = basePath;
            $scope.M = c.m;
            $scope.N = c.n;
            $scope.addrs = null;

            fc.getAddresses({
                doNotVerify: true
            }, function (err, addrs) {
                if (err) {
                    $log.warn(err);
                    return;
                }
                ;
                /*var last10 = [],
                  i = 0,
                  e = addrs.pop();
                while (i++ < 10 && e) {
                  e.path = e.path;
                  last10.push(e);
                  e = addrs.pop();
                }
                $scope.addrs = last10;*/
                $scope.addrs = addrs;
                $timeout(function () {
                    $scope.$apply();
                });

            });

            fc.getListOfBalancesOnAddresses(function (listOfBalances) {
                listOfBalances = listOfBalances.map(function (row) {
                    row.amount = profileService.formatAmountWithUnit(row.amount, row.asset, {dontRound: true});
                    return row;
                });
                //groupBy address
                var assocListOfBalances = {};
                listOfBalances.forEach(function (row) {
                    if (assocListOfBalances[row.address] === undefined) assocListOfBalances[row.address] = [];
                    assocListOfBalances[row.address].push(row);
                });
                $scope.assocListOfBalances = assocListOfBalances;
                $timeout(function () {
                    $scope.$apply();
                });
            });
        };

        $scope.hasListOfBalances = function () {
            return !!Object.keys($scope.assocListOfBalances || {}).length;
        };

        this.sendAddrs = function () {
            var self = this;

            if (isMobile.Android() || isMobile.Windows()) {
                window.ignoreMobilePause = true;
            }

            self.loading = true;

            function formatDate(ts) {
                var dateObj = new Date(ts * 1000);
                if (!dateObj) {
                    $log.debug('Error formating a date');
                    return 'DateError';
                }
                if (!dateObj.toJSON()) {
                    return '';
                }
                return dateObj.toJSON();
            };

            $timeout(function () {
                fc.getAddresses({
                    doNotVerify: true
                }, function (err, addrs) {
                    self.loading = false;
                    if (err) {
                        $log.warn(err);
                        return;
                    }
                    ;

                    var body = 'INVE Wallet "' + $scope.walletName + '" Addresses.\n\n';
                    body += "\n";
                    body += addrs.map(function (v) {
                        return ('* ' + v.address + ' ' + v.path + ' ' + formatDate(v.createdOn));
                    }).join("\n");

                    window.plugins.socialsharing.shareViaEmail(
                        body,
                        'INVE Addresses',
                        null, // TO: must be null or an array
                        null, // CC: must be null or an array
                        null, // BCC: must be null or an array
                        null, // FILES: can be null, a string, or an array
                        function () {
                        },
                        function () {
                        }
                    );

                    $timeout(function () {
                        $scope.$apply();
                    }, 1000);
                });
            }, 100);
        };

        this.clearTransactionHistory = function () {
            $scope.$emit('Local/ClearHistory');

            $timeout(function () {
                go.walletHome();
            }, 100);
        }
    });

'use strict';

//语言设置控制器
angular.module('copayApp.controllers').controller('preferencesLanguageController',
    function ($scope, $log, $timeout, configService, go, uxLanguage) {
        this.availableLanguages = uxLanguage.getLanguages();

        // 保存语言设置
        this.save = function (newLang) {
            var opts = {
                wallet: {
                    settings: {
                        defaultLanguage: newLang
                    }
                }
            };

            configService.set(opts, function (err) {
                if (err) $log.warn(err);
                $scope.$emit('Local/LanguageSettingUpdated');
                $timeout(function () {
                    go.preferencesGlobal();
                }, 100);
            });
        };
    });

'use strict';

angular.module('copayApp.controllers').controller('preferencesLogs',
function(historicLog) {
  this.logs = historicLog.get();

  this.sendLogs = function() {
    var body = 'InterValue Session Logs\n Be careful, this could contain sensitive private data\n\n';
    body += '\n\n';
    body += this.logs.map(function(v) {
      return v.msg;
    }).join('\n');

    window.plugins.socialsharing.shareViaEmail(
      body,
      'InterValue Logs',
      null, // TO: must be null or an array
      null, // CC: must be null or an array
      null, // BCC: must be null or an array
      null, // FILES: can be null, a string, or an array
      function() {},
      function() {}
    );
  };
});

'use strict';

// Tor匿名设置控制器
angular.module('copayApp.controllers').controller('preferencesTorController',
    function ($scope, $log, $timeout, go, configService) {

        var conf = require('intervaluecore/conf.js');
        var network = require('intervaluecore/network.js');

        var bInitialized = false;

        var root = {};
        root.socksHost = null;
        root.socksPort = null;
        root.socksLocalDNS = false;

        $scope.errorHostInput = '';
        $scope.errorPortInput = '';

        $scope.torEnabled = conf.socksHost && conf.socksPort;
        configService.get(function (err, confService) {
            $scope.socksHost = conf.socksHost || confService.socksHost || '127.0.0.1';
            $scope.socksPort = conf.socksPort || confService.socksPort || '9150';
        });

        function setConfAndCloseConnections() {
            conf.socksHost = root.socksHost;
            conf.socksPort = root.socksPort;
            conf.socksLocalDNS = root.socksLocalDNS;
            network.closeAllWsConnections();
        }

        function saveConfToFile(cb) {
            var fs = require('fs' + '');
            var desktopApp = require('intervaluecore/desktop_app.js');
            var appDataDir = desktopApp.getAppDataDir();
            var confJson;
            try {
                confJson = require(appDataDir + '/conf.json');
            } catch (e) {
                confJson = {};
            }
            confJson.socksHost = root.socksHost;
            confJson.socksPort = root.socksPort;
            confJson.socksLocalDNS = root.socksLocalDNS;
            fs.writeFile(appDataDir + '/conf.json', JSON.stringify(confJson, null, '\t'), 'utf8', function (err) {
                if (err) {
                    $scope.$emit('Local/DeviceError', err);
                    return;
                }
                cb();
            });
        }


        $scope.save = function (close, oldVal) {
            $scope.socksHost = (!$scope.socksHost) ? '127.0.0.1' : $scope.socksHost;
            $scope.socksPort = (!$scope.socksPort) ? 9150 : parseInt($scope.socksPort);
            if (!$scope.socksPort || !($scope.socksPort > 0 && $scope.socksPort <= 65535)) {
                $scope.errorPortInput = 'Port is invalid';
                if (!close && !oldVal) $scope.torEnabled = false;
                return;
            }
            $scope.errorPortInput = '';
            root.socksHost = $scope.torEnabled ? $scope.socksHost : null;
            root.socksPort = $scope.torEnabled ? $scope.socksPort : null;
            setConfAndCloseConnections();
            saveConfToFile(function () {
                configService.set({
                    socksHost: $scope.socksHost,
                    socksPort: $scope.socksPort
                }, function (err) {
                    if (err) {
                        $scope.$emit('Local/DeviceError', err);
                        return;
                    }
                    if (close) {
                        $timeout(function () {
                            go.path('preferencesGlobal');
                        }, 50);
                    }
                });
            });
        };


        var unwatchTorEnabled = $scope.$watch('torEnabled', function (newVal, oldVal) {
            if (!bInitialized) {
                bInitialized = true;
                return;
            }
            $scope.save(false, oldVal);
        });

        $scope.$on('$destroy', function () {
            unwatchTorEnabled();
        });

    });

'use strict';

// 单元设置控制器
angular.module('copayApp.controllers').controller('preferencesUnitController',
    function ($rootScope, $scope, $log, configService, go) {
        var config = configService.getSync();
        //单元名称
        this.unitName = config.wallet.settings.unitName;
        //单元选项列表
        this.unitOpts = [
            {
                name: 'bytes',
                shortName: 'atom',
                value: 1,
                decimals: 0,
                code: 'one',
            }
            , {
                name: 'kBytes (1,000 bytes)',
                shortName: 'kA',
                value: 1000,
                decimals: 3,
                code: 'kilo',
            }
            , {
                name: 'MBytes (1,000,000 bytes)',
                shortName: 'MA',
                value: 1000000,
                decimals: 6,
                code: 'mega',
            }
            , {
                name: 'GBytes (1,000,000,000 bytes)',
                shortName: 'GA',
                value: 1000000000,
                decimals: 9,
                code: 'giga',
            }
			, {
				name: 'TBytes (1,000,000,000,000 bytes)',
				shortName: 'TA',
				value: 1000000000000,
				decimals: 12,
				code: 'tera',
			}
			, {
				name: 'PBytes (1,000,000,000,000,000 bytes)',
				shortName: 'PA',
				value: 1000000000000000,
				decimals: 15,
				code: 'peta ',
			}
			, {
				name: 'EBytes (1,000,000,000,000,000,000 bytes)',
				shortName: 'INVE',
				value: 1000000000000000000,
				decimals: 18,
				code: 'exa',
			}
        ];

        this.unitName = this.unitOpts[7].unitName;  // 设置默认单元，刘星修改

        //保存单元设置
        this.save = function (newUnit) {
            newUnit = this.unitOpts[7];             // 设置默认单元，刘星修改
            var opts = {
                wallet: {
                    settings: {
                        unitName: newUnit.shortName,
                        unitValue: newUnit.value,
                        unitDecimals: newUnit.decimals,
                        unitCode: newUnit.code,
                    }
                }
            };
            this.unitName = newUnit.shortName;

            configService.set(opts, function (err) {
                if (err) $log.warn(err);
                $scope.$emit('Local/UnitSettingUpdated');
                go.preferencesGlobal();
            });

        };

        go.onBackButton = function () {
            console.log('units backbutton');
        };
        //console.log('topbar: '+$scope.topbar);
    });

'use strict';

angular.module('copayApp.controllers').controller('preferencesWitnessesController',
  function($scope, go, witnessListService, autoUpdatingWitnessesList, $timeout){
    var self = this;
    this.witnesses = [];
    console.log('preferencesWitnessesController');

    $scope.autoUpdWitnessesList = autoUpdatingWitnessesList.autoUpdate;

    var myWitnesses = require('intervaluecore/my_witnesses.js');
    myWitnesses.readMyWitnesses(function(arrWitnesses){
        self.witnesses = arrWitnesses;
	    $timeout(function(){
		    $scope.$apply();
	    });
        console.log('preferencesWitnessesController set witnesses '+arrWitnesses);
    }, 'wait');

    this.edit = function(witness) {
      if ($scope.autoUpdWitnessesList) return;

      witnessListService.currentWitness = witness;
      go.path('preferencesGlobal.preferencesWitnesses.preferencesEditWitness');
    };


    var unwatchAutoUpdWitnessesList = $scope.$watch('autoUpdWitnessesList', function(val){
      autoUpdatingWitnessesList.setAutoUpdate(val);

      if (val) {
        autoUpdatingWitnessesList.checkChangeWitnesses();
      }
    });

    $scope.$on('$destroy', function(){
      unwatchAutoUpdWitnessesList();
    });
  });

'use strict';

angular.module('copayApp.controllers').controller('recoveryFromSeed',
	function ($rootScope, $scope, $log, $timeout, profileService) {

		var async = require('async');
		var conf = require('intervaluecore/conf.js');
		var wallet_defined_by_keys = require('intervaluecore/wallet_defined_by_keys.js');
		var objectHash = require('intervaluecore/object_hash.js');
		try{
			var ecdsa = require('secp256k1');
		}
		catch(e){
			var ecdsa = require('intervaluecore/node_modules/secp256k1' + '');
		}
		var Mnemonic = require('bitcore-mnemonic');
		var Bitcore = require('bitcore-lib');
		var db = require('intervaluecore/db.js');
		var network = require('intervaluecore/network');
		var myWitnesses = require('intervaluecore/my_witnesses');

		var self = this;

		self.error = '';
		self.bLight = conf.bLight;
		self.scanning = false;
		self.inputMnemonic = '';
		self.xPrivKey = '';
		self.assocIndexesToWallets = {};

		function determineIfAddressUsed(address, cb) {
			db.query("SELECT 1 FROM outputs WHERE address = ? LIMIT 1", [address], function(outputsRows) {
				if (outputsRows.length === 1)
					cb(true);
				else {
					db.query("SELECT 1 FROM unit_authors WHERE address = ? LIMIT 1", [address], function(unitAuthorsRows) {
						cb(unitAuthorsRows.length === 1);
					});
				}
			});
		}

		function scanForAddressesAndWallets(mnemonic, cb) {
			self.xPrivKey = new Mnemonic(mnemonic).toHDPrivateKey();
			var xPubKey;
			var lastUsedAddressIndex = -1;
			var lastUsedWalletIndex = -1;
			var currentAddressIndex = 0;
			var currentWalletIndex = 0;
			var assocMaxAddressIndexes = {};

			function checkAndAddCurrentAddress(is_change) {
				var address = objectHash.getChash160(["sig", {"pubkey": wallet_defined_by_keys.derivePubkey(xPubKey, 'm/' + is_change + '/' + currentAddressIndex)}]);
				determineIfAddressUsed(address, function(bUsed) {
					if (bUsed) {
						lastUsedAddressIndex = currentAddressIndex;
						if (!assocMaxAddressIndexes[currentWalletIndex]) assocMaxAddressIndexes[currentWalletIndex] = {main: 0};
						if (is_change) {
							assocMaxAddressIndexes[currentWalletIndex].change = currentAddressIndex;
						} else {
							assocMaxAddressIndexes[currentWalletIndex].main = currentAddressIndex;
						}
						currentAddressIndex++;
						checkAndAddCurrentAddress(is_change);
					} else {
						currentAddressIndex++;
						if (currentAddressIndex - lastUsedAddressIndex >= 20) {
							if (is_change) {
								if (lastUsedAddressIndex !== -1) {
									lastUsedWalletIndex = currentWalletIndex;
								}
								if (currentWalletIndex - lastUsedWalletIndex >= 20) {
									cb(assocMaxAddressIndexes);
								} else {
									currentWalletIndex++;
									setCurrentWallet();
								}
							} else {
								currentAddressIndex = 0;
								checkAndAddCurrentAddress(1);
							}
						} else {
							checkAndAddCurrentAddress(is_change);
						}
					}
				})
			}

			function setCurrentWallet() {
				xPubKey = Bitcore.HDPublicKey(self.xPrivKey.derive("m/44'/0'/" + currentWalletIndex + "'"));
				lastUsedAddressIndex = -1;
				currentAddressIndex = 0;
				checkAndAddCurrentAddress(0);
			}

			setCurrentWallet();
		}

		function removeAddressesAndWallets(cb) {
			var arrQueries = [];
			db.addQuery(arrQueries, "DELETE FROM pending_shared_address_signing_paths");
			db.addQuery(arrQueries, "DELETE FROM shared_address_signing_paths");
			db.addQuery(arrQueries, "DELETE FROM pending_shared_addresses");
			db.addQuery(arrQueries, "DELETE FROM shared_addresses");
			db.addQuery(arrQueries, "DELETE FROM my_addresses");
			db.addQuery(arrQueries, "DELETE FROM wallet_signing_paths");
			db.addQuery(arrQueries, "DELETE FROM extended_pubkeys");
			db.addQuery(arrQueries, "DELETE FROM wallets");
			db.addQuery(arrQueries, "DELETE FROM correspondent_devices");

			async.series(arrQueries, cb);
		}

		function createAddresses(assocMaxAddressIndexes, cb) {
			var accounts = Object.keys(assocMaxAddressIndexes);
			var currentAccount = 0;

			function addAddress(wallet, is_change, index, maxIndex) {
				wallet_defined_by_keys.issueAddress(wallet, is_change, index, function(addressInfo) {
					index++;
					if (index <= maxIndex) {
						addAddress(wallet, is_change, index, maxIndex);
					} else {
						if (is_change) {
							currentAccount++;
							(currentAccount < accounts.length) ? startAddToNewWallet(0) : cb();
						} else {
							startAddToNewWallet(1);
						}
					}
				});
			}

			function startAddToNewWallet(is_change) {
				if (is_change) {
					if (assocMaxAddressIndexes[accounts[currentAccount]].change !== undefined) {
						addAddress(self.assocIndexesToWallets[accounts[currentAccount]], 1, 0, assocMaxAddressIndexes[accounts[currentAccount]].change);
					} else {
						currentAccount++;
						(currentAccount < accounts.length) ? startAddToNewWallet(0) : cb();
					}
				} else {
					addAddress(self.assocIndexesToWallets[accounts[currentAccount]], 0, 0, assocMaxAddressIndexes[accounts[currentAccount]].main + 20);
				}
			}


			startAddToNewWallet(0);
		}

		function createWallets(arrWalletIndexes, cb) {

			function createWallet(n) {
				var account = parseInt(arrWalletIndexes[n]);
				var opts = {};
				opts.m = 1;
				opts.n = 1;
				opts.name = 'Wallet #' + account;
				opts.network = 'livenet';
				opts.cosigners = [];
				opts.extendedPrivateKey = self.xPrivKey;
				opts.mnemonic = self.inputMnemonic;
				opts.account = account;

				profileService.createWallet(opts, function(err, walletId) {
					self.assocIndexesToWallets[account] = walletId;
					n++;
					(n < arrWalletIndexes.length) ? createWallet(n) : cb();
				});
			}

			createWallet(0);
		}

		function scanForAddressesAndWalletsInLightClient(mnemonic, cb) {
			self.xPrivKey = new Mnemonic(mnemonic).toHDPrivateKey();
			var xPubKey;
			var currentWalletIndex = 0;
			var lastUsedWalletIndex = -1;
			var assocMaxAddressIndexes = {};

			function checkAndAddCurrentAddresses(is_change) {
				if (!assocMaxAddressIndexes[currentWalletIndex]) assocMaxAddressIndexes[currentWalletIndex] = {
					main: 0,
					change: 0
				};
				var arrTmpAddresses = [];
				for (var i = 0; i < 20; i++) {
					var index = (is_change ? assocMaxAddressIndexes[currentWalletIndex].change : assocMaxAddressIndexes[currentWalletIndex].main) + i;
					arrTmpAddresses.push(objectHash.getChash160(["sig", {"pubkey": wallet_defined_by_keys.derivePubkey(xPubKey, 'm/' + is_change + '/' + index)}]));
				}
				myWitnesses.readMyWitnesses(function (arrWitnesses) {
					network.requestFromLightVendor('light/get_history', {
						addresses: arrTmpAddresses,
						witnesses: arrWitnesses
					}, function (ws, request, response) {
						if(response && response.error){
							var breadcrumbs = require('intervaluecore/breadcrumbs.js');
							breadcrumbs.add('Error scanForAddressesAndWalletsInLightClient: ' + response.error);
							self.error = 'When scanning an error occurred, please try again later.';
							self.scanning = false;
							$timeout(function () {
								$rootScope.$apply();
							});
							return;
						}
						if (Object.keys(response).length) {
							lastUsedWalletIndex = currentWalletIndex;
							if (is_change) {
								assocMaxAddressIndexes[currentWalletIndex].change += 20;
							} else {
								assocMaxAddressIndexes[currentWalletIndex].main += 20;
							}
							checkAndAddCurrentAddresses(is_change);
						} else {
							if (is_change) {
								if(assocMaxAddressIndexes[currentWalletIndex].change === 0 && assocMaxAddressIndexes[currentWalletIndex].main === 0) delete assocMaxAddressIndexes[currentWalletIndex];
								currentWalletIndex++;
								if(currentWalletIndex - lastUsedWalletIndex > 3){
									cb(assocMaxAddressIndexes);
								}else{
									setCurrentWallet();
								}
							} else {
								checkAndAddCurrentAddresses(1);
							}
						}
					});
				});
			}

			function setCurrentWallet() {
				xPubKey = Bitcore.HDPublicKey(self.xPrivKey.derive("m/44'/0'/" + currentWalletIndex + "'"));
				checkAndAddCurrentAddresses(0);
			}

			setCurrentWallet();
		}

		function cleanAndAddWalletsAndAddresses(assocMaxAddressIndexes) {
			var device = require('intervaluecore/device');
			var arrWalletIndexes = Object.keys(assocMaxAddressIndexes);
			if (arrWalletIndexes.length) {
				removeAddressesAndWallets(function () {
					var myDeviceAddress = objectHash.getDeviceAddress(ecdsa.publicKeyCreate(self.xPrivKey.derive("m/1'").privateKey.bn.toBuffer({size: 32}), true).toString('base64'));
					profileService.replaceProfile(self.xPrivKey.toString(), self.inputMnemonic, myDeviceAddress, function () {
						device.setDevicePrivateKey(self.xPrivKey.derive("m/1'").privateKey.bn.toBuffer({size: 32}));
						createWallets(arrWalletIndexes, function () {
							createAddresses(assocMaxAddressIndexes, function () {
								self.scanning = false;
								$rootScope.$emit('Local/ShowAlert', arrWalletIndexes.length + " wallets recovered, please restart the application to finish.", 'fi-check', function () {
									if (navigator && navigator.app) // android
										navigator.app.exitApp();
									else if (process.exit) // nwjs
										process.exit();
								});
							});
						});
					});
				});
			} else {
				self.error = 'No active addresses found.';
				self.scanning = false;
				$timeout(function () {
					$rootScope.$apply();
				});
			}
		}

		self.recoveryForm = function() {
			if (self.inputMnemonic) {
				self.error = '';
				self.inputMnemonic = self.inputMnemonic.toLowerCase();
				if ((self.inputMnemonic.split(' ').length % 3 === 0) && Mnemonic.isValid(self.inputMnemonic)) {
					self.scanning = true;
					if (self.bLight) {
						scanForAddressesAndWalletsInLightClient(self.inputMnemonic, cleanAndAddWalletsAndAddresses);
					} else {
						scanForAddressesAndWallets(self.inputMnemonic, cleanAndAddWalletsAndAddresses);
					}
				} else {
					self.error = 'Seed is not valid';
				}
			}
		}

	});

'use strict';

angular.module('copayApp.controllers').controller('sidebarController',
  function($rootScope, $timeout, lodash, profileService, configService, go, isMobile, isCordova, backButton) {
    var self = this;
    self.isWindowsPhoneApp = isMobile.Windows() && isCordova;
    self.walletSelection = false;

    // wallet list change
    $rootScope.$on('Local/WalletListUpdated', function(event) {
      self.walletSelection = false;
      self.setWallets();
    });

    $rootScope.$on('Local/ColorUpdated', function(event) {
      self.setWallets();
    });

    $rootScope.$on('Local/AliasUpdated', function(event) {
      self.setWallets();
    });


    self.signout = function() {
      profileService.signout();
    };

    self.switchWallet = function(selectedWalletId, currentWalletId) {
    	backButton.menuOpened = false;
      if (selectedWalletId == currentWalletId) return;
      self.walletSelection = false;
      profileService.setAndStoreFocus(selectedWalletId, function() {
      });
    };

    self.toggleWalletSelection = function() {
      self.walletSelection = !self.walletSelection;
      if (!self.walletSelection) return;
      self.setWallets();
    };

    self.setWallets = function() {
      if (!profileService.profile) return;
      var config = configService.getSync();
      config.colorFor = config.colorFor || {};
      config.aliasFor = config.aliasFor || {};
      var ret = lodash.map(profileService.profile.credentials, function(c) {
        return {
          m: c.m,
          n: c.n,
          name: config.aliasFor[c.walletId] || c.walletName,
          id: c.walletId,
          color: config.colorFor[c.walletId] || '#4A90E2',
        };
      });
      self.wallets = lodash.sortBy(ret, 'name');
    };

    self.setWallets();

  });

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

'use strict';

angular.module('copayApp.controllers').controller('topbarController', function($scope, $rootScope, go) {

    this.onQrCodeScanned = function(data) {
        go.handleUri(data);
        //$rootScope.$emit('dataScanned', data);
    };

    this.openSendScreen = function() {
        go.send();
    };

    this.onBeforeScan = function() {
    };

    this.goHome = function() {
        go.walletHome();
    };

});

'use strict';

angular.module('copayApp.controllers').controller('versionController', function() {
  this.version = window.version;
  this.commitHash = window.commitHash;
});

'use strict';

angular.module('copayApp.controllers').controller('versionAndWalletTypeController', function() {
    
    // wallet type
    var conf = require('intervaluecore/conf.js');
    //this.type = (conf.bLight ? 'light wallet' : 'full wallet');
    this.type = (conf.bLight ? 'light' : '');

    // version
    this.version = window.version;
    this.commitHash = window.commitHash;
});

'use strict';

var constants = require('intervaluecore/constants.js');
var eventBus = require('intervaluecore/event_bus.js');
var breadcrumbs = require('intervaluecore/breadcrumbs.js');
var ValidationUtils = require('intervaluecore/validation_utils.js');

angular.module('copayApp.controllers')
	.controller('walletHomeController', function ($scope, $rootScope, $timeout, $filter, $modal, $log, notification, isCordova, profileService, lodash, configService, storageService, gettext, gettextCatalog, nodeWebkit, addressService, confirmDialog, animationService, addressbookService, correspondentListService, newVersion, autoUpdatingWitnessesList) {

		var self = this;
		var home = this;
		var conf = require('intervaluecore/conf.js');
		var chatStorage = require('intervaluecore/chat_storage.js');
		this.protocol = conf.program;
		$rootScope.hideMenuBar = false;
		$rootScope.wpInputFocused = false;
		var config = configService.getSync();
		var configWallet = config.wallet;
		var indexScope = $scope.index;
		$scope.currentSpendUnconfirmed = configWallet.spendUnconfirmed;
		var network = require('intervaluecore/network.js');

		// INIT
		var walletSettings = configWallet.settings;
		this.unitValue = walletSettings.unitValue;
		this.bbUnitValue = walletSettings.bbUnitValue;
		this.unitName = walletSettings.unitName;
		this.bbUnitName = walletSettings.bbUnitName;
		this.unitDecimals = walletSettings.unitDecimals;
		this.isCordova = isCordova;
		this.addresses = [];
		this.isMobile = isMobile.any();
		this.isWindowsPhoneApp = isMobile.Windows() && isCordova;
		this.blockUx = false;
		this.showScanner = false;
		this.isMobile = isMobile.any();
		this.addr = {};
		this.isTestnet = constants.version.match(/t$/);
		this.testnetName = (constants.alt === '2') ? '[NEW TESTNET]' : '[TESTNET]';
		this.exchangeRates = network.exchangeRates;
		$scope.index.tab = 'walletHome'; // for some reason, current tab state is tracked in index and survives re-instatiations of walletHome.js

		var disablePaymentRequestListener = $rootScope.$on('paymentRequest', function (event, address, amount, asset, recipient_device_address) {
			console.log('paymentRequest event ' + address + ', ' + amount);
			$rootScope.$emit('Local/SetTab', 'send');
			self.setForm(address, amount, null, asset, recipient_device_address);

			var form = $scope.sendPaymentForm;
			if (form.address && form.address.$invalid && !self.blockUx) {
				console.log("invalid address, resetting form");
				self.resetForm();
				self.error = gettext('Could not recognize a valid InterValue QR Code');
			}
		});

		var disablePaymentUriListener = $rootScope.$on('paymentUri', function (event, uri) {
			$timeout(function () {
				$rootScope.$emit('Local/SetTab', 'send');
				self.setForm(uri);
			}, 100);
		});

		var disableAddrListener = $rootScope.$on('Local/NeedNewAddress', function () {
			self.setAddress(true);
		});

		var disableFocusListener = $rootScope.$on('Local/NewFocusedWallet', function () {
			self.addr = {};
			self.resetForm();
		});

		var disableResumeListener = $rootScope.$on('Local/Resume', function () {
			// This is needed then the apps go to sleep
			// looks like it already works ok without rebinding touch events after every resume
			//self.bindTouchDown();
		});

		var disableTabListener = $rootScope.$on('Local/TabChanged', function (e, tab) {
			// This will slow down switch, do not add things here!
			console.log("tab changed " + tab);
			switch (tab) {
				case 'receive':
					// just to be sure we have an address
					self.setAddress();
					break;
				case 'history':
					$rootScope.$emit('Local/NeedFreshHistory');
					break;
				case 'send':
					self.resetError();
			}
			;
		});

		var disableOngoingProcessListener = $rootScope.$on('Addon/OngoingProcess', function (e, name) {
			self.setOngoingProcess(name);
		});

		function onNewWalletAddress(new_address) {
			console.log("==== NEW ADDRESSS " + new_address);
			self.addr = {};
			self.setAddress();
		}

		eventBus.on("new_wallet_address", onNewWalletAddress);

		$scope.$on('$destroy', function () {
			console.log("walletHome $destroy");
			disableAddrListener();
			disablePaymentRequestListener();
			disablePaymentUriListener();
			disableTabListener();
			disableFocusListener();
			disableResumeListener();
			disableOngoingProcessListener();
			disableClaimTextcoinListener();
			$rootScope.hideMenuBar = false;
			eventBus.removeListener("new_wallet_address", onNewWalletAddress);
		});

		//$rootScope.$digest();

		var accept_msg = gettextCatalog.getString('Accept');
		var cancel_msg = gettextCatalog.getString('Cancel');
		var confirm_msg = gettextCatalog.getString('Confirm');

		$scope.openDestinationAddressModal = function (wallets, address) {
			$rootScope.modalOpened = true;
			var fc = profileService.focusedClient;
			//self.resetForm();

			var ModalInstanceCtrl = function ($scope, $modalInstance) {
				$scope.wallets = wallets;
				$scope.editAddressbook = false;
				$scope.addAddressbookEntry = false;
				$scope.selectedAddressbook = {};
				$scope.newAddress = address;
				$scope.addressbook = {
					'address': ($scope.newAddress || ''),
					'label': ''
				};
				$scope.color = fc.backgroundColor;
				$scope.bAllowAddressbook = self.canSendExternalPayment();

				$scope.beforeQrCodeScann = function () {
					$scope.error = null;
					$scope.addAddressbookEntry = true;
					$scope.editAddressbook = false;
				};

				$scope.onQrCodeScanned = function (data, addressbookForm) {
					$timeout(function () {
						var form = addressbookForm;
						if (data && form) {
							data = data.replace(self.protocol + ':', '');
							form.address.$setViewValue(data);
							form.address.$isValid = true;
							form.address.$render();
						}
						$scope.$digest();
					}, 100);
				};

				$scope.selectAddressbook = function (addr) {
					$modalInstance.close(addr);
				};

				$scope.toggleEditAddressbook = function () {
					$scope.editAddressbook = !$scope.editAddressbook;
					$scope.selectedAddressbook = {};
					$scope.addAddressbookEntry = false;
				};

				$scope.toggleSelectAddressbook = function (addr) {
					$scope.selectedAddressbook[addr] = $scope.selectedAddressbook[addr] ? false : true;
				};

				$scope.toggleAddAddressbookEntry = function () {
					$scope.error = null;
					$scope.addressbook = {
						'address': ($scope.newAddress || ''),
						'label': ''
					};
					$scope.addAddressbookEntry = !$scope.addAddressbookEntry;
				};

				$scope.listEntries = function () {
					$scope.error = null;
					addressbookService.list(function (err, ab) {
						if (err) {
							$scope.error = err;
							return;
						}
						$scope.list = ab;
					});
				};

				$scope.add = function (addressbook) {
					$scope.error = null;
					$timeout(function () {
						addressbookService.add(addressbook, function (err, ab) {
							if (err) {
								$scope.error = err;
								return;
							}
							$rootScope.$emit('Local/AddressbookUpdated', ab);
							$scope.list = ab;
							$scope.editAddressbook = true;
							$scope.toggleEditAddressbook();
							$scope.$digest();
						});
					}, 100);
				};

				$scope.remove = function (addr) {
					$scope.error = null;
					$timeout(function () {
						addressbookService.remove(addr, function (err, ab) {
							if (err) {
								$scope.error = err;
								return;
							}
							$rootScope.$emit('Local/AddressbookUpdated', ab);
							$scope.list = ab;
							$scope.$digest();
						});
					}, 100);
				};

				$scope.cancel = function () {
					breadcrumbs.add('openDestinationAddressModal cancel');
					$modalInstance.dismiss('cancel');
				};

				$scope.selectWallet = function (walletId, walletName) {
					//$scope.gettingAddress = true; // this caused a weird hang under cordova if used after pulling "..." drop-up menu in chat
					$scope.selectedWalletName = walletName;
					//$timeout(function() { // seems useless
					//  $scope.$apply();
					//});
					addressService.getAddress(walletId, false, function onGotAddress(err, addr) {
						$scope.gettingAddress = false;

						if (err) {
							self.error = err;
							breadcrumbs.add('openDestinationAddressModal getAddress err: ' + err);
							$modalInstance.dismiss('cancel');
							return;
						}

						$modalInstance.close(addr);
					});
				};
			};

			var modalInstance = $modal.open({
				templateUrl: 'views/modals/destination-address.html',
				windowClass: animationService.modalAnimated.slideUp,
				controller: ModalInstanceCtrl,
			});

			var disableCloseModal = $rootScope.$on('closeModal', function () {
				breadcrumbs.add('openDestinationAddressModal on closeModal');
				modalInstance.dismiss('cancel');
			});

			modalInstance.result.finally(function () {
				$rootScope.modalOpened = false;
				disableCloseModal();
				var m = angular.element(document.getElementsByClassName('reveal-modal'));
				m.addClass(animationService.modalAnimated.slideOutDown);
			});

			modalInstance.result.then(function onDestModalDone(addr) {
				if (addr) {
					self.setToAddress(addr);
				}
			});
		};

		$scope.openSharedAddressDefinitionModal = function (address) {
			$rootScope.modalOpened = true;
			var fc = profileService.focusedClient;

			var ModalInstanceCtrl = function ($scope, $modalInstance) {
				$scope.color = fc.backgroundColor;
				$scope.address = address;
				$scope.shared_address_cosigners = indexScope.shared_address_cosigners;

				var walletGeneral = require('intervaluecore/wallet_general.js');
				var walletDefinedByAddresses = require('intervaluecore/wallet_defined_by_addresses.js');
				walletGeneral.readMyAddresses(function (arrMyAddresses) {
					walletDefinedByAddresses.readSharedAddressDefinition(address, function (arrDefinition, creation_ts) {
						walletDefinedByAddresses.readSharedAddressPeerAddresses(address, function (arrPeerAddresses) {
							$scope.humanReadableDefinition = correspondentListService.getHumanReadableDefinition(arrDefinition, arrMyAddresses, [], arrPeerAddresses, true);
							$scope.creation_ts = creation_ts;
							$timeout(function () {
								$scope.$apply();
							});
						});
					});
				});

				// clicked a link in the definition
				$scope.sendPayment = function (address, amount, asset) {
					if (asset && indexScope.arrBalances.filter(function (balance) {
						return (balance.asset === asset);
					}).length === 0)
						return console.log("i do not own anything of asset " + asset);
					$modalInstance.dismiss('done');
					$timeout(function () {
						indexScope.shared_address = null;
						indexScope.updateAll();
						indexScope.updateTxHistory();
						$rootScope.$emit('paymentRequest', address, amount, asset);
					});
				};

				$scope.cancel = function () {
					breadcrumbs.add('openSharedAddressDefinitionModal cancel');
					$modalInstance.dismiss('cancel');
				};

			};

			var modalInstance = $modal.open({
				templateUrl: 'views/modals/address-definition.html',
				windowClass: animationService.modalAnimated.slideUp,
				controller: ModalInstanceCtrl,
			});

			var disableCloseModal = $rootScope.$on('closeModal', function () {
				breadcrumbs.add('openSharedAddressDefinitionModal on closeModal');
				modalInstance.dismiss('cancel');
			});

			modalInstance.result.finally(function () {
				$rootScope.modalOpened = false;
				disableCloseModal();
				var m = angular.element(document.getElementsByClassName('reveal-modal'));
				m.addClass(animationService.modalAnimated.slideOutDown);
			});

		};

		this.openTxpModal = function (tx, copayers) {
			// deleted, maybe restore from copay sometime later
			// actually, nothing to display here that was not already shown
		};

		this.setAddress = function (forceNew) {
			self.addrError = null;
			var fc = profileService.focusedClient;
			if (!fc)
				return;

			// Address already set?
			if (!forceNew && self.addr[fc.credentials.walletId])
				return;

			if (indexScope.shared_address && forceNew)
				throw Error('attempt to generate for shared address');

			if (fc.isSingleAddress && forceNew)
				throw Error('attempt to generate for single address wallets');

			self.generatingAddress = true;
			$timeout(function () {
				addressService.getAddress(fc.credentials.walletId, forceNew, function (err, addr) {
					self.generatingAddress = false;

					if (err) {
						self.addrError = err;
					}
					else {
						if (addr)
							self.addr[fc.credentials.walletId] = addr;
					}

					$timeout(function () {
						$scope.$digest();
					});
				});
			});
		};

		this.copyAddress = function (addr) {
			if (isCordova) {
				window.cordova.plugins.clipboard.copy(addr);
				window.plugins.toast.showShortCenter(gettextCatalog.getString('Copied to clipboard'));
			}
			else if (nodeWebkit.isDefined()) {
				nodeWebkit.writeToClipboard(addr);
			}
		};

		this.shareAddress = function (addr) {
			if (isCordova) {
				if (isMobile.Android() || isMobile.Windows()) {
					window.ignoreMobilePause = true;
				}
				window.plugins.socialsharing.share(self.protocol + ':' + addr, null, null, null);
			}
		};

		//
		this.openCustomizedAmountModal = function (addr) {
			$rootScope.modalOpened = true;
			var self = this;
			var fc = profileService.focusedClient;
			var ModalInstanceCtrl = function ($scope, $modalInstance) {
				$scope.addr = addr;
				$scope.color = fc.backgroundColor;
				$scope.unitName = self.unitName;
				$scope.unitValue = self.unitValue;
				$scope.unitDecimals = self.unitDecimals;
				$scope.bbUnitValue = walletSettings.bbUnitValue;
				$scope.bbUnitName = walletSettings.bbUnitName;
				$scope.isCordova = isCordova;
				$scope.buttonLabel = gettextCatalog.getString('Generate QR Code');
				$scope.protocol = conf.program;

				Object.defineProperty($scope, "_customAmount", {
					get: function () {
						return $scope.customAmount;
					},
					set: function (newValue) {
						$scope.customAmount = newValue;
					},
					enumerable: true,
					configurable: true
				});

				$scope.submitForm = function (form) {
					if ($scope.index.arrBalances.length === 0)
						return console.log('openCustomizedAmountModal: no balances yet');
					var amount = form.amount.$modelValue;
					var assetInfo = $scope.index.arrBalances[$scope.index.assetIndex];
					var asset = assetInfo.asset;
					if (!asset)
						throw Error("no asset");
					var amountInSmallestUnits = profileService.getAmountInSmallestUnits(amount, asset);
					$timeout(function () {
						$scope.customizedAmountUnit =
							amount + ' ' + ((asset === 'base') ? $scope.unitName : (asset === constants.BLACKBYTES_ASSET ? $scope.bbUnitName : (assetInfo.name || 'of ' + asset)));
						$scope.amountInSmallestUnits = amountInSmallestUnits;
						$scope.asset_param = (asset === 'base') ? '' : '&asset=' + encodeURIComponent(asset);
					}, 1);
				};

				$scope.shareAddress = function (uri) {
					if (isCordova) {
						if (isMobile.Android() || isMobile.Windows())
							window.ignoreMobilePause = true;
						window.plugins.socialsharing.share(uri, null, null, null);
					}
				};

				$scope.cancel = function () {
					breadcrumbs.add('openCustomizedAmountModal: cancel');
					$modalInstance.dismiss('cancel');
				};
			};
			// 要求特定金额视图实例
			var modalInstance = $modal.open({
				templateUrl: 'views/modals/customized-amount.html',
				windowClass: animationService.modalAnimated.slideUp,
				controller: ModalInstanceCtrl,
				scope: $scope
			});

			var disableCloseModal = $rootScope.$on('closeModal', function () {
				breadcrumbs.add('openCustomizedAmountModal: on closeModal');
				modalInstance.dismiss('cancel');
			});

			modalInstance.result.finally(function () {
				$rootScope.modalOpened = false;
				disableCloseModal();
				var m = angular.element(document.getElementsByClassName('reveal-modal'));
				m.addClass(animationService.modalAnimated.slideOutDown);
			});
		};

		this.openClaimTextcoinModal = function (addr) {
			$rootScope.modalOpened = true;
			var fc = profileService.focusedClient;
			var ModalInstanceCtrl = function ($scope, $modalInstance) {
				$scope.color = fc.backgroundColor;
				$scope.buttonLabel = gettextCatalog.getString('Claim funds');

				$scope.submitForm = function (form) {
					$modalInstance.close(form.mnemonic.$modelValue);
				};

				$scope.cancel = function () {
					breadcrumbs.add('openCustomizedAmountModal: cancel');
					$modalInstance.dismiss('cancel');
				};
			};

			var modalInstance = $modal.open({
				templateUrl: 'views/modals/claim-textcoin.html',
				windowClass: animationService.modalAnimated.slideUp,
				controller: ModalInstanceCtrl,
				scope: $scope
			});

			var disableCloseModal = $rootScope.$on('closeModal', function () {
				breadcrumbs.add('openClaimTextcoinModal: on closeModal');
				modalInstance.dismiss('cancel');
			});

			modalInstance.result.finally(function (val) {
				$rootScope.modalOpened = false;
				disableCloseModal();
				var m = angular.element(document.getElementsByClassName('reveal-modal'));
				m.addClass(animationService.modalAnimated.slideOutDown);
			});

			modalInstance.result.then(function (mnemonic) {
				if (mnemonic) {
					claimTextCoin(mnemonic, addr);
				}
			});
		};

		function claimTextCoin(mnemonic, addr) {
			var wallet = require('intervaluecore/wallet.js');
			wallet.receiveTextCoin(mnemonic, addr, function (err, unit, asset) {
				$rootScope.$emit('closeModal');
				if (err) {
					if (err.indexOf("not confirmed") !== -1) {
						store_mnemonic_back();
					}
					return $rootScope.$emit('Local/ShowErrorAlert', err);
				}
				if (asset) {
					var disableBalanceListener = $rootScope.$on('Local/BalanceUpdated', function (assocBalances) {
						var assetIndex = lodash.findIndex(indexScope.arrBalances, {
							asset: asset
						});
						indexScope.assetIndex = assetIndex;
						indexScope.updateTxHistory();
						$rootScope.$emit('Local/SetTab', 'history', null, true);
						disableBalanceListener();
					});
					indexScope.updateAll();
				} else {
					indexScope.assetIndex = 0;
					indexScope.updateTxHistory();
					$rootScope.$emit('Local/SetTab', 'history', null, true);
				}
			});
		}

		var disableClaimTextcoinListener = $rootScope.$on('claimTextcoin', function (event, mnemonic) {
			var addr = self.addr[profileService.focusedClient.credentials.walletId];
			if (addr) {
				claimTextCoin(mnemonic, addr);
			} else {
				addressService.getAddress(profileService.focusedClient.credentials.walletId, false, function (err, addr) {
					if (addr) {
						self.addr[profileService.focusedClient.credentials.walletId] = addr;
						claimTextCoin(mnemonic, addr);
					}

					$timeout(function () {
						$scope.$digest();
					});
				});
			}
		});

		// Send

		var unwatchSpendUnconfirmed = $scope.$watch('currentSpendUnconfirmed', function (newVal, oldVal) {
			if (newVal == oldVal) return;
			$scope.currentSpendUnconfirmed = newVal;
		});

		$scope.$on('$destroy', function () {
			unwatchSpendUnconfirmed();
		});

		this.resetError = function () {
			this.error = this.success = null;
		};

		this.bindTouchDown = function (tries) {
			var self = this;
			tries = tries || 0;
			if (tries > 5) return;
			var e = document.getElementById('menu-walletHome');
			if (!e) return $timeout(function () {
				self.bindTouchDown(++tries);
			}, 500);

			// on touchdown elements
			$log.debug('Binding touchstart elements...');
			['hamburger', 'menu-walletHome', 'menu-send', 'menu-receive', 'menu-history'].forEach(function (id) {
				var e = document.getElementById(id);
				if (e) e.addEventListener('touchstart', function () {
					try {
						event.preventDefault();
					}
					catch (e) {
					}
					;
					angular.element(e)
						.triggerHandler('click');
				}, true);
			});
		}

		this.hideMenuBar = lodash.debounce(function (hide) {
			if (hide) {
				$rootScope.hideMenuBar = true;
				this.bindTouchDown();
			}
			else {
				$rootScope.hideMenuBar = false;
			}
			$rootScope.$digest();
		}, 100);

		this.formFocus = function (what) {
			if (isCordova && !this.isWindowsPhoneApp) {
				this.hideMenuBar(what);
			}
			if (!this.isWindowsPhoneApp) return

			if (!what) {
				this.hideAddress = false;
				this.hideAmount = false;

			}
			else {
				if (what == 'amount') {
					this.hideAddress = true;
				}
				else if (what == 'msg') {
					this.hideAddress = true;
					this.hideAmount = true;
				}
			}
			$timeout(function () {
				$rootScope.$digest();
			}, 1);
		};

		this.setSendPaymentFormInputs = function () {
			/**
			 * Setting the two related amounts as properties prevents an infinite
			 * recursion for watches while preserving the original angular updates
			 *
			 */
			Object.defineProperty($scope,
				"_amount", {
					get: function () {
						return $scope.__amount;
					},
					set: function (newValue) {
						$scope.__amount = newValue;
						self.resetError();
					},
					enumerable: true,
					configurable: true
				});

			Object.defineProperty($scope,
				"_address", {
					get: function () {
						return $scope.__address;
					},
					set: function (newValue) {
						$scope.__address = self.onAddressChange(newValue);
					},
					enumerable: true,
					configurable: true
				});

			var fc = profileService.focusedClient;
			// ToDo: use a credential's (or fc's) function for this
			this.hideNote = true;
		};

		this.setSendError = function (err) {
			var fc = profileService.focusedClient;
			var prefix =
				fc.credentials.m > 1 ? gettextCatalog.getString('Could not create payment proposal') : gettextCatalog.getString('Could not send payment');

			this.error = prefix + ": " + err;
			console.log(this.error);

			$timeout(function () {
				$scope.$digest();
			}, 1);
		};

		this.setOngoingProcess = function (name) {
			var self = this;
			self.blockUx = !!name;

			if (isCordova) {
				if (name) {
					window.plugins.spinnerDialog.hide();
					window.plugins.spinnerDialog.show(null, name + '...', true);
				}
				else {
					window.plugins.spinnerDialog.hide();
				}
			}
			else {
				self.onGoingProcess = name;
				$timeout(function () {
					$rootScope.$apply();
				});
			}
			;
		};

		function getShareMessage(amount, mnemonic, asset) {
			var usd_amount_str = "";
			if (!asset || asset == "base") {
				amount -= constants.TEXTCOIN_CLAIM_FEE;
				if (network.exchangeRates['GBYTE_USD']) {
					usd_amount_str = " (≈" + ((amount / 1e9) * network.exchangeRates['GBYTE_USD']).toLocaleString([], {maximumFractionDigits: 2}) + " USD)";
				}
				amount = (amount / 1e9).toLocaleString([], {maximumFractionDigits: 9});
				asset = "GB";
			} else {
				//indexScope.arrBalances[$scope.index.assetIndex]
				var assetInfo = lodash.find(indexScope.arrBalances, function (balance) {
					return balance.asset == asset
				});
				if (assetInfo && assetInfo.name) {
					asset = assetInfo.name;
					amount /= Math.pow(10, assetInfo.decimals);
				}
			}
			return {
				message: "Here is your link to receive " + amount + " " + asset + usd_amount_str + ": https://inve.one/openapp.html#textcoin?" + mnemonic,
				subject: "InterValue user beamed you money"
			}
		}

		this.openShareTextcoinModal = function (addr, mnemonic, amount, asset, isResend) {
			var msg = getShareMessage(amount, mnemonic, asset);
			var text = msg.message;
			var subject = msg.subject;
			$rootScope.modalOpened = true;
			var fc = profileService.focusedClient;
			var ModalInstanceCtrl = function ($scope, $modalInstance) {
				$scope.color = fc.backgroundColor;
				$scope.buttonLabel = gettextCatalog.getString((isResend ? 're' : '') + 'send email');
				$scope.isCordova = isCordova;
				$scope.address = addr;
				$scope.mnemonic = mnemonic;
				$scope.text = text;
				$scope.subject = subject;
				$scope.isResend = isResend;

				$scope.shareToEmail = function () {
					window.plugins.socialsharing.shareViaEmail(text, subject, [addr]);
					$modalInstance.close();
				};

				$scope.cancel = function () {
					breadcrumbs.add('openShareTextcoinModal: cancel');
					$modalInstance.dismiss('cancel');
				};
			};

			var modalInstance = $modal.open({
				templateUrl: 'views/modals/share.html',
				windowClass: animationService.modalAnimated.slideUp,
				controller: ModalInstanceCtrl,
				scope: $scope
			});

			var disableCloseModal = $rootScope.$on('closeModal', function () {
				breadcrumbs.add('openShareTextcoinModal: on closeModal');
				modalInstance.dismiss('cancel');
			});

			modalInstance.result.finally(function (val) {
				$rootScope.modalOpened = false;
				disableCloseModal();
				var m = angular.element(document.getElementsByClassName('reveal-modal'));
				m.addClass(animationService.modalAnimated.slideOutDown);
			});
		};

		this.submitPayment = function () {
			if ($scope.index.arrBalances.length === 0)
				return console.log('send payment: no balances yet');
			var fc = profileService.focusedClient;
			var unitValue = this.unitValue;
			var bbUnitValue = this.bbUnitValue;

			if (isCordova && this.isWindowsPhoneApp) {
				this.hideAddress = false;
				this.hideAmount = false;
			}

			var form = $scope.sendPaymentForm;
			if (!form)
				return console.log('form is gone');
			if (self.bSendAll)
				form.amount.$setValidity('validAmount', true);
			if ($scope.mtab == 2 && !form.address.$modelValue) { // clicked 'share via message' button
				form.address.$setValidity('validAddressOrEmail', true);
			}
			if (form.$invalid) {
				this.error = gettext('Unable to send transaction proposal');
				return;
			}

			if (fc.isPrivKeyEncrypted()) {
				profileService.unlockFC(null, function (err) {
					if (err)
						return self.setSendError(err.message);
					return self.submitPayment();
				});
				return;
			}

			var comment = form.comment.$modelValue;

			// ToDo: use a credential's (or fc's) function for this
			if (comment) {
				var msg = 'Could not add message to imported wallet without shared encrypting key';
				$log.warn(msg);
				return self.setSendError(gettext(msg));
			}

			var wallet = require('intervaluecore/wallet.js');
			var assetInfo = $scope.index.arrBalances[$scope.index.assetIndex];
			var asset = assetInfo.asset;
			console.log("asset " + asset);

			var isMultipleSend = !!form.addresses;
			if (isMultipleSend) {
				if (assetInfo.is_private)
					return self.setSendError("private assets can not be sent to multiple addresses");
				var outputs = [];
				form.addresses.$modelValue.split('\n').forEach(function (line) {
					var tokens = line.trim().split(/[\s,;]/);
					var address = tokens[0];
					var amount = tokens.pop();
					if (asset === "base")
						amount *= unitValue;
					else if (assetInfo.decimals)
						amount *= Math.pow(10, assetInfo.decimals);
					amount = Math.round(amount);
					outputs.push({address: address, amount: +amount});
				});
				var current_payment_key = form.addresses.$modelValue.replace(/[^a-zA-Z0-9]/g, '');
			} else {
				var address = form.address.$modelValue;
				var recipient_device_address = assocDeviceAddressesByPaymentAddress[address];
				var amount = form.amount.$modelValue;
				// address can be [bytreball_addr, email, empty => social sharing]
				var isTextcoin = !ValidationUtils.isValidAddress(address);
				// 刘星屏蔽
				// var isEmail = ValidationUtils.isValidEmail(address);
				var isEmail = true;
				if (isTextcoin)
					address = "textcoin:" + (address ? address : (Date.now() + "-" + amount));
				if (isTextcoin && assetInfo.is_private)
					return self.setSendError("private assets can not be sent as textcoins yet");
				if (asset === "base")
					amount *= unitValue;
				else if (asset === constants.BLACKBYTES_ASSET)
					amount *= bbUnitValue;
				else if (assetInfo.decimals)
					amount *= Math.pow(10, assetInfo.decimals);
				amount = Math.round(amount);
				if (isTextcoin && asset === "base") amount += constants.TEXTCOIN_CLAIM_FEE;

				var current_payment_key = '' + asset + address + amount;
			}
			var merkle_proof = '';
			if (form.merkle_proof && form.merkle_proof.$modelValue)
				merkle_proof = form.merkle_proof.$modelValue.trim();

			if (current_payment_key === self.current_payment_key)
				return $rootScope.$emit('Local/ShowErrorAlert', "This payment is already under way");
			self.current_payment_key = current_payment_key;

			indexScope.setOngoingProcess(gettext('sending'), true);
			$timeout(function () {

				profileService.requestTouchid(function (err) {
					if (err) {
						profileService.lockFC();
						indexScope.setOngoingProcess(gettext('sending'), false);
						self.error = err;
						$timeout(function () {
							delete self.current_payment_key;
							$scope.$digest();
						}, 1);
						return;
					}

					var device = require('intervaluecore/device.js');
					if (self.binding) {
						if (isTextcoin) {
							delete self.current_payment_key;
							indexScope.setOngoingProcess(gettext('sending'), false);
							return self.setSendError("you can send bound payments to intervalue adresses only");
						}
						if (!recipient_device_address)
							throw Error('recipient device address not known');
						var walletDefinedByAddresses = require('intervaluecore/wallet_defined_by_addresses.js');
						var walletDefinedByKeys = require('intervaluecore/wallet_defined_by_keys.js');
						var my_address;
						// never reuse addresses as the required output could be already present
						useOrIssueNextAddress(fc.credentials.walletId, 0, function (addressInfo) {
							my_address = addressInfo.address;
							if (self.binding.type === 'reverse_payment') {
								var arrSeenCondition = ['seen', {
									what: 'output',
									address: my_address,
									asset: self.binding.reverseAsset,
									amount: self.binding.reverseAmount
								}];
								var arrDefinition = ['or', [
									['and', [
										['address', address],
										arrSeenCondition
									]],
									['and', [
										['address', my_address],
										['not', arrSeenCondition],
										['in data feed', [
											[configService.TIMESTAMPER_ADDRESS], 'timestamp', '>', Date.now() + Math.round(self.binding.timeout * 3600 * 1000)
										]]
									]]
								]];
								var assocSignersByPath = {
									'r.0.0': {
										address: address,
										member_signing_path: 'r',
										device_address: recipient_device_address
									},
									'r.1.0': {
										address: my_address,
										member_signing_path: 'r',
										device_address: device.getMyDeviceAddress()
									}
								};
							}
							else {
								var arrExplicitEventCondition =
									['in data feed', [
										[self.binding.oracle_address], self.binding.feed_name, '=', self.binding.feed_value
									]];
								var arrMerkleEventCondition =
									['in merkle', [
										[self.binding.oracle_address], self.binding.feed_name, self.binding.feed_value
									]];
								var arrEventCondition;
								if (self.binding.feed_type === 'explicit')
									arrEventCondition = arrExplicitEventCondition;
								else if (self.binding.feed_type === 'merkle')
									arrEventCondition = arrMerkleEventCondition;
								else if (self.binding.feed_type === 'either')
									arrEventCondition = ['or', [arrMerkleEventCondition, arrExplicitEventCondition]];
								else
									throw Error("unknown feed type: " + self.binding.feed_type);
								var arrDefinition = ['or', [
									['and', [
										['address', address],
										arrEventCondition
									]],
									['and', [
										['address', my_address],
										['in data feed', [
											[configService.TIMESTAMPER_ADDRESS], 'timestamp', '>', Date.now() + Math.round(self.binding.timeout * 3600 * 1000)
										]]
									]]
								]];
								var assocSignersByPath = {
									'r.0.0': {
										address: address,
										member_signing_path: 'r',
										device_address: recipient_device_address
									},
									'r.1.0': {
										address: my_address,
										member_signing_path: 'r',
										device_address: device.getMyDeviceAddress()
									}
								};
								if (self.binding.feed_type === 'merkle' || self.binding.feed_type === 'either')
									assocSignersByPath[(self.binding.feed_type === 'merkle') ? 'r.0.1' : 'r.0.1.0'] = {
										address: '',
										member_signing_path: 'r',
										device_address: recipient_device_address
									};
							}
							walletDefinedByAddresses.createNewSharedAddress(arrDefinition, assocSignersByPath, {
								ifError: function (err) {
									delete self.current_payment_key;
									indexScope.setOngoingProcess(gettext('sending'), false);
									self.setSendError(err);
								},
								ifOk: function (shared_address) {
									composeAndSend(shared_address);
								}
							});
						});
					}
					else
						composeAndSend(address);

					// compose and send
					function composeAndSend(to_address) {
						var arrSigningDeviceAddresses = []; // empty list means that all signatures are required (such as 2-of-2)
						if (fc.credentials.m < fc.credentials.n)
							$scope.index.copayers.forEach(function (copayer) {
								if (copayer.me || copayer.signs)
									arrSigningDeviceAddresses.push(copayer.device_address);
							});
						else if (indexScope.shared_address)
							arrSigningDeviceAddresses = indexScope.copayers.map(function (copayer) {
								return copayer.device_address;
							});
						breadcrumbs.add('sending payment in ' + asset);
						profileService.bKeepUnlocked = true;
						var opts = {
							shared_address: indexScope.shared_address,
							merkle_proof: merkle_proof,
							asset: asset,
							do_not_email: true,
							send_all: self.bSendAll,
							arrSigningDeviceAddresses: arrSigningDeviceAddresses,
							recipient_device_address: recipient_device_address
						};
						if (asset === "base" || !isTextcoin) {
							if (!isMultipleSend) {
								opts.to_address = to_address;
								opts.amount = amount;
							} else {
								if (asset !== "base")
									opts.asset_outputs = outputs;
								else
									opts.base_outputs = outputs;
							}
						} else {
							opts.asset_outputs = [{address: to_address, amount: amount}];
							opts.base_outputs = [{address: to_address, amount: constants.TEXTCOIN_ASSET_CLAIM_FEE}];
						}
						fc.sendMultiPayment(opts, function (err, unit, mnemonics) {
							// if multisig, it might take very long before the callback is called
							indexScope.setOngoingProcess(gettext('sending'), false);
							breadcrumbs.add('done payment in ' + asset + ', err=' + err);
							delete self.current_payment_key;
							profileService.bKeepUnlocked = false;
							if (err) {
								if (typeof err === 'object') {
									err = JSON.stringify(err);
									eventBus.emit('nonfatal_error', "error object from sendMultiPayment: " + err, new Error());
								}
								else if (err.match(/device address/))
									err = "This is a private asset, please send it only by clicking links from chat";
								else if (err.match(/no funded/))
									err = "Not enough spendable funds, make sure all your funds are confirmed";
								else if (err.match(/connection closed/))
									err = gettextCatalog.getString('[internal] connection closed') ;
								else if (err.match(/funds from/))
									err = err.substring(err.indexOf("from")+4, err.indexOf("for")) + gettextCatalog.getString(err.substr(0,err.indexOf("from"))) + gettextCatalog.getString(". It needs atleast ")  + parseInt(err.substring(err.indexOf("for")+3, err.length))/1000000000000000000 + "INVE";
								return self.setSendError(err);
							}
							var binding = self.binding;
							self.resetForm();
							$rootScope.$emit("NewOutgoingTx");
							if (recipient_device_address) { // show payment in chat window
								eventBus.emit('sent_payment', recipient_device_address, amount || 'all', asset, !!binding);
								if (binding && binding.reverseAmount) { // create a request for reverse payment
									if (!my_address)
										throw Error('my address not known');
									var paymentRequestCode = 'intervalue:' + my_address + '?amount=' + binding.reverseAmount + '&asset=' + encodeURIComponent(binding.reverseAsset);
									var paymentRequestText = '[reverse payment](' + paymentRequestCode + ')';
									device.sendMessageToDevice(recipient_device_address, 'text', paymentRequestText);
									var body = correspondentListService.formatOutgoingMessage(paymentRequestText);
									correspondentListService.addMessageEvent(false, recipient_device_address, body);
									device.readCorrespondent(recipient_device_address, function (correspondent) {
										if (correspondent.my_record_pref && correspondent.peer_record_pref) chatStorage.store(correspondent.device_address, body, 0, 'html');
									});

									// issue next address to avoid reusing the reverse payment address
									if (!fc.isSingleAddress) walletDefinedByKeys.issueNextAddress(fc.credentials.walletId, 0, function () {
									});
								}
							}
							else if (Object.keys(mnemonics).length) {
								var mnemonic = mnemonics[address];
								if (opts.send_all && asset === "base")
									amount = assetInfo.stable;

								if (isEmail) {
									self.openShareTextcoinModal(address.slice("textcoin:".length), mnemonic, amount, asset, false);
								} else {
									if (isCordova) {
										if (isMobile.Android() || isMobile.Windows()) {
											window.ignoreMobilePause = true;
										}
										window.plugins.socialsharing.shareWithOptions(getShareMessage(amount, mnemonic, asset));
									} else {
										self.openShareTextcoinModal(null, mnemonic, amount, asset, false);
									}
								}

								$rootScope.$emit('Local/SetTab', 'history');
							}
							else // redirect to history
								$rootScope.$emit('Local/SetTab', 'history');
						});

					}

					function useOrIssueNextAddress(wallet, is_change, handleAddress) {
						if (fc.isSingleAddress) {
							addressService.getAddress(fc.credentials.walletId, false, function (err, addr) {
								handleAddress({
									address: addr
								});
							});
						}
						else walletDefinedByKeys.issueNextAddress(wallet, is_change, handleAddress);
					}

				});
			}, 100);
		};

		$scope.$watch('index.assetIndex', function (newVal, oldVal) {
			$scope.assetIndexSelectorValue = newVal;
			self.switchForms();
		});
		this.switchForms = function () {
			this.bSendAll = false;
			if ($scope.assetIndexSelectorValue < 0) {
				this.shownForm = 'data';
			}
			else {
				$scope.index.assetIndex = $scope.assetIndexSelectorValue;
				this.shownForm = 'payment';
			}
			$scope.mtab = 1;
		}

		this.submitData = function () {
			var objectHash = require('intervaluecore/object_hash.js');
			var fc = profileService.focusedClient;
			var value = {};
			var app;
			switch ($scope.assetIndexSelectorValue) {
				case -1:
					app = "data_feed";
					break;
				case -2:
					app = "attestation";
					break;
				case -3:
					app = "profile";
					break;
				case -4:
					app = "data";
					break;
				default:
					throw new Error("invalid asset selected");
					break;
			}
			var errored = false;
			$scope.home.feedvaluespairs.forEach(function (pair) {
				if (value[pair.name]) {
					self.setSendError("All keys must be unique");
					errored = true;
					return;
				}
				value[pair.name] = pair.value;
			});
			if (errored) return;
			if (Object.keys(value)
				.length === 0) {
				self.setSendError("Provide at least one value");
				return;
			}

			if (fc.isPrivKeyEncrypted()) {
				profileService.unlockFC(null, function (err) {
					if (err)
						return self.setSendError(err.message);
					return self.submitData();
				});
				return;
			}

			profileService.requestTouchid(function (err) {
				if (err) {
					profileService.lockFC();
					indexScope.setOngoingProcess(gettext('sending'), false);
					self.error = err;
					$timeout(function () {
						$scope.$digest();
					}, 1);
					return;
				}

				if (app == "attestation") {
					value = {
						address: $scope.home.attested_address,
						profile: value
					};
				}
				var objMessage = {
					app: app,
					payload_location: "inline",
					payload_hash: objectHash.getBase64Hash(value),
					payload: value
				};
				var arrSigningDeviceAddresses = []; // empty list means that all signatures are required (such as 2-of-2)
				if (fc.credentials.m < fc.credentials.n)
					indexScope.copayers.forEach(function (copayer) {
						if (copayer.me || copayer.signs)
							arrSigningDeviceAddresses.push(copayer.device_address);
					});
				else if (indexScope.shared_address)
					arrSigningDeviceAddresses = indexScope.copayers.map(function (copayer) {
						return copayer.device_address;
					});

				indexScope.setOngoingProcess(gettext('sending'), true);

				fc.sendMultiPayment({
					arrSigningDeviceAddresses: arrSigningDeviceAddresses,
					shared_address: indexScope.shared_address,
					messages: [objMessage]
				}, function (err) { // can take long if multisig
					indexScope.setOngoingProcess(gettext('sending'), false);
					if (err) {
						self.setSendError(err);
						return;
					}
					breadcrumbs.add('done submitting data into feeds ' + Object.keys(value)
						.join(','));
					self.resetDataForm();
					$rootScope.$emit('Local/SetTab', 'history');
				});
			});
		}

		this.resetDataForm = function () {
			this.resetError();
			$scope.home.feedvaluespairs = [{}];
			$timeout(function () {
				$rootScope.$digest();
			}, 1);
		};

		var assocDeviceAddressesByPaymentAddress = {};

		this.canSendExternalPayment = function () {
			if ($scope.index.arrBalances.length === 0 || $scope.index.assetIndex < 0) // no balances yet, assume can send
				return true;
			if (!$scope.index.arrBalances[$scope.index.assetIndex].is_private)
				return true;
			var form = $scope.sendPaymentForm;
			if (!form || !form.address) // disappeared
				return true;
			var address = form.address.$modelValue;
			var recipient_device_address = assocDeviceAddressesByPaymentAddress[address];
			return !!recipient_device_address;
		};

		this.deviceAddressIsKnown = function () {
			//	return true;
			if ($scope.index.arrBalances.length === 0) // no balances yet
				return false;
			var form = $scope.sendPaymentForm;
			if (!form || !form.address) // disappeared
				return false;
			var address = form.address.$modelValue;
			var recipient_device_address = assocDeviceAddressesByPaymentAddress[address];
			return !!recipient_device_address;
		};

		this.openBindModal = function () {
			$rootScope.modalOpened = true;
			var fc = profileService.focusedClient;
			var form = $scope.sendPaymentForm;
			if (!form || !form.address) // disappeared
				return;
			var address = form.address;

			var ModalInstanceCtrl = function ($scope, $modalInstance) {
				$scope.color = fc.backgroundColor;
				$scope.arrPublicAssetInfos = indexScope.arrBalances.filter(function (b) {
					return !b.is_private;
				})
					.map(function (b) {
						var info = {
							asset: b.asset
						};
						if (b.asset === 'base')
							info.displayName = self.unitName;
						else if (b.asset === constants.BLACKBYTES_ASSET)
							info.displayName = self.bbUnitName;
						else if (profileService.assetMetadata[b.asset])
							info.displayName = profileService.assetMetadata[b.asset].name;
						else
							info.displayName = 'of ' + b.asset.substr(0, 4);
						return info;
					});
				$scope.binding = { // defaults
					type: fc.isSingleAddress ? 'data' : 'reverse_payment',
					timeout: 4,
					reverseAsset: 'base',
					feed_type: 'either'
				};
				if (self.binding) {
					$scope.binding.type = self.binding.type;
					$scope.binding.timeout = self.binding.timeout;
					if (self.binding.type === 'reverse_payment') {
						$scope.binding.reverseAsset = self.binding.reverseAsset;
						$scope.binding.reverseAmount = profileService.getAmountInDisplayUnits(self.binding.reverseAmount, self.binding.reverseAsset);
					}
					else {
						$scope.binding.oracle_address = self.binding.oracle_address;
						$scope.binding.feed_name = self.binding.feed_name;
						$scope.binding.feed_value = self.binding.feed_value;
						$scope.binding.feed_type = self.binding.feed_type;
					}
				}
				$scope.oracles = configService.oracles;
				$scope.isSingleAddress = fc.isSingleAddress;

				$scope.cancel = function () {
					$modalInstance.dismiss('cancel');
				};

				$scope.bind = function () {
					var binding = {
						type: $scope.binding.type
					};
					if (binding.type === 'reverse_payment') {
						binding.reverseAsset = $scope.binding.reverseAsset;
						binding.reverseAmount = profileService.getAmountInSmallestUnits($scope.binding.reverseAmount, $scope.binding.reverseAsset);
					}
					else {
						binding.oracle_address = $scope.binding.oracle_address;
						binding.feed_name = $scope.binding.feed_name;
						binding.feed_value = $scope.binding.feed_value;
						binding.feed_type = $scope.binding.feed_type;
					}
					binding.timeout = $scope.binding.timeout;
					self.binding = binding;
					$modalInstance.dismiss('done');
				};

			};

			var modalInstance = $modal.open({
				templateUrl: 'views/modals/bind.html',
				windowClass: animationService.modalAnimated.slideUp,
				controller: ModalInstanceCtrl,
			});

			var disableCloseModal = $rootScope.$on('closeModal', function () {
				modalInstance.dismiss('cancel');
			});

			modalInstance.result.finally(function () {
				$rootScope.modalOpened = false;
				disableCloseModal();
				var m = angular.element(document.getElementsByClassName('reveal-modal'));
				m.addClass(animationService.modalAnimated.slideOutDown);
			});

		};

		this.setToAddress = function (to) {
			var form = $scope.sendPaymentForm;
			if (!form || !form.address) // disappeared?
				return console.log('form.address has disappeared');
			form.address.$setViewValue(to);
			form.address.$isValid = true;
			form.address.$render();
		}

		this.setForm = function (to, amount, comment, asset, recipient_device_address) {
			this.resetError();
			$timeout((function () {
				delete this.binding;
				var form = $scope.sendPaymentForm;
				if (!form || !form.address) // disappeared?
					return console.log('form.address has disappeared');
				if (to) {
					form.address.$setViewValue(to);
					form.address.$isValid = true;
					form.address.$render();
					this.lockAddress = true;
					if (recipient_device_address) // must be already paired
						assocDeviceAddressesByPaymentAddress[to] = recipient_device_address;
				}

				if (amount) {
					//	form.amount.$setViewValue("" + amount);
					//	form.amount.$isValid = true;
					this.lockAmount = true;
					$timeout(function () {
						form.amount.$setViewValue("" + profileService.getAmountInDisplayUnits(amount, asset));
						form.amount.$isValid = true;
						form.amount.$render();
					});
				}
				else {
					this.lockAmount = false;
					form.amount.$pristine = true;
					form.amount.$setViewValue('');
					form.amount.$render();
				}
				//	form.amount.$render();

				if (form.merkle_proof) {
					form.merkle_proof.$setViewValue('');
					form.merkle_proof.$render();
				}
				if (comment) {
					form.comment.$setViewValue(comment);
					form.comment.$isValid = true;
					form.comment.$render();
				}

				if (asset) {
					var assetIndex = lodash.findIndex($scope.index.arrBalances, {
						asset: asset
					});
					if (assetIndex < 0)
						throw Error("failed to find asset index of asset " + asset);
					$scope.index.assetIndex = assetIndex;
					this.lockAsset = true;
				}
				else
					this.lockAsset = false;
			}).bind(this), 1);
		};

		this.resetForm = function () {
			this.resetError();
			delete this.binding;

			this.lockAsset = false;
			this.lockAddress = false;
			this.lockAmount = false;
			this.hideAdvSend = true;
			$scope.currentSpendUnconfirmed = configService.getSync()
				.wallet.spendUnconfirmed;

			this._amount = this._address = null;
			this.bSendAll = false;

			var form = $scope.sendPaymentForm;

			if (form && form.amount) {
				form.amount.$pristine = true;
				form.amount.$setViewValue('');
				if (form.amount)
					form.amount.$render();

				if (form.merkle_proof) {
					form.merkle_proof.$setViewValue('');
					form.merkle_proof.$render();
				}
				if (form.comment) {
					form.comment.$setViewValue('');
					form.comment.$render();
				}
				form.$setPristine();

				if (form.address) {
					form.address.$pristine = true;
					form.address.$setViewValue('');
					form.address.$render();
				}
			}
			$timeout(function () {
				$rootScope.$digest();
			}, 1);
		};

		this.setSendAll = function () {
			var form = $scope.sendPaymentForm;
			if (!form || !form.amount) // disappeared?
				return console.log('form.amount has disappeared');
			if (indexScope.arrBalances.length === 0)
				return;
			var assetInfo = indexScope.arrBalances[indexScope.assetIndex];
			if (assetInfo.asset === 'base') {
				this._amount = null;
				this.bSendAll = true;
				form.amount.$setViewValue('');
				form.amount.$setValidity('validAmount', true);
				form.amount.$render();
			}
			else {
				var full_amount = assetInfo.stable;
				if (assetInfo.asset === constants.BLACKBYTES_ASSET)
					full_amount /= this.bbUnitValue;
				else if (assetInfo.decimals)
					full_amount /= Math.pow(10, assetInfo.decimals);
				form.amount.$setViewValue('' + full_amount);
				form.amount.$render();
			}
			//console.log('done setsendall')
			/*$timeout(function() {
                $rootScope.$digest();
                console.log('-- amount invalid? '+form.amount.$invalid);
                console.log('-- form invalid? '+form.$invalid);
            }, 1);*/
		};

		this.setFromUri = function (uri) {
			var objRequest;
			require('intervaluecore/uri.js')
				.parseUri(uri, {
					ifError: function (err) {
					},
					ifOk: function (_objRequest) {
						objRequest = _objRequest; // the callback is called synchronously
					}
				});

			if (!objRequest) // failed to parse
				return uri;
			if (objRequest.amount) {
				// setForm() cares about units conversion
				//var amount = (objRequest.amount / this.unitValue).toFixed(this.unitDecimals);
				this.setForm(objRequest.address, objRequest.amount);
			}
			return objRequest.address;
		};

		this.onAddressChange = function (value) {
			this.resetError();
			if (!value) return '';

			if (value.indexOf(self.protocol + ':') === 0)
				return this.setFromUri(value);
			else
				return value;
		};

		// History

		function strip(number) {
			return (parseFloat(number.toPrecision(12)));
		}

		this.getUnitName = function () {
			return this.unitName;
		};

		this.openTxModal = function (btx) {
			$rootScope.modalOpened = true;
			var self = this;
			var fc = profileService.focusedClient;
			var ModalInstanceCtrl = function ($scope, $modalInstance) {
				$scope.btx = btx;
				var assetIndex = lodash.findIndex(indexScope.arrBalances, {
					asset: btx.asset
				});
				$scope.isPrivate = indexScope.arrBalances[assetIndex].is_private;
				$scope.settings = walletSettings;
				$scope.color = fc.backgroundColor;
				$scope.n = fc.credentials.n;
				$scope.exchangeRates = network.exchangeRates;
				$scope.BLACKBYTES_ASSET = constants.BLACKBYTES_ASSET;

				$scope.shareAgain = function () {
					if (isCordova) {
						if (isMobile.Android() || isMobile.Windows()) {
							window.ignoreMobilePause = true;
						}
						window.plugins.socialsharing.shareWithOptions(getShareMessage(btx.amount, btx.mnemonic, btx.asset));
					} else {
						self.openShareTextcoinModal(btx.textAddress, btx.mnemonic, btx.amount, btx.asset, true);
					}
				}

				$scope.eraseTextcoin = function () {
					(function () {
						var wallet = require('intervaluecore/wallet.js');
						var ModalInstanceCtrl = function ($scope, $modalInstance, $sce) {
							$scope.title = $sce.trustAsHtml(gettextCatalog.getString('Deleting the textcoin will remove the ability to claim it back or resend'));
							$scope.cancel_button_class = 'light-gray outline';
							$scope.loading = false;
							$scope.confirm_label = gettextCatalog.getString('Confirm');

							$scope.ok = function () {
								$scope.loading = true;
								$modalInstance.close(gettextCatalog.getString('Confirm'));

								wallet.eraseTextcoin(btx.unit, btx.addressTo);

								indexScope.updateTxHistory();
								$rootScope.$emit('Local/SetTab', 'history');
							};
							$scope.cancel = function () {
								$modalInstance.dismiss(gettextCatalog.getString('No'));
							};
						};

						var modalInstance = $modal.open({
							templateUrl: 'views/modals/confirmation.html',
							windowClass: animationService.modalAnimated.slideUp,
							controller: ModalInstanceCtrl
						});

						modalInstance.result.finally(function () {
							var m = angular.element(document.getElementsByClassName('reveal-modal'));
							m.addClass(animationService.modalAnimated.slideOutDown);
						});
					})();
				}


				$scope.getAmount = function (amount) {
					return self.getAmount(amount);
				};

				$scope.getUnitName = function () {
					return self.getUnitName();
				};

				$scope.openInExplorer = function () {
					var testnet = home.isTestnet ? 'testnet' : '';
					var url = 'https://' + testnet + 'explorer.intervalue.org/#' + btx.unit;
					if (typeof nw !== 'undefined')
						nw.Shell.openExternal(url);
					else if (isCordova)
						cordova.InAppBrowser.open(url, '_system');
				};

				$scope.copyAddress = function (addr) {
					if (!addr) return;
					self.copyAddress(addr);
				};

				$scope.showCorrespondentList = function () {
					self.showCorrespondentListToReSendPrivPayloads(btx);
				};

				$scope.reSendPrivateMultiSigPayment = function () {
					var indivisible_asset = require('intervaluecore/indivisible_asset');
					var wallet_defined_by_keys = require('intervaluecore/wallet_defined_by_keys');
					var walletDefinedByAddresses = require('intervaluecore/wallet_defined_by_addresses');
					var fc = profileService.focusedClient;

					function success() {
						$timeout(function () {
							notification.success(gettextCatalog.getString('Success'), gettextCatalog.getString('Private payloads sent', {}));
						});
					}

					indivisible_asset.restorePrivateChains(btx.asset, btx.unit, btx.addressTo, function (arrRecipientChains, arrCosignerChains) {
						if (indexScope.shared_address) {
							walletDefinedByAddresses.forwardPrivateChainsToOtherMembersOfAddresses(arrCosignerChains, [indexScope.shared_address], null, success);
						}
						else {
							wallet_defined_by_keys.forwardPrivateChainsToOtherMembersOfWallets(arrCosignerChains, [fc.credentials.walletId], null, success);
						}
					});
				};

				$scope.cancel = function () {
					breadcrumbs.add('dismiss tx details');
					try {
						$modalInstance.dismiss('cancel');
					}
					catch (e) {
						//	indexScope.sendBugReport('simulated in dismiss tx details', e);
					}
				};

			};

			var modalInstance = $modal.open({
				templateUrl: 'views/modals/tx-details.html',
				windowClass: animationService.modalAnimated.slideRight,
				controller: ModalInstanceCtrl,
			});

			var disableCloseModal = $rootScope.$on('closeModal', function () {
				breadcrumbs.add('on closeModal tx details');
				modalInstance.dismiss('cancel');
			});

			modalInstance.result.finally(function () {
				$rootScope.modalOpened = false;
				disableCloseModal();
				var m = angular.element(document.getElementsByClassName('reveal-modal'));
				m.addClass(animationService.modalAnimated.slideOutRight);
			});
		};

		this.showCorrespondentListToReSendPrivPayloads = function (btx) {
			$rootScope.modalOpened = true;
			var self = this;
			var fc = profileService.focusedClient;
			var ModalInstanceCtrl = function ($scope, $modalInstance, $timeout, go, notification) {
				$scope.btx = btx;
				$scope.settings = walletSettings;
				$scope.color = fc.backgroundColor;

				$scope.readList = function () {
					$scope.error = null;
					correspondentListService.list(function (err, ab) {
						if (err) {
							$scope.error = err;
							return;
						}
						$scope.list = ab;
						$scope.$digest();
					});
				};

				$scope.sendPrivatePayments = function (correspondent) {
					var indivisible_asset = require('intervaluecore/indivisible_asset');
					var wallet_general = require('intervaluecore/wallet_general');
					indivisible_asset.restorePrivateChains(btx.asset, btx.unit, btx.addressTo, function (arrRecipientChains, arrCosignerChains) {
						wallet_general.sendPrivatePayments(correspondent.device_address, arrRecipientChains, true, null, function () {
							modalInstance.dismiss('cancel');
							go.history();
							$timeout(function () {
								notification.success(gettextCatalog.getString('Success'), gettextCatalog.getString('Private payloads sent', {}));
							});
						});
					});

				};

				$scope.back = function () {
					self.openTxModal(btx);
				};

			};

			var modalInstance = $modal.open({
				templateUrl: 'views/modals/correspondentListToReSendPrivPayloads.html',
				windowClass: animationService.modalAnimated.slideRight,
				controller: ModalInstanceCtrl,
			});

			var disableCloseModal = $rootScope.$on('closeModal', function () {
				modalInstance.dismiss('cancel');
			});

			modalInstance.result.finally(function () {
				$rootScope.modalOpened = false;
				disableCloseModal();
				var m = angular.element(document.getElementsByClassName('reveal-modal'));
				m.addClass(animationService.modalAnimated.slideOutRight);
			});
		};

		this.hasAction = function (actions, action) {
			return actions.hasOwnProperty('create');
		};

		this._doSendAll = function (amount) {
			this.setForm(null, amount, null);
		};

		this.sendAll = function (amount, feeStr) {
			var self = this;
			var msg = gettextCatalog.getString("{{fee}} will be deducted for bitcoin networking fees", {
				fee: feeStr
			});

			confirmDialog.show(msg, function (confirmed) {
				if (confirmed)
					self._doSendAll(amount);
			});
		};

		/* Start setup */

		this.bindTouchDown();
		this.setSendPaymentFormInputs();
		if (profileService.focusedClient && profileService.focusedClient.isComplete()) {
			this.setAddress();
		}

		var store_mnemonic_back = function () {
		};
		if (isCordova) {
			window.plugins.appPreferences.fetch(function (referrer) {
				if (referrer) {
					console.log('==== referrer: ' + referrer);
					window.plugins.appPreferences.remove(function () {
					}, function () {
					}, 'referrer');
					store_mnemonic_back = function () {
						window.plugins.appPreferences.store(function () {
						}, function () {
						}, 'referrer', referrer);
					};
					if (referrer.split('-').length % 3 === 0)
						$rootScope.$emit("claimTextcoin", referrer);
				}
			}, function () {
			}, "referrer");
		}
	});
window.version="1.0.0";
window.commitHash="9755177";
'use strict';

angular.element(document).ready(function () {

	// Run copayApp after device is ready.
	var startAngular = function () {
		angular.bootstrap(document, ['copayApp']);
	};

	// var handleBitcoinURI = function (url) {
	// 	if (!url) return;
	// 	if (url.indexOf('glidera') != -1) {
	// 		url = '#/uri-glidera' + url.replace('bitcoin://glidera', '');
	// 	}
	// 	else {
	// 		url = '#/uri-payment/' + url;
	// 	}
	// 	setTimeout(function () {
	// 		window.location = url;
	// 	}, 1000);
	// };

	/* Cordova specific Init */
	if (window.cordova !== undefined) {
		document.addEventListener('deviceready', function () {

			// document.addEventListener('pause', function () {
			// 	if (!window.ignoreMobilePause) {
			// 		setTimeout(function () {
			// 			window.location = '#/cordova/pause/';
			// 		}, 100);
			// 	}
			// 	setTimeout(function () {
			// 		window.ignoreMobilePause = false;
			// 	}, 100);
			// }, false);
            //
			// document.addEventListener('resume', function () {
			// 	if (!window.ignoreMobilePause) {
			// 		setTimeout(function () {
			// 			window.location = '#/cordova/resume/';
			// 		}, 100);
			// 	}
			// 	setTimeout(function () {
			// 		window.ignoreMobilePause = false;
			// 	}, 100);
			// }, false);

			// Back button event
			// document.addEventListener('backbutton', function () {
			// 	var loc = window.location;
			// 	var isHome = loc.toString().match(/index\.html#\/$/) ? 'true' : '';
			// 	if (!window.ignoreMobilePause) {
			// 		window.location = '#/cordova/backbutton/' + isHome;
			// 	}
			// 	setTimeout(function () {
			// 		window.ignoreMobilePause = false;
			// 	}, 100);
			// }, false);

			document.addEventListener('menubutton', function () {
				window.location = '#/preferences';
			}, false);

			// window.plugins.webintent.getUri(handleBitcoinURI);
			// window.plugins.webintent.onNewIntent(handleBitcoinURI);
			// window.handleOpenURL = handleBitcoinURI;

			window.plugins.touchid.isAvailable(
				function (msg) {
					window.touchidAvailable = true;
				}, // success handler: TouchID available
				function (msg) {
					window.touchidAvailable = false;
				} // error handler: no TouchID available
			);

			startAngular();
		}, false);
	} else {
        // try {
        //   window.handleOpenURL = handleBitcoinURI;
        //   window.plugins.webintent.getUri(handleBitcoinURI);
        //   window.plugins.webintent.onNewIntent(handleBitcoinURI);
        // } catch (e) {}

		startAngular();
	}
});




