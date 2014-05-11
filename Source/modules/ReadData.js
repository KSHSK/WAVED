/**
 * A module for loading data into a project
 */
define([
        'd3',
        'jquery',
        'util/defined',
        'util/displayMessage'
    ], function(
        d3,
        $,
        defined,
        displayMessage) {
    'use strict';

    var ReadData = {
        dataFolderPath: '',

        getFilePath: function(filename) {
            return this.dataFolderPath + filename;
        },

        endsWithInsensitive: function(str, suffix) {
            suffix = suffix.toLowerCase();
            return str.toLowerCase().indexOf(suffix, str.length - suffix.length) !== -1;
        },

        /**
         *
         * @param dataSet The DataSet containing the information to be read.
         */
        readData: function(dataSet) {
            var readComplete = $.Deferred();

            // Get Data Fields when the data has been loaded.
            $.when(readComplete).done(function() {
                var values = d3.values(dataSet.data)[0];
                    if(defined(values)){
                        dataSet.dataFields = Object.keys(values);
                    }
            });

            var path = this.getFilePath(dataSet.filename);

            if (this.endsWithInsensitive(path, '.csv')) {
                d3.csv(path, function(error, data) {
                    if (error) {
                        displayMessage('Could not read data for ' + dataSet.name);
                        return;
                    }

                    dataSet.data = data;
                    readComplete.resolve();
                    dataSet._dataLoaded.resolve();
                });
            }
            else if (this.endsWithInsensitive(path, '.json')) {
                d3.json(path, function(error, data) {
                    if (error) {
                        displayMessage('Could not read data for ' + dataSet.name);
                        return;
                    }

                    // TODO: Extra processing will be needed to get JSON data to be in the same form as CSV data.
                    dataSet.data = data;
                    readComplete.resolve();
                    dataSet._dataLoaded.resolve();
                });
            }
            else {
                // Invalid file type.
                readComplete.reject();
            }

            return readComplete.promise();
        },
        readAllData: function(viewModel) {
            $.each(viewModel.currentProject.dataSets, function(index, dataSet) {
                // Read file contents for the DataSet.
                ReadData.readData(dataSet);

                // TODO: How should DataSubsets be handled?
            });
        }
    };

    return ReadData;
});