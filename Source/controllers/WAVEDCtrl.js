/**
 * Create the WAVED Controller and add it to the controllers module.
 */
define([
        './module',
        '../modules/Welcome',
        'jquery'
    ], function(
        controllers, 
        WelcomeModule, 
        $) {
    
    controllers.controller('WAVEDCtrl', function ($scope) {
    
        $scope.widgets = [];
        $scope.projectName = "";
    
        $scope.selectedWidgetChanged = function() {
            console.log('Selected Widget: ' + $scope.selectedWidget.name);
        };

        WelcomeModule.openWelcomeDialog();
        $scope.tryToCreateNewProject = function() {
            WelcomeModule.tryToCreateNewProject();
        };
    });
});