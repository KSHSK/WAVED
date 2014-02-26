/*global define*/
define([
        'models/Property/Coloring/ColoringScheme',
        'knockout',
        'jquery'
    ],function(
        ColoringScheme,
        ko,
        $){
    'use strict';

    var FourColoringScheme = function(state) {
        ColoringScheme.call(this, state);

        // TODO: Define these, validation, etc.
        this.color1 = state.color1; // StringProperty
        this.color2 = state.color2; // StringProperty
        this.color3 = state.color3; // StringProperty
        this.color4 = state.color4; // StringProperty
    };

    return FourColoringScheme;
});