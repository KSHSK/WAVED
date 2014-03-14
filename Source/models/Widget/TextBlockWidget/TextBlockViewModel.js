define([
        'models/Widget/WidgetViewModel',
        'models/Property/StringProperty',
        'models/Property/NumberProperty',
        'util/defined',
        'util/createValidator',
        'knockout'
    ],function(
        WidgetViewModel,
        StringProperty,
        NumberProperty,
        defined,
        createValidator,
        ko){
    'use strict';

    var TextBlockViewModel = function(state) {
        state = (defined(state)) ? state : {};
        WidgetViewModel.call(this, state);

        // Set label
        this.text = new StringProperty({
            displayName: 'Text',
            value: '',
            validValue: createValidator({
                minLength: 0,
                maxLength: 500
            }),
            textArea: true,
            errorMessage: 'Must be between 0 and 500 characters'
        });

        this.border = new NumberProperty({
            displayName: 'Border',
            value: 1,
            validValue: createValidator({
                min: 0
            }),
            errorMessage: 'Value must be a positive number'
        });

        this.height.value = 5;
        this.width.value = 15;

        this.setState(state);

        ko.track(this);
    };

    /**
     * Static method that returns the type String for this class.
     */
    TextBlockViewModel.getType = function() {
        //TODO: Update this in the DD.
        return 'TextBlock';
    };

    TextBlockViewModel.prototype = Object.create(WidgetViewModel.prototype);

    TextBlockViewModel.prototype.getState = function() {
        var state = WidgetViewModel.prototype.getState.call(this);
        state.type = TextBlockViewModel.getType();
        state.text = this.text.getState();
        state.border = this.border.getState();

        return state;
    };

    TextBlockViewModel.prototype.setState = function(state) {
        WidgetViewModel.prototype.setState.call(this, state);

        if (defined(state.text)) {
            this.text.value = state.text.value;
        }
        if (defined(state.border)) {
            this.border.value = state.border.value;
        }
    };

    Object.defineProperties(TextBlockViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.text, this.x, this.y, this.width, this.height, this.border, this.visible,
                this.logGoogleAnalytics];
            }
        }
    });

    return TextBlockViewModel;
});