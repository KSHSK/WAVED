/* global console*/
define([
        'jquery',
        'knockout',
        'util/defined',
        'util/defaultValue',
        'util/updateQueryByName',
        'util/subscribeObservable',
        'models/Constants/MessageType',
        'models/ComponentViewModel',
        'models/Action/Action',
        'models/Action/PropertyAction',
        'models/Action/QueryAction',
        'modules/DisplayMessage',
        'models/Event/Event',
        'models/WorkspaceViewModel',
        'models/GoogleAnalytics',
        'models/Data/DataSet',
        'models/Data/DataSubset',
        'modules/PropertyChangeSubscriber',
        'modules/HistoryMonitor',
        'modules/UniqueTracker',
        'modules/DependencyChecker'
    ], function(
        $,
        ko,
        defined,
        defaultValue,
        updateQueryByName,
        subscribeObservable,
        MessageType,
        ComponentViewModel,
        Action,
        PropertyAction,
        QueryAction,
        DisplayMessage,
        Event,
        WorkspaceViewModel,
        GoogleAnalytics,
        DataSet,
        DataSubset,
        PropertyChangeSubscriber,
        HistoryMonitor,
        UniqueTracker,
        DependencyChecker) {
    'use strict';

    var ProjectViewModel = function(state) {
        state = defined(state) ? state : {};

        if (typeof state.name === 'undefined') {
            throw new Error('ProjectViewModel name is required');
        }

        this._name = state.name;
        this._googleAnalytics = new GoogleAnalytics();
        this._workspace = new WorkspaceViewModel();
        this._widgets = [];
        this._dataSets = [];
        this._actions = [];
        this._events = [];

        this.setState(state);

        ko.track(this);

        this.subscribeNameChange();

        DependencyChecker.project = this;
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
        components: {
            get: function() {
                return [this.workspace].concat(this.widgets);
            }
        },
        actionComponentOptions: {
            get: function() {
                var items = [];
                this.widgets.forEach(function(widget) {
                    items.push(widget.viewModel);
                    items.push.apply(widget.viewModel.subTargets);
                });
                return items;
            }
        },
        dataSets: {
            get: function() {
                return this._dataSets;
            }
        },
        unmarkedDataSets: {
            get: function() {
                return this._dataSets.filter(function(dataSet) {
                    return !dataSet.isMarkedForDeletion();
                });
            }
        },
        unmarkedProperDataSets: {
            get: function() {
                var subsets = this.dataSubsets;
                return this.unmarkedDataSets.filter(function(dataSet) {
                    return subsets.indexOf(dataSet) === -1;
                });
            }
        },
        dataSubsets: {
            get: function() {
                return this._dataSets.filter(function(dataSet) {
                    return dataSet instanceof DataSubset;
                });
            }
        },
        googleAnalytics: {
            get: function() {
                return this._googleAnalytics;
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
        propertyActions: {
            get: function() {
                return this._actions.filter(function(action) {
                    return action instanceof PropertyAction;
                });
            }
        },
        queryActions: {
            get: function() {
                return this._actions.filter(function(action) {
                    return action instanceof QueryAction;
                });
            }
        },
        nonAutoActions: {
            get: function() {
                return this._actions.filter(function(action) {
                    return !action.applyAutomatically;
                });
            }
        },
        workspace: {
            get: function() {
                return this._workspace;
            }
        }
    });

    ProjectViewModel.prototype.getState = function() {
        var self = this;

        return {
            'name': this._name,
            'workspace': this._workspace.getState(),
            'analytics': this._googleAnalytics.getState(),
            'widgets': $.map(this._widgets, function(item) {
                // Skip workspace.
                if (item === self._workspace) {
                    return null;
                }

                return item.viewModel.getState();
            }),
            'dataSets': $.map(this._dataSets, function(item) {
                return item.getState();
            }),
            'actions': $.map(this._actions, function(item) {
                return item.getState();
            }),
            'events': $.map(this._events, function(item) {
                return item.getState();
            })
        };
    };

    ProjectViewModel.prototype.resetProject = function() {
        this._name = '';
        this._workspace.resetWorkspace();
        this._googleAnalytics.resetGoogleAnalytics();

        if (this._dataSets.length > 0) {
            this._dataSets.length = 0;

            // Setting length doesn't trigger knockout, so we must call valueHasMutated explicitly.
            ko.getObservable(this, '_dataSets').valueHasMutated();
        }

        if (this._widgets.length > 0) {
            this._widgets.length = 0;

            // Setting length doesn't trigger knockout, so we must call valueHasMutated explicitly.
            ko.getObservable(this, '_widgets').valueHasMutated();
        }

        if (this._actions.length > 0) {
            this._actions.length = 0;

            // Setting length doesn't trigger knockout, so we must call valueHasMutated explicitly.
            ko.getObservable(this, '_actions').valueHasMutated();
        }

        if (this._events.length > 0) {
            this._events.length = 0;

            // Setting length doesn't trigger knockout, so we must call valueHasMutated explicitly.
            ko.getObservable(this, '_events').valueHasMutated();
        }

        // Reserve DataSet name 'trigger' because of how Trigger data is sent to actions.
        UniqueTracker.addValueIfUnique(DataSet.getUniqueNameNamespace(), 'trigger', {});
    };


    ProjectViewModel.prototype.setState = function(state, availableWidgets) {
        var self = this;

        if (defined(state.name)) {
            this._name = state.name;
        }

        if (defined(state.analytics)) {
            this._googleAnalytics.setState(state.analytics);
        }

        if (defined(state.workspace)) {
            this._workspace.setState(state.workspace);
        }

        /*
         * Must go before widgets because any widgets that depend on DataSets
         * will need them to be available.
         */
        if (defined(state.dataSets)) {
            // Clear array.
            this._dataSets.length = 0;

            $.each(state.dataSets, function(itemIndex, itemState) {
                var dataSet;

                if (itemState.type === DataSet.getType()) {
                    dataSet = new DataSet(itemState);
                }
                else if (itemState.type === DataSubset.getType()) {
                    dataSet = new DataSubset(itemState);
                }
                else {
                    // Invalid state.
                    return;
                }

                self.addDataSet(dataSet);
            });


            // Update DataSubset parents.
            // Must be done after all DataSets are loaded in case the DataSubset shows up before its parent.
            $.each(self._dataSets, function(index, dataSet) {
                if (dataSet.type === DataSubset.getType()) {
                    // Get the parent object from the name.
                    dataSet.setState({
                        parent: self.getDataSet(dataSet.parent)
                    });
                }
            });
        }

        if (defined(state.widgets)) {
            // Clear array.
            this._widgets.length = 0;

            $.each(state.widgets, function(itemIndex, itemState) {
                for (var index = 0; index < availableWidgets.length; index++) {
                    var widgetType = availableWidgets[index];
                    if (itemState.type === widgetType.o.getViewModelType()) {
                        var widget =  new widgetType.o(itemState, self.getDataSet.bind(self));
                        self.addWidget(widget);
                    }
                }
            });
        }

        if (defined(state.actions)) {
            // Clear array.
            this._actions.length = 0;

            $.each(state.actions, function(itemIndex, itemState) {
                var action;

                if (itemState.type === PropertyAction.getType()) {
                    itemState.target = self.getActionComponentOption(itemState.target);
                    action = new PropertyAction(itemState);
                }
                else if (itemState.type === QueryAction.getType()) {
                    action = new QueryAction(itemState, self.getDataSet.bind(self));
                }
                else {
                    // Invalid state.
                    return;
                }

                self.addAction(action);
            });
        }

        if (defined(state.events)) {
            // Clear array.
            this._events.length = 0;

            $.each(state.events, function(itemIndex, itemState) {
                itemState.triggeringWidget = self.getWidget(itemState.triggeringWidget);
                // TODO: Trigger?
                var actions = [];
                for (var i = 0; i < itemState.actions.length; i++) {
                    actions.push(self.getAction(itemState.actions[i]));
                }

                itemState.actions = actions;

                var event = new Event(itemState);
                self.addEvent(event);
            });
        }
    };

    ProjectViewModel.prototype.addWidget = function(widget, index) {
        var self = this;

        // Try to add unique name.
        var success = UniqueTracker.addValueIfUnique(ComponentViewModel.getUniqueNameNamespace(),
            widget.viewModel.name.value, widget.viewModel);

        if (!success) {
            console.log('New Widget name was not unique.');
            return;
        }

        if (defined(index)) {
            this._widgets.splice(index, 0, widget);
        }
        else {
            this._widgets.push(widget);
        }

        // Add the DOM element.
        widget.addToWorkspace();

        var historyMonitor = HistoryMonitor.getInstance();

        // Undo by removing the item.
        historyMonitor.addUndoChange(function() {
            self.removeWidget(widget);
        });

        // Redo by readding the item.
        historyMonitor.addRedoChange(function() {
            self.addWidget(widget);
        });
    };

    ProjectViewModel.prototype.addDataSet = function(data, index) {
        var self = this;
        var namespace = DataSet.getUniqueNameNamespace();

        // Try to add unique name.
        var success = UniqueTracker.addValueIfUnique(namespace, data.name, data);

        if (!success) {
            console.log('New DataSet name was not unique.');
            return;
        }

        var historyMonitor = HistoryMonitor.getInstance();

        if (data instanceof DataSubset) {
            // DataSubset

            if (defined(index)) {
                this._dataSets.splice(index, 0, data);
            }
            else {
                this._dataSets.push(data);
            }

            // Undo by removing the item.
            historyMonitor.addUndoChange(function() {
                self.removeDataSet(data);
            });

            // Redo by readding the item.
            historyMonitor.addRedoChange(function() {
                self.addDataSet(data);
            });
        }
        else {
            // DataSet

            this._dataSets.push(data);

            // Undo by marking the DataSet for deletion.
            historyMonitor.addUndoChange(function() {
                // Remove unique name.
                UniqueTracker.removeItem(namespace, data);
                data.markForDeletion();
            });

            // Redo by reseting the DataSet's reference count.
            historyMonitor.addRedoChange(function() {
                // Add unique name again.
                var success = UniqueTracker.addValueIfUnique(namespace, data.name, data);

                if (!success) {
                    console.log('DataSet name added through redo was not unique.');
                    return;
                }

                data.resetReferenceCount();
            });
        }
    };

    ProjectViewModel.prototype.addAction = function(action, index) {
        var self = this;

        // Try to add unique name.
        var success = UniqueTracker.addValueIfUnique(Action.getUniqueNameNamespace(), action.name, action);

        if (!success) {
            console.log('New Action name was not unique.');
            return;
        }

        if (defined(index)) {
            this._actions.splice(index, 0, action);
        }
        else {
            this._actions.push(action);
        }

        var historyMonitor = HistoryMonitor.getInstance();

        // Undo by removing the item.
        historyMonitor.addUndoChange(function() {
            self.removeAction(action);
        });

        // Redo by readding the item.
        historyMonitor.addRedoChange(function() {
            self.addAction(action);
        });
    };

    ProjectViewModel.prototype.addEvent = function(event, index) {
        var self = this;

        // Try to add unique name.
        var success = UniqueTracker.addValueIfUnique(Event.getUniqueNameNamespace(), event.name, event);

        if (!success) {
            console.log('New Event name was not unique.');
            return;
        }

        event.register();

        if (defined(index)) {
            this._events.splice(index, 0, event);
        }
        else {
            this._events.push(event);
        }

        var historyMonitor = HistoryMonitor.getInstance();

        // Undo by removing the item.
        historyMonitor.addUndoChange(function() {
            self.removeEvent(event);
        });

        // Redo by readding the item.
        historyMonitor.addRedoChange(function() {
            self.addEvent(event);
        });
    };

    ProjectViewModel.prototype.getWidget = function(name) {
        for (var index = 0; index < this._widgets.length; index++) {
            var widget = this._widgets[index];
            if (widget.viewModel.name.value === name) {
                return widget;
            }
        }

        return null;
    };

    ProjectViewModel.prototype.getActionComponentOption = function(name) {
        for (var index = 0; index < this.actionComponentOptions.length; index++) {
            var viewModel = this.actionComponentOptions[index];
            if (viewModel.name.value === name) {
                return viewModel;
            }
        }

        return null;
    };

    ProjectViewModel.prototype.getDataSet = function(name) {
        var self = this;

        for (var index = 0; index < self._dataSets.length; index++) {
            var dataSet = self._dataSets[index];
            if (dataSet.name === name) {
                return dataSet;
            }
        }

        return null;
    };

    ProjectViewModel.prototype.getDataSetByFilename = function(filename) {
        var self = this;

        for (var index = 0; index < self._dataSets.length; index++) {
            var dataSet = self._dataSets[index];
            if (dataSet.filename === filename) {
                return dataSet;
            }
        }

        return null;
    };

    ProjectViewModel.prototype.getAction = function(name) {
        for (var index = 0; index < this._actions.length; index++) {
            var action = this._actions[index];
            if (action.name === name) {
                return action;
            }
        }

        return null;
    };

    ProjectViewModel.prototype.getEvent = function(name) {
        // TODO
    };

    ProjectViewModel.prototype.removeWidget = function(widget) {
        var self = this;

        var response = DependencyChecker.allowedToDeleteComponent(widget);
        if (!response.allowed) {
            DisplayMessage.show(response.message, MessageType.WARNING);
            return false;
        }

        if (widget !== this._workspace) {
            var index = this._widgets.indexOf(widget);
            if (index > -1) {
                this._widgets.splice(index, 1);

                // Remove unique name.
                UniqueTracker.removeItem(ComponentViewModel.getUniqueNameNamespace(), widget.viewModel);

                // Remove the DOM element.
                widget.removeFromWorkspace();

                var boundData = widget.viewModel.unbindAllData();

                var historyMonitor = HistoryMonitor.getInstance();

                // Undo by adding the item.
                historyMonitor.addUndoChange(function() {
                    self.addWidget(widget, index);

                    boundData.forEach(function(dataSet) {
                        widget.viewModel.bindData(dataSet);
                    });
                });

                // Redo by removing the item.
                historyMonitor.addRedoChange(function() {
                    self.removeWidget(widget);
                    widget.viewModel.unbindAllData();
                });
            }
        }

        return true;
    };

    ProjectViewModel.prototype.removeDataSet = function(dataSet) {
        var self = this;

        var response = DependencyChecker.allowedToDeleteDataSet(dataSet);
        if (!response.allowed) {
            DisplayMessage.show(response.message, MessageType.WARNING);
            return;
        }

        var index = this._dataSets.indexOf(dataSet);
        if (index > -1) {
            this._dataSets.splice(index, 1);

            // Remove unique name.
            UniqueTracker.removeItem(DataSet.getUniqueNameNamespace(), dataSet);

            // Cannot undo/redo removing a DataSet. Only add history if removing DataSubset.
            if (dataSet instanceof DataSubset) {
                var historyMonitor = HistoryMonitor.getInstance();

                // Undo by adding the item.
                historyMonitor.addUndoChange(function() {
                    self.addDataSet(dataSet, index);
                });

                // Redo by removing the item.
                historyMonitor.addRedoChange(function() {
                    self.removeDataSet(dataSet);
                });
            }
        }
    };

    ProjectViewModel.prototype.removeAction = function(action) {
        var self = this;

        var response = DependencyChecker.allowedToDeleteAction(action);
        if (!response.allowed) {
            DisplayMessage.show(response.message, MessageType.WARNING);
            return;
        }

        var index = self._actions.indexOf(action);
        if (index > -1) {
            self._actions.splice(index, 1);

            // Remove unique name.
            UniqueTracker.removeItem(Action.getUniqueNameNamespace(), action);

            var historyMonitor = HistoryMonitor.getInstance();

            // Undo by adding the item.
            historyMonitor.addUndoChange(function() {
                self.addAction(action, index);
            });

            // Redo by removing the item.
            historyMonitor.addRedoChange(function() {
                self.removeAction(action);
            });
        }
    };

    ProjectViewModel.prototype.removeEvent = function(event) {
        var self = this;

        var index = self._events.indexOf(event);
        if (index > -1) {
            event.unregister();
            self._events.splice(index, 1);

            // Remove unique name.
            UniqueTracker.removeItem(Event.getUniqueNameNamespace(), event);

            var historyMonitor = HistoryMonitor.getInstance();

            // Undo by adding the item.
            historyMonitor.addUndoChange(function() {
                self.addEvent(event, index);
            });

            // Redo by removing the item.
            historyMonitor.addRedoChange(function() {
                self.removeEvent(event);
            });
        }
    };

    ProjectViewModel.prototype.refreshWorkspace = function() {
        this.actionComponentOptions.forEach(function(viewModel) {
            var properties = viewModel.properties;
            for (var j = 0; j < properties.length; j++) {
                // Reset all nested values if present
                if(defined(properties[j].getSubscribableNestedProperties())) {
                    var nestedProps = properties[j].getSubscribableNestedProperties();

                    for(var nestedIndex in nestedProps) {
                        nestedProps[nestedIndex].properties.forEach(function(prop) {
                            prop.value = prop.originalValue;
                        });
                    }
                }

                var displayValue = properties[j].displayValue;
                properties[j].value = properties[j].originalValue;
                properties[j].displayValue = displayValue;
            }
        });

        for (var i = 0; i < this.dataSubsets.length; i++) {
            this.dataSubsets[i].reset();
        }

        // Reapply automatically applied actions.
        for (i = 0; i < this._actions.length; i++) {
            if (this._actions[i].applyAutomatically) {
                this._actions[i].apply();
            }
        }
    };

    ProjectViewModel.prototype.subscribeChanges = function() {
        var self = this;

        function arrayChanged(changes) {
            changes.forEach(function(change) {
                if (change.status === 'added') {
                    var subscriber = change.value.viewModel || change.value;

                    // Subscribe to changes if not already subscribed.
                    if (!subscriber.subscribed) {
                        subscriber.subscribeChanges();
                    }
                }
            });
        }

        // Workspace changed.
        this.workspace.subscribeChanges();

        // Google Analytics changed.
        this.googleAnalytics.subscribeChanges();

        // Widget is added or removed.
        subscribeObservable(this, '_widgets', function(changes) {
            arrayChanged(changes);
        }, null, 'arrayChange');

        // DataSet is added or removed.
        subscribeObservable(this, '_dataSets', function(changes) {
            arrayChanged(changes);
        }, null, 'arrayChange');

        // Action is added or removed.
        subscribeObservable(this, '_actions', function(changes) {
            arrayChanged(changes);
        }, null, 'arrayChange');

        // Event is added or removed.
        subscribeObservable(this, '_events', function(changes) {
            arrayChanged(changes);
        }, null, 'arrayChange');
    };

    ProjectViewModel.prototype.subscribeNameChange = function() {
        ko.getObservable(this, '_name').subscribe(function(newValue) {
            // Set the URL to use the new project name.
            updateQueryByName('project', newValue);
        });
    };

    return ProjectViewModel;
});
