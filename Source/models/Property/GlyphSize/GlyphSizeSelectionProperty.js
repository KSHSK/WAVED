/*global define*/
define([
        'models/Property/Property',
        'util/defined',
        'models/Constants/PropertyTemplateName',
        'models/Constants/GlyphSizeSchemeType',
        'models/Property/GlyphSize/ConstantGlyphSizeScheme',
        'models/Property/GlyphSize/ScaledGlyphSizeScheme',
        'knockout'
    ],function(
        Property,
        defined,
        PropertyTemplateName,
        GlyphSizeSchemeType,
        ConstantGlyphSizeScheme,
        ScaledGlyphSizeScheme,
        ko
    ){
    'use strict';

    var GlyphSizeSelectionProperty = function(state) {
        state = defined(state) ? state : {};
        this.setState(state);

        this._templateName = PropertyTemplateName.GLYPH_SIZE;
        this.error = '';

        ko.track(this);
    };

    GlyphSizeSelectionProperty.prototype = Object.create(Property.prototype);

    Object.defineProperties(GlyphSizeSelectionProperty.prototype, {
        value: {
            get: function() {
                return this._value;
            },
            set: function(value) {
                this._value = value;
            }
        },
        choice: {
            get: function() {
                return this._choice;
            }
        }
    });

    // TODO: Uhhhh...this isn't right
    GlyphSizeSelectionProperty.prototype.getSelectedSizeType = function(schemeType) {
        if(schemeType === GlyphSizeSchemeType.CONSTANT_SIZE){
            return new ConstantGlyphSizeScheme();
        }
        else if(schemeType === GlyphSizeSchemeType.SCALED_SIZE){
            return new ScaledGlyphSizeScheme();
        }
    };

    GlyphSizeSelectionProperty.prototype.getState = function() {
        var state = Property.prototype.getState.call(this);
        return state;
    };

    GlyphSizeSelectionProperty.prototype.setState = function(state) {
        Property.call(this, state);

        var constantGlyphSize = new ConstantGlyphSizeScheme(state);
        var scaledGlyphSize = new ScaledGlyphSizeScheme(state);

        var stateValueType;
        switch(state.value.type) {
            case GlyphSizeSchemeType.CONSTANT_SIZE:
                stateValueType = constantGlyphSize;
                break;
            case GlyphSizeSchemeType.SCALED_SIZE:
                stateValueType = scaledGlyphSize;
                break;
            default:
                stateValueType = undefined; // TODO: get rid of this, testing
                break;
        }

        // Always set this to the GlyphSizeSchemeType enums
        this.sizeType = ko.observableArray([constantGlyphSize, scaledGlyphSize]);

        this._value = ko.observable(stateValueType);
    };

    return GlyphSizeSelectionProperty;
});