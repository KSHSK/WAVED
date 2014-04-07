define([
        'models/Event/Trigger',
        'models/Property/Coloring/ColoringSelectionProperty',
        'models/Property/GlyphSize/GlyphSizeSelectionProperty',
        'models/Property/StringProperty',
        'models/Property/ListProperty',
        'models/SuperComponentViewModel',
        'models/Widget/WidgetViewModel',
        'models/Constants/GlyphSizeSchemeType',
        './GlyphViewModel',
        'modules/UniqueTracker',
        'modules/GlyphHelper',
        'util/defined',
        'util/subscribeObservable',
        'knockout',
        'd3',
        'jquery'
    ],function(
        Trigger,
        ColoringSelectionProperty,
        GlyphSizeSelectionProperty,
        StringProperty,
        ListProperty,
        SuperComponentViewModel,
        WidgetViewModel,
        GlyphSizeSchemeType,
        GlyphViewModel,
        UniqueTracker,
        GlyphHelper,
        defined,
        subscribeObservable,
        ko,
        d3,
        $){
    'use strict';

    var radiusScale = d3.scale.linear()
        .domain([1000,500000])
        .range([2,10])
        .clamp(true);

    function getElement(viewModel){
        return d3.select('#' + viewModel.id);
    }

    function removeGlyph(glyph) {
        var child = document.getElementById(glyph._id);
        child.parentNode.removeChild(child);
        glyph._dom = undefined;
        glyph._id = undefined;
    }

    function editGlyph(glyph, viewModel) {
        var data = glyph.dataSet.value.data;

        glyph._dom.selectAll('circle').data(data)
        .attr('cx', function(d, i) {
            var coords = viewModel._projection([d[glyph.longitude.value], d[glyph.latitude.value]]);
            if (coords !== null) {
                return coords[0];
            }
        })
        .attr('cy', function(d, i) {
            var coords = viewModel._projection([d[glyph.longitude.value], d[glyph.latitude.value]]);
            if (coords !== null) {
                return coords[1];
            }
        })
        .attr('r', function(d, i) {
            if (glyph.size.value.type === GlyphSizeSchemeType.SCALED_SIZE) {
                return radiusScale(d[glyph.size.value.dataField.value]);
            } else {
                return glyph.size.value.size.value*viewModel.width.value/100;
            }
        })
        .style('fill', glyph.color.value)
        .style('opacity', glyph.opacity.value/100);
    }

    var id = 0;
    function addGlyph(glyph, viewModel) {
        var w2 = $('#waved-workspace').width() * viewModel.width.value/100;
        var h2 = $('#waved-workspace').height() * viewModel.width.value/100;
        var svg = getElement(viewModel)
            .append('svg')
            .attr('height', h2)
            .attr('width', w2)
            .attr('class', 'widget-container')
            .attr('id', id);


        var data = glyph.dataSet.value.data;
        glyph._dom = svg.append('g');
        glyph._id = id;
        id++;

        glyph._dom.selectAll('circle').data(data)
        .enter().append('circle')
        .attr('cx', function(d, i) {
            var coords = viewModel._projection([d[glyph.longitude.value], d[glyph.latitude.value]]);
            if (coords !== null) {
                return coords[0];
            }
        })
        .attr('cy', function(d, i) {
            var coords = viewModel._projection([d[glyph.longitude.value], d[glyph.latitude.value]]);
            if (coords !== null) {
                return coords[1];
            }
        })
        .attr('r', function(d, i) {
            if (glyph.size.value.type === GlyphSizeSchemeType.SCALED_SIZE) {
                return radiusScale(d[glyph.size.value.dataField.value]);
            } else {
                return glyph.size.value.size.value*viewModel.width.value/100;
            }
        })
        .style('fill', glyph.color.value)
        .style('opacity', glyph.opacity.value/100);
    }

    function renderGlyphs (viewModel) {
        var glyphs = viewModel.glyphs;
        for (var i = 0; i < glyphs.length; i++) {
            addGlyph(glyphs[i], viewModel);
        }
    }

    function renderMap (viewModel) {
        if (viewModel._ready) {
            var w = $('#waved-workspace').width();
            var w2 = w *viewModel.width.value/100;
            var h = $('#waved-workspace').height();
            var h2 = h * viewModel.width.value/100;
            getElement(viewModel).selectAll('svg').remove();
            var scale = w*1.3*viewModel.width.value/100; //1.3 is a magic number
            viewModel._projection = d3.geo.albersUsa().scale(scale).translate(([w2/2, h2/2]));
            var path = d3.geo.path().projection(viewModel._projection);
            var svg = getElement(viewModel)
                .append('svg')
                .attr('height', h2)
                .attr('width', w2)
                .attr('class', 'widget-container');
            viewModel._svg = svg;
            viewModel._states = svg.append('g');
            d3.json('data/states.json', function(json) {
                viewModel._states.selectAll('path')
                    .data(json.features)
                    .enter()
                    .append('path')
                    .attr('d', path)
                    .attr('stroke', 'white')
                    .style('fill', function(d) {
                        return viewModel.coloring.value;
                    });
                viewModel._isRendered = true;
                viewModel.updateSvg();
            });
            renderGlyphs(viewModel);
        }
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
        this.glyphs = [];
        this._selectedGlyph = undefined;

        this.render = function() {
            renderMap(self);
        };

        this.updateSvg = function() {
            if (self._isRendered) {
                getElement(self).selectAll('svg').selectAll('path')
                .style('fill', function(d) {
                    return self.coloring.value;
                });
            }
        };

        //TODO: Make this less hacky
        subscribeObservable(window.wavedWorkspace.width, '_value', this.render);
        subscribeObservable(window.wavedWorkspace.height, '_value', this.render);

        //TODO: Use ColoringSelectionProperty
        this.coloring = new StringProperty({
            displayName: 'Color',
            value: 'grey',
            errorMessage: 'Must be a color name, hexidecimal number, or rgb color',
            onchange: self.updateSvg
        });

        this.glyphList = new ListProperty({
            displayName: 'Glyphs',
            options: this.glyphs,
            add: function() {
                var newGlyph = new GlyphViewModel({}, self._boundData);
                self._selectedGlyph = newGlyph;
                GlyphHelper.addEditGlyph().then(function(){
                    for (var i = 0; i < newGlyph.properties.length; i++) {
                        var property = newGlyph.properties[i];
                        property._value = newGlyph.properties[i]._displayValue;
                        if (property instanceof GlyphSizeSelectionProperty){
                            var p = property.value.properties;
                            for (var j = 0; j < p.length; j++) {
                                p[j]._value = p[j]._displayValue;
                            }
                        }
                    }
                    self.glyphs.push(newGlyph);
                    addGlyph(newGlyph, self);
                });
            },
            edit: function() {
                self._selectedGlyph = this.value;
                if (defined(self._selectedGlyph)) {
                    GlyphHelper.addEditGlyph().then(function() {
                        for (var i = 0; i < self._selectedGlyph.properties.length; i++) {
                            var property = self._selectedGlyph.properties[i];
                            property._value = self._selectedGlyph.properties[i]._displayValue;
                            if (property instanceof GlyphSizeSelectionProperty){
                                var p = property.value.properties;
                                for (var j = 0; j < p.length; j++) {
                                    p[j]._value = p[j]._displayValue;
                                }
                            }
                        }
                        editGlyph(self._selectedGlyph, self);
                    }, function() {
                        for (var i = 0; i < self._selectedGlyph.properties.length; i++) {
                            var property = self._selectedGlyph.properties[i];
                            property._displayValue = self._selectedGlyph.properties[i]._value;
                            if (property instanceof GlyphSizeSelectionProperty){
                                var p = property.value.properties;
                                for (var j = 0; j < p.length; j++) {
                                    p[j]._displayValue = p[j]._value;
                                }
                            }
                        }
                    });
                }
            },
            remove: function() {
                removeGlyph(this.value);
                UniqueTracker.removeItem(SuperComponentViewModel.getUniqueNameNamespace(), self.glyphList.value);
                self.glyphs.splice(self.glyphs.indexOf(self.glyphList.value), 1);
            }
        });

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
        state.glyphs = [];
        for(var i = 0; i < this.glyphs.length; i++) {
            state.glyphs.push(this.glyphs[i].getState());
        }

        return state;

    };

    USMapViewModel.prototype.setState = function(state) {
        WidgetViewModel.prototype.setState.call(this, state);

        if (defined(state.coloring)) {
            this.coloring.value = state.coloring.value;
        }

        if (defined(state.glyphs)){
            for(var i = 0; i < state.glyphs.length; i++) {
                this.glyphs.push(new GlyphViewModel(state.glyphs[i], this._boundData));
            }
        }
    };

    Object.defineProperties(USMapViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.x, this.y, this.width, this.visible, this.coloring,
                this.logGoogleAnalytics, this.glyphList];
            }
        }
    });

    return USMapViewModel;
});