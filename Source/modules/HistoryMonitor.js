define(['knockout',
        'util/subscribeObservable'
    ], function(
        ko,
        subscribeObservable) {
    'use strict';

    var instance;
    var initialized = false;
    var HistoryMonitor = function(addUndoHistoryFunction, addRedoHistoryFunction,
        setUndoRedoSubscriptionPaused) {

        if (initialized) {
            return HistoryMonitor.getInstance();
        }

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
        this.addUndoHistory(undoFunction);
    };

    HistoryMonitor.prototype.addRedoChange = function(redoFunction) {
        this.addRedoHistory(redoFunction);
    };

    return HistoryMonitor;
});