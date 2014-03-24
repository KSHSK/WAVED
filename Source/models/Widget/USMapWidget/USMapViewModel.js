define([
        'models/Event/Trigger',
        'models/Property/Coloring/ColoringSelectionProperty',
        'models/Property/StringProperty',
        'models/SuperComponentViewModel',
        'models/Widget/WidgetViewModel',
        'modules/UniqueTracker',
        'util/defined',
        'util/displayMessage',
        'knockout',
        'd3',
        'jquery'
    ],function(
        Trigger,
        ColoringSelectionProperty,
        StringProperty,
        SuperComponentViewModel,
        WidgetViewModel,
        UniqueTracker,
        defined,
        displayMessage,
        ko,
        d3,
        $){
    'use strict';

    var USMapViewModel = function(state) {
        var self = this;
        state = (defined(state)) ? state : {};
        WidgetViewModel.call(this, state);

        if (!defined(state.name)) {
            var namespace = SuperComponentViewModel.getUniqueNameNamespace();
            this.name.value = UniqueTracker.getDefaultUniqueValue(namespace, USMapViewModel.getType(), this);
        }

        this.render = function() {
            if (self._ready) {
                var w = $('#waved-workspace').width();
                var w2 = w *self.width.value/100;
                var h = $('#waved-workspace').height();
                var h2 = h * self.height.value/100;
                d3.select('#' + self.name.value).selectAll('svg').remove();
                self._projection = d3.geo.albersUsa().scale(w*1.3*self.width.value/100).translate(([w2/2, h2/2]));
                var path = d3.geo.path().projection(self._projection);
                var svg = d3.select('#' + self.name.value)
                    .append('svg');
                self._svg = svg;
                var states = svg.append('g')
                    .attr('id', 'states');
                d3.json('data/states.json', function(json) {
                    states.selectAll('path')
                        .data(json.features)
                        .enter()
                        .append('path')
                        .attr('d', path)
                        .attr('stroke', 'white')
                        .style('filll', function(d) {
                            return self.coloring.value;
                        });
                    self._isRendered = true;
                    self.updateSvg();
                });
            }
        };

        this.updateSvg = function() {
            if (self._isRendered) {
                d3.select('#' + self.name.value).selectAll('svg').selectAll('path')
                .style('fill', function(d) {
                    return self.coloring.value;
                });
            }
        };

        //TODO: Use ColoringSelectionProperty
        this.coloring = new StringProperty({
            displayName: 'Color',
            value: 'grey',
            errorMessage: 'Must be a color name, hexidecimal number, or rgb color',
            onchange: self.updateSvg
        });

        this.width.onchange = this.render;
        this.height.onchange = this.render;
        this.height.value = 100;
        this.width.value = 100;

        this.setState(state);

        this._isRendered = false;

        // TODO: triggers?
        this._triggers.push(new Trigger({
            name: 'US Map'
        }));
        this._ready = true;

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