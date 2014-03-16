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
            options: []
        };
        this.dataSet = new ArrayProperty(dataSetOptions);

        var dataFieldOptions = {
            displayName: 'Data Field',
            value: undefined,
            options: []
        };

        this.dataField = new ArrayProperty(dataFieldOptions);

        // Allows for deselection
        var isValidValue = function(value){
           var undef = (value === undefined);
           var validSelection = false;
           if (defined(this._options) && this._options.length > 0) {
               validSelection = (this._options.indexOf(value) !== -1);
           }

           return undef || validSelection;
        };

        this.dataSet.isValidValue = isValidValue;
        this.dataField.isValidValue = isValidValue;

        ko.track(this);

        // Must call this after ko.track
        this.setState(state, viewModel);
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

    ScaledGlyphSizeScheme.prototype.setState = function(state, viewModel){
        var self = this;

        // Subscribe to the value of dataSet in order to automatically update dataField's options
        ko.getObservable(self.dataSet, '_value').subscribe(function(newValue) {
            if(defined(newValue)){

                // TODO: Find a workaround. The data isn't done loading yet.
                window.setTimeout(function(){self.dataField.options = newValue.dataFields;}, 500);
            }
            else{
                self.dataField.options = [];
            }
        });

        self.dataSet.options = viewModel.boundData;

        // Set default selection. This MUST go after the subscribe in order to trigger dataField to update
        viewModel.boundData.forEach(function(entry){
            if(defined(state.dataSet) && (state.dataSet === entry.name)){
                self.dataSet.value = entry;

                // TODO: Find a workaround. The data isn't done loading yet.
                window.setTimeout(function(){self.dataField.value = state.dataField;}, 500);
                return;
            }
        });
    };

    ScaledGlyphSizeScheme.prototype.getState = function(){
        var set;
        if(defined(this.dataSet.getState().value)){
            set = this.dataSet.getState().value._name;
        }

        var state = {
            dataSet: set,
            dataField: this.dataField.getState().value,
            type: this.getType()
        };

        return state;
    };

    return ScaledGlyphSizeScheme;
});