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

        // Start and end colors default to grey and black
        this.startColor = new StringProperty({
            displayName: 'Start color',
            value: 'LightGrey',
            onchange: state.onchange
        });

        this.endColor = new StringProperty({
            displayName: 'End color',
            value: 'Black',
            onchange: state.onchange
        });

        this.dataSet = new ArrayProperty({
            displayName: 'Data Set',
            value: undefined,
            options: [],
            getOptionText: function(value) {
                return value.displayName;
            },
            onchange: state.onchange
        });

        this.dataField = new ArrayProperty({
            displayName: 'Data Field',
            value: undefined,
            options: [],
            getOptionText: function(value) {
                return value;
            },
            onchange: state.onchange
        });

        /*
         * keyField shadows the options in dataField.
         * The user should select the field that contains the keys that match
         * the keys that will be used to decide how objects are colored.
         * For example: Coloring US states - You need to choose the keyField that
         * contains the state names.
         */
        this.keyField = new ArrayProperty({
            displayName : 'State Name Field',
            value: undefined,
            options:[],
            getOptionText: function(value) {
                return value;
            },
            onchange: state.onchange
        });

        var isValidValue = function(value) {
            if (value === undefined) {
                return true;
            }

            if (defined(this._options) && this._options.length > 0) {
                return (this.options.indexOf(value) !== -1);
            }

            return true;
        };

        this.dataSet.isValidValue = isValidValue;
        this.dataField.isValidValue = isValidValue;
        this.keyField.isValidValue = isValidValue;

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
               return [this.startColor, this.endColor, this.dataSet, this.keyField, this.dataField];
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
            keyField: this.keyField.getState().value,
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
                        /*
                         * Must set originalValue to undefined before altering the options to
                         * allow the field to reset itself correctly. Settings options first leads
                         * to the field looking blank even though the default option is selected
                         */
                        self.dataField.originalValue = undefined;
                        self.dataField.options = newValue.dataFields;
                        self.keyField.originalValue = undefined;
                        self.keyField.options = newValue.dataFields;
                    }
                    else {
                        // Keep trying until data is ready, as long as data is a defined object.
                        var interval = setInterval(function(){
                            if(defined(newValue.data)){
                                self.dataField.options = newValue.dataFields;
                                self.keyField.options = newValue.dataFields;
                                clearInterval(interval);
                            }
                        }, 100);
                    }
                }
                else{
                    // Must set originalValue first before resetting options
                    self.dataField.originalValue = undefined; // Reset the dataField selection
                    self.dataField.options = [];
                    self.keyField.originalValue = undefined;
                    self.keyField.options = [];
                }
            };

            // Change bundling
            var historyMonitor = HistoryMonitor.getInstance();
            historyMonitor.executeAmendHistory(changeFunction);
        });

        // Properly unset the dataSet value when the options disappear (when the bound data is unbound)
        subscribeObservable(self.dataSet, '_options', function(newValue){
            if(defined(self.dataSet.originalValue) && (newValue.indexOf(self.dataSet.originalValue) === -1)){
                self.dataSet.originalValue = undefined;
            }
        });

        self.dataSet.options = viewModel.boundData;

        // Set default selection. This MUST go after the subscribe in order to trigger dataField to update
        viewModel.boundData.forEach(function(entry){
            if(defined(state.dataSet) && (state.dataSet === entry.name)){
                self.dataSet.originalValue = entry;
                self.dataField.originalValue = state.dataField;
                self.keyField.originalValue = state.keyField;
            }
        });
    };

    return GradientColoringScheme;
});