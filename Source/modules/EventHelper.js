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
            viewModel.selectedEventName = '';
            viewModel.selectedEvent = undefined;
            viewModel.selectedEventActions = [];
        },

        addEvent: function(viewModel) {
            var self = this;
            self.eventDialog.dialog({
                resizable: false,
                width: 500,
                modal: true,
                closeOnEscape: false,
                buttons: {
                    'Save': function() {
                        var event = new Event({
                            name: viewModel.selectedEventName,
                            eventType: viewModel.selectedEventType,
                            triggeringComponent: viewModel.eventEditorTriggeringComponent,
                            trigger: viewModel.eventEditorTrigger,
                            actions: viewModel.selectedEventActions
                        });
                        viewModel.currentProject.addEvent(event);
                        self.eventDialog.dialog('close');
                        self.resetEventEditor(viewModel);
                    },
                    'Cancel': function() {
                        self.eventDialog.dialog('close');
                        self.resetEventEditor(viewModel);
                    }
                }
            });
        },

        editEvent: function(viewModel) {
            var self = this;

            if (!defined(viewModel.selectedEvent)) {
                displayMessage('Select an event to edit.');
                return;
            }

            viewModel.selectedEventName = viewModel.selectedEvent.name;
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

                        viewModel.selectedEvent.name = viewModel.selectedEventName;
                        viewModel.selectedEvent.eventType =  viewModel.selectedEventType;
                        viewModel.selectedEvent.triggeringComponent = viewModel.eventEditorTriggeringComponent;
                        viewModel.selectedEvent.trigger = viewModel.eventEditorTrigger;
                        viewModel.selectedEvent.actions = viewModel.selectedEventActions;

                        self.eventDialog.dialog('close');
                        self.resetEventEditor(viewModel);
                    },
                    'Cancel': function() {
                        self.eventDialog.dialog('close');
                        self.resetEventEditor(viewModel);
                    }
                }
            });
        }

    };

    return EventHelper;
});