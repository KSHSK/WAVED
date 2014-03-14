define([
        'models/Property/GlyphSize/GlyphSizeScheme',
        'models/Constants/GlyphSizeSchemeType',
        'models/Property/ArrayProperty',
        'knockout',
        'jquery',
        'util/defined',
        'util/defaultValue'
    ],function(
        GlyphSizeScheme,
        GlyphSizeSchemeType,
        ArrayProperty,
        ko,
        $,
        defined,
        defaultValue){
    'use strict';

    var ScaledGlyphSizeScheme = function(state) {
        state = defined(state) ? state : {};

        GlyphSizeScheme.call(this, state);

        var dataSetOptions = {
            displayName: 'Data Set',
            value: undefined,
            options: []
        };
        if (defined(state.dataSet)) {
            dataSetOptions.value = state.dataSet.value;
        }
        if(defined(state.dataSet)){
            if(state.dataSet.options.length > 0){
                dataSetOptions.options = state.dataSet.options; // TODO: Should these just be populated from the data set itself?
            }
        }

        this.dataSet = new ArrayProperty(dataSetOptions);

        var dataFieldOptions = {
            displayName: 'Data Field',
            value: undefined,
            options: []
        };
        if (defined(state.dataField)) {
            dataFieldOptions = state.dataField.value;
        }
        if(defined(state.dataField)){
            if(state.dataField.options.length > 0){
                // TODO: Populate directly from the dataset
                dataFieldOptions = state.dataField.options;
            }
        }

        this.dataField = new ArrayProperty(dataFieldOptions);

        ko.track(this);
    };

    ScaledGlyphSizeScheme.prototype = Object.create(GlyphSizeScheme.prototype);

    ScaledGlyphSizeScheme.prototype.getType = function() {
        return GlyphSizeSchemeType.SCALED_SIZE;
    };

    Object.defineProperties(ScaledGlyphSizeScheme.prototype, {
        properties: {
            get: function() {
                return [this.dataSet, this.dataField];
            }
        }
    });

    ScaledGlyphSizeScheme.prototype.getState = function(){
        var state = {
            dataSet: this.dataSet.getState(),
            dataField: this.dataField.getState()
        };

        return state;
    };

    return ScaledGlyphSizeScheme;
});