/*global define*/
define([
        './modules/NewProject',
        './modules/LoadProject',
        './models/ButtonWidget/ButtonWidget',
        'knockout'
    ], function(
        NewProject,
        LoadProject,
        ButtonWidget,
        ko) {
    'use strict';
    var self;

    var WAVEDViewModel = function() {
        self = this;
        this._dirty = false;

        this._projectList = [];
        this._projectToLoad = '';
        this._selectedWidget = '';
        this._currentProject = {
            name: '',
            workspace: {
                height: {
                    value: 100
                },
                width: {
                    value: 100
                }
            }
        };
        this._availableWidgets = [{
            name: 'Button Widget',
            o: ButtonWidget
        }, {
            name: 'Another Buttton',
            o: ButtonWidget
        }];

        ko.track(this);
    };

    WAVEDViewModel.prototype.tryToCreateNewProject = function(){
        return NewProject.tryToCreateNewProject(self);
    };

    WAVEDViewModel.prototype.tryToLoadProject = function() {
        return LoadProject.tryToLoadProject(self);
    };

    WAVEDViewModel.prototype.updateProjectList = function() {
        return LoadProject.updateProjectList(self);
    };

    WAVEDViewModel.prototype.addNewWidget = function(w) {
        var widget = new w.o();
        self._currentProject.addWidget(widget);
        self._selectedWidget = widget;

    };

    Object.defineProperties(WAVEDViewModel.prototype, {
        dirty: {
            get: function() {
                return this._dirty;
            },
            set: function(value) {
                if (typeof value === 'boolean'){
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
                this._projectToLoad = value[0];
            }
        },
        projectToLoad: {
            get: function() {
                return this._projectToLoad;
            },
            set: function(value) {
                this._projectToLoad = value;
            }
        },
        currentProject: {
            get: function() {
                return this._currentProject;
            },
            set: function(value) {
                this._currentProject = value;
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
            set: function(value){
                this._selectedWidget = value;
            }
        }
    });

    return WAVEDViewModel;
});