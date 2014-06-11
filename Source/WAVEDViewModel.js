/* global console*/
define(['jquery',
        'knockout',
        'models/Action/Action',
        'models/Constants/ActionType',
        'models/Constants/EventType',
        'models/Constants/ComparisonOperator',
        'models/Constants/LogicalOperator',
        'models/Constants/MessageType',
        'models/Event/Event',
        'models/GoogleAnalytics',
        'models/ProjectViewModel',
        'models/Property/ArrayProperty',
        'models/Property/StringProperty',
        'models/Widget/Widget',
        'models/Widget/ButtonWidget/Button',
        'models/Widget/TextBlockWidget/TextBlock',
        'models/Widget/USMapWidget/USMap',
        'models/ProjectTree',
        'modules/ActionHelper',
        'modules/EventHelper',
        'modules/ExportProject',
        'modules/DataSubsetHelper',
        'modules/DisplayMessage',
        'modules/NewProject',
        'modules/LoadProject',
        'modules/SaveProject',
        'modules/DeleteProject',
        'modules/UploadData',
        'modules/BindData',
        'modules/DeleteData',
        'modules/PropertyChangeSubscriber',
        'modules/HistoryMonitor',
        'modules/UniqueTracker',
        'models/Data/Condition',
        'util/getBasename',
        'util/defined',
        'util/defaultValue',
        'util/createValidator',
        'util/subscribeObservable',
        'util/getNamePropertyInstance'
    ], function(
        $,
        ko,
        Action,
        ActionType,
        EventType,
        ComparisonOperator,
        LogicalOperator,
        MessageType,
        Event,
        GoogleAnalytics,
        ProjectViewModel,
        ArrayProperty,
        StringProperty,
        Widget,
        Button,
        TextBlock,
        USMap,
        ProjectTree,
        ActionHelper,
        EventHelper,
        ExportProject,
        DataSubsetHelper,
        DisplayMessage,
        NewProject,
        LoadProject,
        SaveProject,
        DeleteProject,
        UploadData,
        BindData,
        DeleteData,
        PropertyChangeSubscriber,
        HistoryMonitor,
        UniqueTracker,
        Condition,
        getBasename,
        defined,
        defaultValue,
        createValidator,
        subscribeObservable,
        getNamePropertyInstance) {
    'use strict';

    var self;
    var propertiesPanelPosition = $('#accordion').children('div').index($('#properties-panel'));
    var projectTreePanelPosition = $('#accordion').children('div').index($('#project-tree-panel'));

    var WAVEDViewModel = function() {
        self = this;

        this._history = undefined;
        this._historyIndex = undefined;
        this._lastSaveIndex = undefined;
        this.resetHistory();

        // Used to know when to display DataSet vs DataSubset for preview.
        this.dataSetToPreview = '';

        this.disableOpeningPropertiesPanel = false;

        this._projectList = [];
        this._selectedComponent = '';
        this._selectedDataSet = '';
        this._selectedDataSubset = '';
        this._selectedBoundData = '';

        // Create the HistoryMonitor singleton that everything else will use.
        this.historyMonitor = new HistoryMonitor(this.setUndoNewChangeFunction, this.setRedoPreviousChangeFunction,
            this.amendUndoNewChangeFunction, this.amendRedoPreviousChangeFunction);

        // Create the PropertyChangeSubscriber singleton that everything else will use.
        this.propertyChangeSubscriber = new PropertyChangeSubscriber();

        this._currentProject = new ProjectViewModel({
            name: ''
        });

        this._projectTree = new ProjectTree();

        this._availableWidgets = [{
            name: 'Button',
            icon: Button.iconLocation(),
            o: Button
        }, {
            name: 'Text Block',
            icon: TextBlock.iconLocation(),
            o: TextBlock
        }, {
            name: 'US Map',
            icon: USMap.iconLocation(),
            o: USMap
        }];

        this.eventTypes = [];
        for (var eventType in EventType) {
            this.eventTypes.push(eventType);
        }

        this.actionTypes = [];
        for (var actionKey in ActionType) {
            this.actionTypes.push(ActionType[actionKey]);
        }

        this.comparisonOperators = [];
        for (var comparisonOpKey in ComparisonOperator) {
            this.comparisonOperators.push(ComparisonOperator[comparisonOpKey]);
        }

        this.logicalOperators = [];
        for (var logicalOpKey in LogicalOperator) {
            this.logicalOperators.push(LogicalOperator[logicalOpKey]);
        }

        // New Project
        this.newProjectName = getNamePropertyInstance('Project Name:');

        // Save Project As
        this.saveProjectAsName = getNamePropertyInstance('Project Name:');

        // Load Project
        this.loadProjectName = new ArrayProperty({
            displayName: 'Project Name:',
            value: '',
            options: this.projectList
        });

        // Upload Data File
        this.uploadDataName = getNamePropertyInstance('Name:');

        this.uploadDataFile = new StringProperty({
            displayName: 'File:',
            value: '',
            validValue: createValidator({
                minLength: 1,
                regex: new RegExp('.(csv|json)$', 'i')
            }),
            errorMessage: 'Must select a unique file with extension CSV or JSON.'
        });

        var filenameInvalidCharRegex = new RegExp('[^a-zA-Z0-9_\\- ]', 'g');

        // Update the upload data name based on the filename.
        subscribeObservable(self.uploadDataFile, '_value', function(newFilename) {
            if (newFilename !== '') {
                var originalName = getBasename(newFilename).split('.')[0];
                var validName = originalName.replace(filenameInvalidCharRegex, '').substring(0, 50);
                self.uploadDataName.value = validName;
            }
        });

        // Action Editor
        this.selectedActionName = getNamePropertyInstance('Action Name');
        this.selectedAction = undefined;
        this.selectedActionType = '';
        this.actionEditorAffectedWidget = undefined;
        this.actionEditorAffectedWidgetError = false;
        this.actionEditorDataSubsetError = false;
        this._actionEditorDataSubset = undefined;
        this._actionDataSubsetEditorConditions = [];
        this.actionDataSubsetEditorConditionCount = 0;

        // Event Editor
        this.selectedEventName = getNamePropertyInstance('Event Name');
        this.selectedEvent = undefined;
        this.eventEditorTriggeringWidget = undefined;
        this.eventEditorTriggeringWidgetError = false;
        this.selectedEventType = undefined;
        this.selectedEventActions = [];

        // Data Subset Editor
        this.dataSubsetEditorName = getNamePropertyInstance();
        this.dataSubsetEditorDataSource = undefined;
        this.dataSubsetEditorDataSourceError = undefined;
        this.dataSubsetEditorConditions = [];
        this.dataSubsetEditorConditionCount = 0;

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

    WAVEDViewModel.prototype.reset = function(projectState) {
        // Clear the workspace.
        $('#waved-workspace').empty();

        // Clear any existing toast messages
        DisplayMessage.clear();

        // Reset the unique names.
        UniqueTracker.reset();

        // Reset the current project.
        self.currentProject.resetProject();

        // Set the new project state if defined.
        if (defined(projectState)) {
            self.currentProject.setState(projectState, self.availableWidgets);
        }

        // Remove history.
        self.resetHistory();

        // Open project tree panel.
        self.openProjectTreePanel();
    };

    WAVEDViewModel.prototype.resetHistory = function() {
        self._history = [{}];
        self._historyIndex = 0;
        self._lastSaveIndex = 0;
    };

    WAVEDViewModel.prototype.setSaveIndex = function() {
        self._lastSaveIndex = self._historyIndex;
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

        // If the last save index is ahead of the current history index, then make the last save index invalid.
        if (self._lastSaveIndex > self._historyIndex) {
            self._lastSaveIndex = -1;
        }

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

    WAVEDViewModel.prototype.refreshWorkspace = function() {
       self._currentProject.refreshWorkspace();
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
        if(!defined(self.selectedBoundData)) {
            DisplayMessage.show('No bound data selected for unbinding.', MessageType.INFO);
            return;
        }

        return BindData.unbindData(self);
    };

    WAVEDViewModel.prototype.markDataForDeletion = function() {
        if(!defined(self.selectedDataSet)) {
            DisplayMessage.show('No dataset selected for deletion.', MessageType.INFO);
            return;
        }

        return DeleteData.markDataForDeletion(self);
    };

    WAVEDViewModel.prototype.openPreviewDataDialog = function() {
        if (!defined(this.dataSetToPreview)) {
            return;
        }

        $('#preview-data-dialog').dialog({
            height: 'auto',
            width: 'auto',
            modal: true,
            title: 'Preview Data for "' + this.dataSetToPreview.displayName + '"'
        });
    };

    WAVEDViewModel.prototype.previewDataSet = function() {
        if (!defined(this.selectedDataSet)) {
            DisplayMessage.show('No dataset selected for preview.', MessageType.INFO);
            return;
        }

        this.dataSetToPreview = this.selectedDataSet;
        this.openPreviewDataDialog();
    };

    WAVEDViewModel.prototype.previewDataSubset = function() {
        if (!defined(this.selectedDataSubset)) {
            DisplayMessage.show('No data subset selected for preview.', MessageType.INFO);
            return;
        }

        this.dataSetToPreview = this.selectedDataSubset;
        this.openPreviewDataDialog();
    };

    WAVEDViewModel.prototype.previewBoundDataSet = function() {
        if (!defined(this.selectedBoundData)) {
            DisplayMessage.show('No bound data selected for preview.', MessageType.INFO);
            return;
        }

        this.dataSetToPreview = this.selectedBoundData;
        this.openPreviewDataDialog();
    };

    WAVEDViewModel.prototype.addDataSubset = function() {
        if (self.currentProject.unmarkedDataSets.length === 0) {
            DisplayMessage.show('Must upload a Data Source before creating a Data Subset.', MessageType.INFO);
            return;
        }

        DataSubsetHelper.addDataSubset(self);
    };

    WAVEDViewModel.prototype.editDataSubset = function() {
        if(!defined(this.selectedDataSubset)) {
            DisplayMessage.show('No data subset selected for edit.', MessageType.INFO);
            return;
        }

        DataSubsetHelper.editDataSubset(self);
    };

    WAVEDViewModel.prototype.removeSelectedDataSubset = function() {
        if(!defined(this.selectedDataSubset)) {
            DisplayMessage.show('No data subset selected for deletion.', MessageType.INFO);
            return;
        }

        this.currentProject.removeDataSet(this.selectedDataSubset);
    };

    WAVEDViewModel.prototype.dataSubsetConditionChange = function(index) {
        // Use setTimeout to wait for updated conditions
        setTimeout(function() {
            DataSubsetHelper.dataSubsetConditionChange(self, index);
        }, 0);
    };

    WAVEDViewModel.prototype.actionDataSubsetConditionChange = function(index) {
        // Use setTimeout to wait for updated conditions
        setTimeout(function() {
            ActionHelper.actionDataSubsetConditionChange(self, index);
        }, 0);
    };

    WAVEDViewModel.prototype.addAction = function() {
        if(self.currentProject.widgets.length === 0) {
            DisplayMessage.show('No widgets have been added. Please add at least one before adding an action.', MessageType.INFO);
            return;
        }

        return ActionHelper.addAction(self);
    };

    WAVEDViewModel.prototype.editAction = function() {
        if (!defined(self.selectedAction)) {
            DisplayMessage.show('No action selected for editing.', MessageType.INFO);
            return;
        }

        return ActionHelper.editAction(self);
    };

    WAVEDViewModel.prototype.removeSelectedAction = function() {
        if(!defined(self.selectedAction)) {
            DisplayMessage.show('No action selected for deletion.', MessageType.INFO);
            return;
        }

        self._currentProject.removeAction(self.selectedAction);
    };

    WAVEDViewModel.prototype.addEvent = function() {
        if(self.currentProject.widgets.length === 0) {
            DisplayMessage.show('No widgets have been added that can be used as event triggers. Please add at least one widget before creating an event.', MessageType.INFO);
            return;
        }

        EventHelper.addEvent(self);
    };

    WAVEDViewModel.prototype.editEvent = function() {
        if(!defined(self.selectedEvent)) {
            DisplayMessage.show('No event selected for editing.', MessageType.INFO);
            return;
        }

        EventHelper.editEvent(self);
    };

    WAVEDViewModel.prototype.removeSelectedEvent = function() {
        if(!defined(self.selectedEvent)) {
            DisplayMessage.show('No event selected for deletion.', MessageType.INFO);
            return;
        }

        self._currentProject.removeEvent(self.selectedEvent);
    };

    WAVEDViewModel.prototype.removeSelectedComponent = function() {
        var component = self.selectedComponent;

        if (component instanceof Widget) {
            self.disableOpeningPropertiesPanel = true;

            var success = self.currentProject.removeWidget(component);

            if (success) {
                self.selectedComponent = self.currentProject.workspace;
            }

            self.disableOpeningPropertiesPanel = false;
        }
    };

    WAVEDViewModel.prototype.saveProject = function() {
        var deferred = $.Deferred();
        return SaveProject.saveProject(deferred, self);
    };

    WAVEDViewModel.prototype.tryToSaveProjectAs = function() {
        return SaveProject.tryToSaveProjectAs(self);
    };

    WAVEDViewModel.prototype.exportProject = function() {
        ExportProject.tryToExportProject(self);
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

    WAVEDViewModel.prototype.isWorkspaceSelectedInProjectTree = function() {
        var selected =  self.isSelectedInProjectTree(self.projectTree.SelectedTypeEnum.COMPONENT, self.currentProject.workspace);

        if (selected) {
            // Remove the hover/focus look when the workspace is selected, since the button will be disabled.
            $('#project-tree-delete-button').removeClass('ui-state-hover ui-state-focus');
        }

        return selected;
    };

    WAVEDViewModel.prototype.selectInProjectTree = function(type, value) {
        self._projectTree.select(self, type, value);
    };

    WAVEDViewModel.prototype.addNewWidget = function(w) {
        var widget = new w.o();
        self._currentProject.addWidget(widget);
        self._selectedComponent = widget;

        self.openPropertiesPanel();
    };

    WAVEDViewModel.prototype.openPropertiesPanel = function() {
        if (self.disableOpeningPropertiesPanel === true) {
            return;
        }

        $('#accordion').accordion('option', 'active', propertiesPanelPosition);
    };

    WAVEDViewModel.prototype.openProjectTreePanel = function() {
        $('#accordion').accordion('option', 'active', projectTreePanelPosition);
    };

    WAVEDViewModel.prototype.newProjectDialogHasErrors = function() {
        return NewProject.hasErrors(self);
    };

    WAVEDViewModel.prototype.loadProjectDialogHasErrors = function() {
        return LoadProject.hasErrors(self);
    };

    WAVEDViewModel.prototype.saveProjectAsDialogHasErrors = function() {
        return SaveProject.hasErrors(self);
    };

    WAVEDViewModel.prototype.actionDialogHasErrors = function() {
        return ActionHelper.hasErrors(self);
    };

    WAVEDViewModel.prototype.eventDialogHasErrors = function() {
        return EventHelper.hasErrors(self);
    };

    WAVEDViewModel.prototype.uploadDataDialogHasErrors = function() {
        return UploadData.hasErrors(self);
    };

    WAVEDViewModel.prototype.dataSubsetDialogHasErrors = function() {
        return DataSubsetHelper.hasErrors(self);
    };

    Object.defineProperties(WAVEDViewModel.prototype, {
        dirty: {
            get: function() {
                return this._historyIndex !== this._lastSaveIndex;
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
        selectedDataSubset: {
            get: function() {
                return this._selectedDataSubset;
            },
            set: function(value) {
                this._selectedDataSubset = value;
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

        actionEditorDataSubset: {
            get: function() {
                return this._actionEditorDataSubset;
            },
            set: function(value) {
                this._actionEditorDataSubset = value;
                if (defined(this._actionEditorDataSubset)) {
                    this.actionDataSubsetEditorConditions = this.actionEditorDataSubset.query.conditions;
                }
            }
        },

        actionDataSubsetEditorConditions: {
            get: function() {
                return this._actionDataSubsetEditorConditions;
            },
            set: function(conditions) {
                var self = this;
                // Make a deep copy of the array so that it's not referencing the same object.
                this.actionDataSubsetEditorConditions.length = 0;
                conditions.forEach(function(condition) {
                    self.actionDataSubsetEditorConditions.push(new Condition(condition.getState()));
                });

                this.actionDataSubsetEditorConditionCount = this.actionDataSubsetEditorConditions.length;
            }
        },

        availableDataForBinding: {
            // Returns the list of datasets that are not bound to the selected widget.
            get: function() {
                if (!defined(this.currentProject) || !defined(this.selectedComponent)) {
                    return [];
                }

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
        },
        title: {
            get: function() {
                var projectName = this.currentProject.name;
                return projectName ? 'WAVED - ' + projectName : 'WAVED';
            }
        }
    });

    return WAVEDViewModel;
});
