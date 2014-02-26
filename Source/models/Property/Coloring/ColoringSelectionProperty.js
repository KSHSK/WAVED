/*global define*/
define([
        'models/Property/Property',
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

    var ColoringSelectionProperty = function(state) {
        Property.call(this, state);

        state = defined(state) ? state : {};

        // TODO: Validation, settings defaults, etc.
        this.value = state.value; // ColoringScheme
        this._coloringType = state.coloringType; // ArrayProperty

        this._templateName = PropertyTemplateName.COLORING;

        this.isValidValue = function(value){

        };

        ko.track(this);
    };

    ColoringSelectionProperty.prototype = Object.create(Property.prototype);

    Object.defineProperties(ColoringSelectionProperty.prototype, {
        coloringType: {
            get: function() {
                return this._coloringType;
            }
        },
        value: {
            get: function() {
                return this.value;
            },
            set: function(value) {
                this.value = value;
            }
        }
    });

    return ColoringSelectionProperty;
});