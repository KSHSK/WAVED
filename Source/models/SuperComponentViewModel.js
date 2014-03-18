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

    SuperComponentViewModel.prototype.subscribeChanges = function(setDirty) {
        var self = this;
        self.properties.forEach(function(prop) {
            var subscription = subscribeObservable(prop, '_value', setDirty);
            self.subscriptions.push(subscription);

            self.recursiveSubscribeChanges(self, prop, setDirty);
        });
    };

    SuperComponentViewModel.prototype.recursiveSubscribeChanges = function(self, prop, setDirty){
        if(prop === undefined){
            return;
        }

        // This means the property is an object that holds other properties
        if(defined(prop.getSubscribableNestedProperties)){
            var nestedProperties = prop.getSubscribableNestedProperties();
            if(defined(nestedProperties) && nestedProperties.length > 0){

                nestedProperties.forEach(function(nestedProp){
                    var nestedSubscription = subscribeObservable(nestedProp, '_value', setDirty);

                    if(nestedSubscription !== null){
                        self.subscriptions.push(nestedSubscription);
                    }

                    self.recursiveSubscribeChanges(self, nestedProp, setDirty);
                });
            }
        }
        else{
            // The nesting stops here, look for properties like normal
            prop.properties.forEach(function(value){
                var subscription = subscribeObservable(value, '_value', setDirty);

                self.subscriptions.push(subscription);
            });
        }
    };

    return SuperComponentViewModel;
});