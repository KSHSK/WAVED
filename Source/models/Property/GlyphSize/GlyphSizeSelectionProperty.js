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

        // TODO: Validation, settings defaults, etc.
        this._value = state.value; // GlyphSizeScheme
        this._sizeType = state.sizeType; // ArrayProperty

        this._templateName = PropertyTemplateName.GLYPH_SIZE;

        this.isValidValue = function(value) {
            // TODO
        };

        ko.track(this);
    };

    GlyphSizeSelectionProperty.prototype = Object.create(Property.prototype);

    Object.defineProperties(GlyphSizeSelectionProperty.prototype, {
        sizeType: {
            get: function() {
                return this._sizeType;
            },
            set: function(value) {
                this._sizeType = value;
            }
        }
    });

    GlyphSizeSelectionProperty.prototype.getSelectedSizeType = function() {
        // TODO
    };

    return GlyphSizeSelectionProperty;
});