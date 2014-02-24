/*global define*/
define([
        'jquery',
        'util/defined',
        'util/defaultValue',
        'models/WorkspaceViewModel',
        'knockout'
    ], function(
        $,
        defined,
        defaultValue,
        WorkspaceViewModel,
        ko) {
    'use strict';

    var ProjectViewModel = function(options) {
        if (typeof options.name === undefined) {
            throw new Error('ProjectViewModel name is required');
        }

        this._name = options.name;
        this._widgets = defaultValue(options.widgets, []);
        this._dataSets = defaultValue(options.dataSet, []);
        this._events = defaultValue(options.events, []);
        this._actions = defaultValue(options.actions, []);
        this._googleAnalytics = defaultValue(options.googleAnalytics, undefined);
        this._workspace = new WorkspaceViewModel(options.width, options.height);
        this._dirty = false;

        this._widgets.push(this._workspace);

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
        widgets: {
            get: function() {
                return this._widgets;
            }
        },
        dataSets: {
            get: function() {
                return this._dataSets;
            }
        },
        googleAnalytics: {
            get: function() {
                return this._googleAnaytics;
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

    ProjectViewModel.prototype.addWidget = function(widget) {
        this._widgets.push(widget);
    };

    ProjectViewModel.prototype.removeWidget = function(widget) {
        if (widget !== this._workspace) {
            var index = this._widgets.indexOf(widget);
            if (index > -1) {
                this._widgets.splice(index, 1);
            }
        }
    };

    ProjectViewModel.prototype.getState = function(){
        //TODO
    };

    ProjectViewModel.prototype.setState = function(state) {
        //TODO
    };

    ProjectViewModel.prototype.addDataSet = function(data) {
        //TODO
    };

    ProjectViewModel.prototype.addComponent = function(component) {
        //TODO
    };

    ProjectViewModel.prototype.addEvent = function(event) {
        //TODO
    };

    ProjectViewModel.prototype.addAction = function(action) {
        //TODO
    };

    ProjectViewModel.prototype.removeDataSet = function(data) {
        //TODO
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