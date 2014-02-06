/**
 * Create the WAVED Controller and add it to the controllers module.
 */
define([
        './module',
        '../NewProject',
        'jquery'
    ], function(
        controllers, 
        NewProjectModule, 
        $) {
    
    controllers.controller('WAVEDCtrl', function ($scope) {
    
        $scope.widgets = [];
        $scope.projectName = "";
    
        $scope.selectedWidgetChanged = function() {
            console.log('Selected Widget: ' + $scope.selectedWidget.name);
        };

        NewProjectModule.openWelcomeDialog();
        $scope.tryToCreateNewProject = function() {
            NewProjectModule.tryToCreateNewProject();
        };
    });
});