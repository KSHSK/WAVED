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
         * Returns true if the component is not in use; otherwise, returns false.
         * @param component The component to be deleted.
         * @param project The current project.
         */
        allowedToDeleteComponent: function(component, project) {
            var i;

            // Check PropertyActions.
            for (i = 0; i < project.actions.length; i++) {
                var action = project.actions[i];

                if (action instanceof PropertyAction) {
                    if (action.target === component) {
                        return false;
                    }
                }
            }

            // Check Events.
            for (i = 0; i < project.events.length; i++) {
                var event = project.events[i];

                if (event.triggeringComponent === component) {
                    return false;
                }
            }

            return true;
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
                        return false;
                    }
                }
            }

            return true;
        },

        /**
         * Returns true if the dataSet is not bound to a widget; otherwise, returns false.
         * @param project The current project.
         * @param dataSet The dataSet to be deleted.
         */
        allowedToDeleteDataSet: function(dataSet) {
            // TODO Check if the DataSet is used by a QueryAction.

            return (dataSet.referenceCount <= 0);
        },

        /**
         * Returns true if the dataSet is not used by the widget; otherwise, returns false.
         * @param project The current project.
         * @param dataSet The dataSet to be unbound.
         * @param widget The widget that dataSet is bound to.
         */
        allowedToUnbindDataSet: function(dataSet, widget) {
            return (!widget.usesDataSet(dataSet));
        }
    };

    return DependencyChecker;
});