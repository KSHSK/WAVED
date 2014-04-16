/*global console*/
define([
        'models/Event/Trigger',
        'models/Property/Coloring/ColoringSelectionProperty',
        'models/Property/GlyphSize/GlyphSizeSelectionProperty',
        'models/Property/StringProperty',
        'models/ComponentViewModel',
        'models/Property/ListProperty',
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
        ComponentViewModel,
        ListProperty,
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

    function removeGlyph(options, value) {
        value.remove();
        UniqueTracker.removeItem(ComponentViewModel.getUniqueNameNamespace(), value);
        options.splice(options.indexOf(value), 1);
    }

    function addGlyph(options, value) {
        var success = UniqueTracker.addValueIfUnique(ComponentViewModel.getUniqueNameNamespace(),
            value.name.value, value);

        if (!success) {
            console.log('New Component name was not unique.');
            return;
        }
        options.push(value);
        value.add();
    }

    function addSuccess(options, value) {
        value.properties[5]._originalValue = value.properties[5]._displayValue; //set lat lon first for validation
        value.properties[5]._value = value.properties[5]._displayValue;
        value.properties[6]._originalValue = value.properties[6]._displayValue;
        value.properties[6]._value = value.properties[6]._displayValue;

        for (var i = 0; i < value.properties.length; i++) {
            var property = value.properties[i];
            property._originalValue = property._displayValue;
            if (property instanceof GlyphSizeSelectionProperty){
                var p = property.value.properties;
                for (var j = p.length - 1; j >= 0 ; j--) { // Reversed to get dataField before dataSet for scaled size
                    p[j]._originalValue = p[j]._displayValue;
                    p[j]._value = p[j]._displayValue;
                }
            }
        }
        value.add();

        var historyMonitor = HistoryMonitor.getInstance();

        // Undo by removing the item.
        historyMonitor.addUndoChange(function() {
            removeGlyph(options, value);
        });

        // Redo by readding the item.
        historyMonitor.addRedoChange(function() {
            addGlyph(options, value);
        });
    }

    function editSuccess(value) {
        var originalState = value.getState();

        value.properties[5]._originalValue = value.properties[5]._displayValue; // set lat lon first for validation
        value.properties[5]._value = value.properties[5]._displayValue;
        value.properties[6]._originalValue = value.properties[6]._displayValue;
        value.properties[6]._value = value.properties[6]._displayValue;

        for (var i = 0; i < value.properties.length; i++) {
            var property = value.properties[i];
            property._originalValue = property._displayValue;
            if (property instanceof GlyphSizeSelectionProperty){
                var p = property.value.properties;
                for (var j = 0; j < p.length; j++) {
                    p[j]._originalValue = p[j]._displayValue;
                    p[j]._value = p[j]._displayValue;
                }
            }
        }
        value.edit();
       var newState = value.getState();

       var historyMonitor = HistoryMonitor.getInstance();

       historyMonitor.addUndoChange(function() {
           value.setState(originalState);
           value.edit();
       });

       historyMonitor.addRedoChange(function() {
           value.setState(newState);
           value.edit();
       });
    }

    function  editFailure(value) {
        for (var i = 0; i < value.properties.length; i++) {
            var property = value.properties[i];
            property._displayValue = value.properties[i]._originalValue;
            if (property instanceof GlyphSizeSelectionProperty){
                var p = property.value.properties;
                for (var j = 0; j < p.length; j++) {
                    p[j]._displayValue = p[j]._originalValue;
                }
            }
        }
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
                    GlyphHelper.addEditGlyph(newGlyph).then(function() {
                        addSuccess(options, newGlyph);
                    }, function () {
                        options.splice(options.indexOf(newGlyph), 1);
                    });
                }
            },
            edit: function() {
                if (defined(this.value)) {
                    var value = this.value;
                    GlyphHelper.addEditGlyph(value).then(function() {
                        editSuccess(value);
                    }, function() {
                        editFailure(value);
                    });
                }
            },
            remove: function() {
                var options = this.options;
                var value = this.value;

                if (defined(value)) {
                    removeGlyph(options, value);
                    var historyMonitor = HistoryMonitor.getInstance();

                    historyMonitor.addUndoChange(function() {
                        addGlyph(options, value);
                    });

                    historyMonitor.addRedoChange(function() {
                        removeGlyph(options, value);
                    });
                }
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

    USMapViewModel.prototype.usesDataSet = function(dataSet) {
        // TODO: Once Coloring and Glyphs are implemented, this will need to be implemented.
        return false;
    };

    Object.defineProperties(USMapViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.x, this.y, this.width, this.coloring, this.visible,
                this.logGoogleAnalytics, this.glyphList];
            }
        }
    });

    return USMapViewModel;
});