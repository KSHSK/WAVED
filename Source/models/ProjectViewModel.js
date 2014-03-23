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
    var ProjectViewModel = function(state, availableWidgets) {
        self = this;
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

        this.setState(state, availableWidgets);
        // TODO: Update Project Tree if necessary.

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

    // TODO: Update this to make it more generic to Components, temporarily just using this._components in the
    // methods
    ProjectViewModel.prototype.addComponent = function(component) {
        this._components.push(component);
    };

    ProjectViewModel.prototype.removeComponent = function(component) {
        if (component !== this._workspace) {
            var index = this._components.indexOf(component);
            if (index > -1) {
                this._components.splice(index, 1);
            }
        }
    };

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

            var newDataSets = $.map(state.dataSets, function(itemState) {
                if (itemState.type === DataSet.getType()) {
                    return new DataSet(itemState);
                }

                if (itemState.type === DataSubset.getType()) {
                    return new DataSubset(itemState);
                }

                // Invalid state.
                return null;
            });

            this._dataSets.push.apply(this._dataSets, newDataSets);
        }

        if (defined(state.components)) {
            var self = this;
            // Clear array.
            this._components.length = 1;

            var newComponents = $.map(state.components, function(itemState) {
                for (var index in availableWidgets) {
                    var widget = availableWidgets[index];
                    if (itemState.type === widget.o.getViewModelType()) {
                        return new widget.o(itemState, self.getDataSet);
                    }
                }

                // Invalid state.
                return null;
            });

            this._components.push.apply(this._components, newComponents);
        }

        if (defined(state.actions)) {
            // Clear array.
            this._actions.length = 0;

            var newActions = $.map(state.actions, function(itemState) {
                itemState.target = self.getComponent(itemState.target);

                if (itemState.type === PropertyAction.getType()) {
                    return new PropertyAction(itemState);
                }

                if (itemState.type === QueryAction.getType()) {
                    return new QueryAction(itemState);
                }

                // Invalid state.
                return null;
            });

            this._actions.push.apply(this._actions, newActions);
        }

        if (defined(state.events)) {
            // Clear array.
            this._events.length = 0;

            var newEvents = $.map(state.events, function(itemState) {
                itemState.triggeringComponent = self.getComponent(itemState.triggeringComponent);
                // TODO: Trigger?
                var actions = [];
                for (var i = 0; i < itemState.actions.length; i++) {
                    actions.push(self.getAction(itemState.actions[i]));
                }
                itemState.actions = actions;
                return new Event(itemState);
            });

            this._events.push.apply(this._events, newEvents);
        }
    };

    ProjectViewModel.prototype.addDataSet = function(data) {
        if (data instanceof DataSet) {
            this._dataSets.push(data);
        }
    };

    ProjectViewModel.prototype.addEvent = function(event) {
        this._events.push(event);
    };

    ProjectViewModel.prototype.addAction = function(action) {
        // TODO: Check that action doesn't already exist.
        this._actions.push(action);
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

    ProjectViewModel.prototype.getAction = function(name) {
        for (var index = 0; index < this._actions.length; index++) {
            var action = this._actions[index];
            if (action.name === name) {
                return action;
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

    // TODO: Do we want to allow removal using dataset instance and name?
    // The DD specifies this, but we should probably pick one.
    ProjectViewModel.prototype.removeDataSet = function(dataSet) {
        var index = this._dataSets.indexOf(dataSet);
        if (index > -1) {
            this._dataSets.splice(index, 1);
        }
    };

    ProjectViewModel.prototype.removeEvent = function(event) {
        var index = self._events.indexOf(event);
        if (index > -1) {
            self._events.splice(index, 1);
        }
    };

    ProjectViewModel.prototype.removeAction = function(action) {
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
        }
    };

    ProjectViewModel.prototype.refreshWorkspace = function() {
        //TODO
    };

    ProjectViewModel.prototype.subscribeChanges = function(setDirty, addUndo, addRedo) {
        function arrayChanged(changes, list) {
            setDirty();

            changes.forEach(function(change) {
                var subscriber = change.value.viewModel || change.value;
                if (change.status === 'added') {
                    subscriber.subscribeChanges(setDirty);
                }
                else if (change.status === 'deleted') {
                    subscriber.subscriptions.forEach(function(subscription) {
                        subscription.dispose();
                    });
                }
            });
        }

        // Workspace changed.
        this.workspace.subscribeChanges(setDirty);

        // Google Analytics changed.
        this.googleAnalytics.subscribeChanges(setDirty);

        // Component is added or removed.
        subscribeObservable(this, '_components', function(changes) {
            arrayChanged(changes, self._components);
        }, null, 'arrayChange');

        // DataSet is added or removed.
        subscribeObservable(this, '_dataSets', function(changes) {
            arrayChanged(changes, self._dataSets);
        }, null, 'arrayChange');

        // Action is added or removed.
        subscribeObservable(this, '_actions', function(changes) {
            arrayChanged(changes, self._actions);
        }, null, 'arrayChange');

        // Event is added or removed.
        subscribeObservable(this, '_events', function(changes) {
            arrayChanged(changes, self._events);
        }, null, 'arrayChange');
    };

    return ProjectViewModel;
});