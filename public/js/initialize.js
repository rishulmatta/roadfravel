var roadFravel = angular.module('roadFravel', ['ngRoute','ui.bootstrap']);


roadFravel.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/home', {
        templateUrl: 'partials/home',
        controller: "HomeCtrl"
      }).when('/login', {
        templateUrl: 'partials/login',
        controller: "HomeCtrl"
       }).when('/offer', {
        templateUrl: 'partials/offer',
        controller: "OfferCtrl"
      }).
      otherwise({
        redirectTo: '/home'
      });
  }]);