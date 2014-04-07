define([
        'models/Property/Coloring/ColoringScheme',
        'models/Property/StringProperty',
        'models/Constants/ColoringSchemeType',
        'utils/createValidator',
        'utils/defined',
        'knockout'
    ],function(
        ColoringScheme,
        StringProperty,
        ColoringSchemeType,
        createValidator,
        defined,
        ko){
    'use strict';

    var FourColoringScheme = function(state) {
        state = defined(state) ? state : {};

        ColoringScheme.call(this, state);

        // All colors default to black
        this.color1 = new StringProperty({
            displayName: 'Color #1',
            value: '#000000',
            validValue: createValidator({
                regex: new RegExp(ColoringScheme.prototype.HEX_REGEX)
            }),
            errorMessage: ColoringScheme.prototype.INVALID_COLOR_MESSAGE
        });

        this.color2 = new StringProperty({
            displayName: 'Color #2',
            value: '#000000',
            validValue: createValidator({
                regex: new RegExp(ColoringScheme.prototype.HEX_REGEX)
            }),
            errorMessage: ColoringScheme.prototype.INVALID_COLOR_MESSAGE
        });

        this.color3 = new StringProperty({
            displayName: 'Color #3',
            value: '#000000',
            validValue: createValidator({
                regex: new RegExp(ColoringScheme.prototype.HEX_REGEX)
            }),
            errorMessage: ColoringScheme.prototype.INVALID_COLOR_MESSAGE
        });

        this.color4 = new StringProperty({
            displayName: 'Color #4',
            value: '#000000',
            validValue: createValidator({
                regex: new RegExp(ColoringScheme.prototype.HEX_REGEX)
            }),
            errorMessage: ColoringScheme.prototype.INVALID_COLOR_MESSAGE
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
        if(defined(state.value.color1)){
            this.color1.value = state.value.color1.value;
        }
        if(defined(state.value.color2)){
            this.color2.value = state.value.color2.value;
        }
        if(defined(state.value.color3)){
            this.color3.value = state.value.color3.value;
        }
        if(defined(state.value.color4)){
            this.color4.value = state.value.color4.value;
        }
    };

    return FourColoringScheme;
});