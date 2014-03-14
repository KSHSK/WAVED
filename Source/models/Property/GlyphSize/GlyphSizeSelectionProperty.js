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

    var GlyphSizeSelectionProperty = function(options) {
        options = defined(options) ? options : { displayName: 'Glyph Size', value: '' };
        Property.call(this, options);

        this._templateName = PropertyTemplateName.GLYPH_SIZE;
        this.error = '';
        this._value = '';

        var constantGlyphSize = new ConstantGlyphSizeScheme(options);
        var scaledGlyphSize = new ScaledGlyphSizeScheme(options);

        var stateValueType;
        switch(options.value.type) {
            case GlyphSizeSchemeType.CONSTANT_SIZE:
                stateValueType = constantGlyphSize;
                break;
            case GlyphSizeSchemeType.SCALED_SIZE:
                stateValueType = scaledGlyphSize;
                break;
            default:
                stateValueType = scaledGlyphSize; // TODO: make undefined
                break;
        }

        // Always set this to the GlyphSizeSchemeType enums
        this.sizeType = ko.observableArray([constantGlyphSize, scaledGlyphSize]);

        // Initially bind this to the sizeType specified by stateValueType
        // Will be set by the setter onwards
        this._value = stateValueType;

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
        // This actually sets state.value to an object, we don't want that
        var state = Property.prototype.getState.call(this);

        // Overwrite state.value with our own value
        if(this._value !== 'undefined'){
            state.value = this._value.getState();
        }
        else{
            state.value = '';
        }
    };

    return GlyphSizeSelectionProperty;
});