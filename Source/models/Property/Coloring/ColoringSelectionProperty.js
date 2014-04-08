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
       this.error = '';
       this._value = '';

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

       // Initially bind htis to the coloringType specified by stateValueType
       // Will be set by the setter onwards
       this._value = stateValueType;

        ko.track(this);
    };

    ColoringSelectionProperty.prototype = Object.create(Property.prototype);

    Object.defineProperties(ColoringSelectionProperty.prototype, {
        properies: {
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
        }
    });

    ColoringSelectionProperty.prototype.getState = function() {
        // This actually sets state.value to an object, we don't want that
        var state = Property.prototype.getState.call(this);

        // Overwrite state.value with our own value
        if(defined(this._value)){
            state.value = this._value.getState();
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
                this.solidColoring.color.value = scheme.color.value;
                this._value = this.solidColoring;
                break;
            case ColoringSchemeType.FOUR_COLORING:
                this.fourColoring.setState(scheme);
                this._value = this.fourColoring;
                break;
            case ColoringSchemeType.GRADIENT_COLORING:
                this.gradientColoring.setState(scheme, viewModel);
                this._value = this.gradientColoring;
                break;
            default:
                this._value = undefined;
                break;
        }
    };

    ColoringSelectionProperty.prototype.getSubscribableNestedProperties = function() {
        return [this.solidColoring, this.fourColoring, this.gradientColoring];
    };

    return ColoringSelectionProperty;
});