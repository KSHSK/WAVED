define(['knockout',
        'util/subscribeObservable'
    ], function(
        ko,
        subscribeObservable) {
    'use strict';

    var instance;
    var initialized = false;
    var undoRedoSubscriptionPaused = false;
    var HistoryMonitor = function(addUndoHistoryFunction, addRedoHistoryFunction) {

        if (initialized) {
            return HistoryMonitor.getInstance();
        }

        this.addUndoHistory = addUndoHistoryFunction;
        this.addRedoHistory = addRedoHistoryFunction;

        instance = this;
        initialized = true;
    };

    HistoryMonitor.getInstance = function() {
        return instance;
    };

    HistoryMonitor.prototype.isUndoRedoSubscriptionPaused = function() {
        return undoRedoSubscriptionPaused;
    };

    /**
     * Executes the given function, ignoring changes that would normally be added to the history.
     * This can be useful for bundling multiple changes together, so that the individual changes aren't added.
     * This can be useful for undo/redo being called, so that undone changes aren't added as new changes.
     * @param func
     */
    HistoryMonitor.prototype.executeIgnoreHistory = function(func) {
        undoRedoSubscriptionPaused = true;
        func();
        undoRedoSubscriptionPaused = false;
    };

    HistoryMonitor.prototype.addUndoChange = function(undoFunction) {
        this.addUndoHistory(undoFunction);
    };

    HistoryMonitor.prototype.addRedoChange = function(redoFunction) {
        this.addRedoHistory(redoFunction);
    };

    return HistoryMonitor;
});