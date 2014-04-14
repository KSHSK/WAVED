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
            for (i = 0; i < project.actions.length; i++) {
                var action = project.actions[i];

                if (action instanceof PropertyAction) {
                    if (action.target === widget) {
                        message = 'Cannot delete this widget since it is used by action "' + action.name + '"';
                        return {
                            allowed: false,
                            message: message
                        };
                    }
                }
            }

            // Check Events.
            for (i = 0; i < project.events.length; i++) {
                var event = project.events[i];

                if (event.triggeringComponent === widget) {
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
        allowedToDeleteDataSet: function(dataSet) {
            var allowed = (dataSet.referenceCount <= 0);
            var message = '';

            if (!allowed) {
                message = 'Cannot delete data that is bound to a widget';
            }

            // TODO Check if the DataSet is used by a QueryAction.

            return {
                allowed: allowed,
                message: message
            };
        },

        /**
         * Returns true if the dataSet is not used by the widget; otherwise, returns false.
         * @param project The current project.
         * @param dataSet The dataSet to be unbound.
         * @param widget The widget that dataSet is bound to.
         */
        allowedToUnbindDataSet: function(dataSet, widget) {
            var allowed = (!widget.usesDataSet(dataSet));
            var message =  allowed ?  '' : 'Cannot unbind data that is used by a widget';

            return {
                allowed: allowed,
                message: message
            };
        }
    };

    return DependencyChecker;
});