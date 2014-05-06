define([
        'WAVEDViewModel',
        './UniqueTracker',
        './HistoryMonitor',
        'models/Data/DataSubset',
        'models/Data/Condition',
        'util/defined',
        'util/displayMessage',
        'knockout',
        'jquery'
    ],function(
        WAVEDViewModel,
        UniqueTracker,
        HistoryMonitor,
        DataSubset,
        Condition,
        defined,
        displayMessage,
        ko,
        $
    ){
    'use strict';

    var dataSubsetDialog = $('#data-subset-editor-dialog');

    var openDialog = function(saveCallback, cancelCallback) {
        dataSubsetDialog.dialog({
            minHeight: 250,
            minWidth: 400,
            width: 650,
            modal: true,
            buttons: {
                'Save': saveCallback,
                'Cancel': cancelCallback
            }
        });
    };

    var DataSubsetHelper = {
        resetDataSubsetEditor: function(viewModel) {
            // Reset name.
            viewModel.dataSubsetEditorName.reset();

            // Unset error.
            viewModel.dataSubsetEditorDataSourceError = false;

            // One initial conditions.
            viewModel.dataSubsetEditorConditions = [new Condition()];
        },

        addDataSubset: function(viewModel) {
            var self = this;
            self.resetDataSubsetEditor(viewModel);

            var saveCallback = function() {
                if (self.hasErrors(viewModel)) {
                    return;
                }

                if (!UniqueTracker.isValueUnique(DataSubset.getUniqueNameNamespace(),
                    viewModel.dataSubsetEditorName.value)) {

                    displayMessage('The name "' + viewModel.dataSubsetEditorName.value + '" is already in use.');
                    return;
                }
//
//                var dataSubset = new DataSubset({
//                    name: viewModel.selectedDataSubsetName.value,
//                    dataSubsetType: viewModel.selectedDataSubsetType,
//                    triggeringWidget: viewModel.dataSubsetEditorTriggeringWidget,
//                    trigger: $('#dataSubset-trigger-select').prop('selectedIndex'),
//                    actions: viewModel.selectedDataSubsetActions
//                });
//                viewModel.currentProject.addDataSubset(dataSubset);

                dataSubsetDialog.dialog('close');
            };

            var cancelCallback = function() {
                dataSubsetDialog.dialog('close');
            };

            openDialog(saveCallback, cancelCallback);
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

            var saveCallback = function() {
                if (self.hasErrors(viewModel)) {
                    return;
                }

//                if (!UniqueTracker.isValueUnique(DataSubset.getUniqueNameNamespace(),
//                    viewModel.selectedDataSubsetName.value, viewModel.selectedDataSubset)) {
//
//                    displayMessage('The name "' + viewModel.selectedDataSubsetName.value + '" is already in use.');
//                    return;
//                }
//
//                viewModel.selectedDataSubset.unregister();
//                self.updateEditChanges(viewModel);
//                viewModel.selectedDataSubset.register();

                dataSubsetDialog.dialog('close');
            };

            var cancelCallback = function() {
                dataSubsetDialog.dialog('close');
            };

            openDialog(saveCallback, cancelCallback);
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

            // Check that the DataSubset name is valid.
            if (viewModel.dataSubsetEditorName.error) {
                viewModel.dataSubsetEditorName.message = viewModel.dataSubsetEditorName.errorMessage;
                error = true;
            }

            // Check that a Data Source is selected.
            if (!defined(viewModel.dataSubsetEditorDataSource)) {
                viewModel.dataSubsetEditorDataSourceError = true;
                error = true;
            }

            return error;
        }

    };

    return DataSubsetHelper;
});