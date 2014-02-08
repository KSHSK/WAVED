/**
 * Create the WAVED Controller and add it to the controllers module.
 */
define([
        './module',
        '../modules/Welcome',
        '../modules/NewProject',
        'jquery'
    ], function(
        controllers, 
        WelcomeModule, 
        NewProjectModule,
        $) {
    
    controllers.controller('WAVEDCtrl', function ($scope) {
    
        $scope.widgets = [];
        $scope.projectName = "";
    
        $scope.selectedWidgetChanged = function() {
            console.log('Selected Widget: ' + $scope.selectedWidget.name);
        };

        WelcomeModule.openWelcomeDialog();
        $scope.tryToCreateNewProject = function() {
            NewProjectModule.tryToCreateNewProject();
        };
    });
});