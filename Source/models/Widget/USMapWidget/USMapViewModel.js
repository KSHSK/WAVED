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
        'util/displayMessage',
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
        displayMessage,
        subscribeObservable,
        ko,
        d3,
        $){
    'use strict';
    var glyphId = 0;

    function getElement(viewModel){
        return d3.select('#' + viewModel.id);
    }

    function renderGlyphs (viewModel) {
        var glyphs = viewModel.glyphs;
        for (var i = 0; i < glyphs.length; i++) {
            glyphs[i].add();
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
                if (!defined(self.boundData) || self.boundData.length === 0) {
                    displayMessage('Must bind data to map before adding glyph');
                } else {
                    var newGlyph = new GlyphViewModel({}, self);
                    this.options.push(newGlyph);
                    this.value = newGlyph;
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
                        newGlyph.add();
                    }, function() {
                        self.glyphs.splice(self.glyphs.indexOf(self.glyphList.value), 1);
                    });
                }
            },
            edit: function() {
                if (defined(this.value)) {
                    var selectedGlyph = this.value;
                    GlyphHelper.addEditGlyph().then(function() {
                        for (var i = 0; i < selectedGlyph.properties.length; i++) {
                            var property = selectedGlyph.properties[i];
                            property._value = selectedGlyph.properties[i]._displayValue;
                            if (property instanceof GlyphSizeSelectionProperty){
                                var p = property.value.properties;
                                for (var j = 0; j < p.length; j++) {
                                    p[j]._value = p[j]._displayValue;
                                }
                            }
                        }
                       selectedGlyph.edit();
                    }, function() {
                        for (var i = 0; i < selectedGlyph.properties.length; i++) {
                            var property = selectedGlyph.properties[i];
                            property._displayValue = selectedGlyph.properties[i]._value;
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
                this.value.remove();
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
                this.glyphs.push(new GlyphViewModel(state.glyphs[i], this));
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