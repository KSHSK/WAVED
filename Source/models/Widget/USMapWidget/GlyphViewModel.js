define([
        'models/ComponentViewModel',
        'models/Property/ArrayProperty',
        'models/Property/BooleanProperty',
        'models/Property/StringProperty',
        'models/Property/NumberProperty',
        'models/Constants/GlyphSizeSchemeType',
        'models/Property/GlyphSize/GlyphSizeSelectionProperty',
        'modules/UniqueTracker',
        'modules/GlyphHelper',
        'util/defined',
        'util/createValidator',
        'util/subscribeObservable',
        'knockout',
        'd3',
        'jquery'
    ], function(
        ComponentViewModel,
        ArrayProperty,
        BooleanProperty,
        StringProperty,
        NumberProperty,
        GlyphSizeSchemeType,
        GlyphSizeSelectionProperty,
        UniqueTracker,
        GlyphHelper,
        defined,
        createValidator,
        subscribeObservable,
        ko,
        d3,
        $) {
    'use strict';

    var radiusScale = d3.scale.linear()
        .domain([1000,500000])
        .range([2,10])
        .clamp(true);

    function getElement(viewModel) {
        return d3.select('#' + viewModel.id);
    }

    function removeGlyph(glyph) {
        var child = document.getElementById(glyph.id);
        if (child !== null) {
            child.parentNode.removeChild(child);
        }
        glyph._dom = undefined;
    }

    function editGlyph(glyph) {
        if (!defined(glyph._dom)) {
            return;
        }

        if (!glyph.visible.value) {
            glyph._dom.attr('class', 'hide');
            return;
        } else {
            glyph._dom.attr('class', 'show');
        }

        var data = glyph.dataSet.value.data;

        glyph._dom.selectAll('circle').remove();
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
            var value;
            if (glyph.size.value.getType() === GlyphSizeSchemeType.SCALED_SIZE) {
                value = radiusScale(d[glyph.size.value.dataField.value]);
            } else {
                value = glyph.size.value.size.value*glyph.parent.width.value/100;
            }
            if (value !== null && value > 0 && !isNaN(value)) {
                return value;
            }
        })
        .style('fill', glyph.color.value)
        .style('opacity', glyph.opacity.value/100)
        .style('z-index', glyph.z.value);
    }

    function addGlyph(glyph, id) {
        if (defined(glyph._dom)) {
            return;
        }

        var w2 = $('#waved-workspace').width() * glyph.parent.width.value/100;
        var h2 = $('#waved-workspace').height() * glyph.parent.width.value/100;
        var svg = getElement(glyph.parent)
            .append('svg')
            .attr('height', h2)
            .attr('width', w2)
            .attr('class', 'widget-container')
            .style('top', '0')
            .style('left', '0')
            .attr('id', glyph.id);

        glyph._dom = svg.append('g');

        editGlyph(glyph);
    }

    var GlyphViewModel = function(state, parent) {
        var self = this;
        state = (defined(state)) ? state : {};
        ComponentViewModel.call(this, state);

        if (!defined(state.name)) {
            var namespace = ComponentViewModel.getUniqueNameNamespace();
            this.name.value = UniqueTracker.getDefaultUniqueValue(namespace, GlyphViewModel.getType(), this);
            this.name.displayValue = this.name.value; // Don't rely on the subscription here, we need this to go through the setter for proper error flags
        }

        this.parent = parent;

        this.dataSet = new ArrayProperty({
            displayName: 'Data Set',
            errorMessage: 'Value is required.',
            exportProperty: 'dataSet',
            dataSetType: true,
            options: this.parent.boundData,
            getOptionText: function(value) {
                return value.displayName;
            }
        });

        this.color = new StringProperty({
            displayName: 'Color',
            value: 'Red',
            exportProperty: 'color',
            validValue: createValidator({
                minLength: 1
            }),
            errorMessage: 'Value is required.',
            onchange: editGlyph.bind(self, self)
        });

        this.opacity = new NumberProperty({
            displayName: 'Opacity',
            value: 50,
            exportProperty: 'opacity',
            validValue: createValidator({
                min: 0,
                max: 100
            }),
            errorMessage: 'Value must be between 0 and 100.',
            onchange: editGlyph.bind(self, self)
        });

        this.size = new GlyphSizeSelectionProperty({
            displayName: 'Size',
            exportProperty: 'size',
            errorMessage: 'All size fields are required.',
            onchange: editGlyph.bind(self, self)
        }, this);

        this.latitude = new ArrayProperty({
            displayName: 'Latitude',
            exportProperty: 'latitude',
            errorMessage: 'Value is required.',
            options: [],
            onchange: editGlyph.bind(self, self)
        });

        this.longitude = new ArrayProperty({
            displayName: 'Longitude',
            exportProperty: 'longitude',
            errorMessage: 'Value is required.',
            options: [],
            onchange: editGlyph.bind(self, self)
        });

        this.visible.onchange = editGlyph.bind(self, self);

        // Change the data field options.
        this.dataSet.ondisplaychange = function(newValue) {
            if (self.latitude.options !== newValue.dataFields) {
                self.latitude.options = newValue.dataFields;
            }

            if (self.longitude.options !== newValue.dataFields) {
                self.longitude.options = newValue.dataFields;
            }

            // Update scaled size glyphs
            if (self.size.scaledGlyphSize.dataSet.value !== newValue) {
                self.size.scaledGlyphSize.dataSet.value = newValue;
                self.size.scaledGlyphSize.dataSet.displayValue = newValue; // Go through the setter for validation to clear any errors
            }
            if (self.size.scaledGlyphSize.dataField.options !== newValue.dataFields) {
                self.size.scaledGlyphSize.dataField.options = newValue.dataFields;
            }
        };

        // The subscription for the current dataSet's '_data' property.
        this.dataSetSubscription = undefined;

        this.dataSet.onchange = function(newValue) {
            if (defined(self.dataSetSubscription)) {
                self.dataSetSubscription.dispose();
            }

            // Need to update the glyphs if dataSet's '_data' property has changed.
            subscribeObservable(self.dataSet.value, '_data', function() {
                editGlyph(self);
            });

            editGlyph(self);
        };

        this.setState(state);
        this.id = this.name.value;
        this._dom = undefined;

        // USMapViewModel is set at 0, Glyphs sit on top of the map, don't let anything slip between them
        this.z.originalValue = 1;

        this.add = function() {
            self.dataSet.value.executeWhenDataLoaded(function() {
                addGlyph(self);
            });
        };

        this.edit = function() {
            self.dataSet.value.executeWhenDataLoaded(function() {
                editGlyph(self);
            });
        };

        this.remove = function() {
            removeGlyph(self);
        };

        this.renderFunctionName = 'renderGlyphs';

        ko.track(this);
    };

    GlyphViewModel.prototype = Object.create(ComponentViewModel.prototype);

    GlyphViewModel.prototype.usesDataSet = function(dataSet) {
        if (this.dataSet.value === dataSet) {
            return true;
        }

        /*
         * The dataset used in the scaled glyph size scheme is not checked here because that dataset
         * shadows the GlyphViewModel's dataset.
         */

        return false;
    };

    GlyphViewModel.prototype.glyphDialogHasErrors = function() {
        return GlyphHelper.hasErrors(this);
    };

    GlyphViewModel.prototype.getState = function() {
        var state = ComponentViewModel.prototype.getState.call(this);
        state.type = GlyphViewModel.getType();
        state.dataSet = this.dataSet.getState().value.name;
        state.color = this.color.getState();
        state.opacity = this.opacity.getState();
        state.size = this.size.getState();
        state.latitude = this.latitude.getState();
        state.longitude = this.longitude.getState();

        return state;
    };

    GlyphViewModel.prototype.setState = function(state) {
        ComponentViewModel.prototype.setState.call(this, state);
        var self = this;
        if (defined(state.dataSet)) {
            this.boundData.forEach(function(entry) {
                if(defined(state.dataSet) && (state.dataSet === entry.name)) {
                    self.dataSet.originalValue = entry;
                }
            });
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

    // Returns undefined if the given key does not need to be overridden.
    GlyphViewModel.prototype.exportActionCorrection = function(group, key) {
        if (key === 'size' && group.type === GlyphSizeSchemeType.SCALED_SIZE) {
            // Override scaled glyph size since the action newValues has DataSet information in an incorrect format.
            // This puts it in line with what scaled glyph size getState returns.

            return {
                'dataSet': group.dataSet.value.name,
                'dataField': group.dataField.value,
                'type': group.type
            };
        }

        if (key === 'dataSet') {
            // Override dataSet since the action newValues has information in an incorrect format.
            // This puts it in line with what dataSet getState returns.
            return group.name;
        }
    };

    /**
     * Static method that returns the type String for this class.
     */
    GlyphViewModel.getType = function() {
        return 'Glyph';
    };

    Object.defineProperties(GlyphViewModel.prototype, {
        viewModel: {
            get: function() {
                return this;
            }
        },
        properties: {
            get: function() {
                return [this.name, this.color, this.opacity, this.dataSet, this.latitude, this.longitude, this.size, this.visible,
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