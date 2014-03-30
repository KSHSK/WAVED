/**
 * A module for loading data into a project
 */
define([
        'jquery',
        'WAVEDViewModel',
        './HistoryMonitor',
        'models/Widget/WidgetViewModel',
        'models/Data/DataSet',
        'util/defined',
        'util/displayMessage'
    ], function(
        $,
        WAVEDViewModel,
        HistoryMonitor,
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

                        var dataSetNames = checked.map(function(index, item) {
                            return $(item).attr('data-name');
                        });
                        self.bindData(viewModel, dataSetNames);

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

        bindData: function(viewModel, dataSetNames) {
            if (!(viewModel.selectedComponent.viewModel instanceof WidgetViewModel)) {
                return;
            }

            var component = viewModel.selectedComponent.viewModel;

            var dataSets = $.map(dataSetNames, function(name, index) {
                return viewModel.currentProject.getDataSet(name);
            });

            var undoChange = function() {
                for (var i = 0; i < dataSets.length; i++) {
                    component.unbindData(dataSets[i]);
                }
            };

            var executeChange = function() {
                for (var i = 0; i < dataSets.length; i++) {
                    component.bindData(dataSets[i]);
                }
            };

            var historyMonitor = HistoryMonitor.getInstance();
            historyMonitor.addChanges(undoChange, executeChange);

            historyMonitor.executeIgnoreHistory(executeChange);
        },

        unbindData: function(viewModel) {
            // TODO: Check if the data is in use before unbinding it.
            if (!(viewModel.selectedComponent.viewModel instanceof WidgetViewModel)) {
                return;
            }

            if (defined(viewModel.selectedBoundData)) {
                var name = viewModel.selectedBoundData.name;

                var dataSet = viewModel.currentProject.getDataSet(name);
                if (defined(dataSet)) {
                    var component = viewModel.selectedComponent.viewModel;
                    var index = component.boundDataIndex(dataSet);

                    var undoChange = function() {
                        component.bindData(dataSet, index);
                    };

                    var executeChange = function() {
                        component.unbindData(dataSet);
                    };

                    var historyMonitor = HistoryMonitor.getInstance();
                    historyMonitor.addChanges(undoChange, executeChange);

                    historyMonitor.executeIgnoreHistory(executeChange);
                }
            }
        }
    };

    return BindData;
});