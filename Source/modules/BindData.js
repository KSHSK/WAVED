/**
 * A module for loading data into a project
 */
define([
        'jquery',
        'WAVEDViewModel',
        'models/Data/DataSet',
        'util/defined',
        'util/displayMessage'
    ], function(
        $,
        WAVEDViewModel,
        DataSet,
        defined,
        displayMessage) {
    'use strict';

    var BindData = {
        bindDataDialog: $('#bind-data-dialog'),
        bindDataOptions: $('#bind-data-options'),

        tryToBindData: function(viewModel){
            this.openBindDataDialog(viewModel);
        },

        openBindDataDialog: function(viewModel) {
            var self = this;

            // Uncheck all.
            $('.bind-data-selections').removeAttr('checked');

            self.bindDataDialog.dialog({
                resizable: false,
                height: 250,
                width: 400,
                modal: true,
                buttons: {
                    'Bind': function() {
                        var checked = $('.bind-data-selections:checked');

                        if (checked.length === 0) {
                            displayMessage('Select data to bind or click Cancel.');
                            return;
                        }

                        checked.each(function(index, item) {
                            var name = $(item).attr('data-name');
                            self.bindData(viewModel, name);
                        });

                        self.bindDataDialog.dialog('close');
                    },
                    'Cancel': function() {
                        self.bindDataDialog.dialog('close');
                    }
                },
                open: function() {
                    // Don't auto-select any buttons.
                    $('button', $(this).parent()).blur();
                }
            });
        },

        bindData: function(viewModel, name) {
            var dataSet = viewModel.currentProject.getDataSet(name);
            if (defined(dataSet)) {
                viewModel.selectedWidget.viewModel.bindData(dataSet);
            }
        },

        unbindData: function(viewModel) {
            if(viewModel.selectedBoundData !== undefined){
                var name = viewModel.selectedBoundData.name;

                var dataSet = viewModel.currentProject.getDataSet(name);
                if (defined(dataSet)) {
                    viewModel.selectedWidget.viewModel.unbindData(dataSet);
                }
            }
        }

    };

    return BindData;
});