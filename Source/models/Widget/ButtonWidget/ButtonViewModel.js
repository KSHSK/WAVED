/*global define*/
define([
        'models/Widget/WidgetViewModel',
        'models/Property/StringProperty',
        'util/defined',
        'util/createValidator',
        'knockout'
    ],function(
        WidgetViewModel,
        StringProperty,
        defined,
        createValidator,
        ko){
    'use strict';

    var ButtonViewModel = function(state) {
        state = (defined(state)) ? state : {};
        WidgetViewModel.call(this, state);

        // Set label
        var labelValue = '';
        if (defined(state.label)) {
            labelValue = state.label.value;
        }

        this.label = new StringProperty({
            displayName: 'Label',
            value: labelValue,
            validValue: createValidator({
                minLength: 1,
                maxLength: 50
            }),
            errorMessage: 'Must be between 1 and 50 characters'
        });

        // Change the default height if not defined.
        if (!defined(state.height)) {
            this.height.value = 5;
        }

        // Change the default width if not defined.
        if (!defined(state.width)) {
            this.width.value = 10;
        }

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
        // TODO
    };

    Object.defineProperties(ButtonViewModel.prototype, {
        properties: {
            get: function() {
                return [this._name, this.label, this.x, this.y, this.width, this.height, this.visible,
                this.logGoogleAnalytics];
            }
        }
    });

    return ButtonViewModel;
});