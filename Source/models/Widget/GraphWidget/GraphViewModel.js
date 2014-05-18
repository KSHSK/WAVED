
define([
        'models/Widget/WidgetViewModel',
        'models/Property/StringProperty',
        'models/Property/ArrayProperty',
        'util/defined',
        'util/createValidator',
        'knockout'
    ],function(
        WidgetViewModel,
        StringProperty,
        ArrayProperty,
        defined,
        createValidator,
        ko){
    'use strict';

    var GraphViewModel = function(state, getDataSet) {
        state = (defined(state)) ? state : {};
        WidgetViewModel.call(this, state, getDataSet);
        var self = this;

        this.render = function() {
            //abstract
        };

        // TODO: Validation, etc
        this.title = new StringProperty({
            displayName: 'Title',
            value: '',
            validValue: createValidator({
                minLength: 0,
                maxLength: 50
            }),
            errorMessage: 'Must be between 0 and 50 characters',
            onchange: function() {
                self.render();
            }
        });

        this.dataSet = new ArrayProperty({
            displayName: 'Data',
            errorMessage: 'Value is required',
            value: '',
            options: self.boundData,
            getOptionText: function(value) {
                return value.displayName;
            }
        });

        this.xAxisLabel = new StringProperty({
            displayName: 'X Axis Label',
            value: '',
            validValue: createValidator({
                minLength: 0,
                maxLength: 50
            }),
            errorMessage: 'Must be between 0 and 50 characters',
            onchange: function() {
                self.render();
            }
        });

        this.yAxisLabel = new StringProperty({
            displayName: 'Y Axis Label',
            value: '',
            validValue: createValidator({
                minLength: 0,
                maxLength: 50
            }),
            errorMessage: 'Must be between 0 and 50 characters',
            onchange: function() {
                self.render();
            }
        });

        this.xAxisDataField = new ArrayProperty({
            displayName: 'X Data Field',
            value: '',
            options: [],
            errorMessage: 'Value is required',
            onchange: function() {
                self.render();
            }
        });

        this.yAxisDataField = new ArrayProperty({
            displayName: 'Y Data Field',
            value: '',
            options: [],
            errorMessage: 'Value is required',
            onchange: function() {
                self.render();
            }
        });

        this.height.originalValue = 50;
        this.width.originalValue = 50;

        this.title.originalValue = 'Graph Title';

        this.dataSet.onchange = function(newValue) {
            self.xAxisDataField.options = newValue.dataFields;
            self.yAxisDataField.options = newValue.dataFields;
            self.render();
        };

        this.height.onchange = function(newValue) {
            self.render();
        };

        this.width.onchange = function(newValue) {
            self.render();
        };

        this.setState(state);

        ko.track(this);
    };

    GraphViewModel.prototype = Object.create(WidgetViewModel.prototype);

    GraphViewModel.prototype.usesDataSet = function(dataSet) {
        // TODO: Verify that this works.
        return (this.dataSet.value === dataSet);
    };

    GraphViewModel.prototype.getState = function() {
        var state = WidgetViewModel.prototype.getState.call(this);
        state.title = this.title.getState();
        state.dataSet = this.dataSet.getState().value.name;
        state.xAxisLabel = this.xAxisLabel.getState();
        state.yAxisLabel = this.yAxisLabel.getState();
        state.xAxisDataField = this.yAxisDataField.getState();
        state.yAxisDataField = this.yAxisDataField.getState();

        return state;
    };

    GraphViewModel.prototype.setState = function(state) {
        WidgetViewModel.prototype.setState.call(this, state);
        var self = this;

        if (defined(state.dataSet)) {
            this.boundData.forEach(function(entry){
                if (defined(state.dataSet) && (state.dataSet === entry.name)) {
                    self.dataSet.originalValue = entry;
                }
            });
        }
        if(defined(state.title)) {
            this.title.setState(state.title);
        }
        if (defined(state.xAxisLabel)) {
            this.xAxisLabel.setState(state.xAxisLabel);
        }
        if (defined(state.yAxisLabel)) {
            this.yAxisLabel.setState(state.yAxisLabel);
        }
        if (defined(state.xAxisDataField)) {
            this.xAxisDataField.setState(state.xAxisDataField);
        }
        if (defined(state.yAxisDataField)) {
            this.yAxisDataField.setState(state.yAxisDataField);
        }
    };

    Object.defineProperties(GraphViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.x, this.y, this.width, this.height,this.title, this.dataSet,this.xAxisDataField, this.yAxisDataField,
                    this.xAxisLabel, this.yAxisLabel, this.visible, this.logGoogleAnalytics, this.z, this.zIncrement, this.zDecrement];
            }
        }
    });

    return GraphViewModel;
});