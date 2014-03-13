/*global define*/
define([
        'models/Widget/GraphWidget/LineGraphWidget/LineGraphViewModel',
        'models/Constants/ComponentTemplateName',
        'knockout',
        'jquery'
    ],function(
        LineGraphViewModel,
        ComponentTemplateName,
        ko,
        $){
    'use strict';

    var LineGraph = function(state) {
        this._templateName = ComponentTemplateName.LINE_GRAPH;

        var viewModel = new LineGraphViewModel(state);

        var $workspace = $('#waved-workspace');
        var lineGraph = document.createElement('div');
        lineGraph.className = 'widget-container';
        $(lineGraph).attr('data-bind', 'template: {name: \'' + this._templateName + '\'}');
        $workspace.append(lineGraph);

        this.viewModel = viewModel;
        ko.applyBindings(viewModel, lineGraph);
    };

    /**
     * Static method that returns the type String for this class's ViewModel.
     */
    LineGraph.getViewModelType = function() {
        return LineGraphViewModel.getType();
    };

    return LineGraph;
});