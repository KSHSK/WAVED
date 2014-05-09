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

    var eventDialog = $('#event-editor-dialog');

    function resetEventEditor (viewModel) {
        viewModel.eventEditorTriggeringWidget = undefined;
        viewModel.selectedEventType = undefined;
        viewModel.selectedEventName.reset();
        viewModel.selectedEventActions = [];
    }

    function updateEditChanges (viewModel) {
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
    }

    function hasErrors (viewModel) {
        var error = false;

        // Check that the event name is valid.
        if (viewModel.selectedEventName.error) {
            viewModel.selectedEventName.message = viewModel.selectedEventName.errorMessage;
            error = true;
        }

        // Check that a triggering widget is selected.
        if (!defined(viewModel.eventEditorTriggeringWidget)) {
            viewModel.eventEditorTriggeringWidgetError = true;
            error = true;
        }

        return error;
    }

    var EventHelper = {
        addEvent: function(viewModel) {
            var self = this;
            resetEventEditor(viewModel);
            eventDialog.dialog({
                resizable: false,
                width: 'auto',
                modal: true,
                buttons: {
                    'Save': function() {
                        if (hasErrors(viewModel)) {
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
                            triggeringWidget: viewModel.eventEditorTriggeringWidget,
                            actions: viewModel.selectedEventActions
                        });
                        viewModel.currentProject.addEvent(event);
                        eventDialog.dialog('close');
                    },
                    'Cancel': function() {
                        eventDialog.dialog('close');
                    }
                }
            });
        },
        editEvent: function(viewModel) {
            if (!defined(viewModel.selectedEvent)) {
                return;
            }

            var self = this;
            resetEventEditor(viewModel);

            viewModel.selectedEventName.value = viewModel.selectedEvent.name;
            viewModel.selectedEventType = viewModel.selectedEvent.eventType;
            viewModel.eventEditorTriggeringWidget = viewModel.selectedEvent.triggeringWidget;

            // Make a shallow copy of the array so that it's not referencing the same object.
            viewModel.selectedEventActions = viewModel.selectedEvent.actions.slice(0);

            eventDialog.dialog({
                resizable: false,
                width: 'auto',
                modal: true,
                buttons: {
                    'Save': function() {
                        if (hasErrors(viewModel)) {
                            return;
                        }

                        if (!UniqueTracker.isValueUnique(Event.getUniqueNameNamespace(),
                            viewModel.selectedEventName.value, viewModel.selectedEvent)) {

                            displayMessage('The name "' + viewModel.selectedEventName.value + '" is already in use.');
                            return;
                        }

                        updateEditChanges(viewModel);

                        eventDialog.dialog('close');
                    },
                    'Cancel': function() {
                        eventDialog.dialog('close');
                    }
                }
            });
        }
    };

    return EventHelper;
});