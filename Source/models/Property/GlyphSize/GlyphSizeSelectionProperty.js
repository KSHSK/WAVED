define([
        'models/Property/Property',
        'util/defined',
        'models/Constants/PropertyTemplateName',
        'models/Constants/GlyphSizeSchemeType',
        'models/Property/GlyphSize/GlyphSizeScheme',
        'models/Property/GlyphSize/ConstantGlyphSizeScheme',
        'models/Property/GlyphSize/ScaledGlyphSizeScheme',
        'models/Widget/WidgetViewModel',
        'knockout'
    ],function(
        Property,
        defined,
        PropertyTemplateName,
        GlyphSizeSchemeType,
        GlyphSizeScheme,
        ConstantGlyphSizeScheme,
        ScaledGlyphSizeScheme,
        WidgetViewModel,
        ko
    ){
    'use strict';

    var GlyphSizeSelectionProperty = function(options, viewModel) {
        options = defined(options) ? options : {};
        Property.call(this, options);

        this._templateName = PropertyTemplateName.GLYPH_SIZE;
        this.error = '';
        this._value = '';

        this.constantGlyphSize = new ConstantGlyphSizeScheme(options);
        this.scaledGlyphSize = new ScaledGlyphSizeScheme(options, viewModel);

        var stateValueType;
        switch(options.value.type) {
            case GlyphSizeSchemeType.CONSTANT_SIZE:
                stateValueType = this.constantGlyphSize;
                break;
            case GlyphSizeSchemeType.SCALED_SIZE:
                stateValueType = this.scaledGlyphSize;
                break;
            default:
                stateValueType = undefined;
                break;
        }

        // Always set this to the GlyphSizeSchemeType enums
        this.sizeType = [this.constantGlyphSize, this.scaledGlyphSize];

        // Initially bind this to the sizeType specified by stateValueType
        // Will be set by the setter onwards
        this._value = stateValueType;

        ko.track(this);
    };

    GlyphSizeSelectionProperty.prototype = Object.create(Property.prototype);

    Object.defineProperties(GlyphSizeSelectionProperty.prototype, {
        properties: {
            get: function() {
                return [this._value, this.constantGlyphSize, this.scaledGlyphSize];
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

    GlyphSizeSelectionProperty.prototype.getState = function() {
        // This actually sets state.value to an object, we don't want that
        var state = Property.prototype.getState.call(this);

        // Overwrite state.value with our own value
        if(defined(this._value)){
            state.value = this._value.getState();
        }

        return state;
    };

    GlyphSizeSelectionProperty.prototype.setState = function(state, viewModel) {
        if(!defined(state.value)){
            return;
        }
        switch(state.value.type) {
            case GlyphSizeSchemeType.CONSTANT_SIZE:
                this.constantGlyphSize.size.value = state.value.size.value;
                this._value = this.constantGlyphSize;
                break;
            case GlyphSizeSchemeType.SCALED_SIZE:
                this.scaledGlyphSize.setState(state.value, viewModel);
                this._value = this.scaledGlyphSize;
                break;
            default:
                this._value = undefined;
                break;
        }
    };

    return GlyphSizeSelectionProperty;
});