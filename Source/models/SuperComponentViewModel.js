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

    SuperComponentViewModel.prototype.subscribeChanges = function(propertyChangeSubscriber) {
        var self = this;

        self.properties.forEach(function(prop) {
            self.subscribeChange(prop, '_value', propertyChangeSubscriber);
            self.recursiveSubscribeChanges(prop, propertyChangeSubscriber);
        });

        self.subscribed = true;
    };

    SuperComponentViewModel.prototype.subscribeChange = function(prop, name, propertyChangeSubscriber) {
        var self = this;

        // Subscribe undo change.
        var subscription = propertyChangeSubscriber.subscribeBeforeChange(prop, name);

        if (subscription !== null) {
            self.subscriptions.push(subscription);
        }

        // Subscribe redo and dirty changes.
        subscription = propertyChangeSubscriber.subscribeChange(prop, name);

        if (subscription !== null) {
            self.subscriptions.push(subscription);
        }
    };

    SuperComponentViewModel.prototype.recursiveSubscribeChanges = function(prop, propertyChangeSubscriber) {
        var self = this;

        if(prop === undefined){
            return;
        }

        // This means the property is an object that holds other properties
        if(defined(prop.getSubscribableNestedProperties)){
            var nestedProperties = prop.getSubscribableNestedProperties();
            if(defined(nestedProperties) && nestedProperties.length > 0){

                nestedProperties.forEach(function(nestedProp){
                    // Subscribe to the nestedProperty itself
                    self.subscribeChange(nestedProp, '_value', propertyChangeSubscriber);

                    // Traverse down the tree
                    self.recursiveSubscribeChanges(self, nestedProp, propertyChangeSubscriber);
                });
            }
        }
        else{
            // The nesting stops here, look for properties like normal (we've reached the bottom of the tree)
            prop.properties.forEach(function(value){
                self.subscribeChange(value, '_value', propertyChangeSubscriber);
            });
        }
    };

    return SuperComponentViewModel;
});