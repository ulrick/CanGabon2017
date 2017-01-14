angular.module('starter.directives', [])

    .directive("loaderSpinner", function(){
        return{
            restrict: 'A',
            templateUrl: "templates/loader.html"
        }
    });