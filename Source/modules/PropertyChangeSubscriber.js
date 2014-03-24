define(['knockout',
        'util/subscribeObservable'
    ], function(
        ko,
        subscribeObservable) {
    'use strict';

    var PropertyChangeSubscriber = function(setDirtyFunction, addUndoHistoryFunction, addRedoHistoryFunction,
        isUndoRedoSubscriptionPausedFunction) {

        this.setDirty = setDirtyFunction;
        this.addUndoHistory = addUndoHistoryFunction;
        this.addRedoHistory = addRedoHistoryFunction;
        this.isUndoRedoSubscriptionPaused = isUndoRedoSubscriptionPausedFunction;
    };

    /**
     * Subscribes to the beforeChange event, adding the undo change to the history.
     */
    PropertyChangeSubscriber.prototype.subscribeBeforeChange = function(container, observableName) {
        var self = this;

        return subscribeObservable(container, observableName, function(oldValue) {
            if (!self.isUndoRedoSubscriptionPaused()) {
                self.addUndoHistory(function() {
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

            if (!self.isUndoRedoSubscriptionPaused()) {
                self.addRedoHistory(function() {
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

            if (self.isUndoRedoSubscriptionPaused()) {
                return;
            }

            changes.forEach(function(change) {
                var list = container[observableName];
                var item = change.value;
                var index = change.index;

                if (change.status === 'added') {
                    self.addUndoHistory(function() {
                        list.splice(index, 1);
                    });

                    self.addRedoHistory(function() {
                        list.splice(index, 0, item);
                    });
                }
                else if (change.status === 'deleted') {
                    self.addUndoHistory(function() {
                        list.splice(index, 0, item);
                    });

                    self.addRedoHistory(function() {
                        list.splice(index, 1);
                    });
                }
            });
        }, null, 'arrayChange');

    };

    return PropertyChangeSubscriber;
});