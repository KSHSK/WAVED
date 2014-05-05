define([
        'knockout',
        'jquery',
        'models/Property/GlyphSize/GlyphSizeScheme',
        'models/Constants/GlyphSizeSchemeType',
        'models/Property/ArrayProperty',
        'models/Widget/WidgetViewModel',
        'models/ProjectViewModel',
        'modules/HistoryMonitor',
        'util/defined',
        'util/defaultValue',
        'util/subscribeObservable',
        'WAVED'
    ],function(
        ko,
        $,
        GlyphSizeScheme,
        GlyphSizeSchemeType,
        ArrayProperty,
        WidgetViewModel,
        ProjectViewModel,
        HistoryMonitor,
        defined,
        defaultValue,
        subscribeObservable,
        WAVED){
    'use strict';

    var ScaledGlyphSizeScheme = function(state, viewModel) {
        var self = this;

        state = defined(state) ? state : {};

        GlyphSizeScheme.call(this, state);

        var dataSetOptions = {
            displayName: 'Data Set',
            value: undefined,
            options: [],
            getOptionText: function(value){
                return value.displayName;
            }
        };
        this.dataSet = new ArrayProperty(dataSetOptions);

        var dataFieldOptions = {
            displayName: 'Data Field',
            value: undefined,
            options: [],
            getOptionText: function(value){
                return value;
            }
        };

        this.dataField = new ArrayProperty(dataFieldOptions);

        // Allows for deselection
        var isValidValue = function(value){
           var undef = (value === undefined);
           var validSelection = true;
           if (defined(this._options) && this._options.length > 0) {
               validSelection = (this._options.indexOf(value) !== -1);
           }

           return !undef && validSelection;
        };

        this.dataSet.isValidValue = isValidValue;
        this.dataField.isValidValue = isValidValue;

        ko.track(this);

        // Must call this after ko.track
        this.setState(state, viewModel);
    };

    ScaledGlyphSizeScheme.prototype = Object.create(GlyphSizeScheme.prototype);

    Object.defineProperties(ScaledGlyphSizeScheme.prototype, {
        properties: {
            get: function() {
                return [this.dataSet, this.dataField];
            }
        },
        type : {
            get : function() {
                return GlyphSizeSchemeType.SCALED_SIZE;
            }
        },
        error: {
            get : function() {
                var dataSet = this.dataSet;
                var dataField = this.dataField;
                return dataSet.error || dataField.error;
            }
        }
    });

    ScaledGlyphSizeScheme.prototype.setState = function(state, viewModel){
        var self = this;

        // Subscribe to the value of dataSet in order to automatically update dataField's options
        subscribeObservable(self.dataSet, '_originalValue', function(newValue){
            var changeFunction = function() {
                if(defined(newValue)){
                    if(defined(newValue.data)){
                        self.dataField.options = newValue.dataFields;
                    }
                    else {
                        // Keep trying until data is ready, as long as data is a defined object.
                        var interval = setInterval(function(){
                            if(defined(newValue.data)){
                                self.dataField.options = newValue.dataFields;
                                clearInterval(interval);
                            }
                        }, 100);
                    }
                }
                else{
                    self.dataField.options = [];
                    self.dataField.originalValue = undefined; // Reset the dataField selection
                }
            };

            var historyMonitor = HistoryMonitor.getInstance();
            historyMonitor.executeAmendHistory(changeFunction);
        });

        subscribeObservable(self.dataSet, '_displayValue', function(newValue){
            var changeFunction = function() {
                if(defined(newValue)){
                    if(defined(newValue.data)){
                        self.dataField.options = newValue.dataFields;
                    }
                    else {
                        // Keep trying until data is ready, as long as data is a defined object.
                        var interval = setInterval(function(){
                            if(defined(newValue.data)){
                                self.dataField.options = newValue.dataFields;
                                clearInterval(interval);
                            }
                        }, 100);
                    }
                }
                else{
                    self.dataField.options = [];
                    self.dataField.displayValue = undefined; // Reset the dataField selection
                }
            };

            var historyMonitor = HistoryMonitor.getInstance();
            historyMonitor.executeAmendHistory(changeFunction);
        });

        // Properly unset the dataSet value when the options disappear (when the bound data is unbound)
        subscribeObservable(self.dataSet, '_options', function(newValue){
            if(defined(self.dataSet.value) && (newValue.indexOf(self.dataSet.value) === -1)){
                    self.dataSet.orignalValue = undefined;
            }
        });


        self.dataSet.options = viewModel.boundData;

        // Set default selection. This MUST go after the subscribe in order to trigger dataField to update
        viewModel.boundData.forEach(function(entry){
            if(defined(state.dataSet) && (state.dataSet === entry.name)){
                self.dataSet.originalValue = entry;
                self.dataField.originalValue = state.dataField;
            }
        });
    };

    ScaledGlyphSizeScheme.prototype.getState = function(){
        var set;
        if(defined(this.dataSet.getState().value)){
            set = this.dataSet.getState().value.name;
        }

        var state = {
            dataSet: set,
            dataField: this.dataField.getState().value,
            type: this.type
        };

        return state;
    };

    return ScaledGlyphSizeScheme;
});