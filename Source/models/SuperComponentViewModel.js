define([
        'jquery',
        'knockout',
        'models/Property/StringProperty',
        'util/defined',
        'util/createValidator',
        'util/getNamePropertyInstance',
        'util/subscribeObservable'
    ], function(
        $,
        ko,
        StringProperty,
        defined,
        createValidator,
        getNamePropertyInstance,
        subscribeObservable) {
    'use strict';

    var SuperComponentViewModel = function(state) {
        // Set name
        this.name = getNamePropertyInstance('Name', {
            namespace: SuperComponentViewModel.getUniqueNameNamespace(),
            item: this
        });

        ko.track(this);
    };

    SuperComponentViewModel.getUniqueNameNamespace = function() {
        return 'component-name';
    };

    Object.defineProperties(SuperComponentViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name];
            }
        }
    });

    SuperComponentViewModel.prototype.getState = function() {
        return {
            'name': this.name.getState()
        };
    };

    SuperComponentViewModel.prototype.setState = function(state) {
        if (defined(state.name)) {
            this.name.value = state.name.value;
        }
    };

    SuperComponentViewModel.prototype.subscriptions = [];

    SuperComponentViewModel.prototype.subscribed = false;

    SuperComponentViewModel.prototype.subscribeChanges = function(setDirty, addUndoHistoryFunction,
        addRedoHistoryFunction, changeFromUndoRedoFunction) {

        var self = this;
        self.properties.forEach(function(prop) {

            // Subscribe undo change.
            var subscription = subscribeObservable(prop, '_value', function(oldValue) {
                if (!changeFromUndoRedoFunction()) {
                    addUndoHistoryFunction(function() {
                        prop._value = oldValue;
                    });
                }
            }, null, 'beforeChange');

            self.subscriptions.push(subscription);

            // Subscribe redo and dirty changes.
            subscription = subscribeObservable(prop, '_value', function(newValue) {
                setDirty();

                if (!changeFromUndoRedoFunction()) {
                    addRedoHistoryFunction(function() {
                        prop._value = newValue;
                    });
                }
            });

            self.subscriptions.push(subscription);

            self.recursiveSubscribeChanges(self, prop, setDirty, addUndoHistoryFunction, addRedoHistoryFunction,
                changeFromUndoRedoFunction);
        });

        this.subscribed = true;
    };

    SuperComponentViewModel.prototype.recursiveSubscribeChanges = function(self, prop, setDirty,
        addUndoHistoryFunction, addRedoHistoryFunction, changeFromUndoRedoFunction) {

        if(prop === undefined){
            return;
        }

        // This means the property is an object that holds other properties
        if(defined(prop.getSubscribableNestedProperties)){
            var nestedProperties = prop.getSubscribableNestedProperties();
            if(defined(nestedProperties) && nestedProperties.length > 0){

                nestedProperties.forEach(function(nestedProp){
                    // Subscribe to the nestedProperty itself
                    var nestedSubscription = subscribeObservable(nestedProp, '_value', setDirty,
                        addUndoHistoryFunction, addRedoHistoryFunction, changeFromUndoRedoFunction);

                    if(nestedSubscription !== null){
                        self.subscriptions.push(nestedSubscription);
                    }

                    // Traverse down the tree
                    self.recursiveSubscribeChanges(self, nestedProp, setDirty, addUndoHistoryFunction,
                        addRedoHistoryFunction, changeFromUndoRedoFunction);
                });
            }
        }
        else{
            // The nesting stops here, look for properties like normal (we've reached the bottom of the tree)
            prop.properties.forEach(function(value){
                var subscription = subscribeObservable(value, '_value', setDirty, addUndoHistoryFunction,
                    addRedoHistoryFunction, changeFromUndoRedoFunction);

                self.subscriptions.push(subscription);
            });
        }
    };

    return SuperComponentViewModel;
});