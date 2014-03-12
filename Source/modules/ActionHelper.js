/*global define*/
define([
        'WAVEDViewModel',
        'models/Action/PropertyAction',
        'models/Action/QueryAction',
        'util/defined',
        'util/displayMessage',
        'knockout',
        'jquery'
    ],function(
        WAVEDViewModel,
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
            viewModel.selectedActionName = '';
            $('#actionApplyAutomatically').attr('checked', false);
        },

        addAction: function(viewModel) {
            var self = this;

            self.actionDialog.dialog({
                resizable: false,
                width: 500,
                modal: true,
                closeOnEscape: false,
                buttons: {
                    'Okay': function() {
                        var actionValues = [];
                        var properties = viewModel.actionEditorAffectedComponent.viewModel.properties;
                        for (var i = 0; i < properties.length; i++) {
                            actionValues.push(properties[i].displayValue);
                        }

                        // TODO: Handle QueryAction
                        // TODO: Ensure an action with the same name doesn't already exist. Display error message if so.
                        var action = new PropertyAction({
                            name: viewModel.selectedActionName,
                            target: viewModel.actionEditorAffectedComponent,
                            values: actionValues,
                            applyAutomatically: $('#actionApplyAutomatically').is(':checked')
                        });

                        // TODO: Validation to prevent two actions having same name?
                        viewModel.currentProject.addAction(action);
                        self.actionDialog.dialog('close');
                        self.resetActionEditor(viewModel);
                    },
                    'Cancel': function() {
                        self.actionDialog.dialog('close');
                        self.resetActionEditor(viewModel);
                    }
                }
            });
        },

        editAction: function(viewModel) {
            var self = this;

            if (defined(viewModel.selectedAction)) {
                viewModel.selectedActionName = viewModel.selectedAction.name.value;
                viewModel.actionEditorAffectedComponent = viewModel.selectedAction.target;
                $('#actionApplyAutomatically').prop('checked', viewModel.selectedAction.applyAutomatically ? true : false);

                self.actionDialog.dialog({
                    resizable: false,
                    width: 500,
                    modal: true,
                    closeOnEscape: false,
                    buttons: {
                        'Save': function() {
                            var actionValues = [];
                            var properties = viewModel.actionEditorAffectedComponent.viewModel.properties;
                            for (var i = 0; i < properties.length; i++) {
                                actionValues.push(properties[i].displayValue);
                            }

                            viewModel.selectedAction.name.value = viewModel.selectedActionName;
                            viewModel.selectedAction.target = viewModel.actionEditorAffectedComponent;
                            viewModel.selectedAction.values = actionValues;
                            viewModel.selectedAction.applyAutomatically = $('#actionApplyAutomatically').is(':checked');
                            if (viewModel.selectedAction.applyAutomatically) {
                                viewModel.selectedAction.apply();
                            }

                            self.actionDialog.dialog('close');
                            self.resetActionEditor(viewModel);
                        },
                        'Cancel': function() {
                            self.actionDialog.dialog('close');
                            self.resetActionEditor(viewModel);
                        }
                    }
                });
            }
            else {
                displayMessage('Select an action to edit.');
            }
        }

    };

    return ActionHelper;
});