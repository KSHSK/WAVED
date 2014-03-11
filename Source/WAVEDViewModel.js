/*global define*/
define(['jquery',
        'knockout',
        'models/Action/Action',
        'models/Constants/EventType',
        'models/Event/Event',
        'models/GoogleAnalytics',
        'models/ProjectViewModel',
        'models/Property/ArrayProperty',
        'models/Property/StringProperty',
        'models/WorkspaceViewModel',
        'models/Widget/ButtonWidget/Button',
        'modules/ActionHelper',
        'modules/EventHelper',
        'modules/NewProject',
        'modules/LoadProject',
        'modules/SaveProject',
        'modules/UploadData',
        'modules/BindData',
        'modules/DeleteData',
        'util/defined',
        'util/defaultValue',
        'util/createValidator'
    ], function(
        $,
        ko,
        Action,
        EventType,
        Event,
        GoogleAnalytics,
        ProjectViewModel,
        ArrayProperty,
        StringProperty,
        WorkspaceViewModel,
        Button,
        ActionHelper,
        EventHelper,
        NewProject,
        LoadProject,
        SaveProject,
        UploadData,
        BindData,
        DeleteData,
        defined,
        defaultValue,
        createValidator) {
    'use strict';

    var self;
    var WAVEDViewModel = function() {
        self = this;
        this._dirty = false;

        this._projectList = [];
        this._selectedWidget = '';
        this._selectedDataSet = '';
        this._selectedBoundData = '';

        this._currentProject = new ProjectViewModel({
            name: ''
        });

        this._availableWidgets = [{
            name: 'Button',
            o: Button
        }];

        this.eventTypes = [];
        for (var eventType in EventType) {
            this.eventTypes.push(eventType);
        }

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

        this.loadProjectName = new ArrayProperty({
                displayName: 'Project Name',
                value: '',
                options: this.projectList
            });

        this.actionEditorSelectedProperty = undefined;
        this.actionEditorAffectedComponent = undefined;
        this.actionEditorDataSet = undefined;
        this.selectedAction = undefined;
        this.selectedEvent = undefined;
        this.selectedActionName = '';
        this.selectedEventName = '';
        this.eventEditorTriggeringComponent = undefined;
        this.eventEditorTrigger = undefined;
        this.selectedEventType = undefined;
        this.selectedEventActions = [];

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

    WAVEDViewModel.prototype.tryToUploadData = function() {
        return UploadData.tryToUploadData(self);
    };

    WAVEDViewModel.prototype.tryToBindData = function() {
        return BindData.tryToBindData(self);
    };

    WAVEDViewModel.prototype.unbindData = function() {
        return BindData.unbindData(self);
    };

    WAVEDViewModel.prototype.markDataForDeletion = function() {
        return DeleteData.markDataForDeletion(self);
    };

    WAVEDViewModel.prototype.addAction = function() {
        return ActionHelper.addAction(self);
    };

    WAVEDViewModel.prototype.editAction = function() {
        return ActionHelper.editAction(self);
    };

    WAVEDViewModel.prototype.removeSelectedAction = function() {
        self._currentProject.removeAction(self.selectedAction);
    };

    WAVEDViewModel.prototype.addEvent = function() {
        EventHelper.addEvent(self);
    };

    WAVEDViewModel.prototype.editEvent = function() {
        EventHelper.editEvent(self);
    };

    WAVEDViewModel.prototype.removeSelectedEvent = function() {
        self._currentProject.removeEvent(self.selectedEvent);
    };

    WAVEDViewModel.prototype.saveProject = function() {
        var deferred = $.Deferred();
        return SaveProject.saveProject(deferred, this.currentProject.name, self);
    };

    WAVEDViewModel.prototype.tryToSaveProject = function() {
        return SaveProject.tryToSaveProject(self);
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
                this.loadProjectName.options = value;
                this.loadProjectName.value = value[0];
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
        },
        selectedDataSet: {
            get: function() {
                return this._selectedDataSet;
            },
            set: function(value) {
                this._selectedDataSet = value;
            }
        },
        selectedBoundData: {
            get: function() {
                return this._selectedBoundData;
            },
            set: function(value) {
                this._selectedBoundData = value;
            }
        },
        availableDataForBinding: {
            // Returns the list of datasets that are not bound to the selected widget.
            get: function() {
                if (!defined(this.currentProject) || !defined(this.selectedWidget)) {
                    return [];
                }

                // TODO: Make sure use of 'unmarkedDataSets' works after DataSubsets are implemented
                // since implementation of that function could change at that point.
                var dataSets = this.currentProject.unmarkedDataSets;
                var boundDataNames = defaultValue(this.selectedWidget.viewModel.boundData, []);

                return dataSets.filter(function(dataSet) {
                    return boundDataNames.indexOf(dataSet.name) === -1;
                });
            }
        }
    });

    return WAVEDViewModel;
});