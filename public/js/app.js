angular.module('myApp', ['ui.router'])
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/home');
        $locationProvider.html5Mode(true);

        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '../partials/home.html'
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
