define([
        'WAVEDViewModel',
        './UniqueTracker',
        './HistoryMonitor',
        'models/Event/Event',
        'util/defined',
        'util/displayMessage',
        'knockout',
        'jquery'
    ],function(
        WAVEDViewModel,
        UniqueTracker,
        HistoryMonitor,
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
            viewModel.selectedEventActions = viewModel.selectedEvent.actions.slice(0);

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

                        self.updateEditChanges(viewModel);

                        self.eventDialog.dialog('close');
                    },
                    'Cancel': function() {
                        self.eventDialog.dialog('close');
                    }
                }
            });
        },
        updateEditChanges: function(viewModel) {
            var event = viewModel.selectedEvent;

            var oldName = event.name;
            var oldEventType = event.eventType;
            var oldTriggeringComponent = event.triggeringComponent;
            var oldTrigger = event.trigger;
            var oldActions = event.actions;

            function undoChange() {
                event.name = oldName;
                event.eventType = oldEventType;
                event.triggeringComponent = oldTriggeringComponent;
                event.trigger = oldTrigger;
                event.actions = oldActions;
            }

            var newName = viewModel.selectedEventName.value;
            var newEventType = viewModel.selectedEventType;
            var newTriggeringComponent = viewModel.eventEditorTriggeringComponent;
            var newTrigger = viewModel.eventEditorTrigger;
            var newActions = viewModel.selectedEventActions;

            function executeChange() {
                event.name = newName;
                event.eventType = newEventType;
                event.triggeringComponent = newTriggeringComponent;
                event.trigger = newTrigger;
                event.actions = newActions;
            }

            var historyMonitor = HistoryMonitor.getInstance();
            historyMonitor.addUndoChange(undoChange);
            historyMonitor.addRedoChange(executeChange);

            historyMonitor.pauseUndoRedoSubscription();
            executeChange();
            historyMonitor.resumeUndoRedoSubscription();
        }

    };

    return EventHelper;
});