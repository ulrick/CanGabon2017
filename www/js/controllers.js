angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $state, $ionicPopup, AuthService, BackandUserAuthService, AUTH_EVENTS) {
  
  /*$scope.username = AuthService.username();
 
  $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
    var alertPopup = $ionicPopup.alert({
      title: 'Unauthorized!',
      template: 'You are not allowed to access this resource.'
    });
  });
 
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('login');
    var alertPopup = $ionicPopup.alert({
      title: 'Session Lost!',
      template: 'Sorry, You have to login again.'
    });
  });*/

  $scope.data = {};
 
  $scope.login = function(data) {

    BackandUserAuthService.getConnectedUser(data.username, data.password)
      .then(function (result) {
        console.log("les results ", result);
        if(result.data.length == 1){
          AuthService.login(data.username, data.password).then(function(authenticated) {
            //console.log(authenticated);
            $state.go('main.admin', {}, {reload: true});
            $scope.setCurrentUsername(data.username);
          }, function(err) {
            var alertPopup = $ionicPopup.alert({
              title: 'Connection échouée',
              template: 'Veuillez réessayer!'
            });
          });
        }else{
          console.log("login pas correct!")
          var alertPopup = $ionicPopup.alert({
            title: 'Connection échouée',
            template: 'Ce utilisateur n\'existe pas.'
          });
        }
    });

  };

  $scope.setCurrentUsername = function(name) {
    $scope.username = name;
  };

})

.controller('MatchCalendarCtrl', function($scope, $rootScope, $state, $http, $ionicPopup, AuthService, BackandMatches, CordovaNetwork, Notification, $timeout) {
    
    $scope.loader = false;
    //console.log(CordovaNetwork.getStatus());
    if (!CordovaNetwork.isOnline()) {
        Notification.error({message: 'La connexion à Internet a été perdue.', delay:4000});
        return;
    }

    $scope.logout = function() {
      AuthService.logout();
      $state.go('login');
    };

    $scope.username = AuthService.username();

    $scope.matches = [];

    BackandMatches.getMatches().then(function(data){
      $scope.loader = true;
      $timeout(function(){$scope.loader = false}, 1000);
      //clearTimeout(loadSpinner);
      //console.log("les matchs ",data.data[0].__metadata.descriptives.team1.label);
      //console.log("les matchs ",data.data);
      var matchs = data.data;
      var teams = data.relatedObjects;
      
      var matches = [];
      var indexedMatches = [];

      angular.forEach(matchs, function(match) {
        
          match.id = parseInt(match.id);
          var team1Id = parseInt(match.team1);
          var team2Id = parseInt(match.team2);
          var team1 = teams.teams[team1Id];
          var team2 = teams.teams[team2Id];
          //console.log("detail me ", match);
          //console.log("teams  ", teams);
          
          match.team1 = team1.name;
          match.team2 = team2.name;
          match.scoreTeam1 = match.scoreTeam1;
          match.scoreTeam2 = match.scoreTeam2;
          match.dateDay = moment(match.date).format("LL"); // Convert iso8601 "YYYY-MM-DDTHH:MM:SS" datetime to date "01 jan 2017" format
          match.dateHour = moment(match.date).format("LT"); // Convert iso8601 "YYYY-MM-DDTHH:MM:SS" datetime to hour "HH:MM" format
          match.team1Icon = team1.icon;
          match.team2Icon = team2.icon;
          match.group = team1.group;
          //})  
      });
      
      $scope.matches = matchs;
  
      $scope.matchesToFilter = function() {
          indexedMatches = [];
          return $scope.matches;
      }

      // Filter matches per day
      $scope.filterMatches = function(match) {
          var matchIsNew = indexedMatches.indexOf(match.dateDay) == -1;
          if (matchIsNew) {
              indexedMatches.push(match.dateDay);
          }
          return matchIsNew;
      }
    }); 
   

    $scope.doRefresh = function() {

      if (!CordovaNetwork.isOnline()) {
          Notification.error({message: 'Verifier votre connexion internet.', delay:4000});
          return;
      }

        BackandMatches.getMatches().then(function(data){
          $scope.loader = true;
          loadSpinner = $timeout(function(){$scope.loader = false}, 1000);
          //console.log("les matchs ",data.data[0].__metadata.descriptives.team1.label);
          //console.log("les matchs ",data.data);
          var matchs = data.data;
          var teams = data.relatedObjects;
          var matches = [];
          var indexedMatches = [];
          
          angular.forEach(matchs, function(match) {
              match.id = parseInt(match.id);
              var team1Id = parseInt(match.team1);
              var team2Id = parseInt(match.team2);
              var team1 = teams.teams[team1Id];
              var team2 = teams.teams[team2Id];
              match.team1 = team1.name;
              match.team2 = team2.name;
              match.scoreTeam1 = match.scoreTeam1;
              match.scoreTeam2 = match.scoreTeam2;
              match.dateDay = moment(match.date).format("LL"); // Convert iso8601 "YYYY-MM-DDTHH:MM:SS" datetime to date "01 jan 2017" format
              match.dateHour = moment(match.date).format("LT"); // Convert iso8601 "YYYY-MM-DDTHH:MM:SS" datetime to hour "HH:MM" format
              match.team1Icon = team1.icon;
              match.team2Icon = team2.icon;
              match.group = team1.group;
          });
          $scope.matches = matchs;
      
          $scope.matchesToFilter = function() {
              indexedMatches = [];
              return $scope.matches;
          }

          // Filter matches per day
          $scope.filterMatches = function(match) {
              var matchIsNew = indexedMatches.indexOf(match.dateDay) == -1;
              if (matchIsNew) {
                  indexedMatches.push(match.dateDay);
              }
              return matchIsNew;
          }
          //console.log("les matchs filtrés ", $scope.matches);
        });
        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');
    }
    
    $scope.getTeamPoule = function(match){
      return match.group;
    }
})


