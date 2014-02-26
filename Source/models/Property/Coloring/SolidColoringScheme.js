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

    var SolidColoringScheme = function(state) {

        // TODO: Validation, etc
        this.color = state.color; // StringProperty
    };

    return SolidColoringScheme;
});