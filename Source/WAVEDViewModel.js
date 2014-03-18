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
        'models/ProjectTree',
        'modules/ActionHelper',
        'modules/EventHelper',
        'modules/NewProject',
        'modules/LoadProject',
        'modules/SaveProject',
        'modules/DeleteProject',
        'modules/UploadData',
        'modules/BindData',
        'modules/DeleteData',
        'models/Widget/TextBlockWidget/TextBlock',
        'util/defined',
        'util/defaultValue',
        'util/createValidator',
        'util/getNamePropertyInstance'
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
        ProjectTree,
        ActionHelper,
        EventHelper,
        NewProject,
        LoadProject,
        SaveProject,
        DeleteProject,
        UploadData,
        BindData,
        DeleteData,
        TextBlock,
        defined,
        defaultValue,
        createValidator,
        getNamePropertyInstance) {
    'use strict';

    var self;
    var WAVEDViewModel = function() {
        self = this;
        this._dirty = false;

        this._projectList = [];
        this._selectedComponent = '';
        this._selectedDataSet = '';
        this._selectedBoundData = '';

        this._currentProject = new ProjectViewModel({
            name: ''
        });

        this._projectTree = new ProjectTree();

        this._availableWidgets = [{
            name: 'Button',
            o: Button
        }, {
            name: 'Text Block',
            o: TextBlock
        }];

        this.eventTypes = [];
        for (var eventType in EventType) {
            this.eventTypes.push(eventType);
        }

        this.newProjectName = getNamePropertyInstance('Project Name');

        this.loadProjectName = new ArrayProperty({
            displayName: 'Project Name',
            value: '',
            options: this.projectList
        });

        this.uploadDataName = getNamePropertyInstance('Name');

        this.uploadDataFile = new StringProperty({
            displayName: 'File',
            value: '',
            validValue: createValidator({
                minLength: 1,
                regex: new RegExp('.(csv|json)$', 'i')
            }),
            errorMessage: 'Must select a file with extension CSV or JSON.'
        });


        this.selectedActionName = getNamePropertyInstance('Action Name');
        this.selectedAction = undefined;
        this.selectedActionType = '';
        this.actionEditorAffectedComponent = undefined;
        this.actionEditorDataSet = undefined;

        this.selectedEventName = getNamePropertyInstance('Event Name');
        this.selectedEvent = undefined;
        this.eventEditorTriggeringComponent = undefined;
        this.eventEditorTrigger = undefined;
        this.selectedEventType = undefined;
        this.selectedEventActions = [];

        ko.track(this);

        this.currentProject.subscribeChanges(function() {
            self.dirty = true;
        });
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

    WAVEDViewModel.prototype.removeSelectedComponent = function() {
        self._currentProject.removeComponent(self.selectedComponent);
    };

    WAVEDViewModel.prototype.saveProject = function() {
        var deferred = $.Deferred();
        return SaveProject.saveProject(deferred, this.currentProject.name, self);
    };

    WAVEDViewModel.prototype.tryToSaveProject = function() {
        return SaveProject.tryToSaveProject(self);
    };

    WAVEDViewModel.prototype.tryToDeleteProject = function() {
        return DeleteProject.tryToDeleteProject(self);
    };

    WAVEDViewModel.prototype.tryToDeleteFromProjectTree = function() {
        return self._projectTree.tryToDeleteSelected(self);
    };

    WAVEDViewModel.prototype.isSelectedInProjectTree = function(type, value) {
        return self._projectTree.isSelected(self, type, value);
    };

    WAVEDViewModel.prototype.selectInProjectTree = function(type, value) {
        self._projectTree.select(self, type, value);
    };

    WAVEDViewModel.prototype.propertiesPanelPosition = $('#accordion').children('div').index($('#properties-panel'));

    // TODO: Component
    WAVEDViewModel.prototype.addNewWidget = function(w) {
        var widget = new w.o();
        self._currentProject.addComponent(widget);
        self._selectedComponent = widget;

        self.openPropertiesPanel();
    };

    WAVEDViewModel.prototype.openPropertiesPanel = function() {
        // TODO: Really shouldn't do any jQuery stuff in here.
        $('#accordion').accordion('option', 'active', self.propertiesPanelPosition);
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
            }
        },
        availableWidgets: {
            get: function() {
                return this._availableWidgets;
            }
        },
        selectedComponent: {
            get: function() {
                return this._selectedComponent;
            },
            set: function(value) {
                this._selectedComponent = value;
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
                if (!defined(this.currentProject) || !defined(this.selectedComponent)) {
                    return [];
                }

                // TODO: Make sure use of 'unmarkedDataSets' works after DataSubsets are implemented
                // since implementation of that function could change at that point.
                var dataSets = this.currentProject.unmarkedDataSets;
                var boundDataNames = defaultValue(this.selectedComponent.viewModel.boundData, []);

                return dataSets.filter(function(dataSet) {
                    return boundDataNames.indexOf(dataSet.name) === -1;
                });
            }
        },
        projectTree: {
            get: function() {
                return this._projectTree;
            }
        }
    });

    return WAVEDViewModel;
});