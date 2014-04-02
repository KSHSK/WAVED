define([
        'models/Event/Trigger',
        'models/Property/Coloring/ColoringSelectionProperty',
        'models/Property/StringProperty',
        'models/Property/ListProperty',
        'models/SuperComponentViewModel',
        'models/Widget/WidgetViewModel',
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
        StringProperty,
        ListProperty,
        SuperComponentViewModel,
        WidgetViewModel,
        GlyphViewModel,
        UniqueTracker,
        GlyphHelper,
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
        this.glyphs = [];
        this._selectedGlyph = undefined;

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
                        newGlyph.properties[i]._value = newGlyph.properties[i]._displayValue;
                    }
                    self.glyphs.push(newGlyph);
                });
            },
            edit: function() {
                self._selectedGlyph = this.value;
                GlyphHelper.addEditGlyph().then(function() {
                    for (var i = 0; i < self._selectedGlyph.properties.length; i++) {
                        self._selectedGlyph.properties[i]._value = self._selectedGlyph.properties[i]._displayValue;
                    }
                }, function() {
                    for (var i = 0; i < self._selectedGlyph.properties.length; i++) {
                        self._selectedGlyph.properties[i]._displayValue = self._selectedGlyph.properties[i]._value;
                    }
                });
            },
            remove: function() {
                UniqueTracker.removeItem(SuperComponentViewModel.getUniqueNameNamespace(), self.glyphList.value);
                self.glyphs.splice(self.glyphs.indexOf(self.glyphList.value));
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