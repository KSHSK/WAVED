define([
        'models/Widget/GraphWidget/GraphViewModel',
        'models/ComponentViewModel',
        'modules/UniqueTracker',
        'util/defined',
        'jquery',
        'knockout',
         'd3'
    ],function(
        GraphViewModel,
        ComponentViewModel,
        UniqueTracker,
        defined,
        $,
        ko,
        d3){
    'use strict';

    function getElement(viewModel){
        return d3.select('#' + viewModel.id);
    }

    function renderLineGraph(viewModel) {
        var data = viewModel.dataSet.value.data;

        var w = $('#waved-workspace').width();
        var w2 = w * viewModel.width.value/100;
        var h = $('#waved-workspace').height();
        var h2 = h * viewModel.height.value/100;

        var xAxisDataField = viewModel.xAxisDataField.value;
        var yAxisDataField = viewModel.yAxisDataField.value;

        var margin = {top:20, right: 20, bottom: 50, left: 55};
        var width = w2 - margin.left - margin.right;
        var height = h2 - margin.top - margin.bottom;

        getElement(viewModel).selectAll('svg').remove();

        var x = d3.scale.linear().range([0, width]);
        var y = d3.scale.linear().range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');

        var line = d3.svg.line()
            .x(function(d){return x(d[xAxisDataField]);})
            .y(function(d){return y(d[yAxisDataField]);});

        var svg = getElement(viewModel).append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        svg.append('text')
            .attr('x', (width / 2))
            .attr('y', -5)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('text-decoration', 'underline')
            .style('font-weight', 'bold')
            .text(viewModel.title.value);

        if (defined(data) && xAxisDataField !== '' && yAxisDataField !== '') {
            x.domain(d3.extent(data, function(d) { return d[xAxisDataField]; }));
            y.domain(d3.extent(data, function(d) { return d[yAxisDataField]; }));

            svg.append('path')
                .datum(data)
                .attr('class', 'line')
                .attr('d', line);

            svg.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + height + ')')
                .call(xAxis)
                .append('text')
                .attr('transform', 'translate(0, 40)')
                .style('font-weight', 'bold')
                .text(viewModel.xAxisLabel.value);

            svg.append('g')
                .attr('class', 'y axis')
                .call(yAxis)
                .append('text')
                .attr('transform', 'translate(-40, ' + height +'), rotate(-90)')
                .style('font-size', '18px')
                .text(viewModel.yAxisLabel.value);

        }
    }

    var LineGraphViewModel = function(state, getDataSet) {
        var self = this;
        state = (defined(state)) ? state : {};

        GraphViewModel.call(this, state, getDataSet);

        var namespace = ComponentViewModel.getUniqueNameNamespace();
        this.id = UniqueTracker.getDefaultUniqueValue(namespace, LineGraphViewModel.getType(), this);
        if (!defined(state.name)) {
            this.name.originalValue = this.id;
        }

        this.render = function(){
            renderLineGraph(self);
        };

        ko.track(this);
    };

    /**
     * Static method that returns the type String for this class.
     */
    LineGraphViewModel.getType = function() {
        return 'LineGraph';
    };

    LineGraphViewModel.prototype = Object.create(GraphViewModel.prototype);

    LineGraphViewModel.prototype.getState = function() {
        var state = GraphViewModel.prototype.getState.call(this);
        state.type = LineGraphViewModel.getType();
        return state;
    };

    LineGraphViewModel.prototype.setState = function(state) {
        GraphViewModel.prototype.setState.call(this, state);
    };

    return LineGraphViewModel;
});