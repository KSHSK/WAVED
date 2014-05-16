define([
        'WAVEDViewModel',
        './UniqueTracker',
        './HistoryMonitor',
        'models/Action/Action',
        'models/Action/PropertyAction',
        'models/Action/QueryAction',
        'models/Constants/ActionType',
        'models/Data/Condition',
        'util/defined',
        'models/Constants/MessageType',
        'util/displayMessage',
        'knockout',
        'jquery'
    ],function(
        WAVEDViewModel,
        UniqueTracker,
        HistoryMonitor,
        Action,
        PropertyAction,
        QueryAction,
        ActionType,
        Condition,
        defined,
        MessageType,
        displayMessage,
        ko,
        $
    ){
    'use strict';

    var ActionHelper = {
        actionDialog: $('#action-editor-dialog'),

        resetActionEditor: function(viewModel) {
            // Reset name.
            viewModel.selectedActionName.reset();

            // Select Property Action
            viewModel.selectedActionType = ActionType.PROPERTY_ACTION;

            // Select first Widget
            viewModel.actionEditorAffectedWidgetError = false;

            $('#actionApplyAutomatically').attr('checked', false);
        },

        closeActionDialog: function(viewModel) {
            this.actionDialog.dialog('close');

            // Restore displayValue to value so that it's not shown as the new value
            // if the action isn't applied automatically.
            if (defined(viewModel.actionEditorAffectedWidget)) {
                var properties = viewModel.actionEditorAffectedWidget.viewModel.properties;
                for (var i = 0; i < properties.length; i++) {
                    properties[i].displayValue = properties[i].value;

                    // Force the view to update.
                    ko.getObservable(properties[i], '_displayValue').valueHasMutated();
                }
            }
        },

        addAction: function(viewModel) {
            var self = this;
            self.resetActionEditor(viewModel);
            self.actionDialog.dialog({
                resizable: false,
                width: 'auto',
                modal: true,
                buttons: {
                    'Save': {
                        text: 'Save',
                        'data-bind': 'jQueryDisable: actionDialogHasErrors()',
                        click: function() {
                            if (self.hasErrors(viewModel)) {
                                return;
                            }

                            if (!UniqueTracker.isValueUnique(Action.getUniqueNameNamespace(),
                                viewModel.selectedActionName.value)) {

                                displayMessage('The name "' + viewModel.selectedActionName.value + '" is already in use.', MessageType.WARNING);
                                return;
                            }

                            var actionValues = {};
                            var properties = viewModel.actionEditorAffectedWidget.viewModel.properties;
                            for (var property in viewModel.actionEditorAffectedWidget.viewModel) {
                                var propertyIndex = properties.indexOf(viewModel.actionEditorAffectedWidget.viewModel[property]);
                                if (propertyIndex > -1) {
                                    if (properties[propertyIndex].displayValue !== properties[propertyIndex].originalValue) {
                                        actionValues[property] = properties[propertyIndex].displayValue;
                                    }
                                }
                            }

                            var action;
                            var actionState = {
                                name: viewModel.selectedActionName.value,
                                applyAutomatically: $('#actionApplyAutomatically').is(':checked')
                            };

                            if (viewModel.selectedActionType === ActionType.PROPERTY_ACTION) {
                                actionState.target = viewModel.actionEditorAffectedWidget,
                                actionState.newValues = actionValues,
                                action = new PropertyAction(actionState);
                            }
                            else {
                                actionState.dataSubset = viewModel.actionEditorDataSubset.name;
                                actionState.conditions = viewModel.actionDataSubsetEditorConditions;
                                action = new QueryAction(actionState, viewModel.currentProject.getDataSet.bind(viewModel.currentProject));
                            }

                            viewModel.currentProject.addAction(action);
                            self.closeActionDialog(viewModel);
                        },
                        create: function() {
                            ko.applyBindings(viewModel, this);
                        },
                    },
                    'Cancel': function() {
                        self.closeActionDialog(viewModel);
                    }
                }
            });
        },

        editAction: function(viewModel) {
            if (!defined(viewModel.selectedAction)) {
                return;
            }

            var self = this;
            self.resetActionEditor(viewModel);

            viewModel.selectedActionType = viewModel.selectedAction.getType();
            viewModel.selectedActionName.value = viewModel.selectedAction.name;
            $('#actionApplyAutomatically').prop('checked', viewModel.selectedAction.applyAutomatically ? true : false);

            if (viewModel.selectedActionType === ActionType.PROPERTY_ACTION) {
                viewModel.actionEditorAffectedWidget = viewModel.selectedAction.target;

                var widget = viewModel.actionEditorAffectedWidget.viewModel;

                // Set the displayValues to match those saved in the Action
                for (var index in widget.properties) {
                    widget.properties[index].displayValue = widget.properties[index].originalValue;
                }

                for (var key in viewModel.selectedAction.newValues) {
                    widget[key].displayValue = viewModel.selectedAction.newValues[key];
                }
            }
            else {
                viewModel.actionEditorDataSubset = viewModel.selectedAction.dataSubset;
                viewModel.actionDataSubsetEditorConditions = viewModel.selectedAction.conditions;
                viewModel.actionDataSubsetEditorConditionCount = viewModel.actionDataSubsetEditorConditions.length;
            }

            self.actionDialog.dialog({
                resizable: false,
                width: 'auto',
                modal: true,
                buttons: {
                    'Save': function() {
                        if (self.hasErrors(viewModel)) {
                            return;
                        }

                        if (!UniqueTracker.isValueUnique(Action.getUniqueNameNamespace(),
                            viewModel.selectedActionName.value, viewModel.selectedAction)) {

                            displayMessage('The name "' + viewModel.selectedActionName.value + '" is already in use.', MessageType.WARNING);
                            return;
                        }

                        self.updateEditChanges(viewModel);
                        self.closeActionDialog(viewModel);
                    },
                    'Cancel': function() {
                        self.closeActionDialog(viewModel);
                    }
                }
            });
        },
        updateEditChanges: function(viewModel) {
            var properties = viewModel.actionEditorAffectedWidget.viewModel.properties;
            var action = viewModel.selectedAction;

            var oldName = action.name;
            var oldTarget = action.target;
            var oldNewValues = $.extend({}, action.newValues);
            var oldApplyAutomatically = action.applyAutomatically;

            function undoChange() {
                action.name = oldName;
                action.target = oldTarget;
                action.newValues = oldNewValues;
                action.applyAutomatically = oldApplyAutomatically;

                if (action.applyAutomatically) {
                    action.apply();
                }
            }

            var actionValues = {};

            for (var property in viewModel.actionEditorAffectedWidget.viewModel) {
                var propertyIndex = properties.indexOf(viewModel.actionEditorAffectedWidget.viewModel[property]);
                if (propertyIndex > -1) {
                    if (properties[propertyIndex].displayValue !== properties[propertyIndex].originalValue) {
                        actionValues[property] = properties[propertyIndex].displayValue;
                    }
                }
            }

            var newName = viewModel.selectedActionName.value;
            var newTarget = viewModel.actionEditorAffectedWidget;
            var newApplyAutomatically = $('#actionApplyAutomatically').is(':checked');

            function executeChange() {
                action.name = newName;
                action.target = newTarget;
                action.newValues = actionValues;
                action.applyAutomatically = newApplyAutomatically;

                if (action.applyAutomatically) {
                    action.apply();
                }
            }

            var historyMonitor = HistoryMonitor.getInstance();
            historyMonitor.addChanges(undoChange, executeChange);

            historyMonitor.executeIgnoreHistory(executeChange);
        },
        hasErrors: function(viewModel) {
            var error = false;

            // Check that the action name is valid.
            if (viewModel.selectedActionName.error) {
                error = true;
            }

            if (viewModel.selectedActionType === ActionType.PROPERTY_ACTION) {
                // Check Property Action errors.

                // Check that a widget is selected.
                if (!defined(viewModel.actionEditorAffectedWidget)) {
                    viewModel.actionEditorAffectedWidgetError = true;
                    error = true;
                }

                // Check if any property has an error.
                if (defined(viewModel.actionEditorAffectedWidget)) {
                    var properties = viewModel.actionEditorAffectedWidget.viewModel.properties;
                    for (var i = 0; i < properties.length; i++) {
                        if (properties[i].error) {
                            error = true;
                            break;
                        }
                    }
                }
            }
            else {
                // Check Query Action errors.
                error |= !defined(viewModel.actionEditorDataSubset);
            }

            return error;
        },
        actionDataSubsetConditionChange: function(viewModel, index) {
            var currentCondition = viewModel.actionDataSubsetEditorConditions[index];

            if (defined(currentCondition.logicalOperator)) {
                // Only move to next condition if the logical operator is defined.
                // This means that AND or OR has been selected.

                if (index === viewModel.actionDataSubsetEditorConditions.length - 1) {
                    // Reached limit, so add new condition.
                    viewModel.actionDataSubsetEditorConditions.push(new Condition());
                    viewModel.actionDataSubsetEditorConditionCount++;
                }
                else {
                    // Display all conditions until an undefined logical operator is found.
                    for (var i = index; i < viewModel.actionDataSubsetEditorConditions.length; i++) {
                        var condition = viewModel.actionDataSubsetEditorConditions[i];

                        if (!defined(condition.logicalOperator)) {
                            break;
                        }

                        viewModel.actionDataSubsetEditorConditionCount++;
                    }
                }
            }
            else {
                if (index < viewModel.actionDataSubsetEditorConditionCount - 1) {
                    // Hide conditions that aren't needed anymore.
                    viewModel.actionDataSubsetEditorConditionCount = index + 1;
                }
            }
        }
    };


    return ActionHelper;
});
