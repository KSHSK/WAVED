/**
 * A module that keeps track of properties that must have a unique value, such as name.
 */
define([
        'd3',
        'jquery',
        'util/defined'
    ], function(
        d3,
        $,
        defined) {
    'use strict';

    // Namespace is a String representing a namespace for uniqueness. Every value in a namespace must be unique.
    // Value is the unique value used by the item.
    // Item is an instance of a Component, DataSet, Action, or Event, which uses the specified value.
    // For example: {namespace1: {myname: Widget1, actname: Action1}, namespace2: {eventword: Event1}}
    var namespaceValueItemMap = {};

    var UniqueTracker = {
        /**
         * If the item has a unique name, adds the item and returns true. Otherwise, does nothing and returns false.
         * @param namespace The collection of item/name pairs to check for uniqueness.
         * @param item The Component, DataSet, Action, or Event to add.
         * @param name The name of the item.
         * @returns {Boolean}
         */
        addValueIfUnique: function(namespace, value, item) {
            if (!this.isValueUnique(namespace, value, item)) {
                return false;
            }

            var valueItemMap = namespaceValueItemMap[namespace];
            if (!defined(valueItemMap)) {
                namespaceValueItemMap[namespace] = {};
                valueItemMap = namespaceValueItemMap[namespace];
            }

            // Remove old value if necessary.
            this.removeItem(namespace, item);

            valueItemMap[value] = item;
            return true;
        },
        isValueUnique: function(namespace, valueToCheck, itemToCheck) {
            // If itemToCheck is not supplied, assume it's a new item.
            if (!defined(itemToCheck)) {
                itemToCheck = {};
            }

            var valueItemMap = namespaceValueItemMap[namespace];
            if (!defined(valueItemMap)) {
                return true;
            }

            var oldItem = valueItemMap[valueToCheck];
            if (defined(oldItem)) {
                // This value already exists.
                // Only not unique if this item is different from itemToCheck.
                return itemToCheck === oldItem;
            }

            return true;
        },
        removeItem: function(namespace, item) {
            var valueItemMap = namespaceValueItemMap[namespace];
            if (defined(valueItemMap)) {
                var oldValue = this.findValueByItem(namespace, item);
                if (oldValue !== null) {
                    delete valueItemMap[oldValue];
                }
            }
        },
        findValueByItem: function(namespace, itemToCheck) {
            var valueItemMap = namespaceValueItemMap[namespace];
            if (!defined(valueItemMap)) {
                return null;
            }

            for (var value in valueItemMap) {
                var item = valueItemMap[value];
                if (itemToCheck === item) {
                    return value;
                }
            }

            return null;
        }
    };

    return UniqueTracker;
});