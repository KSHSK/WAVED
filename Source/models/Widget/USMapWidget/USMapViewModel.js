define([
        'models/Event/Trigger',
        'models/Property/Coloring/ColoringSelectionProperty',
        'models/Property/StringProperty',
        'models/Widget/WidgetViewModel',
        'util/defined',
        'knockout',
        'd3',
        'jquery',
        'topojson'
    ],function(
        Trigger,
        ColoringSelectionProperty,
        StringProperty,
        WidgetViewModel,
        defined,
        ko,
        d3,
        $,
        topojson){
    'use strict';

    var self;
    var USMapViewModel = function(state) {
        self = this;
        state = (defined(state)) ? state : {};
        WidgetViewModel.call(this, state);

        //TODO: Use ColoringSelectionProperty
        this.coloring = new StringProperty({
            displayName: 'Color',
            value: 'grey',
            errorMessage: 'Must be a color name, hexidecimal number, or rgb color',
            onchange: function(newValue) {
                self.updateSvg();
            }
        });

        this.height.value = 100;
        this.width.value = 100;
        this.name.value = 'USMap1';

        this.setState(state);

        this._isRendered = false;

        // TODO: triggers?
        this._triggers.push(new Trigger({
            name: 'US Map'
        }));

        ko.track(this);
    };

    /**
     * Static method that returns the type String for this class.
     */
    USMapViewModel.getType = function() {
        return 'USMap';
    };

    USMapViewModel.prototype = Object.create(WidgetViewModel.prototype);

    USMapViewModel.prototype.getState = function() {
        var state = WidgetViewModel.prototype.getState.call(this);
        state.type = USMapViewModel.getType();
        state.coloring = this.coloring.getState();

        return state;

    };

    USMapViewModel.prototype.setState = function(state) {
        WidgetViewModel.prototype.setState.call(this, state);

        if (defined(state.coloring)) {
            this.coloring.value = state.coloring.value;
        }
    };

    USMapViewModel.prototype.render = function() {
        var w = $('#waved-workspace').width(); //TODO: this can't use percentages
        var h = $('#waved-workspace').height();
        self._projection = d3.geo.albersUsa().translate(([w/2, h/2]));
        var path = d3.geo.path().projection(self._projection);
        self._svg = d3.select('#' + self.name.value)
            .append('svg')
            .attr('width', w - 20)
            .attr('height', h - 20);
        self._g = self._svg.append('g');
        d3.json('data/states.json', function(error, json) {
            if (error) {
                alert('error creating map');
            } else {
                self._g.append('g')
                    .attr('id', 'states')
                    .selectAll('path')
                    .data(json.features)
                    .enter()
                    .append('path')
                    .attr('d', path)
                    .attr('stroke', 'white')
                    .style('fill', function(d) {
                        return self.coloring.value;
                    });

                self._g.append('path')
                    .datum(topojson.mesh(json, json, function(a, b){ return a !== b; }))
                    .attr('id', 'state-borders')
                    .attr('d', path);
                self._isRendered =  true;
            }
        });
    };

    USMapViewModel.prototype.updateSvg = function() {
        var interval = setInterval(function(){
            if (self._isRendered) {
                self._svg.selectAll('path')
                .style('fill', function(d) {
                    return self.coloring.value;
                });
                clearInterval(interval);
            }
        }, 100);
    };

    Object.defineProperties(USMapViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.x, this.y, this.width, this.height, this.visible, this.logGoogleAnalytics,
                this.coloring];
            }
        }
    });

    return USMapViewModel;
});