define([
        'models/Event/Trigger',
        'models/Property/Coloring/ColoringSelectionProperty',
        'models/Property/StringProperty',
        'models/SuperComponentViewModel',
        'models/Widget/WidgetViewModel',
        'modules/UniqueTracker',
        'util/defined',
        'util/subscribeObservable',
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
        subscribeObservable,
        ko,
        d3,
        $){
    'use strict';

    function getElement(viewModel){
        return d3.select('#' + viewModel.id);
    }

    var USMapViewModel = function(state, getDataSet) {
        var self = this;
        state = (defined(state)) ? state : {};
        WidgetViewModel.call(this, state, getDataSet);
        var namespace = SuperComponentViewModel.getUniqueNameNamespace();
        this.id = UniqueTracker.getDefaultUniqueValue(namespace, USMapViewModel.getType(), this);
        if (!defined(state.name)) {
            this.name.value = this.id;
        }

        this.render = function() {
            if (self._ready) {
                var w = $('#waved-workspace').width();
                var w2 = w *self.width.value/100;
                var h = $('#waved-workspace').height();
                var h2 = h * self.width.value/100;
                getElement(self).selectAll('svg').remove();
                var scale = w*1.3*self.width.value/100; //1.3 is a magic number
                self._projection = d3.geo.albersUsa().scale(scale).translate(([w2/2, h2/2]));
                var path = d3.geo.path().projection(self._projection);
                var svg = getElement(self)
                    .append('svg')
                    .attr('height', h2)
                    .attr('width', w2);
                self._svg = svg;
                var states = svg.append('g');
                d3.json('data/states.json', function(json) {
                    states.selectAll('path')
                        .data(json.features)
                        .enter()
                        .append('path')
                        .attr('d', path)
                        .attr('stroke', 'white')
                        .style('fill', function(d) {
                            return self.coloring.value;
                        });
                    self._isRendered = true;
                    self.updateSvg();
                });
            }
        };

        // TODO: Update this for the new ColoringSelectionProperty
        this.updateSvg = function() {
            if (self._isRendered) {
                getElement(self).selectAll('svg').selectAll('path')
                .style('fill', function(d) {
                    return defined(self.coloring.value) ? self.coloring.value : '#000000';
                });
            }
        };

        //TODO: Make this less hacky
        subscribeObservable(window.wavedWorkspace.width, '_value', this.render);
        subscribeObservable(window.wavedWorkspace.height, '_value', this.render);

        //TODO: Use ColoringSelectionProperty
//        this.coloring = new StringProperty({
//            displayName: 'Color',
//            value: 'grey',
//            errorMessage: 'Must be a color name, hexidecimal number, or rgb color',
//            onchange: self.updateSvg
//        });

        this.coloring = new ColoringSelectionProperty({
            displayName: 'Color Scheme',
            value: ''
            //onchange: self.updateSvg // TODO: This onchange MIGHT need changing
        }, this);

        this.width.onchange = this.render;
        this.width.value = 100;
        this.width._displayName = 'Scale';

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
            this.coloring.setState(state.coloring, this);
        }
    };

    Object.defineProperties(USMapViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.x, this.y, this.width, this.visible, this.logGoogleAnalytics,
                this.coloring];
            }
        }
    });

    return USMapViewModel;
});