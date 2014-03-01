/*global define*/
/**
 * A module for loading data into a project
 */
define([
        'WavedViewModel',
        'models/Data/DataSet',
        'jquery'
    ], function(
        WAVEDViewModel,
        DataSet,
        $) {
    'use strict';

    var LoadData = {
        bindDataDialog: $('#bind-data-dialog'),
        bindDataOptions: $('#bind-data-options'),

        tryToBindData: function(viewModel){
            this.openBindDataDialog(viewModel);
        },

        openBindDataDialog: function(viewModel) {
            var self = this;
            var selections = $('.bind-data-selections');

            // Uncheck all.
            selections.removeAttr('checked');

            self.bindDataDialog.dialog({
                resizable: false,
                height: 250,
                width: 400,
                modal: true,
                buttons: {
                    'Bind': function() {
                        var checked = selections.filter(':checked');
                        checked.each(function(index, item) {
                            var name = $(item).attr('data-name');
                            self.bindData(viewModel, name);
                        });

                        self.bindDataDialog.dialog('close');
                    },
                    'Cancel': function() {
                        self.bindDataDialog.dialog('close');
                    }
                }
            });
        },

        bindData: function(viewModel, name) {
            var dataSet = viewModel.currentProject.getDataSet(name);
            if (dataSet != null) {
                viewModel.selectedWidget.viewModel.bindData(dataSet);
            }
        },

    };

    return LoadData;
});