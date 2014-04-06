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

        tryToDeleteProject: function(viewModel, projectName, doCleanUp) {
            /* Try to delete current project by default */
            if (projectName === undefined)
            {
                projectName = viewModel.currentProject.name.trim();
            }

            /* Do clean up of open project and Open Welcome Dialog by default */
            if (doCleanUp === undefined)
            {
                doCleanUp = true;
            }

            var projectDeleted = $.Deferred();
            this.openDeleteProjectDialog(projectDeleted, projectName, viewModel, doCleanUp);

            return projectDeleted.promise();
        },

        /**
         * Open the dialog for deleting a project.
         */
        openDeleteProjectDialog: function(projectDeleted, projectName, viewModel, doCleanUp) {
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
                        self.deleteProject(projectDeleted, projectName, viewModel);
                        $.when(projectDeleted).done(function() {
                            if (doCleanUp) {
                                // Clear the workspace.
                                $('#waved-workspace').empty();

                                // TODO : Clean up leftovers from deleted project

                                // Remove project name from URL
                                updateQueryByName('project', '');

                                // Open welcome dialog
                                Welcome.openWelcomeDialog(viewModel);
                            }

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
        deleteProject: function(projectDeleted, projectName, viewModel) {
            var self = this;

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

                    projectDeleted.resolve();
                }
            });
        }
    };

    return DeleteProject;
});
