/**
 * Create the WAVED Controller and add it to the controllers module.
 */
define([
        './module',
        '../modules/Welcome',
        '../modules/NewProject',
        '../modules/GoogleAnalytics',
        '../modules/LoadProject',
        'jquery'
    ], function(
        controllers, 
        WelcomeModule, 
        NewProjectModule,
        GoogleAnalyticsModule, 
        LoadProjectModule,
        $) {
    
    controllers.controller('WAVEDCtrl', function ($scope) {
    
        $scope.widgets = [];
        $scope.projectName = "";
        $scope.projectList = [];
        
        $scope.selectedWidgetChanged = function() {
            console.log('Selected Widget: ' + $scope.selectedWidget.name);
        };
        
        $scope.tryToCreateNewProject = function() {
            NewProjectModule.tryToCreateNewProject();
        };
        
        $scope.addGoogleAnalytics = function() {
            GoogleAnalyticsModule.addGoogleAnalytics();
        };
        
        $scope.removeGoogleAnalytics = function() {
            GoogleAnalyticsModule.removeGoogleAnalytics();
        };
        
        $scope.clearGoogleAnalyticsFields = function() {
            GoogleAnalyticsModule.clearGoogleAnalyticsFields();
        };

        $scope.tryToLoadProject = function() {
            LoadProjectModule.tryToLoadProject();
        };
        
        $scope.updateProjectList = function() {
            LoadProjectModule.updateProjectList();
        };

    });
});