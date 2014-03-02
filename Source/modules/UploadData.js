/*global define*/
/**
 * A module for uploading data to the server
 */
define([
        'WavedViewModel',
        'modules/SaveProject',
        'models/Data/DataSet',
        'jquery'
    ], function(
        WAVEDViewModel,
        SaveProject,
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
            var datasetName = this.uploadDataNameInput.val().trim();
            this.uploadDataNameInput.val(datasetName);

            var form = new FormData();
            var file = self.uploadDataFileInput[0].files[0];
            if (file === undefined) {
                // TODO Handle when validation and error displaying is implemented.
                return;
            }

            form.append("file", file);
            form.append("projectName", viewModel.currentProject.name);

            $.ajax({
                type : "POST",
                url : "PHP/uploadDataFile.php",
                data : form,
                processData : false,
                contentType : false,
                success : function(dataString) {
                    var data = JSON.parse(dataString);
                    if (data.success) {
                        var options = {
                            name: datasetName,
                            filename: data.filePath,
                            referenceCount: 0
                        };

                        var dataset = new DataSet(options);
                        viewModel.currentProject.addDataSet(dataset);

                        // TODO: Make sure this works once SaveProject is implemented.
                        SaveProject.saveProject(viewModel.currentProject.name, viewModel);

                        dataUploaded.resolve();
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