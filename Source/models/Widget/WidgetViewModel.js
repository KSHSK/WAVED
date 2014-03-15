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

    var WidgetViewModel = function(state) {
        ComponentViewModel.call(this, state);

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
        state.boundData = this.boundData;

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
            this._boundData = state.boundData;
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
        var dataObject = d3.values(dataSet.data)[0];
        var dataFields = Object.getOwnPropertyNames(dataObject);

        var set = {
            name: dataSet.name,
            options: dataFields
        };

        // Don't bind the same data twice.
        var found = false;
        for(var index = 0; index < this._boundData.length; index++){
            if(set.name === this._boundData[index].name){
                found = true;
                break;
            }
        }

        if(!found){
            this._boundData.push(set);
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