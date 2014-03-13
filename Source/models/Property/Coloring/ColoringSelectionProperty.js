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

        // TODO: Validation, settings defaults, etc.
        this.value = state.value; // ColoringScheme
        this._coloringType = state.coloringType; // ArrayProperty

        this._templateName = PropertyTemplateName.COLORING;

        this.isValidValue = function(value) {

        };

        ko.track(this);
    };

    ColoringSelectionProperty.prototype = Object.create(Property.prototype);

    Object.defineProperties(ColoringSelectionProperty.prototype, {
        coloringType: {
            get: function() {
                return this._coloringType;
            }
        }
    });

    ColoringSelectionProperty.prototype.getSelectedColoringType = function() {
        // TODO
    };

    return ColoringSelectionProperty;
});