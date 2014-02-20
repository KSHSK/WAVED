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
    /*TODO: Rename*/
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
        this._dirty = false;

        this._widgets.push(this._workspace);

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
        dataSets: {
            get: function(){
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