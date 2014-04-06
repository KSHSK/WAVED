/* global console*/
define([
        'jquery',
        'knockout',
        'util/defined',
        'util/defaultValue',
        'util/displayMessage',
        'util/updateQueryByName',
        'util/subscribeObservable',
        'models/SuperComponentViewModel',
        'models/Action/Action',
        'models/Action/PropertyAction',
        'models/Action/QueryAction',
        'models/Event/Event',
        'models/WorkspaceViewModel',
        'models/GoogleAnalytics',
        'models/Data/DataSet',
        'models/Data/DataSubset',
        'modules/PropertyChangeSubscriber',
        'modules/HistoryMonitor',
        'modules/UniqueTracker'
    ], function(
        $,
        ko,
        defined,
        defaultValue,
        displayMessage,
        updateQueryByName,
        subscribeObservable,
        SuperComponentViewModel,
        Action,
        PropertyAction,
        QueryAction,
        Event,
        WorkspaceViewModel,
        GoogleAnalytics,
        DataSet,
        DataSubset,
        PropertyChangeSubscriber,
        HistoryMonitor,
        UniqueTracker) {
    'use strict';

    var ProjectViewModel = function(state) {
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

        this.subscribeNameChange();
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
                return this._googleAnalytics;
            },
            set: function(value) {
                this._googleAnalytics = value;
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
        var self = this;

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

    ProjectViewModel.prototype.resetProject = function() {
        this._name = '';
        this._workspace.resetWorkspace();
        this._googleAnalytics.resetGoogleAnalytics();

        if (this._dataSets.length > 0) {
            this._dataSets.length = 0;
            ko.getObservable(this, '_dataSets').valueHasMutated();
        }

        if (this._components.length > 1) {
            this._components.length = 1;
            ko.getObservable(this, '_components').valueHasMutated();
        }

        if (this._actions.length > 0) {
            this._actions.length = 0;
            ko.getObservable(this, '_actions').valueHasMutated();
        }

        if (this._events.length > 0) {
            this._events.length = 0;
            ko.getObservable(this, '_events').valueHasMutated();
        }
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
                        var component =  new widget.o(itemState, self.getDataSet.bind(self));
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
    ProjectViewModel.prototype.addComponent = function(component, index) {
        var self = this;

        // Try to add unique name.
        var success = UniqueTracker.addValueIfUnique(SuperComponentViewModel.getUniqueNameNamespace(),
            component.viewModel.name.value, component.viewModel);

        if (!success) {
            console.log('New Component name was not unique.');
            return;
        }

        if (defined(index)) {
            this._components.splice(index, 0, component);
        }
        else {
            this._components.push(component);
        }

        // Add the DOM element.
        component.addToWorkspace();

        var historyMonitor = HistoryMonitor.getInstance();

        // Undo by removing the item.
        historyMonitor.addUndoChange(function() {
            self.removeComponent(component);
        });

        // Redo by readding the item.
        historyMonitor.addRedoChange(function() {
            self.addComponent(component);
        });
    };

    ProjectViewModel.prototype.addDataSet = function(data) {
        var namespace = DataSet.getUniqueNameNamespace();

        // Try to add unique name.
        var success = UniqueTracker.addValueIfUnique(namespace, data.name, data);

        if (!success) {
            console.log('New DataSet name was not unique.');
            return;
        }

        var historyMonitor = HistoryMonitor.getInstance();

        if (data instanceof DataSet) {
            this._dataSets.push(data);

            // Undo by marking the DataSet for deletion.
            historyMonitor.addUndoChange(function() {
                // Remove unique name.
                UniqueTracker.removeItem(namespace, data);
                data.markForDeletion();
            });

            // Redo by reseting the DataSet's reference count.
            historyMonitor.addRedoChange(function() {
                // Add unique name again.
                var success = UniqueTracker.addValueIfUnique(namespace, data.name, data);

                if (!success) {
                    console.log('DataSet name added through redo was not unique.');
                    return;
                }

                data.resetReferenceCount();
            });
        }
    };

    ProjectViewModel.prototype.addAction = function(action, index) {
        var self = this;

        // Try to add unique name.
        var success = UniqueTracker.addValueIfUnique(Action.getUniqueNameNamespace(), action.name, action);

        if (!success) {
            console.log('New Action name was not unique.');
            return;
        }

        if (defined(index)) {
            this._actions.splice(index, 0, action);
        }
        else {
            this._actions.push(action);
        }

        var historyMonitor = HistoryMonitor.getInstance();

        // Undo by removing the item.
        historyMonitor.addUndoChange(function() {
            self.removeAction(action);
        });

        // Redo by readding the item.
        historyMonitor.addRedoChange(function() {
            self.addAction(action);
        });
    };

    ProjectViewModel.prototype.addEvent = function(event, index) {
        var self = this;

        // Try to add unique name.
        var success = UniqueTracker.addValueIfUnique(Event.getUniqueNameNamespace(), event.name, event);

        if (!success) {
            console.log('New Event name was not unique.');
            return;
        }

        event.register();

        if (defined(index)) {
            this._events.splice(index, 0, event);
        }
        else {
            this._events.push(event);
        }

        var historyMonitor = HistoryMonitor.getInstance();

        // Undo by removing the item.
        historyMonitor.addUndoChange(function() {
            self.removeEvent(event);
        });

        // Redo by readding the item.
        historyMonitor.addRedoChange(function() {
            self.addEvent(event);
        });
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
        var self = this;

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

    ProjectViewModel.prototype.removeComponent = function(component) {
        var self = this;

        if (component !== this._workspace) {
            var index = this._components.indexOf(component);
            if (index > -1) {
                this._components.splice(index, 1);

                // Remove unique name.
                UniqueTracker.removeItem(SuperComponentViewModel.getUniqueNameNamespace(), component.viewModel);

                // Remove the DOM element.
                component.removeFromWorkspace();

                var historyMonitor = HistoryMonitor.getInstance();

                // Undo by adding the item.
                historyMonitor.addUndoChange(function() {
                    self.addComponent(component, index);
                });

                // Redo by removing the item.
                historyMonitor.addRedoChange(function() {
                    self.removeComponent(component);
                });
            }
        }
    };

    // TODO: Do we want to allow removal using dataset instance and name?
    // The DD specifies this, but we should probably pick one.
    ProjectViewModel.prototype.removeDataSet = function(dataSet) {
        var index = this._dataSets.indexOf(dataSet);
        if (index > -1) {
            this._dataSets.splice(index, 1);

            // Remove unique name.
            UniqueTracker.removeItem(DataSet.getUniqueNameNamespace(), dataSet);

            // Cannot undo/redo removing a DataSet.
        }
    };

    ProjectViewModel.prototype.removeAction = function(action) {
        var self = this;

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

            // Remove unique name.
            UniqueTracker.removeItem(Action.getUniqueNameNamespace(), action);

            var historyMonitor = HistoryMonitor.getInstance();

            // Undo by adding the item.
            historyMonitor.addUndoChange(function() {
                self.addAction(action, index);
            });

            // Redo by removing the item.
            historyMonitor.addRedoChange(function() {
                self.removeAction(action);
            });
        }
    };

    ProjectViewModel.prototype.removeEvent = function(event) {
        var self = this;

        var index = self._events.indexOf(event);
        if (index > -1) {
            event.unregister();
            self._events.splice(index, 1);

            // Remove unique name.
            UniqueTracker.removeItem(Event.getUniqueNameNamespace(), event);

            var historyMonitor = HistoryMonitor.getInstance();

            // Undo by adding the item.
            historyMonitor.addUndoChange(function() {
                self.addEvent(event, index);
            });

            // Redo by removing the item.
            historyMonitor.addRedoChange(function() {
                self.removeEvent(event);
            });
        }
    };

    ProjectViewModel.prototype.refreshWorkspace = function() {
        //TODO
    };

    ProjectViewModel.prototype.subscribeChanges = function(setDirty) {
        var self = this;

        function arrayChanged(changes) {
            setDirty();

            changes.forEach(function(change) {
                if (change.status === 'added') {
                    var subscriber = change.value.viewModel || change.value;

                    // Subscribe to changes if not already subscribed.
                    if (!subscriber.subscribed) {
                        subscriber.subscribeChanges();
                    }
                }
            });
        }

        // Workspace changed.
        this.workspace.subscribeChanges();

        // Google Analytics changed.
        this.googleAnalytics.subscribeChanges();

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

    ProjectViewModel.prototype.subscribeNameChange = function() {
        ko.getObservable(this, '_name').subscribe(function(newValue) {
            // Set the URL to use the new project name.
            updateQueryByName('project', newValue);
        });
    };

    return ProjectViewModel;
});