/*global define*/
define([
        'WAVEDViewModel',
        'models/Event/Event',
        'util/defined',
        'util/displayMessage',
        'knockout',
        'jquery'
    ],function(
        WAVEDViewModel,
        Event,
        defined,
        displayMessage,
        ko,
        $
    ){
    'use strict';

    var EventHelper = {

        eventDialog: $('#event-editor-dialog'),

        resetEventEditor: function(viewModel) {
            viewModel.eventEditorTriggeringComponent = undefined;
            viewModel.eventEditorTrigger = undefined;
            viewModel.selectedEventType = undefined;
            viewModel.selectedEventName.setBlank();
            viewModel.selectedEventActions = [];
        },

        addEvent: function(viewModel) {
            var self = this;
            self.resetEventEditor(viewModel);
            self.eventDialog.dialog({
                resizable: false,
                width: 500,
                modal: true,
                buttons: {
                    'Save': function() {
                        if (!viewModel.selectedEventName.error) {
                            var event = new Event({
                                name: viewModel.selectedEventName.value,
                                eventType: viewModel.selectedEventType,
                                triggeringComponent: viewModel.eventEditorTriggeringComponent,
                                trigger: viewModel.eventEditorTrigger,
                                actions: viewModel.selectedEventActions
                            });
                            viewModel.currentProject.addEvent(event);
                            self.eventDialog.dialog('close');
                        }
                    },
                    'Cancel': function() {
                        self.eventDialog.dialog('close');
                    }
                }
            });
        },

        editEvent: function(viewModel) {
            if (!defined(viewModel.selectedEvent)) {
                displayMessage('Select an event to edit.');
                return;
            }

            var self = this;
            self.resetEventEditor(viewModel);

            viewModel.selectedEventName.value = viewModel.selectedEvent.name;
            viewModel.selectedEventType = viewModel.selectedEvent.eventType;
            viewModel.eventEditorTriggeringComponent = viewModel.selectedEvent.triggeringComponent;
            viewModel.eventEditorTrigger = viewModel.selectedEvent.trigger;
            viewModel.selectedEventActions = viewModel.selectedEvent.actions;

            self.eventDialog.dialog({
                resizable: false,
                width: 500,
                modal: true,
                closeOnEscape: false,
                buttons: {
                    'Save': function() {
                        if (!viewModel.selectedEventName.error) {
                            viewModel.selectedEvent.name = viewModel.selectedEventName.value;
                            viewModel.selectedEvent.eventType =  viewModel.selectedEventType;
                            viewModel.selectedEvent.triggeringComponent = viewModel.eventEditorTriggeringComponent;
                            viewModel.selectedEvent.trigger = viewModel.eventEditorTrigger;
                            viewModel.selectedEvent.actions = viewModel.selectedEventActions;

                            self.eventDialog.dialog('close');
                        }
                    },
                    'Cancel': function() {
                        self.eventDialog.dialog('close');
                    }
                }
            });
        }

    };

    return EventHelper;
});