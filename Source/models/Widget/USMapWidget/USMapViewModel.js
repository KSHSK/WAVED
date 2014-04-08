define([
        'models/Event/Trigger',
        'models/Property/Coloring/ColoringSelectionProperty',
        'models/Constants/ColoringSchemeType',
        'models/Property/StringProperty',
        'models/SuperComponentViewModel',
        'models/Widget/WidgetViewModel',
        'modules/UniqueTracker',
        'util/defined',
        'util/subscribeObservable',
        'knockout',
        'd3',
        'topojson',
        'jquery'
    ],function(
        Trigger,
        ColoringSelectionProperty,
        ColoringSchemeType,
        StringProperty,
        SuperComponentViewModel,
        WidgetViewModel,
        UniqueTracker,
        defined,
        subscribeObservable,
        ko,
        d3,
        topojson,
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
                            // TODO: Load the coloring from state
                            return self.coloring.value;
                        });
                    self._isRendered = true;
                    // TODO: Test this, changed from updateSvg
                    self.updateColoring();
                });
            }
        };

        this.updateSvg = function() {
            // TODO: Keeping this around since it might be useful for general svg updates
        };

        this.updateColoring = function() {
            if(!self._isRendered){
                return;
            }

            var path = getElement(self).selectAll('svg').selectAll('path');
            switch(self.coloring.value.getType()){
                case ColoringSchemeType.SOLID_COLORING:
                    path.style('fill', function(d) {
                        return defined(self.coloring.value.color.value) ? self.coloring.value.color.value : '#000000';
                    });
                    break;
                case ColoringSchemeType.FOUR_COLORING:
                    path.style('fill', function(d) {
                        var stateName = d.properties.name;
                        for(var i=0; i<self.fourColorStateGroupings.length; i++){
                            if(self.fourColorStateGroupings[i].indexOf(stateName) !== -1){
                                return self.coloring.value.getColorArray()[i];
                            }
                        }
                    });
                    break;
                case ColoringSchemeType.GRADIENT_COLORING:
                    break;
                default:
                    break;
            }
        };

        //TODO: Make this less hacky
        subscribeObservable(window.wavedWorkspace.width, '_value', this.render);
        subscribeObservable(window.wavedWorkspace.height, '_value', this.render);

        this.coloring = new ColoringSelectionProperty({
            displayName: 'Color Scheme',
            value: '',
            onchange: self.updateColoring
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

    // Groupings of states so that
    USMapViewModel.prototype.fourColorStateGroupings = [
        ['Alaska', 'Alabama', 'Arkansas', 'Connecticut', 'Delware', 'Hawaii', 'Illinois', 'Maine', 'Michigan', 'Montana', 'Nebraska', 'New Mexico', 'Nevada', 'South Carolina', 'Virginia', 'Washington'],
        ['Arizona', 'District of Columbia', 'Florida', 'Kansas', 'Mississippi', 'North Carolina', 'North Dakota', 'Oregon', 'Pennsylvania', 'Rhode Island', 'Texas', 'Vermont', 'Wisconsin', 'Wyoming'],
        ['California', 'Colorado', 'Georgia', 'Idaho', 'Indiana', 'Louisiana', 'Massachusetts', 'Missouri', 'New Jersey', 'South Dakota', 'West Virginia'],
        ['Iowa', 'Maryland', 'New Hampshire', 'New York', 'Ohio', 'Oklahoma', 'Tennessee', 'Utah']
    ];

    return USMapViewModel;
});