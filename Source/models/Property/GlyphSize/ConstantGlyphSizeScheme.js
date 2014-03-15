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

        var stateSize = {
            displayName: 'Size (%)',
            value: 10
        };
        if(defined(state.value.size) && state.value.size.value > 0){
            stateSize.value = state.value.size.value;
        }

        this.size = new NumberProperty(stateSize);

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

    return ConstantGlyphSizeScheme;
});