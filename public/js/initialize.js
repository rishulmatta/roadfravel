var roadFravel = angular.module('roadFravel', ['ui.router','ui.bootstrap','mgo-angular-wizard','toastr','rzModule']);


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
      }).state('map.offer', {
        templateUrl: 'partials/offer',
        controller: "OfferCtrl",
        url:"/offer"
      }).state('landing', {
        templateUrl: 'partials/landing',
        controller: "LandingCtrl",
        url:"/landing"
      }).state('login', {
        templateUrl: 'partials/login',
        controller: "LoginCtrl",
        url:"/login"
      }).state('faq', {
        templateUrl: 'partials/faq',
        controller: "FaqCtrl",
        url:"/faq"
      }).state('mypools', {
        templateUrl: 'partials/myPools',
        controller: "MyPoolsCtrl",
        url:"/mypools"
      }).state('aboutus', {
        templateUrl: 'partials/aboutUs',
        controller: "AboutUsCtrl",
        url:"/aboutus"
      })
  });


roadFravel.run(function ($rootScope) {
  $rootScope.$on('$stateChangeStart', 
  function(event, toState, toParams, fromState, fromParams, options){ 
     $("html, body").animate({ scrollTop: 0 }, 300);
     if (toState.name == 'map.search') {
         $(".loader").css("display","");
     }
  })
})