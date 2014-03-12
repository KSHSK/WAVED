/*global define*/
/**
 * A module for loading data into a project
 */
define([
        'd3',
        'jquery'
    ], function(
        d3,
        $) {
    'use strict';

    var ReadData = {
        dataFolderPath: '',

        getFilePath: function(dataSet) {
            return this.dataFolderPath + dataSet.filename;
        },

        /**
         *
         * @param dataSet The DataSet containing the information to be read.
         */
        readData: function(dataSet) {
            var readComplete = $.Deferred();

            d3.csv(this.getFilePath(dataSet), function(data) {
                dataSet.data = data;
                readComplete.resolve();
            });

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