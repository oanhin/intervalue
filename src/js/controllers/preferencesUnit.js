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
                name: 'INVE',
                shortName: 'INVE',
                value: 1,
                decimals: 0,
                code: 'one',
            }
            , {
                name: 'kINVE (1,000 INVE)',
                shortName: 'kI',
                value: 1000,
                decimals: 3,
                code: 'kilo',
            }
            , {
                name: 'MINVE (1,000,000 INVE)',
                shortName: 'MI',
                value: 1000000,
                decimals: 6,
                code: 'mega',
            }
            , {
                name: 'GINVE (1,000,000,000 INVE)',
                shortName: 'GI',
                value: 1000000000,
                decimals: 9,
                code: 'giga',
            }
        ];

        this.unitName = this.unitOpts[0].unitName;  // 设置默认单元，刘星修改

        //保存单元设置
        this.save = function (newUnit) {
            newUnit = this.unitOpts[0];             // 设置默认单元，刘星修改
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
