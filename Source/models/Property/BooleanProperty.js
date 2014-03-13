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

    var BooleanProperty = function(options) {
        options = defined(options) ? options : {};
        Property.call(this, options);

        this._templateName = PropertyTemplateName.BOOLEAN;

        this.setState(options);

        ko.track(this);
    };

    BooleanProperty.prototype = Object.create(Property.prototype);

    Object.defineProperties(BooleanProperty.prototype, {
        value: {
            get: function() {
                return this._value;
            },
            set: function(value) {
                if (typeof value === 'boolean' && this.isValidValue(value)) {
                    this.error = false;
                    this.message = '';
                    this._value = value;
                }
                else {
                    this.error = true;
                    this.message = this.errorMessage;
                }
            }
        }
    });

    return BooleanProperty;
});