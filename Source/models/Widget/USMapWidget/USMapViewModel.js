/*global console*/
define([
        'models/Constants/GlyphSizeSchemeType',
        'models/Constants/MessageType',
        'models/Event/Trigger',
        'models/Property/Coloring/ColoringScheme',
        'models/Property/Coloring/ColoringSelectionProperty',
        'models/Property/Coloring/SolidColoringScheme',
        'models/Constants/ColoringSchemeType',
        'models/Property/GlyphSize/GlyphSizeSelectionProperty',
        'models/Property/StringProperty',
        'models/ComponentViewModel',
        'models/Property/ListProperty',
        'models/Widget/WidgetViewModel',
        'modules/DisplayMessage',
        'modules/DependencyChecker',
        'modules/GlyphHelper',
        'modules/HistoryMonitor',
        'modules/ReadData',
        'modules/UniqueTracker',
        './GlyphViewModel',
        'util/createValidator',
        'util/defined',
        'util/subscribeObservable',
        'knockout',
        'd3',
        'jquery'
    ],function(
        GlyphSizeSchemeType,
        MessageType,
        Trigger,
        ColoringScheme,
        ColoringSelectionProperty,
        SolidColoringScheme,
        ColoringSchemeType,
        GlyphSizeSelectionProperty,
        StringProperty,
        ComponentViewModel,
        ListProperty,
        WidgetViewModel,
        DisplayMessage,
        DependencyChecker,
        GlyphHelper,
        HistoryMonitor,
        ReadData,
        UniqueTracker,
        GlyphViewModel,
        createValidator,
        defined,
        subscribeObservable,
        ko,
        d3,
        $){
    'use strict';
    var STATES_DATA_FILE = 'states.json';

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

    var addStateDataToTrigger = function(viewModel, d) {
        var name = d.properties.name;
        var abbrev = d.properties.abbreviation;
        viewModel._trigger.addData('state', name);
        viewModel._trigger.addData('stateAbbreviation', abbrev);

        // Iterate through each bound DataSet and add data values to the trigger
        // only for the state matching the specified name.
        for (var i = 0; i < viewModel._boundData.length; i++) {
            var data = viewModel._boundData[i].data;
            for (var j = 0; j < data.length; j++) {
                for (var key in data[j]) {
                    var lowerVal = data[j][key].toLowerCase();
                    if (lowerVal === name.toLowerCase() || lowerVal === abbrev.toLowerCase()) {
                        for (var k in data[j]) {
                            viewModel._trigger.addData(viewModel._boundData[i].name, k, data[j][k]);
                        }
                        break;
                    }
                }
            }
        }
    };

    function renderMap (viewModel) {
        if (viewModel._ready) {
            var w = $('#waved-workspace').width();
            var w2 = w * viewModel.width.value/100;
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
                .attr('width', w2);
            viewModel._svg = svg;
            viewModel._states = svg.append('g');
            var statesDataPath = ReadData.getFilePath(STATES_DATA_FILE);
            d3.json(statesDataPath, function(json) {
                viewModel._states.selectAll('path')
                    .data(json.features)
                    .enter()
                    .append('path')
                    .attr('d', path)
                    .attr('stroke', 'white')
                    .style('fill', function(d) {
                        return viewModel.coloring.value;
                    })
                    .on('mouseover', function(d) {
                        addStateDataToTrigger(viewModel, d);
                    })
                    .on('mousemove', function(d) {
                        addStateDataToTrigger(viewModel, d);
                    })
                    .on('mouseout', function(d) {
                        addStateDataToTrigger(viewModel, d);
                    })
                    .on('click', function(d) {
                        addStateDataToTrigger(viewModel, d);
                    });
                viewModel._isRendered = true;
                viewModel.updateSvg();
                updateColoring(viewModel);
            });
            renderGlyphs(viewModel);
        }
    }

    function updateColoring(viewModel) {
        if(!viewModel._isRendered || !defined(viewModel.coloring.value) || !defined(viewModel.strokeColor.value)) {
            return;
        }

        var coloringScheme = viewModel.coloring.value;
        var path = viewModel._states.selectAll('path');

        path.style('stroke', function(d) {
            return viewModel.strokeColor.value;
        });

        // Every time a color is used here, it should be converted toLowerCase() to be consistent across the board
        switch(coloringScheme.getType()){
            case ColoringSchemeType.SOLID_COLORING:
                path.style('fill', function(d) {
                    return defined(coloringScheme.color.value) ? coloringScheme.color.value.toLowerCase() : viewModel.DEFAULT_MAP_COLOR.toLowerCase();
                });
                break;
            case ColoringSchemeType.FOUR_COLORING:
                path.style('fill', function(d) {
                    var stateName = d.properties.name;
                    for(var i=0; i < viewModel.fourColorStateGroupings.length; i++){
                        if(viewModel.fourColorStateGroupings[i].indexOf(stateName) !== -1){
                            return coloringScheme.getColorArray()[i].toLowerCase();
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
                        return viewModel.DEFAULT_MAP_COLOR.toLowerCase();
                    });
                    break;
                }

                coloringScheme.dataSet.value.executeWhenDataLoaded(function() {
                    // Find the min and max values for the dataField we're using to scale the gradient
                    var dataField = coloringScheme.dataField.value;
                    var min = d3.min(coloringScheme.dataSet.value.data, function(d) { return +d[dataField]; });
                    var max = d3.max(coloringScheme.dataSet.value.data, function(d) { return +d[dataField]; });

                    // Default the map to black when we can't extract an actual min or max (the field is not numeric)
                    if(!defined(min) || !defined(max)){
                        path.style('fill', function(d){
                            return viewModel.DEFAULT_MAP_COLOR.toLowerCase();
                        });
                    }

                    // Set up the gradient function
                    // Color names must be lowercase or this won't work due to the range function not liking caps
                    var gradient = d3.scale.linear().domain([min, max]).range([coloringScheme.startColor.value.toLowerCase(), coloringScheme.endColor.value.toLowerCase()]);
                    path.style('fill', function(d) {
                        var stateName = d.properties.name.toLowerCase();
                        var stateAbbrev = d.properties.abbreviation.toLowerCase();
                        var keyName = coloringScheme.keyField.value;

                        if(!defined(keyName)){
                            return viewModel.DEFAULT_MAP_COLOR;
                        }

                        for(var i=0; i<coloringScheme.dataSet.value.data.length; i++){
                            var currentValue = coloringScheme.dataSet.value.data[i][keyName] || '';
                            currentValue = currentValue.toLowerCase();
                            if(currentValue === stateName || currentValue === stateAbbrev){
                                return gradient(coloringScheme.dataSet.value.data[i][dataField]);
                            }

                            // Didn't find any matches
                            if(i === coloringScheme.dataSet.value.data.length-1){
                                return viewModel.DEFAULT_MAP_COLOR;
                            }
                        }
                    });
                });
                break;
            default:
                break;
        }
    }

    function removeGlyph(options, glyph) {
        var response = DependencyChecker.allowedToDeleteComponent(glyph);

        if (response.allowed) {
            glyph.remove();
            UniqueTracker.removeItem(ComponentViewModel.getUniqueNameNamespace(), glyph);
            options.splice(options.indexOf(glyph), 1);
            return true;
        }

        DisplayMessage.show(response.message, MessageType.WARNING);

        return false;
    }

    function addGlyph(options, glyph, index) {
        var success = UniqueTracker.addValueIfUnique(ComponentViewModel.getUniqueNameNamespace(),
            glyph.name.value, glyph);

        if (!success) {
            console.log('New Component name was not unique.');
            return;
        }

        if (defined(index)) {
            options.splice(index, 0, glyph);
        } else {
            options.push(glyph);
        }

        glyph.add();
    }

    function addSuccess(options, glyph) {
        options.push(glyph);
        //set lat lon first for validation reasons
        glyph.latitude.originalValue = glyph.latitude.displayValue;
        glyph.latitude.value = glyph.latitude.displayValue;
        glyph.longitude.originalValue = glyph.longitude.displayValue;
        glyph.longitude.value = glyph.longitude.displayValue;

        // Reversed to get GlyphSizeSelectionProperty (its scaled size dataField) before dataSet is changed.
        for (var i = glyph.properties.length - 1; i >= 0; i--) {
            var property = glyph.properties[i];
            property._originalValue = property._displayValue;

            if (property instanceof GlyphSizeSelectionProperty){
                var p = property.value.properties;

                // Reversed to get dataField before dataSet for scaled size
                for (var j = p.length - 1; j >= 0 ; j--) {
                    p[j].originalValue = p[j].displayValue;
                    p[j].value = p[j].displayValue;
                }
            }
        }
        glyph.add();

        var historyMonitor = HistoryMonitor.getInstance();

        // Undo by removing the item.
        historyMonitor.addUndoChange(function() {
            removeGlyph(options, glyph);
        });

        // Redo by readding the item.
        historyMonitor.addRedoChange(function() {
            addGlyph(options, glyph);
        });
    }

    function editSuccess(glyph) {
        var originalState = glyph.getState();

        glyph.latitude.originalValue = glyph.latitude.displayValue;
        glyph.latitude.value = glyph.latitude.displayValue;
        glyph.longitude.originalValue = glyph.longitude.displayValue;
        glyph.longitude.value = glyph.longitude.displayValue;

        // Reversed to get GlyphSizeSelectionProperty (its scaled size dataField) before dataSet is changed.
        for (var i = glyph.properties.length - 1; i >= 0; i--) {
            var property = glyph.properties[i];
            property._originalValue = property._displayValue;

            if (property instanceof GlyphSizeSelectionProperty){
                var p = property.value.properties;

                // Reversed to get dataField before dataSet for scaled size
                for (var j = p.length - 1; j >= 0 ; j--) {
                    p[j].originalValue = p[j].displayValue;
                    p[j].value = p[j].displayValue;
                }
            }
        }
        glyph.edit();
        var newState = glyph.getState();

        var historyMonitor = HistoryMonitor.getInstance();

        historyMonitor.addUndoChange(function() {
            glyph.setState(originalState);
            glyph.latitude.options = glyph.dataSet.value.dataFields;
            glyph.longitude.options = glyph.dataSet.value.dataFields;
            glyph.latitude.value = originalState.latitude.value;
            glyph.longitude.value = originalState.longitude.value;
            glyph.edit();
        });

        historyMonitor.addRedoChange(function() {
            glyph.setState(newState);
            glyph.latitude.options = glyph.dataSet.value.dataFields;
            glyph.longitude.options = glyph.dataSet.value.dataFields;
            glyph.latitude.value = newState.latitude.value;
            glyph.longitude.value = newState.longitude.value;
            glyph.edit();
       });
    }

    function  editFailure(glyph) {
        for (var i = 0; i < glyph.properties.length; i++) {
            var property = glyph.properties[i];
            property.displayValue = glyph.properties[i].originalValue;
            if (property instanceof GlyphSizeSelectionProperty){
                var p = property.value.properties;
                for (var j = p.length - 1; j >= 0 ; j--) {
                    p[j].displayValue = p[j].originalValue;
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
            // TODO: Keeping this around since it might be useful for general svg updates
        };

        //TODO: Make this less hacky
        subscribeObservable(window.wavedWorkspace.width, '_value', this.render);
        subscribeObservable(window.wavedWorkspace.height, '_value', this.render);

        this.coloring = new ColoringSelectionProperty({
            displayName: 'Color Scheme',
            value: '',
            onchange: function() {
                updateColoring(self);
            }
        }, this);

        // Default to black strokes
        this.strokeColor = new StringProperty({
            displayName: 'Stroke Color',
            value: 'Black',
            onchange: function() {
                updateColoring(self);
            },
            validValue: function(value) {
                return defined(value) && (value.trim() !== '');
            }
        }, this);

        this.glyphList = new ListProperty({
            displayName: 'Glyphs',
            options: this.glyphs,
            add: function() {
                if (!defined(self.boundData) || self.boundData.length === 0) {
                    DisplayMessage.show('Must bind data to map before adding glyph', MessageType.WARNING);
                } else {
                    var newGlyph = new GlyphViewModel({}, self);
                    var options = this.options;

                    // Force this glyph to be the value by not using the setter.
                    this._value = newGlyph;

                    var that = this;
                    GlyphHelper.addEditGlyph(newGlyph).then(function() {
                        addSuccess(options, newGlyph);
                    }, function() {
                        that._value = undefined;
                        UniqueTracker.removeItem(ComponentViewModel.getUniqueNameNamespace(), newGlyph);
                    });
                }
            },
            edit: function() {
                if (defined(this.value)) {
                    var value = this.value;
                    GlyphHelper.resetGlyphDialog(value);
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
                var index = options.indexOf(value);

                if (index > -1) {
                    // removeGlyph will return true on success, false otherwise
                    var removeSuccess = removeGlyph(options, value);

                    if(removeSuccess) {
                        var historyMonitor = HistoryMonitor.getInstance();

                        historyMonitor.addUndoChange(function() {
                            addGlyph(options, value, index);
                        });

                        historyMonitor.addRedoChange(function() {
                            removeGlyph(options, value);
                        });
                        this._value = undefined;
                    }
                }
            }
        });

        this.width.onchange = this.render;
        this.width.originalValue = 100;
        this.width._displayName = 'Scale';

        this.setState(state);

        this._isRendered = false;
        this._ready = true;

        /*
         * Map will always be below everything else. Must always be set to 0.
         * This is due to a click-through issue where clicks on the map will propagate to elements underneath.
         */
        this.z.originalValue = 0;

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
        state.glyphs = [];
        //TODO: push this to ListProperty.getState
        for(var i = 0; i < this.glyphs.length; i++) {
            state.glyphs.push(this.glyphs[i].getState());
        }

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

        if (defined(state.glyphs)){
            //TODO: push this to ListProperty.setState
            for(var i = 0; i < state.glyphs.length; i++) {
                this.glyphs.push(new GlyphViewModel(state.glyphs[i], this));
            }
        }
    };

    USMapViewModel.prototype.usesDataSet = function(dataSet) {
        if(this.coloring.value.getType() === ColoringSchemeType.GRADIENT_COLORING) {
            if(this.coloring.value.dataSet.value === dataSet){
                return true;
            }
        }
        if (this.glyphList.options.length > 0) {
            var glyphs = this.glyphList.options;
            for (var i = 0; i < glyphs.length; i++) {
                if (glyphs[i].usesDataSet(dataSet)) {
                    return true;
                }
            }
        }

        return false;
    };

    Object.defineProperties(USMapViewModel.prototype, {
        properties: {
            // z is not exposed here because the map should always be on the bottom
            get: function() {
                return [this.name, this.x, this.y, this.width, this.visible,
                        this.strokeColor, this.coloring, this.logGoogleAnalytics, this.glyphList];
            }
        },
        subTargets: {
            get: function() {
                var allSubTargets = [];

                // Push all subtargets to a single array and return it
                allSubTargets.push.apply(allSubTargets, this.glyphs);

                return allSubTargets;
            }
        }
    });

    // Groupings of states so that no adjacent states are colored the same when using four-coloring scheme
    USMapViewModel.prototype.fourColorStateGroupings = [
        ['Alaska', 'Alabama', 'Arkansas', 'Connecticut', 'Delaware', 'Illinois', 'Maine', 'Michigan', 'Minnesota', 'Montana', 'Nebraska', 'New Mexico', 'Nevada', 'Virginia'],
        ['Arizona', 'District of Columbia', 'Kansas', 'Kentucky', 'Mississippi', 'North Carolina', 'Oregon', 'Pennsylvania', 'Rhode Island', 'Texas', 'Vermont', 'Wisconsin', 'Wyoming'],
        ['California', 'Colorado', 'Georgia', 'Idaho', 'Indiana', 'Louisiana', 'Massachusetts', 'Missouri', 'New Jersey', 'South Dakota', 'West Virginia'],
        ['Florida', 'Hawaii', 'Iowa', 'Maryland', 'New Hampshire', 'New York', 'North Dakota', 'Ohio', 'Oklahoma', 'South Carolina', 'Tennessee', 'Utah', 'Washington']
    ];

    USMapViewModel.prototype.DEFAULT_MAP_COLOR = 'LightGrey';

    return USMapViewModel;
});
