angular.module('myApp', ['ui.router'])
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/overview');
        $locationProvider.html5Mode(true);

        $stateProvider
            .state('overview', {
                //abstract: true,
                url: '/overview',
                //templateUrl: '../partials/overview.html',
                views: {
                    mainModule: {
                        templateUrl: '../partials/overview.html'
                    },
                    'realtime@overview': {
                        templateUrl: '../partials/realtime.html'
                    },
                    'history@overview': {
                        templateUrl: '../partials/history.html'
                    }
                }
            })
            .state('overview.realtime', {
                url: '/realtime',
                templateUrl: '../partials/realtime.html'
            })
            .state('realtime', {
                url: '/realtime',
                templateUrl: '../partials/realtime.html'
            })
            .state('history', {
                url: '/history',
                templateUrl: '../partials/history.html'
            });
    });
