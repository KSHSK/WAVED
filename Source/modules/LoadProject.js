/**
 * A module for loading an existing project.
 */
define([
        'jquery',
        './UnsavedChanges',
        './ReadData',
        './DeleteData',
        './SaveProject',
        './UniqueTracker',
        'models/ProjectViewModel'
    ], function(
        $,
        UnsavedChanges,
        ReadData,
        DeleteData,
        SaveProject,
        UniqueTracker,
        ProjectViewModel) {
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
                UnsavedChanges.handleUnsavedChanges(projectClean);
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
                        // Clear the workspace.
                        $('#waved-workspace').empty();

                        // Update the data folder path.
                        ReadData.dataFolderPath = data.dataFolder;

                        UniqueTracker.reset();

                        // Create the new project.
                        viewModel.currentProject.setState(JSON.parse(data.projectState),
                            viewModel.availableWidgets);

                        viewModel.resetHistory();

                        viewModel.loadProjectName._value = '';
                        viewModel.selectedComponent = viewModel.workspace;

                        // Delete marked data.
                        var filesDeleted = DeleteData.deleteAllMarkedData(viewModel);

                        $.when(filesDeleted).done(function() {
                            // Save the project if some files were deleted.
                            var projectSaved = $.Deferred();
                            SaveProject.saveProject(projectSaved, viewModel);
                        });

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