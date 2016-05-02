var roadFravel = angular.module('roadFravel', ['ui.router','ui.bootstrap']);


roadFravel.config(
  function($stateProvider, $urlRouterProvider) {

      $urlRouterProvider.otherwise("/landing");

    $stateProvider.
      state('home', {
        templateUrl: 'partials/home',
        controller: "HomeCtrl",
        url : "/home"
      }).state('/login', {
        templateUrl: 'partials/login',
        controller: "HomeCtrl"
       }).state('offer', {
        templateUrl: 'partials/offer',
        controller: "OfferCtrl",
        url:"/offer"
      }).state('landing', {
        templateUrl: 'partials/landing',
        controller: "LandingCtrl",
        url:"/landing"
      })
  });