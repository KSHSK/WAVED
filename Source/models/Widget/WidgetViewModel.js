define([
        'jquery',
        'd3',
        'models/Property/StringProperty',
        'models/Property/NumberProperty',
        'models/Property/BooleanProperty',
        'models/Property/ButtonProperty',
        'models/ComponentViewModel',
        'models/Event/Trigger',
        'modules/HistoryMonitor',
        'util/defined',
        'util/defaultValue',
        'util/createValidator',
        'util/displayMessage'
    ], function(
        $,
        d3,
        StringProperty,
        NumberProperty,
        BooleanProperty,
        ButtonProperty,
        ComponentViewModel,
        Trigger,
        HistoryMonitor,
        defined,
        defaultValue,
        createValidator,
        displayMessage) {
    'use strict';

    var WidgetViewModel = function(state, getDataSet) {
        ComponentViewModel.call(this, state);
        var self = this;

        this.getDataSetByName = function(dataSetName){
            return getDataSet(dataSetName);
        };

        // Set width
        this.width = new NumberProperty({
            displayName: 'Width',
            value: 50,
            validValue: createValidator({
                min: 1,
                max: 100
            }),
            errorMessage: 'Value must be between 1 and 100'
        });

        // Set height
        this.height = new NumberProperty({
            displayName: 'Height',
            value: 50,
            validValue: createValidator({
                min: 1,
                max: 100
            }),
            errorMessage: 'Value must be between 1 and 100'
        });

        // Set x
        this.x = new NumberProperty({
            displayName: 'X',
            value: 0,
            validValue: createValidator({
                min: 0,
                max: 100
            }),
            errorMessage: 'Value must be between 0 and 100'
        });

        // Set y
        this.y = new NumberProperty({
            displayName: 'Y',
            value: 0,
            validValue: createValidator({
                min: 0,
                max: 100
            }),
            errorMessage: 'Value must be between 0 and 100'
        });

        this._boundData = []; // String[]
        this._trigger = new Trigger();
    };

    WidgetViewModel.prototype = Object.create(ComponentViewModel.prototype);

    Object.defineProperties(WidgetViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.x, this.y, this.z, this.zIncrement, this.zDecrement, this.width, this.height, this.visible, this.logGoogleAnalytics];
            }
        },
        boundData: {
            get: function() {
                return this._boundData;
            }
        },
        trigger: {
            get: function() {
                return this._trigger;
            }
        }
    });

    WidgetViewModel.prototype.getState = function() {
        var state = ComponentViewModel.prototype.getState.call(this);
        state.width = this.width.getState();
        state.height = this.height.getState();
        state.x = this.x.getState();
        state.y = this.y.getState();

        var boundDataSetStates = [];
        for(var index=0; index < this.boundData.length; index++){
            boundDataSetStates.push(this.boundData[index].getState());
        }

        state.boundData = boundDataSetStates;
        return state;
    };

    WidgetViewModel.prototype.setState = function(state) {
        ComponentViewModel.prototype.setState.call(this, state);

        if (defined(state.width)) {
            this.width.originalValue = state.width.value;
        }

        if (defined(state.height)) {
            this.height.originalValue = state.height.value;
        }

        if (defined(state.x)) {
            this.x.originalValue = state.x.value;
        }

        if (defined(state.y)) {
            this.y.originalValue = state.y.value;
        }

        if (defined(state.elements)) {
            this._elementNames = state.elements;
        }

        if (defined(state.boundData)) {
            for(var index=0; index < state.boundData.length; index++){
                var dataSet = this.getDataSetByName(state.boundData[index].name);
                if(dataSet !== null){
                    this._boundData.push(dataSet);
                }
            }
        }
    };

    WidgetViewModel.prototype.boundDataIndex = function(dataSet) {
        return this._boundData.indexOf(dataSet);
    };

    WidgetViewModel.prototype.bindData = function(dataSet, indexToInsert) {
        var self = this;

        if (this.boundDataIndex(dataSet) > -1) {
            displayMessage('DataSet "' + dataSet.name + '" is already bound.');
            return;
        }

        dataSet.incrementReferenceCount();
        if (defined(indexToInsert)) {
            self._boundData.splice(indexToInsert, 0, dataSet);
        }
        else {
            self._boundData.push(dataSet);
        }
    };

    WidgetViewModel.prototype.unbindData = function(dataSet) {
        var self = this;

        // Only unbind if the data is bound.
        var index = this.boundDataIndex(dataSet);
        if(index > -1){
            self._boundData.splice(index, 1);
            dataSet.decrementReferenceCount();
        }
    };

    WidgetViewModel.prototype.unbindAllData = function() {
        var self = this;

        var data = this.boundData.slice(0);
        data.forEach(function(dataSet) {
            self.unbindData(dataSet);
        });

        return data;
    };

    return WidgetViewModel;
});