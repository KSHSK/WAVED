define([
        'WAVEDViewModel',
        './UniqueTracker',
        './HistoryMonitor',
        'models/Action/Action',
        'models/Action/PropertyAction',
        'models/Action/QueryAction',
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
        defined,
        displayMessage,
        ko,
        $
    ){
    'use strict';

    var ActionHelper = {
        actionDialog: $('#action-editor-dialog'),

        resetActionEditor: function(viewModel) {
            viewModel.actionEditorAffectedComponent = undefined;
            viewModel.actionEditorDataSet = undefined;
            viewModel.selectedActionName.reset();
            viewModel.selectedActionType = '';
            $('#actionApplyAutomatically').attr('checked', false);
        },

        closeActionDialog: function(viewModel) {
            this.actionDialog.dialog('close');

            // Restore displayValue to value so that it's not shown as the new value
            // if the action isn't applied automatically.
            var properties = viewModel.actionEditorAffectedComponent.viewModel.properties;
            for (var i = 0; i < properties.length; i++) {
                properties[i].displayValue = properties[i].value;
            }

        },

        addAction: function(viewModel) {
            var self = this;
            self.resetActionEditor(viewModel);
            self.actionDialog.dialog({
                resizable: false,
                width: 500,
                modal: true,
                buttons: {
                    'Save': function() {
                        if (viewModel.selectedActionName.error) {
                            viewModel.selectedActionName.message = viewModel.selectedActionName.errorMessage;
                            return;
                        }

                        if (!UniqueTracker.isValueUnique(Action.getUniqueNameNamespace(),
                            viewModel.selectedActionName.value)) {

                            displayMessage('The name "' + viewModel.selectedActionName.value + '" is already in use.');
                            return;
                        }

                        var actionValues = {};
                        var properties = viewModel.actionEditorAffectedComponent.viewModel.properties;
                        for (var property in viewModel.actionEditorAffectedComponent.viewModel) {
                            var propertyIndex = properties.indexOf(viewModel.actionEditorAffectedComponent.viewModel[property]);
                            if (propertyIndex > -1) {
                                if (properties[propertyIndex].displayValue !== properties[propertyIndex].value) {
                                    actionValues[property] = properties[propertyIndex].displayValue;
                                }
                            }
                        }

                        // TODO: Handle QueryAction
                        // TODO: Ensure an action with the same name doesn't already exist. Display error message if so.
                        var action = new PropertyAction({
                            name: viewModel.selectedActionName.value,
                            target: viewModel.actionEditorAffectedComponent,
                            newValues: actionValues,
                            applyAutomatically: $('#actionApplyAutomatically').is(':checked')
                        });

                        // TODO: Validation to prevent two actions having same name?
                        viewModel.currentProject.addAction(action);
                        self.closeActionDialog(viewModel);
                    },
                    'Cancel': function() {
                        self.closeActionDialog(viewModel);
                    }
                }
            });
        },

        editAction: function(viewModel) {
            if (!defined(viewModel.selectedAction)) {
                displayMessage('Select an action to edit.');
                return;
            }

            var self = this;
            self.resetActionEditor(viewModel);

            viewModel.selectedActionName.value = viewModel.selectedAction.name;
            viewModel.actionEditorAffectedComponent = viewModel.selectedAction.target;
            $('#actionApplyAutomatically').prop('checked', viewModel.selectedAction.applyAutomatically ? true : false);

            var component = viewModel.actionEditorAffectedComponent.viewModel;

            // Set the displayValues to match those saved in the Action
            for (var index in component.properties) {
                component.properties[index].displayValue = component.properties[index].value;
            }

            for (var key in viewModel.selectedAction.newValues) {
                component[key].displayValue = viewModel.selectedAction.newValues[key];
            }

            self.actionDialog.dialog({
                resizable: false,
                width: 500,
                modal: true,
                buttons: {
                    'Save': function() {
                        if (viewModel.selectedActionName.error) {
                            viewModel.selectedActionName.message = viewModel.selectedActionName.errorMessage;
                            return;
                        }

                        if (!UniqueTracker.isValueUnique(Action.getUniqueNameNamespace(),
                            viewModel.selectedActionName.value, viewModel.selectedAction)) {

                            displayMessage('The name "' + viewModel.selectedActionName.value + '" is already in use.');
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
            var properties = viewModel.actionEditorAffectedComponent.viewModel.properties;
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

            for (var property in viewModel.actionEditorAffectedComponent.viewModel) {
                var propertyIndex = properties.indexOf(viewModel.actionEditorAffectedComponent.viewModel[property]);
                if (propertyIndex > -1) {
                    if (properties[propertyIndex].displayValue !== properties[propertyIndex].value) {
                        actionValues[property] = properties[propertyIndex].displayValue;
                    }
                }
            }

            var newName = viewModel.selectedActionName.value;
            var newTarget = viewModel.actionEditorAffectedComponent;
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
            historyMonitor.addUndoChange(undoChange);
            historyMonitor.addRedoChange(executeChange);

            historyMonitor.pauseUndoRedoSubscription();
            executeChange();
            historyMonitor.resumeUndoRedoSubscription();
        }
    };


    return ActionHelper;
});