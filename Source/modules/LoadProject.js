/*global define*/
/**
 * A module for loading an existing project.
 */
define([
        'angular',
        '../modules/UnsavedChanges',
        'jquery'
    ], function(
        angular,
        UnsavedChangesModule,
        $) {
    'use strict';

    var LoadProject = {
        loadProjectDialog: $('#load-project-dialog'),
        loadProjectSelect: $('#load-project-select'),
        loadProjectError: $('#load-project-error'),

        /**
         * If the project is clean, the load project dialog is opened. If the project is dirty, the unsaved changes must
         * be handled before the load project dialog is opened.
         */
        tryToLoadProject: function(viewModel) {
            var self = this;

            var projectClean = $.Deferred();

            if (viewModel.dirty) {
                UnsavedChangesModule.handleUnsavedChanges(projectClean);
            }
            else {
                // Project is already clean.
                projectClean.resolve();
            }

            var projectLoaded = $.Deferred();
            $.when(projectClean).done(function() {
                var projectListLoaded = self.updateProjectList();
                $.when(projectListLoaded).done(function() {
                    self.openLoadProjectDialog(projectLoaded, viewModel);
                });
            });

            return projectLoaded.promise();
        },

        /**
         * Updates the list of projects displayed in the dialog.
         */
        updateProjectList: function() {
            var self = this;

            return $.ajax({
                type: 'POST',
                url: 'PHP/getExistingProjectNames.php',
                success: function(dataString) {
                    var data = JSON.parse(dataString);
                    if (data.success) {
                        self.loadProjectError.text('');
                        self.setProjectList(data.projects);
                    }
                    else {
                        // Display error to user.
                        self.loadProjectError.text(data.errorMessage);
                    }
                }
            }).promise();
        },

        setProjectList: function(projects) {
            var scope = angular.element($('body')).scope();
            scope.$apply(function() {
                scope.projectList = projects;

                if (projects.length > 0) {
                    scope.selectedProjectToLoad = projects[0];
                }
            });
        },

        /**
         * Open the dialog for loading an existing project.
         */
        openLoadProjectDialog: function(projectLoaded, viewModel) {
            var self = this;

            this.loadProjectDialog.dialog({
                resizable: false,
                height: 250,
                width: 400,
                modal: true,
                buttons: {
                    'Load Project': {
                        text: 'Load Project',
                        'class': 'submit-button',
                        click: function() {
                            var scope = angular.element($('body')).scope();
                            var projectName = scope.selectedProjectToLoad;
                            self.loadProject(projectLoaded, projectName, viewModel);
                            $.when(projectLoaded).done(function() {
                                self.loadProjectDialog.dialog('close');
                            });
                        }
                    },
                    'Cancel': function() {
                        self.loadProjectDialog.dialog('close');
                    }
                }
            });
        },

        /**
         * Actually submit the load project request.
         */
        loadProject: function(projectLoaded, projectName, viewModel) {
            var self = this;

            $.ajax({
                type: 'POST',
                url: 'PHP/loadProject.php',
                data: {
                    'project': projectName
                },
                success: function(dataString) {
                    var data = JSON.parse(dataString);
                    if (data.success) {
                        self.loadProjectError.text('');

                        // Set the project name.
                        var scope = angular.element($('body')).scope();
                        scope.$apply(function() {
                            scope.projectName = data.projectName;
                        });

                        viewModel.dirty = false;
                        projectLoaded.resolve();
                    }
                    else {
                        // Display error to user.
                        self.loadProjectError.text(data.errorMessage);
                    }
                }
            });
        }
    };

    return LoadProject;
});