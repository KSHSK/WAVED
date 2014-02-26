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

    var GlyphSizeSelectionProperty = function(state) {
        Property.call(this, state);

        state = defined(state) ? state : {};

        // TODO: Validation, settings defaults, etc.
        this._value = state.value;
        this._sizeType = state.sizeType;

        this._templateName = PropertyTemplateName.GLYPH_SIZE;

        this.isValidValue = function(value){

        };

        ko.track(this);
    };

    GlyphSizeSelectionProperty.prototype = Object.create(Property.prototype);

    Object.defineProperties(GlyphSizeSelectionProperty.prototype, {
        sizeType: {
            get: function() {
                return this._sizeType;
            }
        },
        value: {
            get: function() {
                return this._value;
            },
            set: function(value) {
                this._value = value;
            }
        }
    });

    return GlyphSizeSelectionProperty;
});