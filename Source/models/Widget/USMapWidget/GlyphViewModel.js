define([
        'models/ComponentViewModel',
        'models/SuperComponentViewModel',
        'models/Property/ArrayProperty',
        'models/Property/StringProperty',
        'models/Property/NumberProperty',
        'models/Constants/GlyphSizeSchemeType',
        'models/Property/GlyphSize/GlyphSizeSelectionProperty',
        'modules/UniqueTracker',
        'util/defined',
        'knockout',
        'd3',
        'jquery'
    ], function(
        ComponentViewModel,
        SuperComponentViewModel,
        ArrayProperty,
        StringProperty,
        NumberProperty,
        GlyphSizeSchemeType,
        GlyphSizeSelectionProperty,
        UniqueTracker,
        defined,
        ko,
        d3,
        $) {
    'use strict';

    var radiusScale = d3.scale.linear()
        .domain([1000,500000])
        .range([2,10])
        .clamp(true);

    function getElement(viewModel){
        return d3.select('#' + viewModel.id);
    }

    function removeGlyph(glyph) {
        var child = document.getElementById(glyph.id);
        child.parentNode.removeChild(child);
        glyph._dom = undefined;
        glyph.id = undefined;
    }

    function editGlyph(glyph) {
        var data = glyph.dataSet.value.data;

        glyph._dom.selectAll('circle').data(data)
        .attr('cx', function(d, i) {
            var coords = glyph.parent._projection([d[glyph.longitude.value], d[glyph.latitude.value]]);
            if (coords !== null) {
                return coords[0];
            }
        })
        .attr('cy', function(d, i) {
            var coords = glyph.parent._projection([d[glyph.longitude.value], d[glyph.latitude.value]]);
            if (coords !== null) {
                return coords[1];
            }
        })
        .attr('r', function(d, i) {
            if (glyph.size.value.type === GlyphSizeSchemeType.SCALED_SIZE) {
                return radiusScale(d[glyph.size.value.dataField.value]);
            } else {
                return glyph.size.value.size.value*glyph.parent.width.value/100;
            }
        })
        .style('fill', glyph.color.value)
        .style('opacity', glyph.opacity.value/100);
    }

    function addGlyph(glyph, id) {
        var w2 = $('#waved-workspace').width() * glyph.parent.width.value/100;
        var h2 = $('#waved-workspace').height() * glyph.parent.width.value/100;
        var svg = getElement(glyph.parent)
            .append('svg')
            .attr('height', h2)
            .attr('width', w2)
            .attr('class', 'widget-container')
            .attr('id', glyph.id);


        var data = glyph.dataSet.value.data;
        glyph._dom = svg.append('g');

        glyph._dom.selectAll('circle').data(data)
        .enter().append('circle')
        .attr('cx', function(d, i) {
            var coords = glyph.parent._projection([d[glyph.longitude.value], d[glyph.latitude.value]]);
            if (coords !== null) {
                return coords[0];
            }
        })
        .attr('cy', function(d, i) {
            var coords = glyph.parent._projection([d[glyph.longitude.value], d[glyph.latitude.value]]);
            if (coords !== null) {
                return coords[1];
            }
        })
        .attr('r', function(d, i) {
            if (glyph.size.value.type === GlyphSizeSchemeType.SCALED_SIZE) {
                return radiusScale(d[glyph.size.value.dataField.value]);
            } else {
                return glyph.size.value.size.value*glyph.parent.width.value/100;
            }
        })
        .style('fill', glyph.color.value)
        .style('opacity', glyph.opacity.value/100);
    }

    var GlyphViewModel = function(state, parent) {
        var self = this;
        state = (defined(state)) ? state : {};
        ComponentViewModel.call(this, state);

        if (!defined(state.name)) {
            var namespace = SuperComponentViewModel.getUniqueNameNamespace();
            this.name.value = UniqueTracker.getDefaultUniqueValue(namespace, GlyphViewModel.getType(), this);
        }
        this.id = this.name.value;

        this.parent = parent;

        this.dataSet = new ArrayProperty({
            displayName: 'Data Set',
            options: this.parent.boundData,
            getOptionText: function(value) {
                return value.getNameAndFilename();
            },
            ondisplaychange: function(newValue){
                self.latitude.options = newValue.dataFields;
                self.longitude.options = newValue.dataFields;
            }
        });
        this.color = new StringProperty({
            displayName: 'Color',
            value: 'Red'
        });
        this.opacity = new NumberProperty({
            displayName: 'Opacity',
            value: 80
        });
        this.size = new GlyphSizeSelectionProperty({
            displayName: 'Size',
            value: ''
        }, this);

        this.latitude = new ArrayProperty({
            displayName: 'Latitude'
        });

        this.longitude = new ArrayProperty({
            displayName: 'Longitude'
        });

        this.setState(state);

        this._dom = undefined;

        this.add = function() {
            addGlyph(self);
        };
        this.edit = function() {
            editGlyph(self);
        };
        this.remove = function() {
            removeGlyph(self);
        };

        ko.track(this);
    };

    GlyphViewModel.prototype = Object.create(ComponentViewModel.prototype);

    GlyphViewModel.prototype.getState = function() {
        var state = ComponentViewModel.prototype.getState.call(this);
        state.type = GlyphViewModel.getType();
        state.dataSet = this.dataSet.getState();
        state.color = this.color.getState();
        state.opacity = this.opacity.getState();
        state.size = this.size.getState();
        state.latitude = this.latitude.getState();
        state.longitude = this.longitude.getState();

        return state;
    };

    GlyphViewModel.prototype.setState = function(state) {
        ComponentViewModel.prototype.setState.call(this, state);

        if (defined(state.dataSet)) {
            this.dataSet.setState(state.dataSet);
        }
        if (defined(state.color)) {
            this.color.setState(state.color);
        }
        if (defined(state.opacity)) {
            this.opacity.setState(state.opacity);
        }
        if (defined(state.size)) {
            this.size.setState(state.size, this);
        }
        if (defined(state.latitude)) {
            this.latitude.setState(state.latitude);
        }
        if (defined(state.longitude)) {
            this.longitude.setState(state.longitude);
        }
    };

    /**
     * Static method that returns the type String for this class.
     */
    GlyphViewModel.getType = function() {
        return 'Glyph';
    };

    Object.defineProperties(GlyphViewModel.prototype, {
        properties: {
            get: function() {
                return [this.name, this.dataSet, this.color, this.opacity, this.size, this.latitude, this.longitude, this.visible,
                this.logGoogleAnalytics];
            }
        },

        boundData : {
            get : function() {
                return this.parent.boundData;
            }
        }
    });

    return GlyphViewModel;
});