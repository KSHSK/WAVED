define([
        'models/Property/Coloring/ColoringScheme',
        'models/Property/StringProperty',
        'models/Constants/ColoringSchemeType',
        'modules/HistoryMonitor',
        'util/createValidator',
        'util/defined',
        'util/subscribeObservable',
        'knockout'
    ],function(
        ColoringScheme,
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
            errorMessage: ColoringScheme.prototype.INVALID_COLOR_MESSAGE
        });

        this.endColor = new StringProperty({
            displayName: 'End color',
            value: '#000000',
            validValue: createValidator({
                regex: new RegExp(ColoringScheme.prototype.HEX_REGEX)
            }),
            errorMessage: ColoringScheme.prototype.INVALID_COLOR_MESSAGE
        });

        // TODO: Look to ScaledGlyphSizeScheme for how to do this
        this.dataSet = state.dataSet; // ArrayProperty
        this.dataField = state.dataField; // ArrayProperty
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
        if(defined(this.dataSet.getState().value)) {
            set = this.dataSet.getState().value.name;
        }

        var state = {
            startColor: this.startColor.getState(),
            endColor: this.endColor.getState(),
            dataSet: set,
            dataField: this.dataField.getState.value,
            type: this.getType()
        };

        return state;
    };

    GradientColoringScheme.prototype.setState = function(state, viewModel) {
        var self = this;
        var scheme = state.value;

        if(defined(scheme.startColor)) {
            this.startColor.value = scheme.startColor.value;
        }

        if(defined(scheme.endColor)) {
            this.endColor.value = scheme.endColor.value;
        }

        // Subscribe to the value of dataSet in order to automatically update dataField's options
        subscribeObservable(self.dataSet, '_value', function(newValue){
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
                    self.dataField.value = undefined; // Reset the dataField selection
                }
            };

            // Change bundling
            var historyMonitor = HistoryMonitor.getInstance();
            historyMonitor.executeAmendHistory(changeFunction);
        });

        // Properly unset the dataSet value when the options disappear (when the bound data is unbound)
        subscribeObservable(self.dataSet, '_options', function(newValue){
            if(defined(self.dataSet.value) && (newValue.indexOf(self.dataSet.value) === -1)){
                    self.dataSet.value = undefined;
            }
        });


        self.dataSet.options = viewModel.boundData;

        // Set default selection. This MUST go after the subscribe in order to trigger dataField to update
        viewModel.boundData.forEach(function(entry){
            if(defined(state.dataSet) && (state.dataSet === entry.name)){
                self.dataSet.value = entry;
                self.dataField.value = state.dataField;

                return;
            }
        });
    };

    return GradientColoringScheme;
});