/*global define*/
define([
        'jquery',
        'knockout',
        'util/defined',
        'util/defaultValue',
        'models/WorkspaceViewModel',
        'models/GoogleAnalytics',
        'models/Data/DataSet',
        'models/Data/DataSubset',
        'models/Action/PropertyAction',
        'models/Action/QueryAction',
        'models/Event/Event'
    ], function(
        $,
        ko,
        defined,
        defaultValue,
        WorkspaceViewModel,
        GoogleAnalytics,
        DataSet,
        DataSubset,
        PropertyAction,
        QueryAction,
        Event) {
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

    ProjectViewModel.prototype.setState = function(state, availableWidgets) {
        if (defined(state.name)) {
            this._name = state.name;
        }

        if (defined(state.analytics)) {
            this._googleAnalytics = new GoogleAnalytics(state.analytics);
        }

        if (defined(state.workspace)) {
            this._workspace = new WorkspaceViewModel(state.workspace);
        }


        if (defined(state.components)) {
            this._components = $.map(state.components, function(itemState) {
                for (var index in availableWidgets) {
                    var widget = availableWidgets[index];
                    if (itemState.type === widget.o.getViewModelType()) {
                        return new widget.o(itemState);
                    }
                }

                // Invalid state.
                return null;
            });

            // Insert workspace first.
            this._components.unshift(this._workspace);
        }

        if (defined(state.dataSets)) {
            this._dataSets = $.map(state.dataSets, function(itemState) {
                if (itemState.type === DataSet.getType()) {
                    return new DataSet(itemState);
                }

                if (itemState.type === DataSubset.getType()) {
                    return new DataSubset(itemState);
                }

                // Invalid state.
                return null;
            });
        }

        if (defined(state.actions)) {
            this._actions = $.map(state.actions, function(itemState) {
                if (itemState.type === PropertyAction.getType()) {
                    return new PropertyAction(itemState);
                }

                if (itemState.type === QueryAction.getType()) {
                    return new QueryAction(itemState);
                }

                // Invalid state.
                return null;
            });
        }

        if (defined(state.events)) {
            this._events = $.map(state.events, function(itemState) {
                return new Event(itemState);
            });
        }
    };

    ProjectViewModel.prototype.addDataSet = function(data) {
        if (data instanceof DataSet) {
            this._dataSets.push(data);
        }
    };

    ProjectViewModel.prototype.addEvent = function(event) {
        // TODO
    };

    ProjectViewModel.prototype.addAction = function(action) {
        // TODO
    };

    ProjectViewModel.prototype.getDataSet = function(name) {
        for (var index = 0; index < this._dataSets.length; index++) {
            var dataSet = this._dataSets[index];
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

    ProjectViewModel.prototype.removeComponent = function(component) {
        //TODO
    };

    ProjectViewModel.prototype.removeEvent = function(event) {
        //TODO
    };

    ProjectViewModel.prototype.removeAction = function(action) {
        //TODO
    };

    ProjectViewModel.prototype.refreshWorkspace = function() {
        //TODO
    };

    return ProjectViewModel;
});