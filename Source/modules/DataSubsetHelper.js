define([
        'WAVEDViewModel',
        './UniqueTracker',
        './HistoryMonitor',
        'models/Data/DataSubset',
        'util/defined',
        'util/displayMessage',
        'knockout',
        'jquery'
    ],function(
        WAVEDViewModel,
        UniqueTracker,
        HistoryMonitor,
        DataSubset,
        defined,
        displayMessage,
        ko,
        $
    ){
    'use strict';

    var DataSubsetHelper = {
        dataSubsetDialog: $('#data-subset-editor-dialog'),

        resetDataSubsetEditor: function(viewModel) {

        },

        addDataSubset: function(viewModel) {
            viewModel.currentProject.addDataSet(new DataSubset({
                name: 'subset',
                parent: viewModel.currentProject.dataSets[0]
            }));

            return;

            var self = this;
            self.resetDataSubsetEditor(viewModel);

            self.dataSubsetDialog.dialog({
                resizable: false,
                width: 'auto',
                modal: true,
                buttons: {
                    'Save': function() {
                        if (self.hasErrors(viewModel)) {
                            return;
                        }

                        if (!UniqueTracker.isValueUnique(DataSubset.getUniqueNameNamespace(),
                            viewModel.selectedDataSubsetName.value)) {

                            displayMessage('The name "' + viewModel.selectedDataSubsetName.value + '" is already in use.');
                            return;
                        }

                        var dataSubset = new DataSubset({
                            name: viewModel.selectedDataSubsetName.value,
                            dataSubsetType: viewModel.selectedDataSubsetType,
                            triggeringWidget: viewModel.dataSubsetEditorTriggeringWidget,
                            trigger: $('#dataSubset-trigger-select').prop('selectedIndex'),
                            actions: viewModel.selectedDataSubsetActions
                        });
                        viewModel.currentProject.addDataSubset(dataSubset);
                        self.dataSubsetDialog.dialog('close');
                    },
                    'Cancel': function() {
                        self.dataSubsetDialog.dialog('close');
                    }
                }
            });
        },
        editDataSubset: function(viewModel) {
            if (!defined(viewModel.selectedDataSubset)) {
                return;
            }

            var self = this;
            self.resetDataSubsetEditor(viewModel);

            viewModel.selectedDataSubsetName.value = viewModel.selectedDataSubset.name;
            viewModel.selectedDataSubsetType = viewModel.selectedDataSubset.dataSubsetType;
            viewModel.dataSubsetEditorTriggeringWidget = viewModel.selectedDataSubset.triggeringWidget;
            viewModel.dataSubsetEditorTrigger = viewModel.selectedDataSubset.trigger;

            // Make a shallow copy of the array so that it's not referencing the same object.
            viewModel.selectedDataSubsetActions = viewModel.selectedDataSubset.actions.slice(0);

            self.dataSubsetDialog.dialog({
                resizable: false,
                width: 'auto',
                modal: true,
                buttons: {
                    'Save': function() {
                        if (self.hasErrors(viewModel)) {
                            return;
                        }

                        if (!UniqueTracker.isValueUnique(DataSubset.getUniqueNameNamespace(),
                            viewModel.selectedDataSubsetName.value, viewModel.selectedDataSubset)) {

                            displayMessage('The name "' + viewModel.selectedDataSubsetName.value + '" is already in use.');
                            return;
                        }

                        viewModel.selectedDataSubset.unregister();
                        self.updateEditChanges(viewModel);
                        viewModel.selectedDataSubset.register();

                        self.dataSubsetDialog.dialog('close');
                    },
                    'Cancel': function() {
                        self.dataSubsetDialog.dialog('close');
                    }
                }
            });
        },
        updateEditChanges: function(viewModel) {
            var dataSubset = viewModel.selectedDataSubset;

            var oldName = dataSubset.name;
            var oldDataSubsetType = dataSubset.dataSubsetType;
            var oldTriggeringWidget = dataSubset.triggeringWidget;
            var oldTrigger = dataSubset.trigger;
            var oldActions = dataSubset.actions;

            function undoChange() {
                dataSubset.name = oldName;
                dataSubset.dataSubsetType = oldDataSubsetType;
                dataSubset.triggeringWidget = oldTriggeringWidget;
                dataSubset.trigger = oldTrigger;
                dataSubset.actions = oldActions;
            }

            var newName = viewModel.selectedDataSubsetName.value;
            var newDataSubsetType = viewModel.selectedDataSubsetType;
            var newTriggeringWidget = viewModel.dataSubsetEditorTriggeringWidget;
            var newTrigger = viewModel.dataSubsetEditorTrigger;
            var newActions = viewModel.selectedDataSubsetActions;

            function executeChange() {
                dataSubset.name = newName;
                dataSubset.dataSubsetType = newDataSubsetType;
                dataSubset.triggeringWidget = newTriggeringWidget;
                dataSubset.trigger = newTrigger;
                dataSubset.actions = newActions;
            }

            var historyMonitor = HistoryMonitor.getInstance();
            historyMonitor.addChanges(undoChange, executeChange);

            historyMonitor.executeIgnoreHistory(executeChange);
        },
        hasErrors: function(viewModel) {
            var error = false;



            return error;
        }

    };

    return DataSubsetHelper;
});