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
    var shouldAmendChanges = false;
    var addUndoHistory;
    var addRedoHistory;
    var amendUndoHistory;
    var amendRedoHistory;
    var HistoryMonitor = function(addUndoHistoryFunction, addRedoHistoryFunction, amendUndoHistoryFunction,
        amendRedoHistoryFunction) {

        if (defined(instance)) {
            return HistoryMonitor.getInstance();
        }

        addUndoHistory = addUndoHistoryFunction;
        addRedoHistory = addRedoHistoryFunction;
        amendUndoHistory = amendUndoHistoryFunction;
        amendRedoHistory = amendRedoHistoryFunction;

        instance = this;
    };

    HistoryMonitor.getInstance = function() {
        return instance;
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

        var previousState = undoRedoSubscriptionPaused;

        undoRedoSubscriptionPaused = true;
        functionToExecute();
        undoRedoSubscriptionPaused = previousState;
    };

    /**
     * Executes the given function, amending changes in history rather than adding changes to the history.
     * This can be useful for bundling changes together when the first action triggers additional changes,
     * preventing executeIgnoreHistory from being used.
     *
     * @param functionToExecute
     */
    HistoryMonitor.prototype.executeAmendHistory = function(functionToExecute) {
        if (typeof functionToExecute !== 'function') {
            console.log('Must be a function.');
            return;
        }

        var previousState = shouldAmendChanges;

        shouldAmendChanges = true;
        functionToExecute();
        shouldAmendChanges = previousState;
    };

    /**
     * Adds the undo and redo functions in the correct order. Use this when possible to avoid adding them in the
     * incorrect order.
     *
     * @param undoFunction
     *            The undo function to add
     * @param redoFunction
     *            The redo function to add
     */
    HistoryMonitor.prototype.addChanges = function(undoFunction, redoFunction) {
        if (typeof undoFunction !== 'function') {
            console.log('Must be a function.');
            return;
        }

        if (typeof redoFunction !== 'function') {
            console.log('Must be a function.');
            return;
        }

        this.addUndoChange(undoFunction);
        this.addRedoChange(redoFunction);
    };

    /**
     * The undo function must always be added before the redo function. Use addChanges when possible to avoid issues.
     *
     * @param undoFunction
     *            The undo function to add
     */
    HistoryMonitor.prototype.addUndoChange = function(undoFunction) {
        if (typeof undoFunction !== 'function') {
            console.log('Must be a function.');
            return;
        }

        // Don't change history.
        if (undoRedoSubscriptionPaused) {
            return;
        }

        if (shouldAmendChanges) {
            amendUndoHistory(undoFunction);
        }
        else {
            addUndoHistory(undoFunction);
        }
    };

    /**
     * The redo function must always be added after the undo function. Use addChanges when possible to avoid issues.
     *
     * @param redoFunction
     *            The redo function to add
     */
    HistoryMonitor.prototype.addRedoChange = function(redoFunction) {
        if (typeof redoFunction !== 'function') {
            console.log('Must be a function.');
            return;
        }

        // Don't change history.
        if (undoRedoSubscriptionPaused) {
            return;
        }

        if (shouldAmendChanges) {
            amendRedoHistory(redoFunction);
        }
        else {
            addRedoHistory(redoFunction);
        }
    };

    return HistoryMonitor;
});