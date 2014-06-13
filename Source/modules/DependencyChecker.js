/**
 * A module that checks if items can safely be deleted from the project.
 */
define([
        'models/Action/PropertyAction',
        'util/defined'
    ], function(
        PropertyAction,
        defined) {
    'use strict';

    var DependencyChecker = {

        project: undefined,

        /**
         * Returns true if the widget is not in use; otherwise, returns false.
         * @param widget The widget to be deleted.
         */
        allowedToDeleteComponent: function(component) {
            var i;
            var message = '';
            var subTargets = component.viewModel.subTargets;

            // Check PropertyActions.
            var propertyActions = this.project.propertyActions;
            for (i = 0; i < propertyActions.length; i++) {
                var action = propertyActions[i];

                if (action.target === component.viewModel) {
                    return {
                        allowed: false,
                        message: 'Cannot delete "' + component.viewModel.name.value  + '" since it is used by action "' + action.name + '"'
                    };
                }

                if (defined(subTargets) && subTargets.length > 0) {
                    for(var j = 0; j < subTargets.length; j++) {
                        var subTarget = subTargets[j];

                        if(action.target === subTarget) {
                            return {
                                allowed: false,
                                message: 'Cannot delete "' + component.viewModel.name.value + '" because "' + subTarget.viewModel.name.value + '" is used by action "' + action.name + '"'
                            };
                        }
                    }
                }
            }

            // Check Events.
            for (i = 0; i < this.project.events.length; i++) {
                var event = this.project.events[i];

                if (event.triggeringWidget === component) {
                    message = 'Cannot delete "' + component.viewModel.name.value + '" since it is used by event "' + event.name + '"';
                    return {
                        allowed: false,
                        message: message
                    };
                }

                if (defined(subTargets) && subTargets.length > 0) {
                    for (var k = 0; k < subTargets.length; k++) {
                        var eventSubTarget = subTargets[k];

                        if (event.triggeringWidget === eventSubTarget) {
                            return {
                                allowed: false,
                                message: 'Cannot delete "' + component.viewModel.name.value + '" because "' + eventSubTarget.viewModel.name.value + '" is used by event "' + event.name + '"'
                            };
                        }
                    }
                }
            }

            return {
                allowed: true,
                message: message
            };
        },

        /**
         * Returns true if the action is not in use; otherwise, returns false.
         * @param action The action to be deleted.
         */
        allowedToDeleteAction: function(action) {
            for (var i = 0; i < this.project.events.length; i++) {
                var event = this.project.events[i];

                for (var j = 0; j < event.actions.length; j++) {
                    var actionToCheck = event.actions[j];

                    if (action.name === actionToCheck.name) {
                        var message = 'Cannot delete this action since it is used by event "' + event.name + '"';
                        return {
                            allowed: false,
                            message: message
                        };
                    }
                }
            }

            return {
                allowed: true,
                message: ''
            };
        },

        /**
         * Returns true if the dataSet is not bound to a widget; otherwise, returns false.
         * @param dataSet The dataSet to be deleted.
         */
        allowedToDeleteDataSet: function(dataSet) {
            // Check reference count
            if (dataSet.referenceCount > 0) {
                return {
                    allowed: false,
                    message: 'Cannot delete data that is bound to a widget'
                };
            }

            // Check if dataSet has a DataSubset created from it.
            var subsets = this.project.dataSubsets;
            for (var i = 0; i < subsets.length; i++) {
                var subset = subsets[i];
                if (subset.parent === dataSet) {
                    return {
                        allowed: false,
                        message: 'Cannot delete data that a Data Subset is created from'
                    };
                }
            }

            // Check if dataSet is in use by a QueryAction
            var queryActions = this.project.queryActions;
            for (i = 0; i < queryActions.length; i++) {
                var queryAction = queryActions[i];
                if (queryAction.dataSubset === dataSet) {
                    return {
                        allowed: false,
                        message: 'Cannot delete data that is in use by a Query Action'
                    };
                }
            }

            return {
                allowed: true,
                message: ''
            };
        },

        /**
         * Returns true if the dataSet is not used by the widget; otherwise, returns false.
         * @param dataSet The dataSet to be unbound.
         * @param widget The widget that dataSet is bound to.
         */
        allowedToUnbindDataSet: function(dataSet, widget) {
            // Check if dataSet is in use by a Widget
            if (widget.usesDataSet(dataSet)) {
                return {
                    allowed: false,
                    message: 'Cannot unbind data that is used by a widget'
                };
            }

            // Check if dataSet is in use by a PropertyAction
            var usedByPropertyAction = false;
            var propertyActions = this.project.propertyActions;

            for (var i = 0; i < propertyActions.length; i++) {
                var propertyAction = propertyActions[i];

                // Only check the property actions that affect the widget with the bound data
                if (propertyAction.target !== widget) {
                    continue;
                }

                var newValues = propertyAction.newValues;
                var usedByPropertyActionMessage = 'Cannot unbind data "' + dataSet.name + '" because it is used by the action "' + propertyAction.name + '"';

                // Iterate through top level properties
                for (var key in newValues) {
                    if (this.isDataSetUsedByPropertyAction(newValues, key, dataSet)) {
                        return {
                            allowed: false,
                            message: usedByPropertyActionMessage
                        };
                    }

                    // Iterate through nestedProperties
                    if(defined(widget[key].getSubscribableNestedProperties())) {
                        var nestedProperty = newValues[key].value; // If it's a nested property, it will always be within .value

                        for (var nestedKey in nestedProperty) {
                            if (this.isDataSetUsedByPropertyAction(nestedProperty, nestedKey, dataSet)) {
                                return {
                                    allowed: false,
                                    message: usedByPropertyActionMessage
                                };
                            }
                        }
                    }
                }
            }

            return {
                allowed: true,
                message: ''
            };
        },

        isDataSetUsedByPropertyAction: function(values, key, dataSet) {
            // If it's a dataSet, it will always be contained within a .value key
            if (defined(values[key].value) && defined(values[key].value.type)) {
                if (values[key].value.type === 'DataSet' || values[key].value.type === 'DataSubset') {
                    if (values[key].value.name === dataSet.name) {
                            return true;
                    }
                }
            }

            return false;
        }
    };

    return DependencyChecker;
});
