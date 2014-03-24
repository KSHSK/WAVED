define(['knockout',
        'util/subscribeObservable'
    ], function(
        ko,
        subscribeObservable) {
    'use strict';

    var PropertyChangeSubscriber = function(setDirtyFunction, addUndoHistoryFunction, addRedoHistoryFunction,
        pauseUndoRedoSubscriptionFunction) {

        this.setDirty = setDirtyFunction;
        this.addUndoHistory = addUndoHistoryFunction;
        this.addRedoHistory = addRedoHistoryFunction;
        this.pauseUndoRedoSubscription = pauseUndoRedoSubscriptionFunction;
    };

    /**
     * Subscribes to the beforeChange event, adding the undo change to the history.
     */
    PropertyChangeSubscriber.prototype.subscribeBeforeChange = function(container, observableName) {
        var self = this;

        return subscribeObservable(container, observableName, function(oldValue) {
            if (!self.pauseUndoRedoSubscription()) {
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

            if (!self.pauseUndoRedoSubscription()) {
                self.addRedoHistory(function() {
                    container[observableName] = newValue;
                });
            }
        });
    };

    return PropertyChangeSubscriber;
});