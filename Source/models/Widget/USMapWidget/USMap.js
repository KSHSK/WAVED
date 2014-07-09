define([
        'models/Widget/USMapWidget/USMapViewModel',
        'models/Constants/WidgetTemplateName',
        'models/Event/Trigger',
        'models/Constants/ColoringSchemeType',
        'models/Constants/GlyphSizeSchemeType',
        '../Widget',
        'util/defined',
        'knockout',
        'jquery'
    ],function(
        USMapViewModel,
        WidgetTemplateName,
        Trigger,
        ColoringSchemeType,
        GlyphSizeSchemeType,
        Widget,
        defined,
        ko,
        $){
    'use strict';

    var USMap = function(state, getDataSet) {
        Widget.call(this, state);

        this._templateName = WidgetTemplateName.US_MAP;

        var $workspace = $('#waved-workspace');
        var usMap = this.newWidgetContainer();
        usMap.attr('data-bind', 'template: {name: \'' + this._templateName + '\', afterRender: render}');

        var viewModel = new USMapViewModel(state, getDataSet);
        viewModel.trigger.domElement = usMap;

        this._domElement = usMap;
        this.viewModel = viewModel;

        ko.applyBindings(viewModel, usMap[0]);
    };

    USMap.prototype = Object.create(Widget.prototype);

    USMap.prototype.addToWorkspace = function() {
        Widget.prototype.addToWorkspace.call(this);

        this.viewModel.render();
    };

    /**
     * Static method that returns the type String for this class's ViewModel.
     */
    USMap.getViewModelType = function() {
        return USMapViewModel.getType();
    };

    USMap.iconLocation = function() {
        return 'Source/models/Widget/USMapWidget/usmap-icon.png';
    };

    USMap.prototype.getCss = function() {
        Widget.prototype.getCss.call(this);

        var vm = this.viewModel;

        this._css.height = '100%';
        this._css.width = '100%';
    };

    USMap.prototype.exportHtml = function() {
        return '<div class="widget widget-map" id="' + this.viewModel.exportId + '"></div>';
    };


    function getGlyphJs(name, glyph) {
        var js = '';
        var w = $('#waved-workspace').width() * glyph.parent.width.value/100;
        var h = $('#waved-workspace').height() * glyph.parent.width.value/100;
        js += 'var svg = d3.select("#widget-' + name + '")\n';
        js += '\t.append("svg")\n';
        js += '\t.attr("height", ' + h + ')\n';
        js += '\t.attr("width",' +  w + ')\n';
        js += '\t.attr("class", "widget-container")\n';
        js += '\t.style("top", "0")\n';
        js += '\t.style("left", "0")\n';
        js += '\t.attr("id","' +  glyph.id + '");\n';
        js += 'var dom = svg.append("g");\n';
        if (!glyph.visible.value) {
            js += 'dom.attr("class", "hide");\n';
        } else {
            js += 'dom.attr("class", "show");\n';
        }

        // Generic glyph rendering function. Can be called from generated js
        js += 'var renderGlyphs = function(glyphDataSet, lonValue, latValue, sizeType, size, color, opacity, z, parentWidth) {\n';
        js += '\tdataSets[glyphDataSet].dataIsLoaded.done(function() {\n';
        js += '\t\tdom.selectAll("circle").data(dataSets[glyphDataSet].data)\n';
        js += '\t\t\t.enter().append("circle")\n';
        js += '\t\t\t.attr("cx", function(d, i) {\n';
        js += '\t\t\t\tvar coords = projection([d[lonValue], d[latValue]]);\n';
        js += '\t\t\t\tif (coords !== null) {\n';
        js += '\t\t\t\t\treturn coords[0];\n';
        js += '\t\t\t\t}\n';
        js += '\t\t\t})\n';
        js += '\t\t\t.attr("cy", function(d, i) {\n';
        js += '\t\t\t\tvar coords = projection([d[lonValue], d[latValue]]);\n';
        js += '\t\t\t\tif (coords !== null) {\n';
        js += '\t\t\t\t\treturn coords[1];\n';
        js += '\t\t\t\t}\n';
        js += '\t\t\t})\n';
        js += '\t\t\t.attr("r", function(d, i) {\n';
        js += '\t\t\t\tvar value;\n';

        js += '\t\t\t\tif (sizeType === "' + GlyphSizeSchemeType.SCALED_SIZE + '") {\n';
        js += '\t\t\t\t\tvar radiusScale = d3.scale.linear().domain([1000,500000]).range([2,10]).clamp(true);\n';
        js += '\t\t\t\t\tvalue = radiusScale(d[size]);\n';
        js += '\t\t\t\t}\n';
        js += '\t\t\t\telse {\n';
        js += '\t\t\t\t\tvalue = size * (parentWidth/100);\n';
        js += '\t\t\t\t}\n';

        js += '\t\t\t\tif (value !== null && value > 0 && !isNaN(value)) {\n';
        js += '\t\t\t\t\treturn value;\n';
        js += '\t\t\t\t}\n';
        js += '\t\t\t})\n';
        js += '\t\t\t.style("fill", "' +  glyph.color.value + '")\n';
        js += '\t\t\t.style("opacity", ' + glyph.opacity.value/100 + ')\n';
        js += '\t\t\t.style("z-index", ' + glyph.z.value + ');\n';

        js += '\t});\n';
        js += '}\n';

        js += '\n';

        // Figure out what size field (constant or scaling field) to pass into the intial renderGlyphs call
        var sizeValue = defined(glyph.size.value.size) ? glyph.size.value.size.value : glyph.size.value.dataField.value;

        // Render the initial set of glyphs
        js += 'renderGlyphs("' + glyph.dataSet.value.name + '", "' + glyph.longitude.value + '", "' +
            glyph.latitude.value + '", "' + glyph.size.value.getType() + '", "' + sizeValue + '", "' + glyph.color.value + '", "' +
            glyph.opacity.value + '", "' + glyph.z.value + '", "' + glyph.parent.width.value + '");\n';

        return js;
    }

    function getColoringJs(viewModel) {
        var js = '';

        var coloringScheme = viewModel.coloring.value;

        js += 'function updateColoring (states) {\n';
        js += '\tvar path = states.selectAll("path");\n';
        js += '\t\tpath.style("stroke", function(d) {\n';
        js += '\t\treturn "' + viewModel.strokeColor.value + '";\n';
        js += '\t});\n';

        // Every time a color is used here, it should be converted toLowerCase() to be consistent across the board
        switch(coloringScheme.getType()){
            case ColoringSchemeType.SOLID_COLORING:
                js += '\tpath.style("fill", function(d) {\n';
                js += '\t\treturn "';
                js += defined(coloringScheme.color.value) ? coloringScheme.color.value.toLowerCase() : viewModel.DEFAULT_MAP_COLOR.toLowerCase();
                js += '";\n';
                js += '\t});\n';
                break;
            case ColoringSchemeType.FOUR_COLORING:
                js += 'var fourColorStateGroupings = [\n';
                js += '\t["Alaska", "Alabama", "Arkansas", "Connecticut", "Delaware", "Illinois", "Maine", "Michigan", "Minnesota", "Montana", "Nebraska", "New Mexico", "Nevada", "Virginia"],\n';
                js += '\t["Arizona", "District of Columbia", "Kansas", "Kentucky", "Mississippi", "North Carolina", "Oregon", "Pennsylvania", "Rhode Island", "Texas", "Vermont", "Wisconsin", "Wyoming"],\n';
                js += '\t["California", "Colorado", "Georgia", "Idaho", "Indiana", "Louisiana", "Massachusetts", "Missouri", "New Jersey", "South Dakota", "West Virginia"],\n';
                js += '\t["Florida", "Hawaii", "Iowa", "Maryland", "New Hampshire", "New York", "North Dakota", "Ohio", "Oklahoma", "South Carolina", "Tennessee", "Utah", "Washington"]\n';
                js += '];\n\n';
                js += 'var colorArray = ["' + coloringScheme.getColorArray()[0] + '", "' + coloringScheme.getColorArray()[1];
                js += '", "' + coloringScheme.getColorArray()[2] + '", "' + coloringScheme.getColorArray()[3] + '"];\n\n';
                js += 'path.style("fill", function(d) {\n';
                js += '\tvar stateName = d.properties.name;\n';
                js += '\tfor(var i=0; i < 4; i++){\n';
                js += '\t\tif(fourColorStateGroupings[i].indexOf(stateName) !== -1){\n';
                js += '\t\t\treturn colorArray[i].toLowerCase();\n';
                js += '\t\t}\n';
                js += '\t}\n';
                js += '});\n';
                break;
            case ColoringSchemeType.GRADIENT_COLORING:
                js += 'd3.csv(\'./data/' + coloringScheme.dataSet.value.filename + '\', function(error, data) {\n';
                js += '\tvar dataField = \'' + coloringScheme.dataField.value + '\';\n';
                js += '\tvar startColor = \'' + coloringScheme.startColor.value.toLowerCase() + '\';\n';
                js += '\tvar endColor = \'' + coloringScheme.endColor.value.toLowerCase() + '\';\n';
                js += '\tvar min = d3.min(data, function(d) { return +d[dataField]; });\n';
                js += '\tvar max = d3.max(data, function(d) { return +d[dataField]; });\n';
                js += '\tif(min === undefined || max === undefined){\n';
                js += '\t\tpath.style("fill", function(d){\n';
                js += '\t\t\treturn \'' + viewModel.DEFAULT_MAP_COLOR.toLowerCase() + '\';\n';
                js += '\t\t});\n';
                js += '\t}\n'; //end if

                js += '\tvar gradient = d3.scale.linear().domain([min, max]).range([startColor, endColor]);\n';
                js += '\tpath.style("fill", function(d) {\n';
                js += '\t\tvar stateName = d.properties.name;\n';
                js += '\t\tvar keyName = \'' + coloringScheme.keyField.value + '\';\n';
                js += '\t\tfor(var i=0; i<data.length; i++){\n';
                js += '\t\t\tif(data[i][keyName] === stateName){\n';
                js += '\t\t\t\treturn gradient(data[i][dataField]);\n';
                js += '\t\t\t}\n';

                js += '\t\tif(i === data.length-1){\n';
                js += '\t\t\treturn \'' + viewModel.DEFAULT_MAP_COLOR + '\';\n';
                js += '\t\t}\n';
                js += '\t\t}\n'; //end for
                js += '\t});\n'; //end path.style function
                js += '});\n'; //end d3.csv
                break;
            default:
                break;
        }

        js += '}\n\n'; // end updateColoring

        return js;
    }

    USMap.prototype.getJs = function(googleAnalytics) {
        var vm = this.viewModel;
        var js = '';

        var w = $('#waved-workspace').width();
        var w2 = w * vm.width.value/100;
        var h = $('#waved-workspace').height();
        var h2 = h * vm.width.value/100;
        var scale = w*1.3*vm.width.value/100;

        js += 'function addStateDataToTrigger(d){\n';
        js += '\tvar name = d.properties.name;\n';
        js += '\tvar abbrev = d.properties.abbreviation;\n';
        // TODO: viewModel does not exist here. We need a way to store data on each exported widget/trigger.
//        js += '\tviewModel._trigger.addData(\'state\', name);\n';
//        js += '\tviewModel._trigger.addData(\'stateAbbreviation\', abbrev);\n';
//        js += '\t// Iterate through each bound DataSet and add data values to the trigger\n';
//        js += '\t// only for the state matching the specified name.\n';
//        js += '\tfor (var i = 0; i < viewModel._boundData.length; i++) {\n';
//        js += '\t\t    var data = viewModel._boundData[i].data;\n';
//        js += '\t\t    for (var j = 0; j < data.length; j++) {\n';
//        js += '\t\t\t        for (var key in data[j]) {\n';
//        js += '\t\t\t\t            var lowerVal = data[j][key].toLowerCase();\n';
//        js += '\t\t\t\t            if (lowerVal === name.toLowerCase() || lowerVal === abbrev.toLowerCase()) {\n';
//        js += '\t\t\t\t\t                for (var k in data[j]) {\n';
//        js += '\t\t\t\t\t\t                    viewModel._trigger.addData(viewModel._boundData[i].name, k, data[j][k]);\n';
//        js += '\t\t\t\t\t                 }\n';
//        js += '\t\t\t\t\t               break;\n';
//        js += '\t\t\t\t            }\n';
//        js += '\t\t\t        }\n';
//        js += '\t\t    }\n';
//        js += '\t}\n';
        js += '}\n\n';
        js += 'var scale = ' + w + '*1.3*' + vm.width.value/100 + '; //1.3 is a magic number\n';
        js += 'var projection = d3.geo.albersUsa().scale(scale).translate(([' + w2 + '/2, ' + h2 + '/2]));\n';
        js += 'var path = d3.geo.path().projection(projection);\n';
        js += getColoringJs(vm);
        js += 'var svg = d3.select("#' + vm.exportId + '")\n';
        js += '\t.append("svg")\n';
        js += '\t.attr("height", ' +  h2 + ')\n';
        js += '\t.attr("width", '  + w2 + ');\n';
        js += 'var states = svg.append("g");\n';
        js += 'd3.json(\'./data/states.json\', function(json) {\n';
        js += '\tstates.selectAll("path")\n';
        js += '\t.data(json.features)\n';
        js += '\t.enter()\n';
        js += '\t.append("path")\n';
        js += '\t.attr("d", path)\n';
        js += '\t.attr("stroke", "white")\n';
        js += '\t.style("fill", function(d) {\n';
        js += '\t\treturn "' + vm.coloring.value.getType() + '";\n';
        js += '\t})\n';
        js += '\t.on("mouseover", function(d) {\n';
        js += '\t\taddStateDataToTrigger(d);\n';
        js += '\t})\n';
        js += '\t.on("mousemove", function(d) {\n';
        js += '\t\taddStateDataToTrigger(d);\n';
        js += '\t})\n';
        js += '\t.on("mouseout", function(d) {\n';
        js += '\t\taddStateDataToTrigger(d);\n';
        js += '\t})\n';
        js += '\t.on("click", function(d) {\n';
        js += '\t\taddStateDataToTrigger(d);\n';
        if (vm.logGoogleAnalytics.value) {
            js += '\t\t_gaq.push([\'_trackEvent\', \'' + googleAnalytics.eventCategory.originalValue + '\', \'click-' + vm.name.originalValue + '-\' + d.properties.name]);\n';
        }
        js += '\t});\n';
        js += '\tupdateColoring(states);\n';
        js += '});\n';
        js += '\n';
        var glyphs = vm.glyphs;
        if (glyphs.length > 0) {
            for (var i = 0; i < glyphs.length; i++) {
                js += getGlyphJs(vm.name.value, glyphs[i]);
            }
        }


        return js;
    };

    /**
     * Returns trigger data supplied to actions when this widget triggers an event.
     */
    USMap.actionTriggerInfo = function() {
        return {
            'state': 'The name of the state that was clicked.',
            'stateAbbreviation': 'The abbreviation of the state that was clicked.'
        };
    };

    return USMap;
});