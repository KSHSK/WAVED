define([
        'models/Property/Coloring/ColoringScheme',
        'models/Property/StringProperty',
        'models/Constants/ColoringSchemeType',
        'util/createValidator',
        'util/defined',
        'knockout'
    ],function(
        ColoringScheme,
        StringProperty,
        ColoringSchemeType,
        createValidator,
        defined,
        ko){
    'use strict';

    var FourColoringScheme = function(state, viewModel) {
        state = defined(state) ? state : {};

        ColoringScheme.call(this, state);

        // All colors default to black
        this.color1 = new StringProperty({
            displayName: 'Color #1',
            value: '#0000FF',
            errorMessage: ColoringScheme.prototype.INVALID_COLOR_MESSAGE,
            onchange: viewModel.updateColoring
        });

        this.color2 = new StringProperty({
            displayName: 'Color #2',
            value: '#00FF00',
            errorMessage: ColoringScheme.prototype.INVALID_COLOR_MESSAGE,
            onchange: viewModel.updateColoring
        });

        this.color3 = new StringProperty({
            displayName: 'Color #3',
            value: '#FF0000',
            errorMessage: ColoringScheme.prototype.INVALID_COLOR_MESSAGE,
            onchange: viewModel.updateColoring
        });

        this.color4 = new StringProperty({
            displayName: 'Color #4',
            value: '#FFDD00',
            errorMessage: ColoringScheme.prototype.INVALID_COLOR_MESSAGE,
            onchange: viewModel.updateColoring
        });

        this.setState(state);

        ko.track(this);
    };

    FourColoringScheme.prototype = Object.create(ColoringScheme.prototype);

    FourColoringScheme.prototype.getType = function() {
        return ColoringSchemeType.FOUR_COLORING;
    };

    Object.defineProperties(FourColoringScheme.prototype, {
        properties: {
            get: function() {
                return [this.color1, this.color2, this.color3, this.color4];
            }
        }
    });

    FourColoringScheme.prototype.getColorArray = function() {
        return [this.color1.value, this.color2.value, this.color3.value, this.color4.value];
    };

    FourColoringScheme.prototype.getState = function() {
        var state = {
            color1: this.color1.getState(),
            color2: this.color2.getState(),
            color3: this.color3.getState(),
            color4: this.color4.getState(),
            type: this.getType()
        };

        return state;
    };

    FourColoringScheme.prototype.setState = function(state) {
        if(defined(state.color1)){
            this.color1._originalValue = state.color1.value;
        }
        if(defined(state.color2)){
            this.color2._originalValue = state.color2.value;
        }
        if(defined(state.color3)){
            this.color3._originalValue = state.color3.value;
        }
        if(defined(state.color4)){
            this.color4._originalValue = state.color4.value;
        }
    };

    return FourColoringScheme;
});