define([
        'WAVEDViewModel',
        './UniqueTracker',
        './HistoryMonitor',
        'models/Action/Action',
        'models/Action/PropertyAction',
        'models/Action/QueryAction',
        'models/Constants/ActionType',
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

            // Unselect DataSet.
            viewModel.actionEditorDataSet = undefined;

            var widget = viewModel.actionEditorAffectedWidget.viewModel;

            // All the properties
            for (var index in widget.properties) {
                widget.properties[index].displayValue = widget.properties[index].originalValue;

                // Nested props
                if(defined(widget.properties[index].getSubscribableNestedProperties())) {
                    var nestedProps = widget.properties[index].getSubscribableNestedProperties();

                    for(var nestedIndex in nestedProps) {
                        nestedProps[nestedIndex].properties.forEach(function(value) {
                            value.displayValue = value.originalValue;
                        });
                    }
                }
            }

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
                                          actionValues[property] = properties[propertyIndex].getDisplayState();
                                        continue; // We don't need to check for nested stuff since the top level changed
                                    }

                                    // Check for changes in nested properties
                                    if (defined(properties[propertyIndex].getSubscribableNestedProperties())) {
                                        // This means we have to look at the displayValue of the currently selected thing...
                                        properties[propertyIndex].displayValue.properties.forEach(function(value) {
                                            if (value.displayValue !== value.originalValue){
                                                // We have to check for undefined here because we can't break out of forEach
                                                if (actionValues[property] === undefined) {
                                                    actionValues[property] = properties[propertyIndex].getDisplayState();
                                                }
                                            }
                                        });
                                    }
                                }
                            }

                            // TODO: Handle QueryAction
                            var action = new PropertyAction({
                                name: viewModel.selectedActionName.value,
                                target: viewModel.actionEditorAffectedWidget,
                                newValues: actionValues,
                                applyAutomatically: $('#actionApplyAutomatically').is(':checked')
                            });

                            viewModel.currentProject.addAction(action);
                            self.closeActionDialog(viewModel);
                        },
                        create: function() {
                            ko.applyBindings(viewModel, this);
                        }
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

            viewModel.selectedActionName.value = viewModel.selectedAction.name;
            viewModel.actionEditorAffectedWidget = viewModel.selectedAction.target;
            $('#actionApplyAutomatically').prop('checked', viewModel.selectedAction.applyAutomatically ? true : false);

            var widget = viewModel.actionEditorAffectedWidget.viewModel;

            // Set the displayValues to match those saved in the widget
            for (var index in widget.properties) {
                widget.properties[index].displayValue = widget.properties[index].originalValue;
            }

            // Update any modified values from the Action
            for (var key in viewModel.selectedAction.newValues) {
                widget[key].setDisplayState(viewModel.selectedAction.newValues[key]);
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
                        actionValues[property] = properties[propertyIndex].getDisplayState();
                        continue;
                    }

                    // Check for changes in nested properties
                    if (defined(properties[propertyIndex].getSubscribableNestedProperties())) {
                        // This means we have to look at the displayValue of the currently selected thing...
                        properties[propertyIndex].displayValue.properties.forEach(function(value) {
                            if (value.displayValue !== value.originalValue){
                                // We have to check for undefined here because we can't break out of forEach
                                if (actionValues[property] === undefined) {
                                    actionValues[property] = properties[propertyIndex].getDisplayState();
                                }
                            }
                        });
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
                        if (properties[i].displayError) {
                            error = true;
                            break;
                        }

                        if (defined(properties[i].getSubscribableNestedProperties())) {
                            for (var j = 0; j < properties[i].displayValue.properties.length; j++) {
                                if(properties[i].displayValue.properties[j].displayError) {
                                    error = true;
                                    break;
                                }
                            }
                            if (error) {
                                break; // Break out of the outer loop
                            }
                        }
                    }
                }
            }
            else {
                // Check Query Action errors.
                // TODO
            }

            return error;
        }
    };


    return ActionHelper;
});