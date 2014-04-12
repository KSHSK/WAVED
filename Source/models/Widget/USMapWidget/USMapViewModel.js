/*global console*/
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
        'modules/HistoryMonitor',
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
        HistoryMonitor,
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

    function removeGlyphs (viewModel) {
        var glyphs = viewModel.glyphs;
        for (var i = 0; i < glyphs.length; i++) {
            glyphs[i].remove();
        }
    }

    function renderMap (viewModel) {
        if (viewModel._ready) {
            var w = $('#waved-workspace').width();
            var w2 = w *viewModel.width.value/100;
            var h = $('#waved-workspace').height();
            var h2 = h * viewModel.width.value/100;
            removeGlyphs(viewModel);
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
            viewModel._states = svg.append('g')
                .attr('pointer-events', 'none');
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
            this.name.originalValue = this.id;
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
                    var options = this.options;
                    options.push(newGlyph);
                    this.value = newGlyph;
                    GlyphHelper.addEditGlyph().then(function(){
                        for (var i = 0; i < newGlyph.properties.length; i++) {
                            var property = newGlyph.properties[i];
                            property._originalValue = newGlyph.properties[i]._displayValue;
                            if (property instanceof GlyphSizeSelectionProperty){
                                var p = property.value.properties;
                                for (var j = 0; j < p.length; j++) {
                                    p[j]._originalValue = p[j]._displayValue;
                                }
                            }
                        }
                        newGlyph.add();

                        var historyMonitor = HistoryMonitor.getInstance();

                        // Undo by removing the item.
                        historyMonitor.addUndoChange(function() {
                            UniqueTracker.removeItem(SuperComponentViewModel.getUniqueNameNamespace(), self.glyphList.value);
                            options.splice(options.indexOf(newGlyph), 1);
                            newGlyph.remove();
                        });

                        // Redo by readding the item.
                        historyMonitor.addRedoChange(function() {
                            var success = UniqueTracker.addValueIfUnique(SuperComponentViewModel.getUniqueNameNamespace(),
                                newGlyph.name.value, newGlyph);

                            if (!success) {
                                console.log('New Component name was not unique.');
                                return;
                            }
                            newGlyph.add();
                            options.push(newGlyph);
                        });

                    }, function() {
                        this.options.splice(this.options.indexOf(this.value), 1);
                    });
                }
            },
            edit: function() {
                if (defined(this.value)) {
                    var selectedGlyph = this.value;
                    var originalState;
                    var newState;
                    GlyphHelper.addEditGlyph().then(function() {
                        originalState = selectedGlyph.getState();
                        for (var i = 0; i < selectedGlyph.properties.length; i++) {
                            var property = selectedGlyph.properties[i];
                            property._originalValue = selectedGlyph.properties[i]._displayValue;
                            if (property instanceof GlyphSizeSelectionProperty){
                                var p = property.value.properties;
                                for (var j = 0; j < p.length; j++) {
                                    p[j]._originalValue = p[j]._displayValue;
                                }
                            }
                        }
                       selectedGlyph.edit();
                       newState = selectedGlyph.getState();

                       var historyMonitor = HistoryMonitor.getInstance();

                       historyMonitor.addUndoChange(function() {
                           selectedGlyph.setState(originalState);
                           selectedGlyph.edit();
                       });

                       historyMonitor.addRedoChange(function() {
                           selectedGlyph.setState(newState);
                           selectedGlyph.edit();
                       });

                    }, function() {
                        for (var i = 0; i < selectedGlyph.properties.length; i++) {
                            var property = selectedGlyph.properties[i];
                            property._displayValue = selectedGlyph.properties[i]._originalValue;
                            if (property instanceof GlyphSizeSelectionProperty){
                                var p = property.value.properties;
                                for (var j = 0; j < p.length; j++) {
                                    p[j]._displayValue = p[j]._originalValue;
                                }
                            }
                        }
                    });
                }
            },
            remove: function() {
                var options = this.options;
                var value = this.value;
                value.remove();
                UniqueTracker.removeItem(SuperComponentViewModel.getUniqueNameNamespace(), self.glyphList.value);
                options.splice(this.options.indexOf(value), 1);

                var historyMonitor = HistoryMonitor.getInstance();

                historyMonitor.addUndoChange(function() {
                    var success = UniqueTracker.addValueIfUnique(SuperComponentViewModel.getUniqueNameNamespace(),
                        value.name.value, value);

                    if (!success) {
                        console.log('New Component name was not unique.');
                        return;
                    }
                    options.push(value);
                    value.add();
                });

                historyMonitor.addRedoChange(function() {
                    value.remove();
                    UniqueTracker.removeItem(SuperComponentViewModel.getUniqueNameNamespace(), self.glyphList.value);
                    options.splice(options.indexOf(value), 1);
                });
            }
        });

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
        state.glyphs = [];
        for(var i = 0; i < this.glyphs.length; i++) {
            state.glyphs.push(this.glyphs[i].getState());
        }

        return state;

    };

    USMapViewModel.prototype.setState = function(state) {
        WidgetViewModel.prototype.setState.call(this, state);

        if (defined(state.coloring)) {
            this.coloring.originalValue = state.coloring.value;
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