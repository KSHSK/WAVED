/*global define*/
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

        // TODO: Validation, etc
        this._dataSet = state.dataSet; // ArrayProperty
        this._dataField = state.dataField; // ArrayProperty
    };

    return ScaledGlyphSizeScheme;
});