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
        this._displayTemplateName = PropertyTemplateName.GLYPH_SIZE_DISPLAY;
        this.error = true;

        this.constantGlyphSize = new ConstantGlyphSizeScheme(options);
        this.scaledGlyphSize = new ScaledGlyphSizeScheme(options, viewModel);

        var stateValueType;
        if (defined(options.value) && options.value.type === GlyphSizeSchemeType.SCALED_SIZE) {
            stateValueType = this.scaledGlyphSize;
        } else {
            stateValueType = this.constantGlyphSize;
        }

        // Always set this to the GlyphSizeSchemeType enums
        this.sizeType = [this.constantGlyphSize, this.scaledGlyphSize];

        // Initially bind this to the sizeType specified by stateValueType
        // Will be set by the setter onwards
        this._originalValue = stateValueType;

        ko.track(this);
    };

    GlyphSizeSelectionProperty.prototype = Object.create(Property.prototype);

    Object.defineProperties(GlyphSizeSelectionProperty.prototype, {
        properties: {
            get: function() {
                return [this.constantGlyphSize, this.scaledGlyphSize];
            }
        },
        originalValue: {
            get: function() {
                return this._originalValue;
            },
            set: function(value) {
                if (defined(value)) {
                    this.error = value.error;
                    this.message = '';
                    this._originalValue = value;
                }
                else {
                    this.error = true;
                    this.message = this.errorMessage;
                }
            }
        },
        value: {
            get: function() {
                return this._value;
            },
            set: function(value) {
                if (defined(value)) {
                    this.error = value.error;
                    this.message = '';
                    this._value = value;
                }
                else {
                    this.error = true;
                    this.message = this.errorMessage;
                }
            }
        },
        displayValue: {
            get: function() {
                return this._displayValue;
            },
            set: function(value) {
                if (defined(value)) {
                    this.error = value.error;
                    this.message = '';
                    this._displayValue = value;
                }
                else {
                    this.error = true;
                    this.message = this.errorMessage;
                }
            }
        },
        error: {
            get : function() {
                // displayValue is the one that's used in glyph pop-up dialog
                return !defined(this.displayValue) || this.displayValue.error;
            },
            set : function(value) {
                this._error = value;
            }
        }
    });

    GlyphSizeSelectionProperty.prototype.getDisplayState = function() {
        var displayState = Property.prototype.getDisplayState.call(this);

        if(defined(this._displayValue)) {
            displayState.value = this._displayValue.getDisplayState();
        }

        return displayState;
    };

    GlyphSizeSelectionProperty.prototype.setDisplayState = function(state, viewModel) {
        if(!defined(state.value)) {
            return;
        }

        var scheme = state.value;
        switch(scheme.type) {
            case GlyphSizeSchemeType.SCALED_SIZE:
                this.scaledGlyphSize.setDisplayState(scheme, viewModel);
                if(this.scaledGlyphSize !== this.originalValue) {
                    this.displayValue = this.scaledGlyphSize;
                }
                break;
            case GlyphSizeSchemeType.CONSTANT_SIZE:
                this.constantGlyphSize.setDisplayState(scheme);
                if(this.constantGlyphSize !== this.originalValue) {
                    this.displayValue = this.constantGlyphSize;
                }
                break;
            default:
                this.displayValue = this.originalValue;
                break;
        }
    };

    GlyphSizeSelectionProperty.prototype.getState = function() {
        // This actually sets state.value to an object, we don't want that
        var state = Property.prototype.getState.call(this);

        // Overwrite state.value with our own value
        if(defined(this._originalValue)){
            state.value = this._originalValue.getState();
        }

        return state;
    };

    GlyphSizeSelectionProperty.prototype.setState = function(state, viewModel) {
        if(!defined(state.value)){
            return;
        }
        if (state.value.type === GlyphSizeSchemeType.SCALED_SIZE) {
            this.scaledGlyphSize.setState(state.value, viewModel);
            this.originalValue = this.scaledGlyphSize;
        } else {
            this.constantGlyphSize.setState(state.value);
            this.originalValue = this.constantGlyphSize;
        }
    };

    GlyphSizeSelectionProperty.prototype.getSubscribableNestedProperties = function(){
        return [this.constantGlyphSize, this.scaledGlyphSize];
    };

    /**
     * @param valueType 'originalValue' or 'value' or 'displayValue'
     */
    GlyphSizeSelectionProperty.prototype.displayErrorMessage = function(valueType) {
        var properties = this[valueType].properties;
        for (var i = 0; i < properties.length; i++) {
            var property = properties[i];
            if (property.error) {
                property.displayErrorMessage(valueType);
            }
        }
    };

    return GlyphSizeSelectionProperty;
});