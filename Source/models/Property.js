/*global define*/
define([],function(){
    'use strict';

    var Property = function(options) {
        this._displayName = options.displayName;
        this._value = options.value;
        this._propertyType = options.propertyType;
        this._isValidValue = options.isValidValue;
    };

    Object.defineProperties(Property.prototype, {
        displayName: {
            get: function() {
                return this._displayName;
            }
        },
        value: {
            get: function() {
                return this._value;
            },
            set: function(v) {
                if (this._isValidValue(v)) {
                    this._value = v;
                }
            }
        },
        propertyType: {
            get: function() {
                return this._propertyType;
            }
        },
        isValidValue: {
            get: function() {
                return this._isValidValue;
            }
        }
    });


    return Property;
});