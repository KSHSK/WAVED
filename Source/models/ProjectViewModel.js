define([
        'jquery',
        'knockout',
        'util/defined',
        'util/defaultValue',
        'util/displayMessage',
        'util/subscribeObservable',
        'models/Action/Action',
        'models/Action/PropertyAction',
        'models/Action/QueryAction',
        'models/Event/Event',
        'models/WorkspaceViewModel',
        'models/GoogleAnalytics',
        'models/Data/DataSet',
        'models/Data/DataSubset'
    ], function(
        $,
        ko,
        defined,
        defaultValue,
        displayMessage,
        subscribeObservable,
        Action,
        PropertyAction,
        QueryAction,
        Event,
        WorkspaceViewModel,
        GoogleAnalytics,
        DataSet,
        DataSubset) {
    'use strict';

    var self;
    var addUndoHistoryFunction;
    var addRedoHistoryFunction;
    var ProjectViewModel = function(state, undoFunction, redoFunction) {
        self = this;
        addUndoHistoryFunction = undoFunction;
        addRedoHistoryFunction = redoFunction;

        state = defined(state) ? state : {};

        if (typeof state.name === 'undefined') {
            throw new Error('ProjectViewModel name is required');
        }

        this._name = state.name;
        this._googleAnalytics = new GoogleAnalytics();
        this._workspace = new WorkspaceViewModel();
        this._components = [this._workspace];
        this._dataSets = [];
        this._actions = [];
        this._events = [];

        this.setState(state);

        ko.track(this);
    };

    Object.defineProperties(ProjectViewModel.prototype, {
        name: {
            get: function() {
                return this._name;
            },
            set: function(value) {
                this._name = value;
            }
        },
        components: {
            get: function() {
                return this._components;
            }
        },
        dataSets: {
            get: function() {
                return this._dataSets;
            }
        },
        unmarkedDataSets: {
            get: function() {
                // TODO: Should this also filter to only grab proper DataSets (exclude DataSubsets)?
                // If not here, it still needs to be done somewhere for displaying on the page.
                return this._dataSets.filter(function(dataSet) {
                    return !dataSet.isMarkedForDeletion();
                });
            }
        },
        googleAnalytics: {
            get: function() {
                return self._googleAnalytics;
            },
            set: function(value) {
                self._googleAnalytics = value;
            }
        },
        events: {
            get: function() {
                return this._events;
            }
        },
        actions: {
            get: function() {
                return this._actions;
            }
        },
        workspace: {
            get: function() {
                return this._workspace;
            }
        }
    });

    ProjectViewModel.prototype.getState = function() {
        self = this;

        return {
            'name': this._name,
            'workspace': this._workspace.getState(),
            'analytics': this._googleAnalytics.getState(),
            'components': $.map(this._components, function(item) {
                // Skip workspace.
                if (item === self._workspace) {
                    return null;
                }

                return item.viewModel.getState();
            }),
            'dataSets': $.map(this._dataSets, function(item) {
                return item.getState();
            }),
            'actions': $.map(this._actions, function(item) {
                return item.getState();
            }),
            'events': $.map(this._events, function(item) {
                return item.getState();
            })
        };
    };

    ProjectViewModel.prototype.setState = function(state, availableWidgets) {
        var self = this;

        if (defined(state.name)) {
            this._name = state.name;
        }

        if (defined(state.analytics)) {
            this._googleAnalytics.setState(state.analytics);
        }

        if (defined(state.workspace)) {
            this._workspace.setState(state.workspace);
        }

        /*
         * Must go before components because any components that depend on DataSets
         * will need them to be available.
         */
        if (defined(state.dataSets)) {
            // Clear array.
            this._dataSets.length = 0;

            var newDataSets = $.each(state.dataSets, function(itemIndex, itemState) {
                var dataSet;

                if (itemState.type === DataSet.getType()) {
                    dataSet = new DataSet(itemState);
                }
                else if (itemState.type === DataSubset.getType()) {
                    dataSet = new DataSubset(itemState);
                }
                else {
                    // Invalid state.
                    return;
                }

                self.addDataSet(dataSet);
            });
        }

        if (defined(state.components)) {
            // Clear array except for Workspace.
            this._components.length = 1;

            var newComponents = $.each(state.components, function(itemIndex, itemState) {
                for (var index = 0; index < availableWidgets.length; index++) {
                    var widget = availableWidgets[index];
                    if (itemState.type === widget.o.getViewModelType()) {
                        var component =  new widget.o(itemState, self.getDataSet);
                        self.addComponent(component);
                    }
                }
            });
        }

        if (defined(state.actions)) {
            // Clear array.
            this._actions.length = 0;

            var newActions = $.each(state.actions, function(itemIndex, itemState) {
                var action;

                if (itemState.type === PropertyAction.getType()) {
                    itemState.target = self.getComponent(itemState.target);
                    action = new PropertyAction(itemState);
                }
                else if (itemState.type === QueryAction.getType()) {
                    action = new QueryAction(itemState);
                }
                else {
                    // Invalid state.
                    return;
                }

                self.addAction(action);
            });
        }

        if (defined(state.events)) {
            // Clear array.
            this._events.length = 0;

            var newEvents = $.each(state.events, function(itemIndex, itemState) {
                itemState.triggeringComponent = self.getComponent(itemState.triggeringComponent);
                // TODO: Trigger?
                var actions = [];
                for (var i = 0; i < itemState.actions.length; i++) {
                    actions.push(self.getAction(itemState.actions[i]));
                }

                itemState.actions = actions;

                var event = new Event(itemState);
                self.addEvent(event);
            });
        }
    };

    // TODO: Update this to make it more generic to Components, temporarily just using this._components in the
    // methods
    ProjectViewModel.prototype.addComponent = function(component, ignoreHistory) {
        this._components.push(component);

        // Add the DOM element.
        component.addToWorkspace();

        // Don't add history if called from undo/redo.
        if (ignoreHistory !== true) {
            // Undo by removing the item.
            addUndoHistoryFunction(function() {
                self.removeComponent(component, true);
            });

            // Redo by readding the item.
            addRedoHistoryFunction(function() {
                self.addComponent(component, true);
            });
        }
    };

    ProjectViewModel.prototype.addDataSet = function(data, ignoreHistory) {
        if (data instanceof DataSet) {
            this._dataSets.push(data);

            // Don't add history if called from undo/redo.
            if (ignoreHistory !== true) {
                // Undo by removing the item.
                addUndoHistoryFunction(function() {
                    self.removeDataSet(data, true);
                });

                // Redo by readding the item.
                addRedoHistoryFunction(function() {
                    self.addDataSet(data, true);
                });
            }
        }
    };

    ProjectViewModel.prototype.addAction = function(action, ignoreHistory) {
        this._actions.push(action);

        // Don't add history if called from undo/redo.
        if (ignoreHistory !== true) {
            // Undo by removing the item.
            addUndoHistoryFunction(function() {
                self.removeAction(action, true);
            });

            // Redo by readding the item.
            addRedoHistoryFunction(function() {
                self.addAction(action, true);
            });
        }
    };

    ProjectViewModel.prototype.addEvent = function(event, ignoreHistory) {
        this._events.push(event);

        // Don't add history if called from undo/redo.
        if (ignoreHistory !== true) {
            // Undo by removing the item.
            addUndoHistoryFunction(function() {
                self.removeEvent(event, true);
            });

            // Redo by readding the item.
            addRedoHistoryFunction(function() {
                self.addEvent(event, true);
            });
        }
    };

    ProjectViewModel.prototype.getComponent = function(name) {
        for (var index = 0; index < this._components.length; index++) {
            var component = this._components[index];
            if (component.viewModel.name.value === name) {
                return component;
            }
        }

        return null;
    };

    ProjectViewModel.prototype.getDataSet = function(name) {
        for (var index = 0; index < self._dataSets.length; index++) {
            var dataSet = self._dataSets[index];
            if (dataSet.name === name) {
                return dataSet;
            }
        }

        return null;
    };

    ProjectViewModel.prototype.getAction = function(name) {
        for (var index = 0; index < this._actions.length; index++) {
            var action = this._actions[index];
            if (action.name === name) {
                return action;
            }
        }

        return null;
    };

    ProjectViewModel.prototype.getEvent = function(name) {
        // TODO
    };

    ProjectViewModel.prototype.removeComponent = function(component, ignoreHistory) {
        if (component !== this._workspace) {
            var index = this._components.indexOf(component);
            if (index > -1) {
                this._components.splice(index, 1);

                // Remove the DOM element.
                component.removeFromWorkspace();

                // Don't add history if called from undo/redo.
                if (ignoreHistory !== true) {
                    // Undo by removing the item.
                    addUndoHistoryFunction(function() {
                        self.addComponent(component, true);
                    });

                    // Redo by readding the item.
                    addRedoHistoryFunction(function() {
                        self.removeComponent(component, true);
                    });
                }
            }
        }
    };

    // TODO: Do we want to allow removal using dataset instance and name?
    // The DD specifies this, but we should probably pick one.
    ProjectViewModel.prototype.removeDataSet = function(dataSet, ignoreHistory) {
        var index = this._dataSets.indexOf(dataSet);
        if (index > -1) {
            this._dataSets.splice(index, 1);

            // Don't add history if called from undo/redo.
            if (ignoreHistory !== true) {
                // Undo by removing the item.
                addUndoHistoryFunction(function() {
                    self.addDataSet(dataSet, true);
                });

                // Redo by readding the item.
                addRedoHistoryFunction(function() {
                    self.removeDataSet(dataSet, true);
                });
            }
        }
    };

    ProjectViewModel.prototype.removeAction = function(action, ignoreHistory) {
        for (var i = 0; i < self._events.length; i++) {
            for (var j = 0; j < self._events[i].actions[0].length; j++) {
                if (self._events[i]._actions[0][j].name.value === action.name.value) {
                    displayMessage('Action is in use by Event: ' + self._events[i].name.value);
                    return;
                }
            }
        }

        var index = self._actions.indexOf(action);
        if (index > -1) {
            self._actions.splice(index, 1);

            // Don't add history if called from undo/redo.
            if (ignoreHistory !== true) {
                // Undo by removing the item.
                addUndoHistoryFunction(function() {
                    self.addAction(action, true);
                });

                // Redo by readding the item.
                addRedoHistoryFunction(function() {
                    self.removeAction(action, true);
                });
            }
        }
    };

    ProjectViewModel.prototype.removeEvent = function(event, ignoreHistory) {
        var index = self._events.indexOf(event);
        if (index > -1) {
            self._events.splice(index, 1);

            // Don't add history if called from undo/redo.
            if (ignoreHistory !== true) {
                // Undo by removing the item.
                addUndoHistoryFunction(function() {
                    self.addEvent(event, true);
                });

                // Redo by readding the item.
                addRedoHistoryFunction(function() {
                    self.removeEvent(event, true);
                });
            }
        }
    };

    ProjectViewModel.prototype.refreshWorkspace = function() {
        //TODO
    };

    ProjectViewModel.prototype.subscribeChanges = function(setDirty) {
        function arrayChanged(changes) {
            setDirty();

            changes.forEach(function(change) {
                var subscriber = change.value.viewModel || change.value;

                if (change.status === 'added') {
                    // Subscribe to dirty changes if not already subscribed.
                    if (!subscriber.subscribed) {
                        subscriber.subscribeChanges(setDirty);
                    }
                }
            });
        }

        // Workspace changed.
        this.workspace.subscribeChanges(setDirty);

        // Google Analytics changed.
        this.googleAnalytics.subscribeChanges(setDirty);

        // Component is added or removed.
        subscribeObservable(this, '_components', function(changes) {
            arrayChanged(changes);
        }, null, 'arrayChange');

        // DataSet is added or removed.
        subscribeObservable(this, '_dataSets', function(changes) {
            arrayChanged(changes);
        }, null, 'arrayChange');

        // Action is added or removed.
        subscribeObservable(this, '_actions', function(changes) {
            arrayChanged(changes);
        }, null, 'arrayChange');

        // Event is added or removed.
        subscribeObservable(this, '_events', function(changes) {
            arrayChanged(changes);
        }, null, 'arrayChange');
    };

    return ProjectViewModel;
});