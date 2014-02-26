/*global define*/
define([
        'models/Element/ElementViewModel',
        'util/defined',
        'knockout'
    ],function(
        ElementViewModel,
        defined,
        ko){
    'use strict';

    var GlyphViewModel = function(options) {
        options = (defined(options)) ? options : {};

        // TODO: Set these from options
        this.dataSet = undefined;
        this.color = undefined;
        this.shape = undefined;
        this.size = undefined;
        this.latitude = undefined;
        this.longitude = undefined;

        ElementViewModel.call(this, options);

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