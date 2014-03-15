/**
 * A module for deleting an existing project.
 */
define([
        '../WAVEDViewModel',
        './Welcome',
        'models/ProjectViewModel',
        'util/updateQueryByName',
        'jquery'
    ], function(
        WAVEDViewModel,
        Welcome,
        ProjectViewModel,
        updateQueryByName,
        $) {
    'use strict';

    var DeleteProject = {

        tryToDeleteProject: function(viewModel) {
            var projectDeleted = $.Deferred();
            this.openDeleteProjectDialog(projectDeleted, viewModel);

            return projectDeleted.promise();
        },

        /**
         * Open the dialog for deleting a project.
         */
        openDeleteProjectDialog: function(projectDeleted, viewModel) {
            var self = this;
            var deleteProjectDialog = $('#delete-project-dialog');
            deleteProjectDialog.find('.error').html('');

            deleteProjectDialog.dialog({
                resizable: false,
                height: 250,
                width: 400,
                modal: true,
                buttons: {
                    'Delete Project': {
                        text: 'Delete Project',
                        'class': 'submit-button',
                        click: function() {
                            self.deleteProject(projectDeleted, viewModel);
                            $.when(projectDeleted).done(function() {
                                deleteProjectDialog.dialog('close');
                            });
                        }
                    },
                    'Cancel': function() {
                        deleteProjectDialog.dialog('close');
                    }
                }
            });
        },

        /**
         * Actually submit the deleteProject request.
         */
        deleteProject: function(projectDeleted, viewModel) {
            var self = this;
            var projectName = viewModel.currentProject.name.trim();

            $.ajax({
                type: 'POST',
                url: 'PHP/deleteProject.php',
                data: {
                    'project': projectName
                },
                success: function(dataString) {
                    var data = JSON.parse(dataString);

                    if (data.success) {
                        // Clear the workspace.
                        $('#waved-workspace').empty();
                        viewModel.currentProject = new ProjectViewModel({
                            name: ''
                        }, viewModel.availableWidgets);

                        // Remove project name from URL
                        updateQueryByName('project', '');

                        // Open welcome dialog
                        Welcome.openWelcomeDialog(viewModel);
                        projectDeleted.resolve();
                    }
                    else {
                        // Display error to user.
                        $('#delete-project-dialog .error').html(data.errorMessage);
                    }
                }
            });
        }
    };

    return DeleteProject;
});