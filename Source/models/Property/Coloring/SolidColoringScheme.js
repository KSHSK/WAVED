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

    var SolidColoringScheme = function(state) {
        state = defined(state) ? state : {};

        ColoringScheme.call(this, state);

        // Default to grey
        var stateColor = {
            displayName: 'Color',
            value: 'LightGrey',
            onchange: state.onchange,
            validValue: function(value) {
                return defined(value) && (value.trim() !== '');
            }
        };
        this.color = new StringProperty(stateColor);

        this.setState(state);

        ko.track(this);
    };

    SolidColoringScheme.prototype = Object.create(ColoringScheme.prototype);

    SolidColoringScheme.prototype.getType = function() {
        return ColoringSchemeType.SOLID_COLORING;
    };

    SolidColoringScheme.prototype.getDisplayText = function() {
        return 'Solid coloring';
    };

    Object.defineProperties(SolidColoringScheme.prototype, {
        properties: {
            get: function() {
                return [this.color];
            }
        }
    });

    SolidColoringScheme.prototype.getDisplayState = function() {
        var displayState = {
            color: this.color.getDisplayState(),
            type: this.getType()
        };

        return displayState;
    };

    SolidColoringScheme.prototype.setDisplayState = function(state) {
        if(defined(state.color) && state.color.value !== this.color.originalValue) {
            this.color.displayValue = state.color.value;
        }
    };

    SolidColoringScheme.prototype.getState = function() {
        var state = {
            color: this.color.getState(),
            type: this.getType()
        };

        return state;
    };

    SolidColoringScheme.prototype.setState = function(state) {
        if(defined(state.color)){
            this.color.originalValue = state.color.value;
        }
    };

    return SolidColoringScheme;
});