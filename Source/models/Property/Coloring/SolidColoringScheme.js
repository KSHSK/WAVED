define([
        'models/Property/Coloring/ColoringScheme',
        'knockout',
        'jquery'
    ],function(
        ColoringScheme,
        ko,
        $){
    'use strict';

    var SolidColoringScheme = function(state) {
        ColoringScheme.call(this, state);

        // TODO: Validation, etc
        this.color = state.color; // StringProperty
    };

    return SolidColoringScheme;
});