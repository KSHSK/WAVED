/**
 * A module for loading data into a project
 */
define([
        'jquery',
        'WAVEDViewModel',
        './HistoryMonitor',
        './DependencyChecker',
        'models/Widget/WidgetViewModel',
        'models/Data/DataSet',
        'util/defined',
        'util/displayMessage'
    ], function(
        $,
        WAVEDViewModel,
        HistoryMonitor,
        DependencyChecker,
        WidgetViewModel,
        DataSet,
        defined,
        displayMessage) {
    'use strict';

    var bindDataDialog = $('#bind-data-dialog');
    var BindData = {
        tryToBindData: function(viewModel){
            this.openBindDataDialog(viewModel);
        },

        openBindDataDialog: function(viewModel) {
            var self = this;

            // Uncheck all.
            $('.bind-data-selections').removeAttr('checked');

            bindDataDialog.dialog({
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

                        bindDataDialog.dialog('close');
                    },
                    'Cancel': function() {
                        bindDataDialog.dialog('close');
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

            var widget = viewModel.selectedComponent.viewModel;

            var dataSets = $.map(dataSetNames, function(name, index) {
                return viewModel.currentProject.getDataSet(name);
            });

            var undoChange = function() {
                for (var i = 0; i < dataSets.length; i++) {
                    widget.unbindData(dataSets[i]);
                }
            };

            var executeChange = function() {
                for (var i = 0; i < dataSets.length; i++) {
                    widget.bindData(dataSets[i]);
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
                    var widget = viewModel.selectedComponent.viewModel;

                    var response = DependencyChecker.allowedToUnbindDataSet(dataSet, widget);
                    if (!response.allowed) {
                        displayMessage(response.message);
                        return;
                    }

                    var index = widget.boundDataIndex(dataSet);

                    var undoChange = function() {
                        widget.bindData(dataSet, index);
                    };

                    var executeChange = function() {
                        widget.unbindData(dataSet);
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