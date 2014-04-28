define([
        './Property',
        'util/defined',
        'models/Constants/PropertyTemplateName',
        'knockout',
        'jqueryUI'
    ],function(
        Property,
        defined,
        PropertyTemplateName,
        ko,
        $
    ){
    'use strict';

    var ButtonProperty = function(options) {
        options = defined(options) ? options : {};
        Property.call(this, options);

        this._templateName = PropertyTemplateName.BUTTON;

        this.buttonLabel = '';
        this.clickFunction = function() {
            return;
        };

        if(defined(options.clickFunction)) {
            this.clickFunction = options.clickFunction;
        }

        if(defined(options.buttonLabel)) {
            this.buttonLabel = options.buttonLabel;
        }

        this.updateUI = function() {
            $('.button-property').button();
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

    ButtonProperty.prototype.setState = function(state) {
        Property.prototype.setState.call(this, state);
    };

    return ButtonProperty;
});