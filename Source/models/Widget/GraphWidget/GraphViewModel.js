/*global define*/
define([
        'models/Widget/WidgetViewModel',
        'models/Property/StringProperty',
        'models/Property/ArrayProperty',
        'util/defined',
        'knockout'
    ],function(
        WidgetViewModel,
        StringProperty,
        ArrayPropery,
        defined,
        ko){
    'use strict';

    var GraphViewModel = function(state) {
        state = (defined(state)) ? state : {};

        // TODO: Validation, etc
        this._title = state.title; // StringProperty
        this._dataSet = state.dataSet; // ArrayProperty
        this._xAxisLabel = state.xAxisLabel; // StringProperty
        this._yAxisLabel = state.yAxisLabel; // StringProperty
        this._xAxisDataField = state.xAxisDataField; // ArrayProperty
        this._yAxisDataField = state.yAxisDataField; // ArrayProperty

        WidgetViewModel.call(this, state);

        ko.track(this);
    };

    GraphViewModel.prototype = Object.create(WidgetViewModel.prototype);

    Object.defineProperties(GraphViewModel.prototype, {
        properties: {
            get: function() {
                return [ this._title, this._dataSet, this._xAxisLabel, this._yAxisLabel, this._xAxisDataField, this._yAxisDataField ];
            }
        }
    });

    return GraphViewModel;
});