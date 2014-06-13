define(['knockout',
        'modules/HistoryMonitor',
        'util/defined',
        'util/subscribeObservable'
    ], function(
        ko,
        HistoryMonitor,
        defined,
        subscribeObservable) {
    'use strict';

    var instance;
    var PropertyChangeSubscriber = function() {
        if (defined(instance)) {
            return PropertyChangeSubscriber.getInstance();
        }

        this.historyMonitor = HistoryMonitor.getInstance();

        instance = this;
    };

    PropertyChangeSubscriber.getInstance = function() {
        return instance;
    };

    /**
     * Subscribes to the beforeChange event, adding the undo change to the history.
     */
    PropertyChangeSubscriber.prototype.subscribeBeforeChange = function(container, observableName) {
        var self = this;

        return subscribeObservable(container, observableName, function(oldValue) {
            self.historyMonitor.addUndoChange(function() {
                container[observableName] = oldValue;

                // Clear errors. We can only ever undo to valid values anyway
                container.error = false;
                container.message = '';
            });
        }, null, 'beforeChange');
    };

    /**
     * Subscribes to the change event, adding the redo change to the history.
     */
    PropertyChangeSubscriber.prototype.subscribeChange = function(container, observableName) {
        var self = this;

        return subscribeObservable(container, observableName, function(newValue) {
            self.historyMonitor.addRedoChange(function() {
                container[observableName] = newValue;
            });
        });
    };

    /**
     * Subscribes to the arrayChange event, adding the undo/redo change to the history.
     */
    PropertyChangeSubscriber.prototype.subscribeArrayChange = function(container, observableName) {
        var self = this;

        return subscribeObservable(container, observableName, function(changes) {
            changes.forEach(function(change) {
                var list = container[observableName];
                var item = change.value;
                var index = change.index;

                var historyMonitor = HistoryMonitor.getInstance();
                var undoChange;
                var executeChange;

                if (change.status === 'added') {
                    undoChange = function() {
                        list.splice(index, 1);
                    };

                    executeChange = function() {
                        list.splice(index, 0, item);
                    };

                    historyMonitor.addChanges(undoChange, executeChange);
                }
                else if (change.status === 'deleted') {
                    undoChange = function() {
                        list.splice(index, 0, item);
                    };

                    executeChange = function() {
                        list.splice(index, 1);
                    };

                    historyMonitor.addChanges(undoChange, executeChange);
                }
            });
        }, null, 'arrayChange');

    };

    return PropertyChangeSubscriber;
});