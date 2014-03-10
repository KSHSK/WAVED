/*global define, alert*/
/**
 * A module for deleting data sets from a project
 */
define([
        '../WAVEDViewModel',
        'util/displayMessage',
        'jquery'
    ], function(
        WAVEDViewModel,
        displayMessage,
        $) {
    'use strict';

    var DeleteData = {
        markDataForDeletion: function(viewModel){
            var dataSet = viewModel.selectedDataSet;

            if (typeof dataSet === 'undefined') {
                return;
            }

            if (dataSet.referenceCount > 0) {
                displayMessage('Cannot delete data that is bound to a widget');
            }
            else {
                dataSet.markForDeletion();
            }
        }
    };

    return DeleteData;
});