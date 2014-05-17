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

    var FourColoringScheme = function(state) {
        state = defined(state) ? state : {};

        ColoringScheme.call(this, state);

        this.name = 'FourColoringScheme';

        // All colors default to black
        this.color1 = new StringProperty({
            displayName: 'Color #1',
            value: 'PaleGreen',
            onchange: state.onchange
        });

        this.color2 = new StringProperty({
            displayName: 'Color #2',
            value: 'PowderBlue',
            onchange: state.onchange
        });

        this.color3 = new StringProperty({
            displayName: 'Color #3',
            value: 'Plum',
            onchange: state.onchange
        });

        this.color4 = new StringProperty({
            displayName: 'Color #4',
            value: 'Khaki',
            onchange: state.onchange
        });

        this.setState(state);

        ko.track(this);
    };

    FourColoringScheme.prototype = Object.create(ColoringScheme.prototype);

    FourColoringScheme.prototype.getType = function() {
        return ColoringSchemeType.FOUR_COLORING;
    };

    FourColoringScheme.prototype.getDisplayText = function() {
        return 'Four coloring';
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

    FourColoringScheme.prototype.getDisplayState = function() {
        var displayState = {
            color1: this.color1.getDisplayState(),
            color2: this.color2.getDisplayState(),
            color3: this.color3.getDisplayState(),
            color4: this.color4.getDisplayState(),
            type: this.getType()
        };

        return displayState;
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
