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

    var GradientColoringScheme = function(state) {
        ColoringScheme.call(this, state);

        // TODO: Define these, validation, etc.
        this.startColor = state.startColor; // StringProperty
        this.endColor = state.endColor; // StringProperty
        this.dataSet = state.dataSet; // ArrayProperty
        this.dataField = state.dataField; // ArrayProperty
    };

    return GradientColoringScheme;
});