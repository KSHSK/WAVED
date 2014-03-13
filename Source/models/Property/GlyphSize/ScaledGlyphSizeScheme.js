define([
        'models/Property/GlyphSize/GlyphSizeScheme',
        'knockout',
        'jquery'
    ],function(
        GlyphSizeScheme,
        ko,
        $){
    'use strict';

    var ScaledGlyphSizeScheme = function(state) {
        GlyphSizeScheme.call(this, state);

        // TODO: Validation, etc
        this.dataSet = state.dataSet; // ArrayProperty
        this.dataField = state.dataField; // ArrayProperty
    };

    return ScaledGlyphSizeScheme;
});