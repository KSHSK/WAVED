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

    var ConstantGlyphSizeScheme = function(state) {

        // TODO: Validation, etc
        this.size = state.size; // NumberProperty
    };

    return ConstantGlyphSizeScheme;
});