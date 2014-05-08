define([
        'WAVEDViewModel',
        './UniqueTracker',
        './HistoryMonitor',
        'models/Data/DataSet',
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
        DataSet,
        DataSubset,
        Condition,
        defined,
        displayMessage,
        ko,
        $
    ){
    'use strict';

    var dataSubsetDialog = $('#data-subset-editor-dialog');

    // Setup the dialog.
    dataSubsetDialog.dialog({
        minHeight: 250,
        height: 375,
        minWidth: 400,
        width: 650,
        modal: true,
        autoOpen: false
    });

    var openDialog = function(saveCallback, cancelCallback) {
        dataSubsetDialog.dialog({
            autoOpen: true,
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

            viewModel.dataSubsetEditorConditionCount = 1;
        },

        addDataSubset: function(viewModel) {
            var self = this;
            self.resetDataSubsetEditor(viewModel);

            var saveCallback = function() {
                if (self.hasErrors(viewModel)) {
                    return;
                }

                if (!UniqueTracker.isValueUnique(DataSet.getUniqueNameNamespace(),
                    viewModel.dataSubsetEditorName.value)) {

                    displayMessage('The name "' + viewModel.dataSubsetEditorName.value + '" is already in use.');
                    return;
                }

                var limit = viewModel.dataSubsetEditorConditionCount;
                var dataSubset = new DataSubset({
                    name: viewModel.dataSubsetEditorName.value,
                    parent: viewModel.dataSubsetEditorDataSource,
                    query: {
                        conditions: viewModel.dataSubsetEditorConditions.slice(0, limit)
                    }
                });

                viewModel.currentProject.addDataSet(dataSubset);

                dataSubsetDialog.dialog('close');
            };

            var cancelCallback = function() {
                dataSubsetDialog.dialog('close');
            };

            openDialog(saveCallback, cancelCallback);
        },
        editDataSubset: function(viewModel) {
            var self = this;

            if (!defined(viewModel.selectedDataSubset)) {
                return;
            }

            self.resetDataSubsetEditor(viewModel);

            viewModel.dataSubsetEditorName.value = viewModel.selectedDataSubset.name;
            viewModel.dataSubsetEditorDataSource = viewModel.selectedDataSubset.parent;

            // Make a deep copy of the array so that it's not referencing the same object.
            viewModel.dataSubsetEditorConditions.length = 0;
            viewModel.selectedDataSubset.query.conditions.forEach(function(condition) {
                viewModel.dataSubsetEditorConditions.push(new Condition(condition.getState()));
            });

            viewModel.dataSubsetEditorConditionCount = viewModel.dataSubsetEditorConditions.length;

            var saveCallback = function() {
                if (self.hasErrors(viewModel)) {
                    return;
                }

                if (!UniqueTracker.isValueUnique(DataSet.getUniqueNameNamespace(),
                    viewModel.dataSubsetEditorName.value, viewModel.selectedDataSubset)) {

                    displayMessage('The name "' + viewModel.dataSubsetEditorName.value + '" is already in use.');
                    return;
                }

                self.updateEditChanges(viewModel);

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
            var oldParent = dataSubset.parent;
            var oldConditions = dataSubset.query.conditions;

            function undoChange() {
                dataSubset.setState({
                    name: oldName,
                    parent: oldParent,
                    query: {
                        conditions: oldConditions
                    }
                });
            }

            var newName = viewModel.dataSubsetEditorName.value;
            var newParent = viewModel.dataSubsetEditorDataSource;

            var limit = viewModel.dataSubsetEditorConditionCount;
            var newConditions = viewModel.dataSubsetEditorConditions.slice(0, limit);

            function executeChange() {
                dataSubset.setState({
                    name: newName,
                    parent: newParent,
                    query: {
                        conditions: newConditions
                    }
                });
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
        },
        dataSubsetConditionChange: function(viewModel, index) {
            var currentCondition = viewModel.dataSubsetEditorConditions[index];

            if (defined(currentCondition.logicalOperator)) {
                // Only move to next condition if the logical operator is defined.
                // This means that AND or OR has been selected.

                if (index === viewModel.dataSubsetEditorConditions.length - 1) {
                    // Reached limit, so add new condition.
                    viewModel.dataSubsetEditorConditions.push(new Condition());
                    viewModel.dataSubsetEditorConditionCount++;
                }
                else {
                    // Display all conditions until an undefined logical operator is found.
                    for (var i = index; i < viewModel.dataSubsetEditorConditions.length; i++) {
                        var condition = viewModel.dataSubsetEditorConditions[i];

                        if (!defined(condition.logicalOperator)) {
                            break;
                        }

                        viewModel.dataSubsetEditorConditionCount++;
                    }
                }
            }
            else {
                if (index < viewModel.dataSubsetEditorConditionCount - 1) {
                    // Hide conditions that aren't needed anymore.
                    viewModel.dataSubsetEditorConditionCount = index + 1;
                }
            }
        }
    };

    return DataSubsetHelper;
});