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
                height: 220,
                width: 350,
                modal: true,
                buttons: {
                    'Delete Project': function() {
                        self.deleteProject(projectDeleted, viewModel);
                        $.when(projectDeleted).done(function() {
                            deleteProjectDialog.dialog('close');
                        });
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

                    if (!data.success) {
                        // Display error to user.
                        $('#delete-project-dialog .error').html(data.errorMessage);
                        return;
                    }

                    // Clear the workspace.
                    $('#waved-workspace').empty();

                    viewModel.currentProject.resetProject();
                    viewModel.dirty = false;

                    // Remove project name from URL
                    updateQueryByName('project', '');

                    // Open welcome dialog
                    Welcome.openWelcomeDialog(viewModel);
                    projectDeleted.resolve();
                }
            });
        }
    };

    return DeleteProject;
});