angular.module('starter.services', [])

  .service('CordovaNetwork', function($rootScope, $cordovaNetwork, Notification) {
      
      document.addEventListener("deviceready", function () {

        var type = $cordovaNetwork.getNetwork()

        var isOnline = $cordovaNetwork.isOnline()

        var isOffline = $cordovaNetwork.isOffline()

        // listen for Online event
        $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
          var onlineState = networkState;
        })

        // listen for Offline event
        $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
          var offlineState = networkState;
        })

      }, false);

      return {

        isOnline: function(){
          var blnReturn = true;
          if(window.Connection){
            if($cordovaNetwork.getNetwork() == Connection.NONE){
              blnReturn = false;
            }
          }
          return blnReturn;
        },
        getStatus: function(){
          if(window.Connection)
            return $cordovaNetwork.getNetwork();
        }
      }
  })

  .service('APIInterceptor', function ($rootScope, $q) {
      var service = this;

      service.responseError = function (response) {
          if (response.status === 401) {
              $rootScope.$broadcast('unauthorized');
          }
          return $q.reject(response);
      };
  })


  .service('BackandUserAuthService', function ($http, Backand) {
        var baseUrl = '/1/objects/';
        var objectName = 'users/';
      
        function getUrl() {
          return Backand.getApiUrl() + baseUrl + objectName;
        }
      
        function getUrlForId(id) {
          return getUrl() + id;
        }
      
        getUsers = function () {
          return $http.get(getUrl());
        };

        getUser = function (userName) {
          return $http ({
            method: 'GET',
            url: Backand.getApiUrl() + '/1/objects/' + objectName,
            params: {
              filter: [{"fieldName":"firstName","operator":"equals","value":userName}]
            }
          }).then(function(data){
            return data.data;
          });
        };
      
        addUser = function(user) {
          return $http.post(getUrl(), todo);
        }
      
        deleteUser = function (id) {
          return $http.delete(getUrlForId(id));
        };

        getConnectedUser = function (username, password) {
      
          return $http({
              method: 'GET',
              url: Backand.getApiUrl() + '/1/objects/' + objectName,
              params: {
                //pageSize: pageSize,
                //pageNumber: pageNumber,
                //sort: sort,
                filter: [{"fieldName":"firstName","operator":"equals","value":username},{"fieldName":"password","operator":"equals","value":password}]
              }
          }).then(function(data){ return data.data});
      };
    
      return {
        getUser: getUser,
        getUsers: getUsers,
        addUser: addUser,
        deleteUser: deleteUser,
        getConnectedUser: getConnectedUser,
      }

  })


  .service('BackandMatches', function ($http, Backand) {

      var baseUrl = '/1/objects/';
      var objectName = 'matches/';
    
      function getUrl() {
        return Backand.getApiUrl() + baseUrl + objectName;
      }
    
      function getUrlForId(id) {
        return getUrl() + id;
      }

      getMatch = function (id) {
        return $http ({
          method: 'GET',
          url: getUrlForId(id),
          params: {
            filter: null,
            relatedObjects: true,
            deep: true
          }
        }).then(function(data){

          return data.data;
        });
      };
    
      getMatches = function () {

        return $http ({
          method: 'GET',
          url: getUrl(),
          params: {
            pageSize: 30,
            pageNumber: 1,
            filter: null,
            sort: [{"fieldName": "date",  "order": "asc" }],
            relatedObjects: true,
            deep: true
          }
        }).then(function(data){
          return data.data;
        });
      };
    
      addMatch = function(match) {
        return $http.post(getUrl(), match);
      }
    
      deleteMatch = function (id) {
        return $http.delete(getUrlForId(id));
      };
        
      return {
        getMatch: getMatch,
        getMatches: getMatches,
        addMatch: addMatch,
        deleteMatch: deleteMatch
      }
  })


  .service('BackandTeams', function ($http, Backand) {

      var baseUrl = '/1/objects/';
      var objectName = 'teams/';
    
      function getUrl() {
        return Backand.getApiUrl() + baseUrl + objectName;
      }
    
      function getUrlForId(id) {
        return getUrl() + id;
      }

      getTeam = function (id) {
        return $http ({
          method: 'GET',
          url: getUrlForId(id),
          params: {
            filter: null,
            relatedObjects: true,
            deep: true
          }
        }).then(function(data){

          return data.data;
        });
      };
    
      getTeams = function () {

        return $http ({
          method: 'GET',
          url: getUrl(),
          params: {
            pageSize: 30,
            pageNumber: 1,
            filter: null,
            sort: [{"fieldName": "points",  "order": "desc" }, {"fieldName": "goalDiff",  "order": "desc" }, {"fieldName": "name",  "order": "asc" }],
            relatedObjects: true,
            deep: true
          }
        }).then(function(data){
          return data.data;
        });
      };
    
      addTeam = function(team) {
        return $http.post(getUrl(), match);
      }


      updateTeam = function (id, options) {
        return $http ({
          method: 'PUT',
          url: getUrlForId(id),
          params: {
            returnObject : true
          },
          data: options
        })
      };
    
      deleteTeam = function (id) {
        return $http.delete(getUrlForId(id));
      };
        
      return {
        getTeam: getTeam,
        getTeams: getTeams,
        addTeam: addTeam,
        updateTeam: updateTeam,
        deleteTeam: deleteTeam
      }
  })



  .service('AuthService', function($q, $http, USER_ROLES, Backand) {
    var LOCAL_TOKEN_KEY = 'user';
    var username = '';
    var isAuthenticated = false;
    var role = '';
    var authToken;
  
    function loadUserCredentials() {
      var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
      if (token) {
        useCredentials(token);
      }
    }
  
    function storeUserCredentials(token) {
      window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
      useCredentials(token);
    }
  
    function useCredentials(token) {
      username = token.split('.')[0];
      isAuthenticated = true;
      authToken = token;
  
      if (username == 'admin') {
        role = USER_ROLES.admin
      }
      if (username == 'user') {
        role = USER_ROLES.public
      }
  
      // Set the token as header for your requests!
      $http.defaults.headers.common['X-Auth-Token'] = token;
    }
  
    function destroyUserCredentials() {
      authToken = undefined;
      username = '';
      isAuthenticated = false;
      $http.defaults.headers.common['X-Auth-Token'] = undefined;
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    }
  
    var login = function(name, pw) {
      return $q(function(resolve, reject) {
        if ((name && pw)) {
          // Make a request and receive your auth token from your server
          storeUserCredentials(name);
          resolve('Login success.');
        } else {
          reject('Login Failed.');
        }
      });
    };
  
    var logout = function() {
      destroyUserCredentials();
    };
  
    var isAuthorized = function(authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
    };
  
    loadUserCredentials();
  
    return {
      login: login,
      logout: logout,
      isAuthorized: isAuthorized,
      isAuthenticated: function() {return isAuthenticated;},
      username: function() {return username;},
      role: function() {return role;}
    };
})

.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized
      }[response.status], response);
      return $q.reject(response);
    }
  };
})
 
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
});

