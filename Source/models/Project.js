/*global define*/
define([
        'jquery',
        'util/defined',
        'util/defaultValue',
        'models/Workspace',
        'knockout'
    ], function(
        $,
        defined,
        defaultValue,
        Workspace,
        ko) {
    'use strict';

    var Project = function(options) {
        if (typeof options.name === undefined) {
            throw new Error('Project name is required');
        }

        this._name = options.name;
        this._widgets = defaultValue(options.widgets, []);
        this._dataSets = defaultValue(options.dataSet, []);
        this._events = defaultValue(options.events, []);
        this._actions = defaultValue(options.actions, []);
        this._googleAnalytics = defaultValue(options.googleAnalytics, undefined);
        this._workspace = new Workspace(options.width, options.height);
        this._history = [];
        this._historyIndex = -1;
        this._dirty = false;

        this._widgets.push(this._workspace);
        this._selectedWidget = this._workspace;

        ko.track(this);
    };

    Object.defineProperties(Project.prototype, {
        name: {
            get: function() {
                return this._name;
            },
            set: function(value) {
                this._name = value;
            }
        },
        widgets: {
            get: function(){
                return this._widgets;
            }
        },
        dataSet: {
            get: function(){
                return this._dataSet;
            }
        },
        googleAnalytics: {
            get: function() {
                return this._googleAnaytics;
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
        }
    });

    Project.prototype.addWidget = function(widget) {
        this._widgets.push(widget);
    };

    Project.prototype.removeWidget = function(widget) {
        if (widget !== this._workspace) {
            var index = this._widgets.indexOf(widget);
            if (index > -1) {
                this._widgets.splice(index, 1);
            }
        }
    };

    return Project;
});