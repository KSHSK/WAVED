define([
        'WAVEDViewModel',
        './UniqueTracker',
        'models/Event/Event',
        'util/defined',
        'util/displayMessage',
        'knockout',
        'jquery'
    ],function(
        WAVEDViewModel,
        UniqueTracker,
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
            viewModel.selectedEventName.reset();
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
                        if (viewModel.selectedEventName.error) {
                            viewModel.selectedEventName.message = viewModel.selectedEventName.errorMessage;
                            return;
                        }

                        if (!UniqueTracker.isValueUnique(Event.getUniqueNameNamespace(),
                            viewModel.selectedEventName.value)) {

                            displayMessage('The name "' + viewModel.selectedEventName.value + '" is already in use.');
                            return;
                        }

                        var event = new Event({
                            name: viewModel.selectedEventName.value,
                            eventType: viewModel.selectedEventType,
                            triggeringComponent: viewModel.eventEditorTriggeringComponent,
                            trigger: viewModel.eventEditorTrigger,
                            actions: viewModel.selectedEventActions
                        });
                        viewModel.currentProject.addEvent(event);
                        self.eventDialog.dialog('close');
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
                buttons: {
                    'Save': function() {
                        if (viewModel.selectedEventName.error) {
                            viewModel.selectedEventName.message = viewModel.selectedEventName.errorMessage;
                            return;
                        }

                        if (!UniqueTracker.isValueUnique(Event.getUniqueNameNamespace(),
                            viewModel.selectedEventName.value, viewModel.selectedEvent)) {

                            displayMessage('The name "' + viewModel.selectedEventName.value + '" is already in use.');
                            return;
                        }

                        // Update values only if changed.
                        var name = viewModel.selectedEventName.value;
                        if (viewModel.selectedEvent.name !== name) {
                            viewModel.selectedEvent.name = name;
                        }

                        var eventType = viewModel.selectedEventType;
                        if (viewModel.selectedEvent.eventType !== eventType) {
                            viewModel.selectedEvent.eventType = eventType;
                        }

                        var triggeringComponent = viewModel.eventEditorTriggeringComponent;
                        if (viewModel.selectedEvent.triggeringComponent !== triggeringComponent) {
                            viewModel.selectedEvent.triggeringComponent = triggeringComponent;
                        }

                        var trigger = viewModel.eventEditorTrigger;
                        if (viewModel.selectedEvent.trigger !== trigger) {
                            viewModel.selectedEvent.trigger = trigger;
                        }

                        var actions = viewModel.selectedEventActions;
                        if (viewModel.selectedEvent.actions !== actions) {
                            viewModel.selectedEvent.actions = actions;
                        }

                        self.eventDialog.dialog('close');
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