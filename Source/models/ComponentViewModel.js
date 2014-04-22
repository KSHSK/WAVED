define([
        'jquery',
        'knockout',
        'models/Property/StringProperty',
        'models/Property/BooleanProperty',
        'modules/PropertyChangeSubscriber',
        'modules/UniqueTracker',
        'util/defined',
        'util/createValidator',
        'util/getNamePropertyInstance',
        'util/subscribeObservable'
    ], function(
        $,
        ko,
        StringProperty,
        BooleanProperty,
        PropertyChangeSubscriber,
        UniqueTracker,
        defined,
        createValidator,
        getNamePropertyInstance,
        subscribeObservable) {
    'use strict';

    var ComponentViewModel = function(state) {
        var self = this;

        // Set name
        this.name = getNamePropertyInstance('Name', {
            namespace: ComponentViewModel.getUniqueNameNamespace(),
            item: this
        });

        // Set visible
        this.visible = new BooleanProperty({
            displayName: 'Visible',
            value: true
        });

        // Set logGoogleAnalytics
        this.logGoogleAnalytics = new BooleanProperty({
            displayName: 'Log Google Analytics',
            value: false
        });

        ko.track(this);

        // Add the name to the unique tracker when changed.
        var namespace = ComponentViewModel.getUniqueNameNamespace();
        subscribeObservable(this.name, '_value', function(newValue) {
            UniqueTracker.addValueIfUnique(namespace, newValue, self);
        });
    };

    ComponentViewModel.getUniqueNameNamespace = function() {
        return 'component-name';
    };

    Object.defineProperties(ComponentViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.visible, this.logGoogleAnalytics];
            }
        }
    });

    ComponentViewModel.prototype.getState = function() {
        return {
            name: this.name.getState(),
            visible : this.visible.getState(),
            logGoogleAnalytics : this.logGoogleAnalytics.getState()
        };
    };

    ComponentViewModel.prototype.setState = function(state) {
        if (defined(state.name)) {
            this.name.originalValue = state.name.value;
        }

        if (defined(state.visible)) {
            this.visible.originalValue = state.visible.value;
        }

        if (defined(state.logGoogleAnalytics)) {
            this.logGoogleAnalytics.originalValue = state.logGoogleAnalytics.value;
        }
    };

    ComponentViewModel.prototype.subscribed = false;

    ComponentViewModel.prototype.subscribeChanges = function() {
        var self = this;
        var propertyChangeSubscriber = PropertyChangeSubscriber.getInstance();

        self.properties.forEach(function(prop) {
            self.subscribeChange(prop, '_originalValue', propertyChangeSubscriber);
            self.recursiveSubscribeChanges(prop, propertyChangeSubscriber);
        });

        self.subscribed = true;
    };

    ComponentViewModel.prototype.subscribeChange = function(prop, name, propertyChangeSubscriber) {
        var self = this;

        // Subscribe undo change.
        propertyChangeSubscriber.subscribeBeforeChange(prop, name);

        // Subscribe redo change.
        propertyChangeSubscriber.subscribeChange(prop, name);
    };

    ComponentViewModel.prototype.recursiveSubscribeChanges = function(prop, propertyChangeSubscriber) {
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
                    self.subscribeChange(nestedProp, '_originalValue', propertyChangeSubscriber);

                    // Traverse down the tree
                    self.recursiveSubscribeChanges(nestedProp, propertyChangeSubscriber);
                });
            }
        }
        else{
            // The nesting stops here, look for properties like normal (we've reached the bottom of the tree)
            prop.properties.forEach(function(value){
                self.subscribeChange(value, '_originalValue', propertyChangeSubscriber);
            });
        }
    };

    ComponentViewModel.prototype.isValid = function() {
        var valid = true;
        for (var i = 0; i < this.properties.length; i++) {
            valid = valid && !this.properties[i].error;
        }
        return valid;
    };

    ComponentViewModel.prototype.displayErrors = function() {
        for (var i = 0; i < this.properties.length; i++) {
            var property = this.properties[i];
            if (property.error) {
                property.message = property.errorMessage;
            }
        }
    };

    /**
     * Checks if this widget use the dataSet.
     * @param dataSet
     * @returns Returns false by default.
     */
    ComponentViewModel.prototype.usesDataSet = function(dataSet) {
        return false;
    };

    return ComponentViewModel;
});