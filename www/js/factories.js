angular.module('starter.factories', [])

    /*** Loading Factory ***/
    .factory('LoaderService', function($ionicLoading, $document, $timeout) {
        return {
            show: function() { //code de la doc ionic
                // Show the loading overlay and text
                return $ionicLoading.show({
                    // intitulé
                    templateUrl: "../templates/loader.html",
                    // animation à prendre
                    animation: 'fade-in',
                    // l'overlay de fond
                    showBackdrop: true,
                    hideOnStateChange: true,
                    duration: 2000,
                    delay: 200
                });
            },
            hide: function() {
                return $ionicLoading.hide();
            }
        };
    })