define(['knockout',
        'modules/HistoryMonitor',
        'util/subscribeObservable'
    ], function(
        ko,
        HistoryMonitor,
        subscribeObservable) {
    'use strict';

    var instance;
    var initialized = false;
    var PropertyChangeSubscriber = function(setDirtyFunction) {

        if (initialized) {
            return PropertyChangeSubscriber.getInstance();
        }

        this.setDirty = setDirtyFunction;
        this.historyMonitor = HistoryMonitor.getInstance();

        instance = this;
        initialized = true;
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
            if (!self.historyMonitor.isUndoRedoSubscriptionPaused()) {
                self.historyMonitor.addUndoHistory(function() {
                    container[observableName] = oldValue;
                });
            }
        }, null, 'beforeChange');
    };

    /**
     * Subscribes to the change event, adding the redo change to the history and setting the dirty flag.
     */
    PropertyChangeSubscriber.prototype.subscribeChange = function(container, observableName) {
        var self = this;

        return subscribeObservable(container, observableName, function(newValue) {
            self.setDirty();

            if (!self.historyMonitor.isUndoRedoSubscriptionPaused()) {
                self.historyMonitor.addRedoHistory(function() {
                    container[observableName] = newValue;
                });
            }
        });
    };

    /**
     * Subscribes to the arrayChange event, adding the undo/redo change to the history and setting the dirty flag.
     */
    PropertyChangeSubscriber.prototype.subscribeArrayChange = function(container, observableName) {
        var self = this;

        return subscribeObservable(container, observableName, function(changes) {
            self.setDirty();

            if (self.historyMonitor.isUndoRedoSubscriptionPaused()) {
                return;
            }

            changes.forEach(function(change) {
                var list = container[observableName];
                var item = change.value;
                var index = change.index;

                if (change.status === 'added') {
                    self.historyMonitor.addUndoHistory(function() {
                        list.splice(index, 1);
                    });

                    self.historyMonitor.addRedoHistory(function() {
                        list.splice(index, 0, item);
                    });
                }
                else if (change.status === 'deleted') {
                    self.historyMonitor.addUndoHistory(function() {
                        list.splice(index, 0, item);
                    });

                    self.historyMonitor.addRedoHistory(function() {
                        list.splice(index, 1);
                    });
                }
            });
        }, null, 'arrayChange');

    };

    return PropertyChangeSubscriber;
});