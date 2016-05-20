angular.module('myApp', ['ngRoute'])
    .config(function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/home', {templateUrl: '../partials/home.html'})
            .when('/realtime', {templateUrl: '../partials/realtime.html'})
            .when('/history', {templateUrl: '../partials/history.html'})
            .when('/backup', {templateUrl: '../partials/backup.html'})
            .when('/settings', {templateUrl: '../partials/settings.html'})
            .otherwise({redirectTo: '/home'});
    });
