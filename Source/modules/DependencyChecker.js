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
        /**
         * Returns true if the widget is not in use; otherwise, returns false.
         * @param widget The widget to be deleted.
         * @param project The current project.
         */
        allowedToDeleteWidget: function(widget, project) {
            var i;
            var message = '';

            // Check PropertyActions.
            var propertyActions = project.propertyActions;
            for (i = 0; i < propertyActions.length; i++) {
                var action = propertyActions[i];

                if (action.target === widget.viewModel) {
                    message = 'Cannot delete this widget since it is used by action "' + action.name + '"';
                    return {
                        allowed: false,
                        message: message
                    };
                }
            }

            // Check Events.
            for (i = 0; i < project.events.length; i++) {
                var event = project.events[i];

                if (event.triggeringWidget === widget) {
                    message = 'Cannot delete this widget since it is used by event "' + event.name + '"';
                    return {
                        allowed: false,
                        message: message
                    };
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
         * @param project The current project.
         */
        allowedToDeleteAction: function(action, project) {
            for (var i = 0; i < project.events.length; i++) {
                var event = project.events[i];

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
         * @param project The current project.
         * @param dataSet The dataSet to be deleted.
         */
        allowedToDeleteDataSet: function(dataSet, project) {
            // Check reference count
            if (dataSet.referenceCount > 0) {
                return {
                    allowed: false,
                    message: 'Cannot delete data that is bound to a widget'
                };
            }

            // Check if dataSet has a DataSubset created from it.
            var subsets = project.dataSubsets;
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
            var queryActions = project.queryActions;
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
         * @param project The current project.
         * @param dataSet The dataSet to be unbound.
         * @param widget The widget that dataSet is bound to.
         */
        allowedToUnbindDataSet: function(dataSet, widget, project) {
            // Check if dataSet is in use by a Widget
            if (widget.usesDataSet(dataSet)) {
                return {
                    allowed: false,
                    message: 'Cannot unbind data that is used by a widget'
                };
            }

            // Check if dataSet is in use by a PropertyAction
            var usedByPropertyAction = false;
            var propertyActions = project.propertyActions;
            var usedByPropertyActionMessage = 'Cannot unbind data that is used by an action affecting this widget';

            for (var i = 0; i < propertyActions.length; i++) {
                var propertyAction = propertyActions[i];
                var newValues = propertyAction.newValues;

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
