define([
        './Property',
        'util/defined',
        'models/Constants/PropertyTemplateName',
        'knockout'
    ],function(
        Property,
        defined,
        PropertyTemplateName,
        ko
    ){
    'use strict';

    var ButtonProperty = function(options) {
        options = defined(options) ? options : {};
        Property.call(this, options);

        this._templateName = PropertyTemplateName.BUTTON;
        this._displayTemplateName = PropertyTemplateName.BUTTON_DISPLAY;

        this.buttonLabel = '';

        this.clickFunction = function() {
            return;
        };

        this.setState(options);

        ko.track(this);
    };

    ButtonProperty.prototype = Object.create(Property.prototype);

    Object.defineProperties(ButtonProperty.prototype, {
        originalValue: {
            get: function() {
                return this._originalValue;
            },
            set: function(value) {

            }
        },
        value: {
            get: function() {
                return this._value;
            },
            set: function(value) {

            }
        },
        displayValue: {
            get: function() {
                return this._displayValue;
            },
            set: function(value) {

            }
        }
    });

    // TODO: Necessary?
    ButtonProperty.prototype.setState = function(state) {
        if(defined(state.clickFunction)) {
            this.clickFunction = state.clickFunction;
        }

        if(defined(state.buttonLabel)) {
            this.buttonLabel = state.buttonLabel;
        }

        Property.prototype.setState.call(this, state);
    };

    ButtonProperty.prototype.getState = function() {

    };

    return ButtonProperty;
});