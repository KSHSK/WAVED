var WAVED = WAVED || {};

/**
 * Constructs a new United States map widget.
 * @constructor
 *
 * @param {DOM Element} svg The SVG canvas to which the map will be appended.
 * @param {number} [width=500] The width of the map, in pixels.
 * @param {number} [height=500] The width of the map, in pixels.
 */
WAVED.UnitedStatesMap = function(svg, width, height) {
    
    if (typeof svg === 'undefined') {
        // TODO: throw exception - svg is a required parameter.
    }
    
    if (typeof width === 'undefined') {
        width = 500;
    }
    
    if (typeof height === 'undefined') {
        height = 500;
    }
    
    this._svg = svg;
    this._width = width;
    this._height = height;
};

/**
 * Creates a new United States map widget from a saved state.
 * 
 * @param {Object} state JSON containing the saved state.
 */
WAVED.UnitedStatesMap.fromState = function(state) {
    // TODO
};

/**
 * Changes all of the states to the specified uniform color.
 *
 * @param {string} color A string representing a color in hex, rgb, or rgba format.
 */
WAVED.UnitedStatesMap.prototype.setColor = function(color) {
    // TODO
};

/**
 * TODO: Doc
 */
WAVED.UnitedStatesMap.prototype.render = function() {
    // TODO
};

/**
 * TODO: Doc
 */
WAVED.UnitedStatesMap.prototype.exportJavaScript = function() {
    // TODO
};