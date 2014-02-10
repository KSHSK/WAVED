/*global define*/
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
    'use strict';

    controllers.controller('WAVEDCtrl', function($scope) {

        $scope.widgets = [];
        $scope.projectName = '';
        $scope.projectList = [];

        $scope.selectedWidgetChanged = function() {
            console.log('Selected Widget: ' + $scope.selectedWidget.name);
        };

        $scope.tryToCreateNewProject = function() {
            NewProjectModule.tryToCreateNewProject();
        };

        $scope.tryToLoadProject = function() {
            LoadProjectModule.tryToLoadProject();
        };

        $scope.updateProjectList = function() {
            LoadProjectModule.updateProjectList();
        };

    });
});