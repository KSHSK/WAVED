define([
        'models/Property/Coloring/ColoringScheme',
        'models/Property/ArrayProperty',
        'models/Property/StringProperty',
        'models/Constants/ColoringSchemeType',
        'modules/HistoryMonitor',
        'util/createValidator',
        'util/defined',
        'util/subscribeObservable',
        'knockout'
    ],function(
        ColoringScheme,
        ArrayProperty,
        StringProperty,
        ColoringSchemeType,
        HistoryMonitor,
        createValidator,
        defined,
        subscribeObservable,
        ko){
    'use strict';

    var GradientColoringScheme = function(state, viewModel) {
        state = defined(state) ? state : {};

        ColoringScheme.call(this, state);

        // Start and end colors default to black
        this.startColor = new StringProperty({
            displayName: 'Start color',
            value: '#000000',
            validValue: createValidator({
                regex: new RegExp(ColoringScheme.prototype.HEX_REGEX)
            }),
            errorMessage: ColoringScheme.prototype.INVALID_COLOR_MESSAGE,
            onchange: viewModel.updateColoring
        });

        this.endColor = new StringProperty({
            displayName: 'End color',
            value: '#000000',
            validValue: createValidator({
                regex: new RegExp(ColoringScheme.prototype.HEX_REGEX)
            }),
            errorMessage: ColoringScheme.prototype.INVALID_COLOR_MESSAGE,
            onchange: viewModel.updateColoring
        });

        this.dataSet = new ArrayProperty({
            displayName: 'Data Set',
            value: undefined,
            options: [],
            getOptionText: function(value) {
                return value.getNameAndFilename();
            },
            onchange: viewModel.updateColoring
        });

        this.dataField = new ArrayProperty({
            displayName: 'Data Field',
            value: undefined,
            options: [],
            getOptionText: function(value) {
                return value;
            },
            onchange: viewModel.updateColoring
        });

        ko.track(this);

        this.setState(state, viewModel);
    };

    GradientColoringScheme.prototype = Object.create(ColoringScheme.prototype);

    GradientColoringScheme.prototype.getType = function() {
        return ColoringSchemeType.GRADIENT_COLORING;
    };

    Object.defineProperties(GradientColoringScheme.prototype, {
       properties: {
           get: function() {
               return [this.startColor, this.endColor, this.dataSet, this.dataField];
           }
       }
    });

    GradientColoringScheme.prototype.getState = function() {
        var set;
        // We use value vs originalValue here because we call getState(), which returns an object with key 'value'
        if(defined(this.dataSet.getState().value)) {
            set = this.dataSet.getState().value.name;
        }

        var state = {
            startColor: this.startColor.getState(),
            endColor: this.endColor.getState(),
            dataSet: set,
            dataField: this.dataField.getState().value,
            type: this.getType()
        };

        return state;
    };

    GradientColoringScheme.prototype.setState = function(state, viewModel) {
        var self = this;

        if(defined(state.startColor)) {
            this.startColor.originalValue = state.startColor.value;
        }

        if(defined(state.endColor)) {
            this.endColor.originalValue = state.endColor.value;
        }

        // Subscribe to the value of dataSet in order to automatically update dataField's options
        subscribeObservable(self.dataSet, '_originalValue', function(newValue){
            var changeFunction = function() {
                if(defined(newValue)){
                    if(defined(newValue.data)){
                        self.dataField.options = newValue.dataFields;
                        self.dataField.originalValue = undefined;
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

            // Change bundling
            var historyMonitor = HistoryMonitor.getInstance();
            historyMonitor.executeAmendHistory(changeFunction);
        });

        // Properly unset the dataSet value when the options disappear (when the bound data is unbound)
        subscribeObservable(self.dataSet, '_options', function(newValue){
            if(defined(self.dataSet.originalValue) && (newValue.indexOf(self.dataSet.originalValue) === -1)){
                    self.dataSet.orignalValue = undefined;
            }
        });

        self.dataSet.options = viewModel.boundData;

        // Set default selection. This MUST go after the subscribe in order to trigger dataField to update
        viewModel.boundData.forEach(function(entry){
            if(defined(state.dataSet) && (state.dataSet === entry.name)){
                self.dataSet.originalValue = entry;
                self.dataField.originalValue = state.dataField;

                return;
            }
        });
    };

    return GradientColoringScheme;
});