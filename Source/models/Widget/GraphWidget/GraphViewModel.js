
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
        this.title = state.title; // StringProperty
        this.dataSet = state.dataSet; // ArrayProperty
        this.xAxisLabel = state.xAxisLabel; // StringProperty
        this.yAxisLabel = state.yAxisLabel; // StringProperty
        this.xAxisDataField = state.xAxisDataField; // ArrayProperty
        this.yAxisDataField = state.yAxisDataField; // ArrayProperty

        WidgetViewModel.call(this, state);

        ko.track(this);
    };

    GraphViewModel.prototype = Object.create(WidgetViewModel.prototype);

    GraphViewModel.prototype.usesDataSet = function(dataSet) {
        // TODO: Verify that this works.
        return (this.dataSet.name === dataSet.name);
    };

    Object.defineProperties(GraphViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.x, this.y, this.z, this.zIncrement, this.zDecrement, this.width, this.height, this.visible, this.logGoogleAnalytics,
                this.title, this.dataSet, this.xAxisLabel, this.yAxisLabel, this.xAxisDataField, this.yAxisDataField];
            }
        }
    });

    return GraphViewModel;
});