define([
        'jquery',
        'models/Property/StringProperty',
        'models/Property/NumberProperty',
        'models/Property/BooleanProperty',
        'models/ComponentViewModel',
        'util/defined',
        'util/defaultValue',
        'util/createValidator',
        'd3'
    ], function(
        $,
        StringProperty,
        NumberProperty,
        BooleanProperty,
        ComponentViewModel,
        defined,
        defaultValue,
        createValidator,
        d3) {
    'use strict';

    var self;
    var WidgetViewModel = function(state, getDataSet) {
        ComponentViewModel.call(this, state);
        self = this;

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

        this._elementNames = []; // String[]
        this._boundData = []; // String[]

        // TODO: Set this.
        this._availableElements = []; // ComponentRecord[]
    };

    WidgetViewModel.prototype = Object.create(ComponentViewModel.prototype);

    Object.defineProperties(WidgetViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.x, this.y, this.width, this.height, this.visible, this.logGoogleAnalytics];
            }
        },
        boundData: {
            get: function() {
                return this._boundData;
            }
        },
        elementNames: {
            get: function() {
                return this._elementNames;
            }
        }
    });

    WidgetViewModel.prototype.getState = function() {
        var state = ComponentViewModel.prototype.getState.call(this);
        state.width = this.width.getState();
        state.height = this.height.getState();
        state.x = this.x.getState();
        state.y = this.y.getState();
        state.elementNames = this.elementNames;

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
            this.width.value = state.width.value;
        }

        if (defined(state.height)) {
            this.height.value = state.height.value;
        }

        if (defined(state.x)) {
            this.x.value = state.x.value;
        }

        if (defined(state.y)) {
            this.y.value = state.y.value;
        }

        if (defined(state.elements)) {
            this._elementNames = state.elements;
        }

        if (defined(state.boundData)) {
            for(var index=0; index < state.boundData.length; index++){
                var dataSet = self.getDataSetByName(state.boundData[index].name);
                if(dataSet !== null){
                    this._boundData.push(dataSet);
                }
            }
        }
    };

    WidgetViewModel.prototype.addElement = function(elementName) {
        // TODO
    };

    WidgetViewModel.prototype.removeElement = function(element) {
        // TODO
    };

    WidgetViewModel.prototype.addSubwidget = function(name) {
        // TODO
    };

    WidgetViewModel.prototype.removeSubwidget = function(name) {
        // TODO
    };

    WidgetViewModel.prototype.getAvailableElements = function() {
        // TODO
    };

    WidgetViewModel.prototype.bindData = function(dataSet) {
        var found = false;
        for(var index = 0; index < this._boundData.length; index++){
            if(dataSet.name === this._boundData[index].name){
                found = true;
                break;
            }
        }

        if(!found){
            this._boundData.push(dataSet);
            dataSet.incrementReferenceCount();
        }
    };

    WidgetViewModel.prototype.unbindData = function(dataSet) {
        var name = dataSet.name;

        // Only unbind if the data is bound.
        for(var index = 0; index < this._boundData.length; index++){
            if(name === this._boundData[index].name){
                this._boundData.splice(index, 1);
                dataSet.decrementReferenceCount();
                break;
            }
        }
    };

    return WidgetViewModel;
});