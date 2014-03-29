/* global console*/
define(['knockout',
        'util/defined',
        'util/subscribeObservable'
    ], function(
        ko,
        defined,
        subscribeObservable) {
    'use strict';

    var instance;
    var undoRedoSubscriptionPaused = false;
    var addUndoHistory;
    var addRedoHistory;
    var HistoryMonitor = function(addUndoHistoryFunction, addRedoHistoryFunction) {
        if (defined(instance)) {
            return HistoryMonitor.getInstance();
        }

        addUndoHistory = addUndoHistoryFunction;
        addRedoHistory = addRedoHistoryFunction;

        instance = this;
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
     * @param functionToExecute
     */
    HistoryMonitor.prototype.executeIgnoreHistory = function(functionToExecute) {
        if (typeof functionToExecute !== 'function') {
            console.log('Must be a function.');
            return;
        }

        undoRedoSubscriptionPaused = true;
        functionToExecute();
        undoRedoSubscriptionPaused = false;
    };

    HistoryMonitor.prototype.addUndoChange = function(undoFunction) {
        if (typeof undoFunction !== 'function') {
            console.log('Must be a function.');
            return;
        }

        addUndoHistory(undoFunction);
    };

    HistoryMonitor.prototype.addRedoChange = function(redoFunction) {
        if (typeof redoFunction !== 'function') {
            console.log('Must be a function.');
            return;
        }

        addRedoHistory(redoFunction);
    };

    return HistoryMonitor;
});