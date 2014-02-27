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

    return LineGraph;
});