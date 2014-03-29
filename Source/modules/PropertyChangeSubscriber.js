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
    var PropertyChangeSubscriber = function(setDirtyFunction) {
        if (defined(instance)) {
            return PropertyChangeSubscriber.getInstance();
        }

        this.setDirty = setDirtyFunction;
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
            if (!self.historyMonitor.isUndoRedoSubscriptionPaused()) {
                self.historyMonitor.addUndoChange(function() {
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
                self.historyMonitor.addRedoChange(function() {
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
                    self.historyMonitor.addUndoChange(function() {
                        list.splice(index, 1);
                    });

                    self.historyMonitor.addRedoChange(function() {
                        list.splice(index, 0, item);
                    });
                }
                else if (change.status === 'deleted') {
                    self.historyMonitor.addUndoChange(function() {
                        list.splice(index, 0, item);
                    });

                    self.historyMonitor.addRedoChange(function() {
                        list.splice(index, 1);
                    });
                }
            });
        }, null, 'arrayChange');

    };

    return PropertyChangeSubscriber;
});