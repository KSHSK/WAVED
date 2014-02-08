/**
 * Create the WAVED Controller and add it to the controllers module.
 */
define([
        './module',
        '../modules/Welcome',
        '../modules/NewProject',
        '../modules/LoadProject',
        'jquery'
    ], function(
        controllers, 
        WelcomeModule, 
        NewProjectModule,
        LoadProjectModule,
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
        
        $scope.tryToLoadProject = function() {
            LoadProjectModule.tryToLoadProject();
        };

    });
});