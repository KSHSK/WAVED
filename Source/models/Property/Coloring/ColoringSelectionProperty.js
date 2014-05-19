define([
        'models/Constants/PropertyTemplateName',
        'models/Constants/ColoringSchemeType',
        'models/Property/Property',
        'models/Property/Coloring/ColoringScheme',
        'models/Property/Coloring/SolidColoringScheme',
        'models/Property/Coloring/FourColoringScheme',
        'models/Property/Coloring/GradientColoringScheme',
        'util/defined',
        'knockout'
    ],function(
        PropertyTemplateName,
        ColoringSchemeType,
        Property,
        ColoringScheme,
        SolidColoringScheme,
        FourColoringScheme,
        GradientColoringScheme,
        defined,
        ko){
    'use strict';

    var ColoringSelectionProperty = function(state, viewModel) {
        state = defined(state) ? state : {};
        Property.call(this, state);

       this._templateName = PropertyTemplateName.COLORING;
       this._displayTemplateName = PropertyTemplateName.COLORING_DISPLAY;
       this.error = false;

       this.solidColoring = new SolidColoringScheme(state);
       this.fourColoring = new FourColoringScheme(state);
       this.gradientColoring = new GradientColoringScheme(state, viewModel);

       var stateValueType;
       switch(state.value.type) {
           case ColoringSchemeType.SOLID_COLORING:
               stateValueType = this.solidColoring;
               break;
           case ColoringSchemeType.FOUR_COLORING:
               stateValueType = this.fourColoring;
               break;
           case ColoringSchemeType.GRADIENT_COLORING:
               stateValueType = this.gradientColoring;
               break;
           default:
               stateValueType = undefined;
               break;
       }

       this.coloringType = [this.solidColoring, this.fourColoring, this.gradientColoring];

       // Initially bind this to the coloringType specified by stateValueType
       // Will be set by the setter onwards
       this._originalValue = stateValueType;

       ko.track(this);
    };

    ColoringSelectionProperty.prototype = Object.create(Property.prototype);

    Object.defineProperties(ColoringSelectionProperty.prototype, {
        properties: {
            get: function() {
                return [this.solidColoring, this.fourColoring, this.gradientColoring];
            }
        },
        value: {
            get: function() {
                return this._value;
            },
            set: function(value) {
                this._value = value;
            }
        },
        originalValue: {
            get: function() {
                return this._originalValue;
            },
            set: function(originalValue) {
                this._orignalValue = originalValue;
            }
        },
        displayValue: {
            get: function() {
                return this._displayValue;
            },
            set: function(displayValue) {
                this._displayValue = displayValue;
            }
        }
    });

    ColoringSelectionProperty.prototype.getDisplayState = function() {
        var displayState = Property.prototype.getDisplayState.call(this);

        if(defined(this.displayValue)){
            displayState.value = this.displayValue.getDisplayState();
        }

        return displayState;
    };

    ColoringSelectionProperty.prototype.setDisplayState = function(state, viewModel) {
        if(!defined(state.value)) {
            return;
        }

        var scheme = state.value;
        switch(scheme.type) {
            case ColoringSchemeType.SOLID_COLORING:
                this.solidColoring.setDisplayState(scheme);
                if(this.solidColoring !== this.originalValue) {
                    this.displayValue = this.solidColoring;
                }
                break;
            case ColoringSchemeType.FOUR_COLORING:
                this.fourColoring.setDisplayState(scheme);
                if(this.fourColoring !== this.originalValue) {
                    this.displayValue = this.fourColoring;
                }
                break;
            case ColoringSchemeType.GRADIENT_COLORING:
                this.gradientColoring.setDisplayState(scheme, viewModel);
                if(this.gradientColoring !== this.originalValue) {
                    this.displayValue = this.gradientColoring;
                }
                break;
            default:
                this.displayValue = this.originalValue;
                break;
        }
    };

    ColoringSelectionProperty.prototype.getState = function() {
        // This actually sets state.value to an object, we don't want that
        var state = Property.prototype.getState.call(this);

        // Overwrite state.value with our own value
        if(defined(this._originalValue)){
            state.value = this._originalValue.getState();
        }

        return state;
    };

    ColoringSelectionProperty.prototype.setState = function(state, viewModel) {
        if(!defined(state.value)){
            return;
        }

        var scheme = state.value;
        switch(scheme.type) {
            case ColoringSchemeType.SOLID_COLORING:
                this.solidColoring.setState(scheme);
                this._originalValue = this.solidColoring;
                break;
            case ColoringSchemeType.FOUR_COLORING:
                this.fourColoring.setState(scheme);
                this._originalValue = this.fourColoring;
                break;
            case ColoringSchemeType.GRADIENT_COLORING:
                this.gradientColoring.setState(scheme, viewModel);
                this._originalValue = this.gradientColoring;
                break;
            default:
                // Defaults to solid coloring
                this._originalValue = this.solidColoring;
                break;
        }
    };

    ColoringSelectionProperty.prototype.getSubscribableNestedProperties = function() {
        return [this.solidColoring, this.fourColoring, this.gradientColoring];
    };

    return ColoringSelectionProperty;
});