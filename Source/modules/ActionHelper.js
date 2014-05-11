define([
        'WAVEDViewModel',
        './UniqueTracker',
        './HistoryMonitor',
        'models/Action/Action',
        'models/Action/PropertyAction',
        'models/Action/QueryAction',
        'models/Constants/ActionType',
        'util/defined',
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
        displayMessage,
        ko,
        $
    ){
    'use strict';

    var actionDialog = $('#action-editor-dialog');

    function resetActionEditor(viewModel) {
        // Reset name.
        viewModel.selectedActionName.reset();

        // Select Property Action
        viewModel.selectedActionType = ActionType.PROPERTY_ACTION;

        // Select first Widget
        viewModel.actionEditorAffectedWidgetError = false;

        // Unselect DataSet.
        viewModel.actionEditorDataSet = undefined;

        $('#actionApplyAutomatically').attr('checked', false);
    }

    function closeActionDialog(viewModel) {
        actionDialog.dialog('close');

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
    }

    function updateEditChanges(viewModel) {
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

        for ( var property in viewModel.actionEditorAffectedWidget.viewModel) {
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
    }

    function hasErrors(viewModel) {
        var error = false;

        // Check that the action name is valid.
        if (viewModel.selectedActionName.error) {
            viewModel.selectedActionName.message = viewModel.selectedActionName.errorMessage;
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
            // TODO
        }

        return error;
    }

    var ActionHelper = {
        addAction: function(viewModel) {
            var self = this;
            resetActionEditor(viewModel);
            actionDialog.dialog({
                resizable: false,
                width: 'auto',
                modal: true,
                buttons: {
                    'Save': function() {
                        if (hasErrors(viewModel)) {
                            return;
                        }

                        if (!UniqueTracker.isValueUnique(Action.getUniqueNameNamespace(),
                            viewModel.selectedActionName.value)) {

                            displayMessage('The name "' + viewModel.selectedActionName.value + '" is already in use.');
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

                        // TODO: Handle QueryAction
                        var action = new PropertyAction({
                            name: viewModel.selectedActionName.value,
                            target: viewModel.actionEditorAffectedWidget,
                            newValues: actionValues,
                            applyAutomatically: $('#actionApplyAutomatically').is(':checked')
                        });

                        viewModel.currentProject.addAction(action);
                        closeActionDialog(viewModel);
                    },
                    'Cancel': function() {
                        closeActionDialog(viewModel);
                    }
                }
            });
        },

        editAction: function(viewModel) {
            if (!defined(viewModel.selectedAction)) {
                return;
            }

            var self = this;
            resetActionEditor(viewModel);

            viewModel.selectedActionName.value = viewModel.selectedAction.name;
            viewModel.actionEditorAffectedWidget = viewModel.selectedAction.target;
            $('#actionApplyAutomatically').prop('checked', viewModel.selectedAction.applyAutomatically ? true : false);

            var widget = viewModel.actionEditorAffectedWidget.viewModel;

            // Set the displayValues to match those saved in the Action
            for (var index in widget.properties) {
                widget.properties[index].displayValue = widget.properties[index].originalValue;
            }

            for (var key in viewModel.selectedAction.newValues) {
                widget[key].displayValue = viewModel.selectedAction.newValues[key];
            }

            actionDialog.dialog({
                resizable: false,
                width: 'auto',
                modal: true,
                buttons: {
                    'Save': function() {
                        if (hasErrors(viewModel)) {
                            return;
                        }

                        if (!UniqueTracker.isValueUnique(Action.getUniqueNameNamespace(),
                            viewModel.selectedActionName.value, viewModel.selectedAction)) {

                            displayMessage('The name "' + viewModel.selectedActionName.value + '" is already in use.');
                            return;
                        }

                        updateEditChanges(viewModel);
                        closeActionDialog(viewModel);
                    },
                    'Cancel': function() {
                        closeActionDialog(viewModel);
                    }
                }
            });
        }
    };

    return ActionHelper;
});