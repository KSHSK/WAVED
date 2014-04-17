define([
        'models/Event/Trigger',
        'models/Property/Coloring/ColoringScheme',
        'models/Property/Coloring/ColoringSelectionProperty',
        'models/Property/Coloring/SolidColoringScheme',
        'models/Constants/ColoringSchemeType',
        'models/Property/StringProperty',
        'models/ComponentViewModel',
        'models/Widget/WidgetViewModel',
        'modules/UniqueTracker',
        'util/createValidator',
        'util/defined',
        'util/subscribeObservable',
        'knockout',
        'd3',
        'topojson',
        'jquery'
    ],function(
        Trigger,
        ColoringScheme,
        ColoringSelectionProperty,
        SolidColoringScheme,
        ColoringSchemeType,
        StringProperty,
        ComponentViewModel,
        WidgetViewModel,
        UniqueTracker,
        createValidator,
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
        var namespace = ComponentViewModel.getUniqueNameNamespace();
        this.id = UniqueTracker.getDefaultUniqueValue(namespace, USMapViewModel.getType(), this);
        if (!defined(state.name)) {
            this.name.originalValue = this.id;
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
                        .attr('stroke', 'white');
                    self._isRendered = true;
                    self.updateColoring();
                });
            }
        };

        this.updateSvg = function() {
            // TODO: Keeping this around since it might be useful for general svg updates
        };

        this.updateColoring = function() {
            if(!self._isRendered || !defined(self.coloring.value) || !defined(self.strokeColor.value)){
                return;
            }

            var coloringScheme = self.coloring.value;
            var path = getElement(self).selectAll('svg').selectAll('path');

            path.style('stroke', function(d) {
                return self.strokeColor.value;
            });

            switch(coloringScheme.getType()){
                case ColoringSchemeType.SOLID_COLORING:
                    path.style('fill', function(d) {
                        return defined(coloringScheme.color.value) ? coloringScheme.color.value : '#000000';
                    });
                    break;
                case ColoringSchemeType.FOUR_COLORING:
                    path.style('fill', function(d) {
                        var stateName = d.properties.name;
                        for(var i=0; i<self.fourColorStateGroupings.length; i++){
                            if(self.fourColorStateGroupings[i].indexOf(stateName) !== -1){
                                return coloringScheme.getColorArray()[i];
                            }
                        }
                    });
                    break;
                case ColoringSchemeType.GRADIENT_COLORING:
                    /*
                     * This makes some very broad assumptions:
                     * 1. All the data is in 1 file
                     * 2. The path data's key and the key in the data used to scale have the same key.
                     * 2.1. For example, both files must have a key of 'New York' for things to match up. No abbreviations.
                     */

                    // If either a dataSet or dataField isn't selected, break
                    if(!defined(coloringScheme.dataField.value) || !defined(coloringScheme.dataSet.value)){
                        path.style('fill', function(d){
                            return '#C0C0C0'; // Default to grey
                        });
                        break;
                    }

                    // Wait until data is available
                    if(!defined(coloringScheme.dataSet.value.data)){
                        var interval = setInterval(function(){
                            if(defined(coloringScheme.dataSet.value.data)){
                                clearInterval(interval);
                            }
                        }, 100);
                    }

                    // Find the min and max values for the dataField we're using to scale the gradient
                    var dataField = coloringScheme.dataField.value;
                    var min = d3.min(coloringScheme.dataSet.value.data, function(d) { return +d[dataField]; });
                    var max = d3.max(coloringScheme.dataSet.value.data, function(d) { return +d[dataField]; });

                    // Default the map to black when we can't extract an actual min or max (the field is not numeric)
                    if(!defined(min) || !defined(max)){
                        path.style('fill', function(d){
                            return '#C0C0C0'; // Default to grey
                        });
                    }

                    // Set up the gradient function
                    var gradient = d3.scale.linear().domain([min, max]).range([coloringScheme.startColor.value, coloringScheme.endColor.value]);
                    path.style('fill', function(d) {
                        var stateName = d.properties.name;
                        var keyName = coloringScheme.keyField.value;

                        for(var i=0; i<coloringScheme.dataSet.value.data.length; i++){
                            if(coloringScheme.dataSet.value.data[i][keyName] === stateName){
                                return gradient(coloringScheme.dataSet.value.data[i][dataField]);
                            }
                        }
                    });

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

        // Default to black strokes
        this.strokeColor = new StringProperty({
            displayName: 'Stroke Color',
            value: '#000000',
            validValue: createValidator({
                regex: new RegExp(ColoringScheme.prototype.HEX_REGEX)
            }),
            onchange: self.updateColoring
        }, this);

        this.width.onchange = this.render;
        this.width.originalValue = 100;
        this.width._displayName = 'Scale';

        this.setState(state);

        this._isRendered = false;
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
        state.strokeColor = this.strokeColor.getState();

        return state;

    };

    USMapViewModel.prototype.setState = function(state) {
        WidgetViewModel.prototype.setState.call(this, state);

        if (defined(state.coloring)) {
            this.coloring.setState(state.coloring, this);
        }

        if(defined(state.strokeColor)){
            this.strokeColor.setState(state.strokeColor);
        }
    };

    USMapViewModel.prototype.usesDataSet = function(dataSet) {
        // TODO: Once Coloring and Glyphs are implemented, this will need to be implemented.

        if(this.coloring.value.type === ColoringSchemeType.GRADIENT_COLORING) {
            if(this.coloring.value.dataSet === dataSet){
                return true;
            }
        }

        return false;
    };

    Object.defineProperties(USMapViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.x, this.y, this.width, this.visible, this.logGoogleAnalytics,
                this.strokeColor, this.coloring];
            }
        }
    });

    // Groupings of states so that
    USMapViewModel.prototype.fourColorStateGroupings = [
        ['Alaska', 'Alabama', 'Arkansas', 'Connecticut', 'Delaware', 'Illinois', 'Maine', 'Michigan', 'Minnesota', 'Montana', 'Nebraska', 'New Mexico', 'Nevada', 'Virginia'],
        ['Arizona', 'District of Columbia', 'Kansas', 'Kentucky', 'Mississippi', 'North Carolina', 'Oregon', 'Pennsylvania', 'Rhode Island', 'Texas', 'Vermont', 'Wisconsin', 'Wyoming'],
        ['California', 'Colorado', 'Georgia', 'Idaho', 'Indiana', 'Louisiana', 'Massachusetts', 'Missouri', 'New Jersey', 'South Dakota', 'West Virginia'],
        ['Florida', 'Hawaii', 'Iowa', 'Maryland', 'New Hampshire', 'New York', 'North Dakota', 'Ohio', 'Oklahoma', 'South Carolina', 'Tennessee', 'Utah', 'Washington']
    ];

    return USMapViewModel;
});