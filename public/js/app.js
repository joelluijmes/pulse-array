angular.module('myApp', ['ui.router'])
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/overview');
        $locationProvider.html5Mode(true);

        $stateProvider
            .state('overview', {
                url: '/overview',
                views: {
                    mainModule: {
                        templateUrl: '/partials/overview.html'
                    },
                    'realtime@overview': {
                        templateUrl: '/partials/realtime.html'
                    },
                    'history@overview': {
                        templateUrl: '/partials/history.html'
                    }
                }
            })
            .state('realtime', {
                url: '/realtime',
                views: {
                    mainModule: {
                        templateUrl: '/partials/realtime.html'
                    }
                }
            })
            .state('history', {
                url: '/history',
                views: {
                    mainModule: {
                        templateUrl: '/partials/history.html'
                    }
                }
            });
    });
