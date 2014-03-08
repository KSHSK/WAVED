/*global define*/
define([
        'jquery',
        'models/Property/StringProperty',
        'models/Property/NumberProperty',
        'models/Property/BooleanProperty',
        'models/ComponentViewModel',
        'util/defined',
        'util/defaultValue',
        'util/createValidator'
    ], function(
        $,
        StringProperty,
        NumberProperty,
        BooleanProperty,
        ComponentViewModel,
        defined,
        defaultValue,
        createValidator) {
    'use strict';

    var WidgetViewModel = function(state) {
        ComponentViewModel.call(this, state);

        // Set width
        var widthValue = 50;
        if (defined(state.width)) {
            widthValue = state.width.value;
        }

        this.width = new NumberProperty({
            displayName: 'Width',
            value: widthValue,
            validValue: createValidator({
                min: 1,
                max: 100
            }),
            errorMessage: 'Value must be between 1 and 100'
        });

        // Set height
        var heightValue = 50;
        if (defined(state.height)) {
            heightValue = state.height.value;
        }

        this.height = new NumberProperty({
            displayName: 'Height',
            value: heightValue,
            validValue: createValidator({
                min: 1,
                max: 100
            }),
            errorMessage: 'Value must be between 1 and 100'
        });

        // Set x
        var xValue = 0;
        if (defined(state.x)) {
            xValue = state.x.value;
        }

        this.x = new NumberProperty({
            displayName: 'X',
            value: xValue,
            validValue: createValidator({
                min: 0,
                max: 100
            }),
            errorMessage: 'Value must be between 0 and 100'
        });

        // Set y
        var yValue = 0;
        if (defined(state.y)) {
            yValue = state.y.value;
        }

        this.y = new NumberProperty({
            displayName: 'Y',
            value: yValue,
            validValue: createValidator({
                min: 0,
                max: 100
            }),
            errorMessage: 'Value must be between 0 and 100'
        });

        this._subwidgetNames = defaultValue(state.subwidgets, []); // String[]
        this._elementNames = defaultValue(state.elements, []); // String[]
        this._boundData = defaultValue(state.boundData, []); // String[]

        // TODO: Set this.
        this._availableElements = []; // ComponentRecord[]
    };

    WidgetViewModel.prototype = Object.create(ComponentViewModel.prototype);

    Object.defineProperties(WidgetViewModel.prototype, {
        properties: {
            get: function() {
                return [this._name, this.x, this.y, this.width, this.height, this.visible, this.logGoogleAnalytics];
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

    WidgetViewModel.prototype.setState = function() {
        // TODO
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
        var name = dataSet.name;

        // Don't bind the same data twice.
        if (this._boundData.indexOf(name) === -1) {
            this._boundData.push(name);
            dataSet.incrementReferenceCount();
        }
    };

    WidgetViewModel.prototype.unbindData = function(dataSet) {
        var name = dataSet.name;

        // Only unbind if the data is bound.
        var index = this._boundData.indexOf(name);
        if (index > -1) {
            this._boundData.splice(index, 1);
            dataSet.decrementReferenceCount();
        }
    };

    return WidgetViewModel;
});