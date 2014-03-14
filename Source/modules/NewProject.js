/**
 * A module for creating a new project.
 */
define([
        './UnsavedChanges',
        './ReadData',
        './SaveProject',
        'models/ProjectViewModel',
        'util/updateQueryByName',
        'jquery',
        'knockout'
    ], function(
        UnsavedChangesModule,
        ReadData,
        SaveProject,
        ProjectViewModel,
        updateQueryByName,
        $,
        ko) {
    'use strict';

    var NewProject = {
        /**
         * If the project is clean, the new project dialog is opened. If the project is dirty, the unsaved changes must
         * be handled before the new project dialog is opened.
         */
        tryToCreateNewProject: function(viewModel) {
            var self = this;
            var projectClean = $.Deferred();

            if (viewModel.dirty === true) {
                UnsavedChangesModule.handleUnsavedChanges(projectClean);
            }
            else {
                // Project is already clean.
                projectClean.resolve();
            }

            var projectCreated = $.Deferred();
            $.when(projectClean).done(function() {
                self.openCreateNewProjectDialog(projectCreated, viewModel);
            });

            return projectCreated.promise();
        },

        /**
         * Open the dialog for creating a new project.
         */
        openCreateNewProjectDialog: function(projectCreated, viewModel) {
            var self = this;
            var createNewProjectDialog = $('#create-new-project-dialog');
            viewModel.newProjectName.reset();

            createNewProjectDialog.dialog({
                resizable: false,
                height: 250,
                width: 400,
                modal: true,
                buttons: {
                    'Create Project': {
                        text: 'Create Project',
                        'class': 'submit-button',
                        click: function() {
                            var value = viewModel.newProjectName.value;

                            if (!viewModel.newProjectName.error) {
                                self.createNewProject(projectCreated, viewModel);
                                $.when(projectCreated).done(function() {
                                    createNewProjectDialog.dialog('close');
                                });
                            }
                            else {
                                viewModel.newProjectName.message = viewModel.newProjectName.errorMessage;
                            }
                        }
                    },
                    'Cancel': function() {
                        createNewProjectDialog.dialog('close');
                    }
                }
            });
        },

        /**
         * Actually submit the createProject request.
         */
        createNewProject: function(projectCreated, viewModel) {
            var self = this;
            // Don't allow leading or trailing white space.
            var projectName = viewModel.newProjectName.value.trim();

            $.ajax({
                type: 'POST',
                url: 'PHP/createProject.php',
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

                        viewModel.currentProject = new ProjectViewModel({
                            name: data.projectName
                        }, viewModel.availableWidgets);
                        viewModel.newProjectName._value = '';
                        viewModel.dirty = false;

                        // Set the URL to include the current project name.
                        updateQueryByName('project', data.projectName);

                        // Save state of new project.
                        var projectSaved = $.Deferred();
                        SaveProject.saveProject(projectSaved, viewModel.currentProject.name, viewModel);

                        projectCreated.resolve();
                    }
                    else {
                        // Display error to user.
                        viewModel.newProjectName.error = true;
                        viewModel.newProjectName.message = data.errorMessage;
                    }
                }
            });
        }
    };

    return NewProject;
});
