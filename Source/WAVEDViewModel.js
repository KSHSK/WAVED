/*global define*/
define([
        './modules/NewProject',
        './modules/LoadProject',
        './models/Widget/ButtonWidget/Button',
        './models/Property/StringProperty',
        './util/createValidator',
        'knockout'
    ], function(
        NewProject,
        LoadProject,
        Button,
        StringProperty,
        createValidator,
        ko) {
    'use strict';

    var self;

    var WAVEDViewModel = function() {
        self = this;
        this._dirty = false;

        this._projectList = [];
        this._selectedWidget = '';
        this._currentProject = {
            name: '',
            workspace: {
                height: {
                    value: 600
                },
                width: {
                    value: 750
                }
            }
        };
        this._availableWidgets = [{
            name: 'Button',
            o: Button
        }];

        this.newProjectName = new StringProperty({
            displayName: 'Project Name',
            value: '',
            validValue: createValidator({
                minLength: 1,
                maxLength: 50,
                regex: new RegExp('^[a-zA-Z0-9_\\- ]+$')
            }),
            errorMessage: 'Must be between 1 and 50 characters<br>Can only include alphanumeric characters, hyphens (-), underscores (_), and spaces.'
        });

        this.loadProjectName =  new StringProperty({
            displayName: 'Project Name',
            value: '',
            validValue: createValidator({
                minLength: 1,
                maxLength: 50,
                regex: new RegExp('^[a-zA-Z0-9_\\- ]+$')
            }),
            errorMessage: 'Must be between 1 and 50 characters<br>Can only include alphanumeric characters, hyphens (-), underscores (_), and spaces.'
        });

        ko.track(this);
    };

    WAVEDViewModel.prototype.tryToCreateNewProject = function() {
        return NewProject.tryToCreateNewProject(self);
    };

    WAVEDViewModel.prototype.tryToLoadProject = function() {
        return LoadProject.tryToLoadProject(self);
    };

    WAVEDViewModel.prototype.updateProjectList = function() {
        return LoadProject.updateProjectList(self);
    };

    // TODO: Component
    WAVEDViewModel.prototype.addNewWidget = function(w) {
        var widget = new w.o();
        self._currentProject.addComponent(widget);
        self._selectedWidget = widget;
    };

    Object.defineProperties(WAVEDViewModel.prototype, {
        dirty: {
            get: function() {
                return this._dirty;
            },
            set: function(value) {
                if (typeof value === 'boolean') {
                    this._dirty = value;
                }
            }
        },
        projectList: {
            get: function() {
                return this._projectList;
            },
            set: function(value) {
                this._projectList = value;
                this.projectToLoad = value[0];
            }
        },
        currentProject: {
            get: function() {
                return this._currentProject;
            },
            set: function(value) {
                this._currentProject = value;
                this._selectedWidget = value.workspace;
            }
        },
        availableWidgets: {
            get: function() {
                return this._availableWidgets;
            }
        },
        selectedWidget: {
            get: function() {
                return this._selectedWidget;
            },
            set: function(value) {
                this._selectedWidget = value;
            }
        }
    });

    return WAVEDViewModel;
});