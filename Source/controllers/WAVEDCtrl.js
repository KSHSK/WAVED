/**
 * Create the WAVED Controller and add it to the controllers module.
 */
define([
        './module',
        '../modules/Welcome',
        '../modules/NewProject',
        '../modules/GoogleAnalytics',
        'jquery'
    ], function(
        controllers, 
        WelcomeModule, 
        NewProjectModule,
        GoogleAnalyticsModule, 
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
        
        $scope.addGoogleAnalytics = function() {
            GoogleAnalyticsModule.addGoogleAnalytics();
        };
        
        $scope.removeGoogleAnalytics = function() {
            GoogleAnalyticsModule.removeGoogleAnalytics();
        };
        
        $scope.clearGoogleAnalyticsFields = function() {
            GoogleAnalyticsModule.clearGoogleAnalyticsFields();
        };
    });
});