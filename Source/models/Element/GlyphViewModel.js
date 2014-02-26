/*global define*/
define([
        'models/Element/ElementViewModel',
        'models/Property/ArrayProperty',
        'models/Property/StringProperty',
        'models/Property/GlyphSize/GlyphSizeSelectionProperty',
        'util/defined',
        'knockout'
    ],function(
        ElementViewModel,
        ArrayProperty,
        StringProperty,
        GlyphSizeSelectionProperty,
        defined,
        ko){
    'use strict';

    var GlyphViewModel = function(state) {
        state = (defined(state)) ? state : {};

        // TODO: Set these from options
        this.dataSet = undefined;
        this.color = undefined;
        this.shape = undefined;
        this.size = undefined;
        this.latitude = undefined;
        this.longitude = undefined;

        ElementViewModel.call(this, state);

        ko.track(this);
    };

    GlyphViewModel.prototype = Object.create(ElementViewModel.prototype);

    GlyphViewModel.prototype.getState = function() {
        //TODO;
    };

    GlyphViewModel.prototype.setState = function(state) {
        //TODO;
    };

    Object.defineProperties(GlyphViewModel.prototype, {
        properties: {
            get: function() {
                return [ this.dataSet, this.color, this.shape, this.size, this.latitute, this.longitude ];
            }
        }
    });

    return GlyphViewModel;
});