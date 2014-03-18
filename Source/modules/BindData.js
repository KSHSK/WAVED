/**
 * A module for loading data into a project
 */
define([
        'jquery',
        'WAVEDViewModel',
        'models/Widget/WidgetViewModel',
        'models/Data/DataSet',
        'util/defined',
        'util/displayMessage'
    ], function(
        $,
        WAVEDViewModel,
        WidgetViewModel,
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
            if (!(viewModel.selectedComponent.viewModel instanceof WidgetViewModel)) {
                return;
            }

            var dataSet = viewModel.currentProject.getDataSet(name);
            if (defined(dataSet)) {
                viewModel.selectedComponent.viewModel.bindData(dataSet);
            }
        },

        unbindData: function(viewModel) {
            if (!(viewModel.selectedComponent.viewModel instanceof WidgetViewModel)) {
                return;
            }

            //TODO: Check if the data is in use before unbinding it.

            var name = viewModel.selectedBoundData;

            var dataSet = viewModel.currentProject.getDataSet(name);
            if (defined(dataSet)) {
                viewModel.selectedComponent.viewModel.unbindData(dataSet);
            }
        }

    };

    return BindData;
});