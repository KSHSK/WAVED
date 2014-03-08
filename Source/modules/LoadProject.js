/*global define*/
/**
 * A module for loading an existing project.
 */
define([
        './UnsavedChanges',
        './ReadData',
        'models/ProjectViewModel',
        'util/updateQueryByName',
        'jquery'
    ], function(
        UnsavedChangesModule,
        ReadData,
        ProjectViewModel,
        updateQueryByName,
        $) {
    'use strict';

    var LoadProject = {

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
                        viewModel.projectList = data.projects;
                    }
                    else {
                        viewModel.loadProjectName.error = true;
                        viewModel.loadProjectName.message = data.errorMessage;
                    }
                }
            }).promise();
        },

        /**
         * Open the dialog for loading an existing project.
         */
        openLoadProjectDialog: function(projectLoaded, viewModel) {
            var loadProjectDialog = $('#load-project-dialog');
            var self = this;
            viewModel.loadProjectName._value = '';
            viewModel.loadProjectName.message = '';

            loadProjectDialog.dialog({
                resizable: false,
                height: 250,
                width: 400,
                modal: true,
                buttons: {
                    'Load Project': {
                        text: 'Load Project',
                        'class': 'submit-button',
                        click: function() {
                            var projectName = viewModel.loadProjectName.value;
                            self.loadProject(projectLoaded, projectName, viewModel);
                            $.when(projectLoaded).done(function() {
                                loadProjectDialog.dialog('close');
                            });
                        }
                    },
                    'Cancel': function() {
                        loadProjectDialog.dialog('close');
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
                        // Set the project name.
                        viewModel.currentProject = new ProjectViewModel(JSON.parse(data.projectState),
                            viewModel.availableWidgets);
                        viewModel.dirty = false;
                        viewModel.loadProjectName._value = '';

                        // Set the URL to include the current project name.
                        updateQueryByName('project', data.projectName);

                        // Read the contents of all data files.
                        $.each(viewModel.currentProject.dataSets, function(index, dataSet) {
                            // Read file contents for the DataSet.
                            ReadData.readData(dataSet);

                            // TODO: How should DataSubsets be handled?
                        });

                        // TODO: Remove files that are marked for deletion.

                        projectLoaded.resolve();
                    }
                    else {
                        viewModel.loadProjectName.error = true;
                        viewModel.loadProjectName.message = data.errorMessage;
                        projectLoaded.reject();
                    }
                }
            });
        }
    };

    return LoadProject;
});