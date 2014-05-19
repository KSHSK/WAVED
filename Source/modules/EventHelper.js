define([
        'WAVEDViewModel',
        './UniqueTracker',
        './HistoryMonitor',
        'models/Event/Event',
        'util/defined',
        'models/Constants/MessageType',
        'util/displayMessage',
        'knockout',
        'jquery'
    ],function(
        WAVEDViewModel,
        UniqueTracker,
        HistoryMonitor,
        Event,
        defined,
        MessageType,
        displayMessage,
        ko,
        $
    ){
    'use strict';

    var EventHelper = {
        eventDialog: $('#event-editor-dialog'),

        resetEventEditor: function(viewModel) {
            viewModel.eventEditorTriggeringWidget = undefined;
            viewModel.selectedEventType = undefined;
            viewModel.selectedEventName.reset();
            viewModel.selectedEventActions = [];
        },

        addEvent: function(viewModel) {
            var self = this;
            self.resetEventEditor(viewModel);
            self.eventDialog.dialog({
                resizable: false,
                width: 'auto',
                modal: true,
                buttons: {
                    'Save': {
                        text: 'Save',
                        'data-bind': 'jQueryDisable: eventDialogHasErrors()',
                        click:  function() {
                            if (self.hasErrors(viewModel)) {
                                return;
                            }

                            if (!UniqueTracker.isValueUnique(Event.getUniqueNameNamespace(),
                                viewModel.selectedEventName.value)) {

                                displayMessage('The name "' + viewModel.selectedEventName.value + '" is already in use.', MessageType.WARNING);
                                return;
                            }

                            var event = new Event({
                                name: viewModel.selectedEventName.value,
                                eventType: viewModel.selectedEventType,
                                triggeringWidget: viewModel.eventEditorTriggeringWidget,
                                actions: viewModel.selectedEventActions
                            });
                            viewModel.currentProject.addEvent(event);
                            self.eventDialog.dialog('close');
                        },
                        create: function() {
                            ko.applyBindings(viewModel, this);
                        },
                    },
                    'Cancel': function() {
                        self.eventDialog.dialog('close');
                    }
                }
            });
        },
        editEvent: function(viewModel) {
            if (!defined(viewModel.selectedEvent)) {
                return;
            }

            var self = this;
            self.resetEventEditor(viewModel);

            viewModel.selectedEventName.value = viewModel.selectedEvent.name;
            viewModel.selectedEventType = viewModel.selectedEvent.eventType;
            viewModel.eventEditorTriggeringWidget = viewModel.selectedEvent.triggeringWidget;

            // Make a shallow copy of the array so that it's not referencing the same object.
            viewModel.selectedEventActions = viewModel.selectedEvent.actions.slice(0);

            self.eventDialog.dialog({
                resizable: false,
                width: 'auto',
                modal: true,
                buttons: {
                    'Save': function() {
                        if (self.hasErrors(viewModel)) {
                            return;
                        }

                        if (!UniqueTracker.isValueUnique(Event.getUniqueNameNamespace(),
                            viewModel.selectedEventName.value, viewModel.selectedEvent)) {

                            displayMessage('The name "' + viewModel.selectedEventName.value + '" is already in use.', MessageType.WARNING);
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
            var oldTriggeringWidget = event.triggeringWidget;
            var oldActions = event.actions;

            function undoChange() {
                event.name = oldName;
                event.eventType = oldEventType;
                event.triggeringWidget = oldTriggeringWidget;
                event.actions = oldActions;
            }

            var newName = viewModel.selectedEventName.value;
            var newEventType = viewModel.selectedEventType;
            var newTriggeringWidget = viewModel.eventEditorTriggeringWidget;
            var newActions = viewModel.selectedEventActions;

            function executeChange() {
                event.name = newName;
                event.eventType = newEventType;
                event.triggeringWidget = newTriggeringWidget;
                event.actions = newActions;
            }

            var historyMonitor = HistoryMonitor.getInstance();
            historyMonitor.addChanges(undoChange, executeChange);

            historyMonitor.executeIgnoreHistory(executeChange);
        },
        hasErrors: function(viewModel) {
            var error = false;

            // Check that the event name is valid.
            if (viewModel.selectedEventName.error) {
                error = true;
            }

            // Check that a triggering widget is selected.
            if (!defined(viewModel.eventEditorTriggeringWidget)) {
                viewModel.eventEditorTriggeringWidgetError = true;
                error = true;
            }

            return error;
        }

    };

    return EventHelper;
});
