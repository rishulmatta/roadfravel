var roadFravel = angular.module('roadFravel', ['ui.router','ui.bootstrap']);


roadFravel.config(
  function($stateProvider, $urlRouterProvider) {

      $urlRouterProvider.otherwise("/landing");

    $stateProvider.
      state('map', {
        templateUrl: 'partials/map',
        controller:"MapCtrl",
        url : "/map"
      }).state('map.search', {
        templateUrl: 'partials/search',
        controller: "SearchCtrl",
        url : "/search"
      }).state('login', {
        templateUrl: 'partials/login',
        controller: "HomeCtrl"
       }).state('map.offer', {
        templateUrl: 'partials/offer',
        controller: "OfferCtrl",
        url:"/offer"
      }).state('landing', {
        templateUrl: 'partials/landing',
        controller: "LandingCtrl",
        url:"/landing"
      })
  });