// Match classement
.controller('TeamsRankCtrl', function($scope, BackandTeams, LoaderService, $timeout, BackandMatches, BackandUserAuthService, $q, CordovaNetwork) {

    $scope.loader = false;
    $scope.teams = [];
    
    var filteredTeamsA = [];
    var filteredTeamsB = [];
    var filteredTeamsC = [];
    var filteredTeamsD = [];

    if (!CordovaNetwork.isOnline()) {
        Notification.error({message: 'La connexion à Internet a été perdue.', delay:4000});
        return;
    }

    BackandTeams.getTeams().then(function(data){
      var teams = data.data;


      var updatedTeams = [];

      $scope.loader = true;
      $timeout(function(){$scope.loader = false}, 2000);

      angular.forEach(teams, function(team) {
        var promise = getPlayedMatches();
        promise.then(function(matchsPlayed){
          
          // Parcourons les matchs joués et determinons combien de fois une équipe apparait dans la liste des matchs joués
          var matchPlay = 0, matchWin = 0, matchNull = 0, matchLost = 0, points = 0, goalAgainst = 0, goalFor = 0, goalDiff = 0;
          angular.forEach(matchsPlayed, function(matchPlayed) {
            // Si je retrouve la team encours
            if(matchPlayed.team1.id == team.id || matchPlayed.team2.id == team.id){
              matchPlay++;
              if(matchPlayed.scoreTeam1 == matchPlayed.scoreTeam2){
                  matchNull++;
                  points++;
              }
              else{
                if((team.id == matchPlayed.team1.id && matchPlayed.scoreTeam1 < matchPlayed.scoreTeam2)
                || (team.id == matchPlayed.team2.id && matchPlayed.scoreTeam2 < matchPlayed.scoreTeam1)){
                  matchLost++;
                  points += 0;
                }
                else{
                  matchWin++;
                  points+=3;
                }
              }
              goalAgainst += (matchPlayed.team1.id == team.id)? matchPlayed.scoreTeam2 : matchPlayed.scoreTeam1;
              goalFor += (matchPlayed.team2.id == team.id)? matchPlayed.scoreTeam2 : matchPlayed.scoreTeam1;
            }
            
          })
          team.matchPlayed = matchPlay;
          team.matchWin = matchWin;
          team.matchNull = matchNull;
          team.matchLost = matchLost;
          team.goalFor = goalFor;
          team.goalAgainst = goalAgainst;
          team.goalDiff = goalFor - goalAgainst;
          team.points = points;

        })

        updatedTeams.push(team);

      })
      
      //console.log($scope.teams);
      $scope.teams = updatedTeams;

      $scope.filteredTeamsA = _.filter($scope.teams, function(teamGroup){

        return teamGroup.group == 'A';
      });
      $scope.filteredTeamsB = _.filter($scope.teams, function(teamGroup){
        
        return teamGroup.group == 'B';
      });
      $scope.filteredTeamsC = _.filter($scope.teams, function(teamGroup){
        
        return teamGroup.group == 'C';
      });
      $scope.filteredTeamsD = _.filter($scope.teams, function(teamGroup){

        return teamGroup.group == 'D';
      });
      //console.log("group ", $scope.filteredTeamsA);

    });

    // Refresh page
    $scope.doRefresh = function() {
      
        BackandTeams.getTeams().then(function(data){
          var teams = data.data;
          var updatedTeams = [];

          $scope.loader = true;
          $timeout(function(){$scope.loader = false}, 1000);


          angular.forEach(teams, function(team) {
              var promise = getPlayedMatches();
              promise.then(function(matchsPlayed){
                
                // Parcourons les matchs joués et determinons combien de fois une équipe apparait dans la liste des matchs joués
                var matchPlay = 0, matchWin = 0, matchNull = 0, matchLost = 0, points = 0, goalAgainst = 0, goalFor = 0, goalDiff = 0;
                angular.forEach(matchsPlayed, function(matchPlayed) {
                  // Si je retrouve la team encours
                  if(matchPlayed.team1.id == team.id || matchPlayed.team2.id == team.id){
                    matchPlay++;
                    if(matchPlayed.scoreTeam1 == matchPlayed.scoreTeam2){
                        matchNull++;
                        points++;
                    }
                    else{
                      if((team.id == matchPlayed.team1.id && matchPlayed.scoreTeam1 < matchPlayed.scoreTeam2)
                      || (team.id == matchPlayed.team2.id && matchPlayed.scoreTeam2 < matchPlayed.scoreTeam1)){
                        matchLost++;
                        points += 0;
                      }
                      else{
                        matchWin++;
                        points+=3;
                      }
                    }
                    goalAgainst += (matchPlayed.team1.id == team.id)? matchPlayed.scoreTeam2 : matchPlayed.scoreTeam1;
                    goalFor += (matchPlayed.team2.id == team.id)? matchPlayed.scoreTeam2 : matchPlayed.scoreTeam1;
                  }
                  
                })
                team.matchPlayed = matchPlay;
                team.matchWin = matchWin;
                team.matchNull = matchNull;
                team.matchLost = matchLost;
                team.goalFor = goalFor;
                team.goalAgainst = goalAgainst;
                team.goalDiff = goalFor - goalAgainst;
                team.points = points;

              })

              updatedTeams.push(team);

                  //resetAll(team);
                  //resetAll(team2);

                  //BackandTeams.updateTeam(team1.id, team1);
                  //BackandTeams.updateTeam(team.id, team);
            })

          
          //console.log($scope.teams);
          $scope.teams = updatedTeams;

          $scope.filteredTeamsA = _.filter($scope.teams, function(teamGroup){

            return teamGroup.group == 'A';
          });
          $scope.filteredTeamsB = _.filter($scope.teams, function(teamGroup){
          
            return teamGroup.group == 'B';
          });
          $scope.filteredTeamsC = _.filter($scope.teams, function(teamGroup){
          
            return teamGroup.group == 'C';
          });
          $scope.filteredTeamsD = _.filter($scope.teams, function(teamGroup){
      
            return teamGroup.group == 'D';
          });
          //Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        });
    }


    function getPlayedMatches(){

      var deferred = $q.defer();
      var matchesPlayed = [];

      return BackandMatches.getMatches().then(function(data){   
        var team1 = {}, team2 = {};
        var matchs = data.data;
        var teams = data.relatedObjects.teams;
        if(matchs){
          //console.log(matchs);
          angular.forEach(matchs, function(match) {
            if(match.isPlayed){
              var matchData = {};
              var team1_Id = parseInt(match.team1);
              var team2_Id = parseInt(match.team2);
              team1 = teams[team1_Id];
              team2 = teams[team2_Id];
          
              matchData.id = match.id;
              matchData.scoreTeam1 = match.scoreTeam1;
              matchData.scoreTeam2 = match.scoreTeam2;
              matchData.team1 = team1;
              matchData.team2 = team2;
              matchesPlayed.push(matchData);
            }
          })  
          deferred.resolve(matchesPlayed);
        }
        else {
          deferred.reject("pas de données");
        }
        return deferred.promise;
      });
    }
    

    var resetAll = function(team){ 
        team.score = 0;
        team.matchPlayed = 0;
        team.matchWin = 0;
        team.matchNull = 0;
        team.matchLost = 0;
        team.goalFor = 0;
        team.goalAgainst = 0;
        team.goalDiff = 0;
        team.points = 0;

        return team
    }

})

/*
.controller('PrognosticatorsCtrl', function($scope, PrognosisService) {
    
})*/
