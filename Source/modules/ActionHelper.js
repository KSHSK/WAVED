/*global define*/
define([
        'WAVEDViewModel',
        './UniqueTracker',
        'models/Action/PropertyAction',
        'models/Action/QueryAction',
        'util/defined',
        'util/displayMessage',
        'knockout',
        'jquery'
    ],function(
        WAVEDViewModel,
        UniqueTracker,
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
                    'Okay': function() {
                        if (viewModel.selectedActionName.error) {
                            viewModel.selectedActionName.message = viewModel.selectedActionName.errorMessage;
                            return;
                        }

                        if (!UniqueTracker.isValueUnique('name', viewModel.selectedActionName.value)) {
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
            // Set the displayValues to match those saved in the Action
            var properties = viewModel.actionEditorAffectedComponent.viewModel.properties;
            for (var key in viewModel.selectedAction.newValues) {
                viewModel.actionEditorAffectedComponent.viewModel[key].displayValue = viewModel.selectedAction.newValues[key];
            }

            self.actionDialog.dialog({
                resizable: false,
                width: 500,
                modal: true,
                closeOnEscape: false,
                buttons: {
                    'Save': function() {
                        if (!viewModel.selectedActionName.error) {
                            var actionValues = {};

                            for (var property in viewModel.actionEditorAffectedComponent.viewModel) {
                                var propertyIndex = properties.indexOf(viewModel.actionEditorAffectedComponent.viewModel[property]);
                                if (propertyIndex > -1) {
                                    if (properties[propertyIndex].displayValue !== properties[propertyIndex].value) {
                                        actionValues[property] = properties[propertyIndex].displayValue;
                                    }
                                }
                            }

                            viewModel.selectedAction.name = viewModel.selectedActionName.value;
                            viewModel.selectedAction.target = viewModel.actionEditorAffectedComponent;
                            viewModel.selectedAction.newValues = actionValues;
                            viewModel.selectedAction.applyAutomatically = $('#actionApplyAutomatically').is(':checked');
                            if (viewModel.selectedAction.applyAutomatically) {
                                viewModel.selectedAction.apply();
                            }

                            self.closeActionDialog(viewModel);
                        }
                        else {
                            viewModel.selectedActionName.message = viewModel.selectedActionName.errorMessage;
                        }
                    },
                    'Cancel': function() {
                        self.closeActionDialog(viewModel);
                    }
                }
            });
        }

    };

    return ActionHelper;
});