/**
 * A module for saving a project.
 */
define([
        '../WAVEDViewModel',
        'util/displayMessage',
        'jquery'
    ], function(
        WAVEDViewModel,
        displayMessage,
        $) {
    'use strict';

    var SaveProject = {

        tryToSaveProject: function(viewModel) {
            // TODO
        },

        openSaveProjectDialog: function(viewModel) {
            // TODO
        },

        saveProject: function(projectSaved, projectName, viewModel) {
            var self = this;
            var stateObj = viewModel.currentProject.getState();

            $.ajax({
                type: 'POST',
                url: 'PHP/saveProject.php',
                data: {
                    'project': projectName,
                    'state': JSON.stringify(stateObj)
                },
                success: function(dataString) {
                    var data = JSON.parse(dataString);
                    if (data.success) {
                        // Set the project name in case this is a "Save As"
                        viewModel.currentProject.name = data.projectName;
                        viewModel.dirty = false;

                        displayMessage('The project was successfully saved');
                        projectSaved.resolve();
                    }
                    else {
                        // Display error to user.
                        displayMessage(data.errorMessage);
                        projectSaved.reject();
                    }
                }
            });
        }
    };

    return SaveProject;
});