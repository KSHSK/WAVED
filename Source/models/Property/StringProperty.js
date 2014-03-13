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

    var StringProperty = function(options) {
        options = defined(options) ? options : {};
        Property.call(this, options);

        this._templateName = PropertyTemplateName.STRING;

        this.setState(options);

        ko.track(this);
    };

    StringProperty.prototype = Object.create(Property.prototype);

    StringProperty.prototype.reset = function() {
        this._value = '';
        this.message = '';
        this.error = false;

        // Force the view to update.
        ko.getObservable(this, '_value').valueHasMutated();
    };

    Object.defineProperties(StringProperty.prototype, {
        value: {
            get: function() {
                return this._value;
            },
            set: function(value) {
                if (typeof value === 'string' && this.isValidValue(value)) {
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

    return StringProperty;
});