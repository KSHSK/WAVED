/*global define*/
/**
 * A module for deleting data sets from a project
 */
define([
        '../WAVEDViewModel',
        'jquery'
    ], function(
        WAVEDViewModel,
        $) {
    'use strict';

    var DeleteData = {
        markDataForDeletion: function(viewModel){
            var dataSet = viewModel.selectedDataSet;

            if (typeof dataSet === 'undefined') {
                return;
            }

            if (dataSet.referenceCount > 0) {
                // TODO: Change this to be jQueryUI dialog, page banner, or other nicer display method.
                alert('Cannot delete data that is bound to a widget');
            }
            else {
                dataSet.markForDeletion();
            }
        }
    };

    return DeleteData;
});