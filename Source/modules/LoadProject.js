/*global define*/
/**
 * A module for loading an existing project.
 */
define([
        '../modules/UnsavedChanges',
        '../models/ProjectViewModel',
        'util/updateQueryByName',
        'jquery'
    ], function(
        UnsavedChangesModule,
        ProjectViewModel,
        updateQueryByName,
        $) {
    'use strict';

    var LoadProject = {
        /* TODO: validation */
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

            if (viewModel.dirty === true) {
                UnsavedChangesModule.handleUnsavedChanges(projectClean);
            }
            else {
                // Project is already clean.
                projectClean.resolve();
            }

            var projectLoaded = $.Deferred();
            $.when(projectClean).done(function() {
                var projectListLoaded = self.updateProjectList(viewModel);
                $.when(projectListLoaded).done(function() {
                    self.openLoadProjectDialog(projectLoaded, viewModel);
                });
            });

            return projectLoaded.promise();
        },

        /**
         * Updates the list of projects displayed in the dialog.
         */
        updateProjectList: function(viewModel) {
            var self = this;

            return $.ajax({
                type: 'POST',
                url: 'PHP/getExistingProjectNames.php',
                success: function(dataString) {
                    var data = JSON.parse(dataString);
                    if (data.success) {
                        self.loadProjectError.text('');
                        viewModel.projectList = data.projects;
                    }
                    else {
                        // Display error to user.
                        self.loadProjectError.text(data.errorMessage);
                    }
                }
            }).promise();
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
                            var projectName = viewModel.projectToLoad;
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
                        viewModel.currentProject = new ProjectViewModel({
                            name: data.projectName
                        });
                        viewModel.dirty = false;

                        // Set the URL to include the current project name.
                        updateQueryByName('project', data.projectName);

                        // TODO: Remove files that are marked for deletion.
                        // TODO: Read file contents for every DataSet in the state.

                        projectLoaded.resolve();
                    }
                    else {
                        // Display error to user.
                        self.loadProjectError.text(data.errorMessage);
                        projectLoaded.reject();
                    }
                }
            });
        }
    };

    return LoadProject;
});