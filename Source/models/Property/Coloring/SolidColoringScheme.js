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

    var SolidColoringScheme = function(state, viewModel) {
        state = defined(state) ? state : {};

        ColoringScheme.call(this, state);

        // Default to grey
        var stateColor = {
            displayName: 'Color',
            value: '#C0C0C0',
            validValue: createValidator({
                regex: new RegExp(ColoringScheme.prototype.HEX_REGEX)
            }),
            errorMessage: ColoringScheme.prototype.INVALID_COLOR_MESSAGE,
            onchange: viewModel.updateColoring
        };
        this.color = new StringProperty(stateColor);

        this.setState(state);

        ko.track(this);
    };

    SolidColoringScheme.prototype = Object.create(ColoringScheme.prototype);

    SolidColoringScheme.prototype.getType = function() {
        return ColoringSchemeType.SOLID_COLORING;
    };

    Object.defineProperties(SolidColoringScheme.prototype, {
        properties: {
            get: function() {
                return [this.color];
            }
        }
    });

    SolidColoringScheme.prototype.getState = function() {
        var state = {
            color: this.color.getState(),
            type: this.getType()
        };

        return state;
    };

    SolidColoringScheme.prototype.setState = function(state) {
        if(defined(state.value.color)){
            // state.value.color.value -> SolidColoringScheme.color.value
            this.color._originalValue = state.value.color.value;
        }
    };

    return SolidColoringScheme;
});