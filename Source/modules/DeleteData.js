/**
 * A module for deleting data sets from a project
 */
define([
        './DependencyChecker',
        'util/displayMessage',
        'jquery'
    ], function(
        DependencyChecker,
        displayMessage,
        $) {
    'use strict';

    var DeleteData = {
        markDataForDeletion: function(viewModel){
            var dataSet = viewModel.selectedDataSet;

            if (typeof dataSet === 'undefined') {
                return;
            }

            var response = DependencyChecker.allowedToDeleteDataSet(dataSet, viewModel.currentProject);
            if (!response.allowed) {
                displayMessage(response.message);
                return;
            }

            dataSet.markForDeletion();
        },
        deleteAllMarkedData: function(viewModel) {
            var self = this;

            var deferreds = [];
            var groupDeferred = $.Deferred();

            // Delete in reverse order to avoid race conditions with Ajax callbacks.
            var length = viewModel.currentProject.dataSets.length;
            for (var index = length - 1; index >= 0; index--) {
                var dataSet = viewModel.currentProject.dataSets[index];
                if (dataSet.isMarkedForDeletion()) {
                    var deferred = self.deleteData(viewModel, dataSet);
                    deferreds.push(deferred);
                }
            }

            if (deferreds.length > 0) {
                $.when.apply($, deferreds).always(function() {
                    groupDeferred.resolve();
                });
            }

            return groupDeferred;
        },
        deleteData: function(viewModel, dataSet) {
            var self = this;

            return $.ajax({
                type: 'POST',
                url: 'PHP/deleteDataFile.php',
                data: {
                    project: viewModel.currentProject.name,
                    fileName: dataSet.filename
                },
                success: function(dataString) {
                    var data = JSON.parse(dataString);
                    if (data.success) {
                        viewModel.currentProject.removeDataSet(dataSet);
                    }
                    else {
                        displayMessage(data.errorMessage);
                    }
                }
            }).promise();
        }
    };

    return DeleteData;
});