define([
        'models/ComponentViewModel',
        'models/Event/Trigger',
        'models/Property/StringProperty',
        'models/Widget/WidgetViewModel',
        'modules/UniqueTracker',
        'util/defined',
        'util/createValidator',
        'knockout'
    ],function(
        ComponentViewModel,
        Trigger,
        StringProperty,
        WidgetViewModel,
        UniqueTracker,
        defined,
        createValidator,
        ko){
    'use strict';

    var ButtonViewModel = function(state, getDataSet) {
        state = (defined(state)) ? state : {};
        WidgetViewModel.call(this, state, getDataSet);

        if (!defined(state.name)) {
            var namespace = ComponentViewModel.getUniqueNameNamespace();
            this.name.originalValue = UniqueTracker.getDefaultUniqueValue(namespace, ButtonViewModel.getType(), this);
        }

        // Set label
        this.label = new StringProperty({
            displayName: 'Label',
            value: '',
            validValue: createValidator({
                minLength: 0,
                maxLength: 50
            }),
            errorMessage: 'Must be between 0 and 50 characters'
        });

        this.height.originalValue = 5;
        this.width.originalValue = 10;

        this.setState(state);

        ko.track(this);
    };

    /**
     * Static method that returns the type String for this class.
     */
    ButtonViewModel.getType = function() {
        return 'Button';
    };

    ButtonViewModel.prototype = Object.create(WidgetViewModel.prototype);

    ButtonViewModel.prototype.getState = function() {
        var state = WidgetViewModel.prototype.getState.call(this);
        state.type = ButtonViewModel.getType();
        state.label = this.label.getState();

        return state;
    };

    ButtonViewModel.prototype.setState = function(state) {
        WidgetViewModel.prototype.setState.call(this, state);

        if (defined(state.label)) {
            this.label.originalValue = state.label.value;
        }
    };

    Object.defineProperties(ButtonViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.label, this.x, this.y, this.width, this.height, this.visible,
                this.logGoogleAnalytics, this.z, this.zIncrement, this.zDecrement];
            }
        }
    });

    return ButtonViewModel;
});