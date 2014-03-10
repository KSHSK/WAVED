/*global define*/
/**
 * A module for loading data into a project
 */
define([
        'WAVEDViewModel',
        'models/Data/DataSet',
        'd3',
        'jquery'
    ], function(
        WAVEDViewModel,
        DataSet,
        d3,
        $) {
    'use strict';

    var ReadData = {
        /**
         *
         * @param dataSet The DataSet containing the information to be read.
         */
        readData: function(dataSet) {
            var readComplete = $.Deferred();

            d3.csv(dataSet.filename, function(data) {
                dataSet.data = data;
                readComplete.resolve();
            });

            return readComplete.promise();
        }

    };

    return ReadData;
});