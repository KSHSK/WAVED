/**
 * A module for saving a project.
 */
define([
        'jquery',
        './ReadData',
        'models/Constants/MessageType',
        'util/displayMessage'
    ], function(
        $,
        ReadData,
        MessageType,
        displayMessage) {
    'use strict';

    var SaveProject = {

        tryToSaveProjectAs: function(viewModel) {
            var projectSaved = $.Deferred();
            this.openSaveProjectAsDialog(projectSaved, viewModel);
            return projectSaved.promise();
        },

        openSaveProjectAsDialog: function(projectSaved, viewModel) {
            var self = this;
            var saveProjectAsDialog = $('#save-project-as-dialog');
            viewModel.saveProjectAsName.reset();

            saveProjectAsDialog.dialog({
                resizable: false,
                height: 250,
                width: 400,
                modal: true,
                buttons: {
                    'Save': function() {
                        if (!viewModel.saveProjectAsName.error) {
                            self.saveProjectAs(projectSaved, viewModel);
                            $.when(projectSaved).done(function() {
                                saveProjectAsDialog.dialog('close');
                            });
                        }
                        else {
                            viewModel.saveProjectAsName.message = viewModel.saveProjectAsName.errorMessage;
                        }
                    },
                    'Cancel': function() {
                        saveProjectAsDialog.dialog('close');
                    }
                }
            });
        },

        saveProject: function(projectSaved, viewModel) {
            var self = this;
            var projectName = viewModel.currentProject.name;
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
                        displayMessage('The project was successfully saved', MessageType.SUCCESS);
                        projectSaved.resolve();
                        viewModel.setSaveIndex();
                    }
                    else {
                        // Display error to user.
                        displayMessage(data.errorMessage, MessageType.ERROR);
                    }
                }
            });
        },

        saveProjectAs: function(projectSaved, viewModel) {
            var oldProjectName = viewModel.currentProject.name;
            var projectName = viewModel.saveProjectAsName.value;

            var stateObj = viewModel.currentProject.getState();
            stateObj.name = projectName;

            $.ajax({
                type: 'POST',
                url: 'PHP/saveProjectAs.php',
                data: {
                    'project': projectName,
                    'oldProject': oldProjectName,
                    'state': JSON.stringify(stateObj)
                },
                success: function(dataString) {
                    var data = JSON.parse(dataString);
                    if (data.success) {
                        // Update the data folder path.
                        ReadData.dataFolderPath = data.dataFolder;

                        // Set the project name since the name has changed.
                        viewModel.currentProject.name = data.projectName;

                        displayMessage('The project was successfully saved', MessageType.SUCCESS);
                        projectSaved.resolve();
                        viewModel.setSaveIndex();
                    }
                    else {
                        // Display error to user.
                        displayMessage(data.errorMessage, MessageType.ERROR);
                    }
                }
            });
        }
    };

    return SaveProject;
});