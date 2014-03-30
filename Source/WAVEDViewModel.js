/* global console*/
define(['jquery',
        'knockout',
        'models/Action/Action',
        'models/Constants/EventType',
        'models/Event/Event',
        'models/GoogleAnalytics',
        'models/ProjectViewModel',
        'models/Property/ArrayProperty',
        'models/Property/StringProperty',
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
        'modules/PropertyChangeSubscriber',
        'modules/HistoryMonitor',
        'models/Widget/TextBlockWidget/TextBlock',
        'util/defined',
        'util/defaultValue',
        'util/createValidator',
        'util/subscribeObservable',
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
        PropertyChangeSubscriber,
        HistoryMonitor,
        TextBlock,
        defined,
        defaultValue,
        createValidator,
        subscribeObservable,
        getNamePropertyInstance) {
    'use strict';

    var self;
    var WAVEDViewModel = function() {
        self = this;
        this._dirty = false;

        this._history = undefined;
        this._historyIndex = undefined;
        this.resetHistory();

        this._projectList = [];
        this._selectedComponent = '';
        this._selectedDataSet = '';
        this._selectedBoundData = '';

        // Create the HistoryMonitor singleton that everything else will use.
        this.historyMonitor = new HistoryMonitor(this.setUndoNewChangeFunction, this.setRedoPreviousChangeFunction,
            this.amendUndoNewChangeFunction, this.amendRedoPreviousChangeFunction);

        // Create the PropertyChangeSubscriber singleton that everything else will use.
        this.propertyChangeSubscriber = new PropertyChangeSubscriber(this.setDirty);

        this._currentProject = new ProjectViewModel({
            name: ''
        },
        this.setDirty);

        this._projectTree = new ProjectTree();

        this._availableWidgets = [{
            name: 'Button',
            icon: Button.iconLocation(),
            o: Button
        }, {
            name: 'Text Block',
            icon: TextBlock.iconLocation(),
            o: TextBlock
        }];

        this.eventTypes = [];
        for (var eventType in EventType) {
            this.eventTypes.push(eventType);
        }

        this.newProjectName = getNamePropertyInstance('Project Name:');

        this.saveProjectAsName = getNamePropertyInstance('Project Name:');

        this.loadProjectName = new ArrayProperty({
            displayName: 'Project Name:',
            value: '',
            options: this.projectList
        });

        this.uploadDataName = getNamePropertyInstance('Name:');

        this.uploadDataFile = new StringProperty({
            displayName: 'File:',
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

        this.currentProject.subscribeChanges();

        // Remove the hover/focus look when undo or redo is disabled.
        subscribeObservable(this, '_historyIndex', function() {
            if (!self.isUndoAllowed()) {
                $('#undo-button').removeClass('ui-state-hover ui-state-focus');
            }

            if (!self.isRedoAllowed()) {
                $('#redo-button').removeClass('ui-state-hover ui-state-focus');
            }
        });
    };

    WAVEDViewModel.prototype.setDirty = function() {
        self.dirty = true;
    };

    WAVEDViewModel.prototype.resetHistory = function() {
        self._history = [{}];
        self._historyIndex = 0;
    };

    WAVEDViewModel.prototype.isUndoAllowed = function() {
        return (self._historyIndex > 0);
    };

    WAVEDViewModel.prototype.isRedoAllowed = function() {
        return (self._historyIndex < self._history.length - 1);
    };

    WAVEDViewModel.prototype.setUndoNewChangeFunction = function(changeFunction) {
        // Remove history after historyIndex.
        self._history.length = self._historyIndex + 1;

        self._history.push({
            undoChange: changeFunction
        });

        self._historyIndex++;
    };

    WAVEDViewModel.prototype.setRedoPreviousChangeFunction = function(changeFunction) {
        var index = self._historyIndex - 1;
        if (!defined(self._history[index])) {
            self._history[index] = {};
        }

        self._history[index].redoChange = changeFunction;
    };

    WAVEDViewModel.prototype.amendUndoNewChangeFunction = function(newChangeFunction) {
        if (self._historyIndex !== self.history.length - 1) {
            console.log('Can only amend undo if in the last history position');
            return;
        }

        var currentChangeFunction = self._history[self._historyIndex].undoChange;

        if (!defined(currentChangeFunction)) {
            console.log('Undo function was undefined. Perhaps amend was called erroneously');
            return;
        }

        self._history[self._historyIndex].undoChange = function() {
            currentChangeFunction();
            newChangeFunction();
        };
    };

    WAVEDViewModel.prototype.amendRedoPreviousChangeFunction = function(newChangeFunction) {
        if (self._historyIndex !== self.history.length - 1) {
            console.log('Can only amend redo if in the last history position');
            return;
        }

        var index = self._historyIndex - 1;

        var currentChangeFunction = self._history[index].redoChange;

        if (!defined(currentChangeFunction)) {
            console.log('Redo function was undefined. Perhaps amend was called erroneously');
            return;
        }

        self._history[index].redoChange = function() {
            currentChangeFunction();
            newChangeFunction();
        };
    };

    WAVEDViewModel.prototype.undo = function() {
        if (!this.isUndoAllowed()) {
            return;
        }

        var changeFunction = this._history[this._historyIndex].undoChange;

        this._historyIndex--;

        if (defined(changeFunction)) {
            this.historyMonitor.executeIgnoreHistory(changeFunction);
        }
    };

    WAVEDViewModel.prototype.redo = function() {
        if (!this.isRedoAllowed()) {
            return;
        }

        var changeFunction = this._history[this._historyIndex].redoChange;

        this._historyIndex++;

        if (defined(changeFunction)) {
            this.historyMonitor.executeIgnoreHistory(changeFunction);
        }
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
        var component = self._selectedComponent;
        self._selectedComponent = self.currentProject.workspace;
        self._currentProject.removeComponent(component);
    };

    WAVEDViewModel.prototype.saveProject = function() {
        var deferred = $.Deferred();
        return SaveProject.saveProject(deferred, self);
    };

    WAVEDViewModel.prototype.tryToSaveProjectAs = function() {
        return SaveProject.tryToSaveProjectAs(self);
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
                var boundDataSets = defaultValue(this.selectedComponent.viewModel.boundData, []);

                return dataSets.filter(function(dataSet) {
                    for(var index = 0; index < boundDataSets.length; index++){
                        if(boundDataSets[index]._name === dataSet.name){
                            return false;
                        }
                    }

                    return true;
                });
            }
        },
        projectTree: {
            get: function() {
                return this._projectTree;
            }
        },
        history: {
            get: function() {
                return this._history;
            }
        },
        historyIndex: {
            get: function() {
                return this._historyIndex;
            }
        }
    });

    return WAVEDViewModel;
});