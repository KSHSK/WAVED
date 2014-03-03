/*global define*/
define([
        'jquery',
        'util/defined',
        'util/defaultValue',
        'models/WorkspaceViewModel',
        'models/Data/DataSet',
        'modules/GoogleAnalytics',
        'knockout'
    ], function(
        $,
        defined,
        defaultValue,
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

        this._name = options.name;
        this._components = defaultValue(options.components, []);
        this._dataSets = defaultValue(options.dataSet, []);
        this._events = defaultValue(options.events, []);
        this._actions = defaultValue(options.actions, []);
        this._googleAnalytics = defaultValue(options.googleAnalytics, new GoogleAnalytics());
        this._workspace = new WorkspaceViewModel(options.width, options.height);
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
        // TODO
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
    ProjectViewModel.prototype.removeDataSet = function(data) {
        // TODO
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