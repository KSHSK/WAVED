define(['knockout',
        'util/subscribeObservable'
    ], function(
        ko,
        subscribeObservable) {
    'use strict';

    var instance;
    var initialized = false;
    var HistoryMonitor = function(setDirtyFunction, addUndoHistoryFunction, addRedoHistoryFunction,
        setUndoRedoSubscriptionPaused) {

        if (initialized) {
            return HistoryMonitor.getInstance();
        }

        this.setDirty = setDirtyFunction;
        this.addUndoHistory = addUndoHistoryFunction;
        this.addRedoHistory = addRedoHistoryFunction;
        this.setUndoRedoSubscriptionPaused = setUndoRedoSubscriptionPaused;

        instance = this;
        initialized = true;
    };

    HistoryMonitor.getInstance = function() {
        return instance;
    };

    HistoryMonitor.prototype.pauseUndoRedoSubscription = function() {
        this.setUndoRedoSubscriptionPaused(true);
    };

    HistoryMonitor.prototype.resumeUndoRedoSubscription = function() {
        this.setUndoRedoSubscriptionPaused(false);
    };

    HistoryMonitor.prototype.addUndoChange = function(undoFunction) {
        var self = this;
        this.addUndoHistory(function() {
            self.setDirty();
            undoFunction();
        });
    };

    HistoryMonitor.prototype.addRedoChange = function(redoFunction) {
        var self = this;
        this.addRedoHistory(function() {
            self.setDirty();
            redoFunction();
        });
    };

    return HistoryMonitor;
});