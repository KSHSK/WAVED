/*global define, alert*/
define([
        'jquery',
        'util/defined',
        'util/defaultValue',
        'util/displayMessage',
        'models/Action/Action',
        'models/Event/Event',
        'models/WorkspaceViewModel',
        'models/Data/DataSet',
        './GoogleAnalytics',
        'knockout'
    ], function(
        $,
        defined,
        defaultValue,
        displayMessage,
        Action,
        Event,
        WorkspaceViewModel,
        DataSet,
        GoogleAnalytics,
        ko) {
    'use strict';

    var self;
    var ProjectViewModel = function(options) {
        self = this;
        if (typeof options.name === 'undefined') {
            throw new Error('ProjectViewModel name is required');
        }

        // TODO: Load actual state.
        this._name = options.name;
        this._components = defaultValue(options.components, []);
        this._dataSets = defaultValue(options.dataSet, []);
        this._events = defaultValue(options.events, []);
        this._actions = defaultValue(options.actions, []);
        this._googleAnalytics = defaultValue(options.googleAnalytics, new GoogleAnalytics());
        this._workspace = new WorkspaceViewModel();
        this._dirty = false;
        this._projectTree = undefined; // TODO

        this._components.push(this._workspace);

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

    ProjectViewModel.prototype.setState = function(state) {
        // TODO
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
        // Check that action doesn't already exist.
        this._actions.push(action);
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
    ProjectViewModel.prototype.removeDataSet = function(data) {
        // TODO
    };

    ProjectViewModel.prototype.removeComponent = function(component) {
        //TODO
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
                    // TODO: Replace alert w/ banner notification.
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

    return ProjectViewModel;
});