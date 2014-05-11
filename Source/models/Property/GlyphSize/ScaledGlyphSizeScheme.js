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
            errorMessage: '',
            options: [],
            getOptionText: function(value){
                return value.displayName;
            },
            visible: false
        };
        this.dataSet = new ArrayProperty(dataSetOptions);

        var dataFieldOptions = {
            displayName: 'Scaling Field',
            value: undefined,
            errorMessage: 'Value is required.',
            options: [],
            getOptionText: function(value){
                return value;
            }
        };
        this.dataField = new ArrayProperty(dataFieldOptions);

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

    ScaledGlyphSizeScheme.prototype.setState = function(state, viewModel) {
        var self = this;

        var firstTimeLoaded = true;

        // Subscribe to the value of dataSet in order to automatically update dataField's options
        subscribeObservable(self.dataSet, '_originalValue', function(newValue) {
            var changeFunction = function() {
                if(defined(newValue)){
                    if(newValue.dataLoaded) {
                        self.dataField.options = newValue.dataFields;
                        if (firstTimeLoaded) {
                            self.dataField.originalValue = state.dataField;
                            firstTimeLoaded = false;
                        }
                    }
                    else {
                        // Keep trying until data is ready, as long as data is a defined object.
                        var interval = setInterval(function() {
                            if(newValue.dataLoaded) {
                                self.dataField.options = newValue.dataFields;
                                if (firstTimeLoaded) {
                                    self.dataField.originalValue = state.dataField;
                                    firstTimeLoaded = false;
                                }

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

        subscribeObservable(self.dataSet, '_displayValue', function(newValue) {
            var changeFunction = function() {
                if(defined(newValue)){
                    if(newValue.dataLoaded) {
                        if (newValue.dataFields.indexOf(self.dataField.displayValue) === -1) {
                            self.dataField.displayValue = undefined;
                        }

                        if (self.dataField.options !== newValue.dataFields) {
                            self.dataField.options = newValue.dataFields;
                        }
                    }
                    else {
                        // Keep trying until data is ready, as long as data is a defined object.
                        var interval = setInterval(function() {
                            if(newValue.dataLoaded) {
                                self.dataField.options = newValue.dataFields;
                                clearInterval(interval);
                            }
                        }, 100);
                    }
                }
                else{
                    self.dataField.displayValue = undefined; // Reset the dataField selection
                    self.dataField.options = [];
                }
            };

            var historyMonitor = HistoryMonitor.getInstance();
            historyMonitor.executeAmendHistory(changeFunction);
        });

        // Properly unset the dataSet value when the options disappear (when the bound data is unbound)
        // This should never happen since unbinding cannot be done when the dataSet is in use.
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