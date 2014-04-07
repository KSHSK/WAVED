define([
        'util/defined',
        'knockout'
    ],function(
        defined,
        ko
    ){
    'use strict';

    var ColoringScheme = function(state) {

    };

    ColoringScheme.prototype.HEX_REGEX = '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$';
    ColoringScheme.prototype.INVALID_COLOR_MESSAGE = 'Invalid hex color';

    return ColoringScheme;
});