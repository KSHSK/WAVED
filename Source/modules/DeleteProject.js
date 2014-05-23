/**
 * A module for deleting an existing project.
 */
define([
        '../WAVEDViewModel',
        './Welcome',
        'models/ProjectViewModel',
        'util/defined',
        'util/updateQueryByName',
        'jquery'
    ], function(
        WAVEDViewModel,
        Welcome,
        ProjectViewModel,
        defined,
        updateQueryByName,
        $) {
    'use strict';

    var DeleteProject = {

        tryToDeleteProject: function(viewModel, projectName, doCleanUp) {
            /* Try to delete current project by default */
            if (!defined(projectName)) {
                projectName = viewModel.currentProject.name.trim();
            }

            /* Do clean up of open project and Open Welcome Dialog by default */
            if (!defined(doCleanUp)) {
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

            // Reset dialog text
            deleteProjectDialog.find('.error').empty();
            deleteProjectDialog.find('.content').text(projectName);

            deleteProjectDialog.dialog({
                title: 'Delete Project "' + projectName + '"',
                resizable: false,
                height: 220,
                width: 350,
                modal: true,
                buttons: {
                    'Delete Project': function() {
                        self.deleteProject(projectDeleted, projectName, viewModel, doCleanUp);
                        $.when(projectDeleted).done(function() {
                            deleteProjectDialog.dialog('close');
                        });
                    },
                    'Cancel': {
                        text: 'Cancel',
                        'class': 'cancel-button',
                        click: function() {
                            deleteProjectDialog.dialog('close');
                        }
                    }
                },
                open: function() {
                    // Select 'Cancel' by default.
                    $('.cancel-button', $(this).parent()).focus();
                }
            });
        },

        /**
         * Actually submit the deleteProject request.
         */
        deleteProject: function(projectDeleted, projectName, viewModel, doCleanUp) {
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

                    if (doCleanUp) {
                        viewModel.reset();

                        // Remove project name from URL
                        updateQueryByName('project', '');

                        // Open welcome dialog
                        Welcome.openWelcomeDialog(viewModel);
                    }

                    projectDeleted.resolve();
                }
            });
        }
    };

    return DeleteProject;
});
