define([
        'models/Property/GlyphSize/GlyphSizeScheme',
        'models/Constants/GlyphSizeSchemeType',
        'models/Property/ArrayProperty',
        'models/Widget/WidgetViewModel',
        'models/ProjectViewModel',
        'knockout',
        'jquery',
        'util/defined',
        'util/defaultValue',
        'WAVED'
    ],function(
        GlyphSizeScheme,
        GlyphSizeSchemeType,
        ArrayProperty,
        WidgetViewModel,
        ProjectViewModel,
        ko,
        $,
        defined,
        defaultValue,
        WAVED){
    'use strict';

    var ScaledGlyphSizeScheme = function(state, viewModel) {
        var self = this;

        state = defined(state) ? state : {};

        GlyphSizeScheme.call(this, state);

        var dataSetOptions = {
            displayName: 'Data Set',
            value: undefined,
            options: viewModel.boundData
        };

        this.dataSet = new ArrayProperty(dataSetOptions);

        var dataFieldOptions = {
            displayName: 'Data Field',
            value: undefined,
            options: []
        };

        this.dataField = new ArrayProperty(dataFieldOptions);

        ko.track(this);

        // Subscribe to the value of dataSet in order to automatically update dataField's options
        ko.getObservable(self.dataSet, '_value').subscribe(function(newValue) {
            self.dataField.options = newValue.options;
        });

        // Set default selection. This MUST go after the subscribe in order to trigger dataField to update
        viewModel.boundData.forEach(function(entry){
            if(state.value.dataSet.value.name === entry.name){
                self.dataSet.value = entry;
                self.dataField.value = state.value.dataField.value;
                return;
            }
        });


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
            dataField: this.dataField.getState(),
            type: this.getType()
        };

        return state;
    };

    return ScaledGlyphSizeScheme;
});