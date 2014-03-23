define([
        'models/Property/GlyphSize/GlyphSizeScheme',
        'models/Constants/GlyphSizeSchemeType',
        'models/Property/NumberProperty',
        'knockout',
        'jquery',
        'util/defined',
        'util/defaultValue'
    ],function(
        GlyphSizeScheme,
        GlyphSizeSchemeType,
        NumberProperty,
        ko,
        $,
        defined,
        defaultValue){
    'use strict';

    var ConstantGlyphSizeScheme = function(state) {
        state = defined(state) ? state : {};

        GlyphSizeScheme.call(this, state);

        if(!defined(state.validValue)){
            state.validValue = function(value) {
                return (defined(this.size.value) && this.size.value > 0);
            };
        }

        // Default size
        var stateSize = {
            displayName: 'Size (%)',
            value: 10
        };
        this.size = new NumberProperty(stateSize);

        this.setState(state);

        ko.track(this);
    };

    ConstantGlyphSizeScheme.prototype = Object.create(GlyphSizeScheme.prototype);

    ConstantGlyphSizeScheme.prototype.getType = function() {
        return GlyphSizeSchemeType.CONSTANT_SIZE;
    };

    Object.defineProperties(ConstantGlyphSizeScheme.prototype, {
        properties: {
            get: function() {
                return [this.size];
            }
        }
    });

    ConstantGlyphSizeScheme.prototype.getState = function() {
        var state = {
            size: this.size.getState(),
            type: this.getType()
        };

        return state;
    };

    ConstantGlyphSizeScheme.prototype.setState = function(state) {
        if(defined(state.value.size) && state.value.size.value > 0){
            this.size.value = state.value.size.value;
        }
    };

    return ConstantGlyphSizeScheme;
});