/**
 * A module for uploading data to the server
 */
define([
        'jquery',
        'WAVEDViewModel',
        'modules/SaveProject',
        'models/Data/DataSet',
        'util/displayMessage'
    ], function(
        $,
        WAVEDViewModel,
        SaveProject,
        DataSet,
        displayMessage) {
    'use strict';

    var UploadData = {
        uploadDataDialog: $('#upload-data-dialog'),
        uploadDataFileInput: $('#upload-data-file'),

        tryToUploadData: function(viewModel){
            var dataUploaded = $.Deferred();
            this.openUploadDataDialog(dataUploaded, viewModel);
            return dataUploaded.promise();
        },

        openUploadDataDialog: function(dataUploaded, viewModel){
            var self = this;

            // Clear the inputs and errors.
            viewModel.uploadDataName.reset();
            viewModel.uploadDataFile.reset();
            self.uploadDataFileInput.val('');

            self.uploadDataDialog.dialog({
                resizable: false,
                height: 250,
                width: 400,
                modal: true,
                buttons: {
                    'Upload': {
                        text: 'Upload',
                        'class': 'submit-button',
                        click: function() {
                            if (viewModel.uploadDataName.error || viewModel.uploadDataFile.error) {
                                viewModel.uploadDataName.message = viewModel.uploadDataName.errorMessage;
                                viewModel.uploadDataFile.message = viewModel.uploadDataFile.errorMessage;
                                return;
                            }

                            self.uploadData(dataUploaded, viewModel);

                            $.when(dataUploaded).done(function() {
                                self.uploadDataDialog.dialog('close');
                            });
                        }
                    },
                    'Cancel': function() {
                        self.uploadDataDialog.dialog('close');
                    }
                }
            });
        },

        uploadData: function(dataUploaded, viewModel){
            var self = this;

            // Don't allow leading or trailing white space.
            viewModel.uploadDataName.value = viewModel.uploadDataName.value.trim();
            var dataSetName = viewModel.uploadDataName.value;

            var form = new FormData();
            var file = self.uploadDataFileInput[0].files[0];
            if (file === undefined) {
                // Just a precaution, but should never be called.
                displayMessage('No file has been selected');
                return;
            }

            form.append('file', file);
            form.append('project', viewModel.currentProject.name);

            $.ajax({
                type : 'POST',
                url : 'PHP/uploadDataFile.php',
                data : form,
                processData : false,
                contentType : false,
                success : function(dataString) {
                    var data = JSON.parse(dataString);
                    if (data.success) {
                        var options = {
                            name: dataSetName,
                            filename: data.filename,
                            referenceCount: 0
                        };

                        // Create the DataSet.
                        var dataSet = new DataSet(options);
                        viewModel.currentProject.addDataSet(dataSet);

                        var projectSaved = $.Deferred();

                        // Automatically save the project to avoid inconsistencies with state and the file system.
                        SaveProject.saveProject(projectSaved, viewModel.currentProject.name, viewModel);

                        $.when(projectSaved).done(function() {
                            dataUploaded.resolve();
                        });
                    }
                    else {
                        // Display error to user.
                        displayMessage(data.errorMessage);
                    }
                }

            });
        }
    };

    return UploadData;
});