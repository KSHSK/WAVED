/*global define*/
/**
 * A module for saving a project.
 */
define([
        '../WAVEDViewModel',
        'jquery'
    ], function(
        WAVEDViewModel,
        $) {
    'use strict';

    var SaveProject = {

        tryToSaveProject: function(viewModel){
            // TODO
        },

        openSaveProjectDialog: function(viewModel){
            // TODO
        },

        saveProject: function(projectSaved, projectName, viewModel){
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

                        // TODO: Clear error for Save As popup.

                        projectSaved.resolve();
                    }
                    else {
                        // Display error to user.
                        // TODO: Display error for Save As popup.

                        projectSaved.reject();
                    }
                }
            });
        }
    };

    return SaveProject;
});