define([
        'models/Widget/GraphWidget/LineGraphViewModel',
        'models/Constants/WidgetTemplateName',
        '../Widget',
        'knockout',
        'jquery'
    ],function(
        LineGraphViewModel,
        WidgetTemplateName,
        Widget,
        ko,
        $){
    'use strict';

    var LineGraph = function(state, getDataSet) {
        Widget.call(this, state);
        this._templateName = WidgetTemplateName.LINE_GRAPH;

        var $workspace = $('#waved-workspace');
        var lineGraph = this.newWidgetContainer();
        lineGraph.attr('data-bind', 'template: {name: \'' + this._templateName + '\', afterRender: render}');

        var viewModel = new LineGraphViewModel(state, getDataSet);
        viewModel.trigger.domElement = lineGraph;

        this._domElement = lineGraph;
        this.viewModel = viewModel;

        ko.applyBindings(viewModel, lineGraph[0]);
    };

    LineGraph.prototype = Object.create(Widget.prototype);

    LineGraph.prototype.addToWorkspace = function() {
        Widget.prototype.addToWorkspace.call(this);

        this.viewModel.render();
    };

    /**
     * Static method that returns the type String for this class's ViewModel.
     */
    LineGraph.getViewModelType = function() {
        return LineGraphViewModel.getType();
    };

    LineGraph.iconLocation = function() {
        return 'Source/models/Widget/GraphWidget/linegraph-icon.png';
    };

    return LineGraph;
});