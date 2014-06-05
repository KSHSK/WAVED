/**
 * A module for uploading data to the server
 */
define([
        'jquery',
        'WAVEDViewModel',
        './SaveProject',
        './UniqueTracker',
        'models/Constants/MessageType',
        'models/Data/DataSet',
        'util/displayMessage',
        'knockout'
    ], function(
        $,
        WAVEDViewModel,
        SaveProject,
        UniqueTracker,
        MessageType,
        DataSet,
        displayMessage,
        ko) {
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
                        'data-bind': 'jQueryDisable: uploadDataDialogHasErrors()',
                        click: function() {
                            if (viewModel.uploadDataName.error || viewModel.uploadDataFile.error) {
                                viewModel.uploadDataName.message = viewModel.uploadDataName.errorMessage;
                                viewModel.uploadDataFile.message = viewModel.uploadDataFile.errorMessage;
                                return;
                            }

                            if (!UniqueTracker.isValueUnique(DataSet.getUniqueNameNamespace(),
                                viewModel.uploadDataName.value)) {

                                displayMessage('The name "' + viewModel.uploadDataName.value + '" is already in use.', MessageType.WARNING);
                                return;
                            }

                            var basename = viewModel.uploadDataFile.value.split(new RegExp('(\\\\|/)')).pop();
                            var dataSet = viewModel.currentProject.getDataSetByFilename(basename);
                            if (dataSet)
                            {
                                if (dataSet.isMarkedForDeletion()) {
                                    displayMessage('The project must be saved and reloaded to reuse this filename.', MessageType.WARNING);
                                }
                                else {
                                    viewModel.uploadDataFile.error = true;
                                    viewModel.uploadDataFile.message = viewModel.uploadDataFile.errorMessage;
                                }

                                return;
                            }

                            self.uploadData(dataUploaded, viewModel);
                            $.when(dataUploaded).done(function() {
                                self.uploadDataDialog.dialog('close');
                            });
                        },
                        create: function() {
                            ko.applyBindings(viewModel, this);
                        }
                    },
                    'Cancel': function() {
                        self.uploadDataDialog.dialog('close');
                    }
                }
            });
        },

        hasErrors: function(viewModel) {
            return viewModel.uploadDataName.error || viewModel.uploadDataFile.error;
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
                displayMessage('No file has been selected', MessageType.WARNING);
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
                        SaveProject.saveProject(projectSaved, viewModel);

                        $.when(projectSaved).done(function() {
                            dataUploaded.resolve();
                        });
                    }
                    else {
                        // Display error to user.
                        displayMessage(data.errorMessage, MessageType.ERROR);
                    }
                }

            });
        }
    };

    return UploadData;
});
