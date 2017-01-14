// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.directives', 'starter.services', 'starter.factories', 'starter.constants', 'backand', 'ui-notification'])

.run(function($ionicPlatform, Notification, $ionicPopup, CordovaNetwork) {

  $ionicPlatform.ready(function() {
    
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    document.addEventListener("online", onOnline, false);
    document.addEventListener("offline", onOffline, false);

    function onOnline() {
      var networkState = navigator.connection.type;
      if (networkState !== Connection.NONE) {
          Notification.success({message: 'La connexion à Internet a été rétablie.', delay:4000});
      }
      console.log('Connection type: ' + networkState);
		}

		function onOffline() {
      Notification.error({message: 'La connexion à Internet a été perdue.', delay:4000});
		}

    if (!CordovaNetwork.isOnline()) {
        Notification.error({message: 'Veuillez verifier votre connexion internet!', delay:4000});
        return;
    }

  });
})


.config(function(BackandProvider, $stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider, USER_ROLES, NotificationProvider) {

  $ionicConfigProvider.tabs.position('bottom');

  NotificationProvider.setOptions({
      delay: 10000,
      startTop: 50,
      startLeft: 10,
      verticalSpacing: 20,
      horizontalSpacing: 20,
      positionX: 'left',
      positionY: 'top',
      closeOnClick: true
  });

  BackandProvider.setAppName('canprognosis2017');
  //BackandProvider.setSignUpToken('adb40358-ab39-4bf2-937f-0e5aeff8ee22');
  BackandProvider.setAnonymousToken('6a941be9-9ded-4805-aae4-faa699c954c9');

  //$ionicConfigProvider.views.maxCache(0);

  $stateProvider
    /*.state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })*/
    .state('main', {
      url: '/',
      abstract: true,
      templateUrl: 'templates/main.html'
    })
    .state('main.dash', {
      cache: false,
      url: 'main/dash',
      views: {
          'dash-tab': {
            templateUrl: 'templates/dashboard.html',
            controller: 'MatchCalendarCtrl'
          }
      }
    })
    .state('main.teams', {
      cache: true,
      url: 'main/teams',
      views: {
          'teams-tab': {
            templateUrl: 'templates/teams.html',
            controller: 'TeamsRankCtrl'
          }
      }
    });
    
    $urlRouterProvider.otherwise(function ($injector, $location) {
      var $state = $injector.get("$state");
      $state.go("main.dash");
    });

    $httpProvider.interceptors.push('APIInterceptor');
})

.run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
  $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {
 
    /*if ('data' in next && 'authorizedRoles' in next.data) {
      console.log("next ",next)
      var authorizedRoles = next.data.authorizedRoles;
      if (!AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        $state.go($state.current, {}, {reload: true});
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      }
    }*/

    /*if('data' in next && next.name == "main.admin"){
      if (!AuthService.isAuthenticated()) {
        //if (next.name !== 'login') {
          event.preventDefault();
          $state.go('login');
        //}
      }
    }*/
 
    /*if (!AuthService.isAuthenticated()) {
      if (next.name !== 'login') {
        event.preventDefault();
        $state.go('login');
      }
    }*/
  });
})
