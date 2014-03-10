/*global define*/
/**
 * A module for uploading data to the server
 */
define([
        'WAVEDViewModel',
        'modules/SaveProject',
        'modules/ReadData',
        'models/Data/DataSet',
        'jquery'
    ], function(
        WAVEDViewModel,
        SaveProject,
        ReadData,
        DataSet,
        $) {
    'use strict';

    var UploadData = {
        uploadDataDialog: $('#upload-data-dialog'),
        uploadDataNameInput: $('#upload-data-name'),
        uploadDataNameError: $('#upload-data-name-error'),
        uploadDataFileInput: $('#upload-data-file'),
        uploadDataFileError: $('#upload-data-file-error'),

        tryToUploadData: function(viewModel){
            var dataUploaded = $.Deferred();
            this.openUploadDataDialog(dataUploaded, viewModel);
            return dataUploaded.promise();
        },

        openUploadDataDialog: function(dataUploaded, viewModel){
            var self = this;

            // Clear the inputs and errors.
            self.uploadDataNameInput.val('');
            self.uploadDataNameError.text('');
            self.uploadDataFileInput.val('');
            self.uploadDataFileError.text('');

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
            /* TODO: validation */

            var self = this;

            // Don't allow leading or trailing white space.
            var dataSetName = this.uploadDataNameInput.val().trim();
            this.uploadDataNameInput.val(dataSetName);

            // TODO Update/Remove condition when validation and error displaying is implemented.
            if (dataSetName.length === 0) {
                // TODO Handle when validation and error displaying is implemented.
                return;
            }

            var form = new FormData();
            var file = self.uploadDataFileInput[0].files[0];
            if (file === undefined) {
                // TODO Handle when validation and error displaying is implemented.
                return;
            }

            form.append('file', file);
            form.append('projectName', viewModel.currentProject.name);

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
                            filename: data.filePath,
                            referenceCount: 0
                        };

                        // Create the DataSet.
                        var dataSet = new DataSet(options);
                        viewModel.currentProject.addDataSet(dataSet);

                        var projectSaved = $.Deferred();

                        // Automatically save the project to avoid inconsistencies with state and the file system.
                        SaveProject.saveProject(projectSaved, viewModel.currentProject.name, viewModel);

                        // Read the contents of the data file.
                        ReadData.readData(dataSet);

                        $.when(projectSaved).done(function() {
                            dataUploaded.resolve();
                        });
                    }
                    else {
                        // Display error to user.
                        // TODO Handle when validation and error displaying is implemented.
                    }
                }

            });
        }
    };

    return UploadData;
});