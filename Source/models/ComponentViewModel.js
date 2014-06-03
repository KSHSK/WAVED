define([
        'jquery',
        'knockout',
        'models/Constants/ValueType',
        'models/Property/StringProperty',
        'models/Property/BooleanProperty',
        'models/Property/NumberProperty',
        'models/Property/ButtonProperty',
        'modules/PropertyChangeSubscriber',
        'modules/UniqueTracker',
        'util/defined',
        'util/createValidator',
        'util/getNamePropertyInstance',
        'util/subscribeObservable'
    ], function(
        $,
        ko,
        ValueType,
        StringProperty,
        BooleanProperty,
        NumberProperty,
        ButtonProperty,
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

        /*
         * Default to 25. Override 0 for components that need to always be on bottom (e.g. WorkspaceViewModel, USMapViewModel)
         * 25 is a magic number, it's just so that if you add multiple widgets on top of one another and want to send one to the back,
         * you don't need to send all the other ones forward, just move the one back.
         */
        this.z = new NumberProperty({
            displayName: 'Z',
            value: 25,
            visible: false,
            onchange: function() {
                /*
                 * Don't let this go below zMinimum. Z-index is relative to the parent container
                 * so a negative z will put it behind the parent.
                 */
                if (this.value === self.zMinimum) {
                    self.zDecrement.disableButton();
                }
                else {
                    self.zDecrement.enableButton();
                }
            }
        });

        this.zMinimum = 1;

        this.zIncrement = new ButtonProperty({
            displayName: '',
            buttonLabel: 'Move Forward',
            clickFunction: function() {
                self.z.originalValue++;
            }
        });

        this.zDecrement = new ButtonProperty({
           displayName: '',
           buttonLabel: 'Move Backward',
           clickFunction: function() {
               self.z.originalValue--;
           }
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
            logGoogleAnalytics : this.logGoogleAnalytics.getState(),
            z : this.z.getState()
        };
    };

    ComponentViewModel.prototype.setState = function(state) {
        if (defined(state.name)) {
            this.name.setState(state.name);
        }

        if (defined(state.visible)) {
            this.visible.setState(state.visible);
        }

        if (defined(state.logGoogleAnalytics)) {
            this.logGoogleAnalytics.setState(state.logGoogleAnalytics);
        }

        if(defined(state.z)){
            this.z.setState(state.z);

            if(this.z.originalValue === this.zMinimum){
                this.zDecrement.disableButton();
            }
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

    ComponentViewModel.prototype.isValid = function(type) {
        var valid = true;

        for (var i = 0; i < this.properties.length; i++) {
            var error = false;
            var nestedError = false;
            var errorType = (type === ValueType.DISPLAY_VALUE ? 'displayError' : 'error');

            error = this.properties[i][errorType];

            // Search for nested property errors
            if (defined(this.properties[i].getSubscribableNestedProperties())) {
                for (var j = 0; j < this.properties[i].displayValue.properties.length; j++) {
                    nestedError = this.properties[i].displayValue.properties[j][errorType];
                }
            }

            valid = valid && !error && !nestedError;
        }

        return valid;
    };

    ComponentViewModel.prototype.displayErrors = function(valueType) {
        for (var i = 0; i < this.properties.length; i++) {
            var property = this.properties[i];

            if (valueType === ValueType.DISPLAY_VALUE) {
                if (property.displayError) {
                    property.displayErrorMessage(ValueType.DISPLAY_VALUE);
                }
            }
            else {
                if (property.error) {
                    property.displayErrorMessage(valueType);
                }
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