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

        return this._css;
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

    function getColoringJs(viewModel, tabs) {
        var js = '';

        js += '\n';
        js += tabs + 'function updateColoring (states, coloring) {\n';
        js += tabs + '\tvar path = states.selectAll("path");\n';
        js += tabs + '\tswitch(coloring.type){\n';
        js += tabs + '\t\tcase "' + ColoringSchemeType.SOLID_COLORING + '":\n';
        js += tabs + '\t\t\tpath.style("fill", function(d) {\n';
        js += tabs + '\t\t\t\treturn coloring.color.value;\n';
        js += tabs + '\t\t\t});\n';
        js += tabs + '\t\t\tbreak;\n';

        js += tabs + '\t\tcase "' + ColoringSchemeType.FOUR_COLORING + '":\n';
        js += tabs + '\t\t\tvar fourColorStateGroupings = [\n';
        js += tabs + '\t\t\t\t["Alaska", "Alabama", "Arkansas", "Connecticut", "Delaware", "Illinois", "Maine", "Michigan", "Minnesota", "Montana", "Nebraska", "New Mexico", "Nevada", "Virginia"],\n';
        js += tabs + '\t\t\t\t["Arizona", "District of Columbia", "Kansas", "Kentucky", "Mississippi", "North Carolina", "Oregon", "Pennsylvania", "Rhode Island", "Texas", "Vermont", "Wisconsin", "Wyoming"],\n';
        js += tabs + '\t\t\t\t["California", "Colorado", "Georgia", "Idaho", "Indiana", "Louisiana", "Massachusetts", "Missouri", "New Jersey", "South Dakota", "West Virginia"],\n';
        js += tabs + '\t\t\t\t["Florida", "Hawaii", "Iowa", "Maryland", "New Hampshire", "New York", "North Dakota", "Ohio", "Oklahoma", "South Carolina", "Tennessee", "Utah", "Washington"]\n';
        js += tabs + '\t\t\t];\n\n';

        js += tabs + '\t\t\tvar colorArray = [coloring.color1.value, coloring.color2.value, coloring.color3.value, coloring.color4.value];\n\n';
        js += tabs + '\t\t\tpath.style("fill", function(d) {\n';
        js += tabs + '\t\t\t\tvar stateName = d.properties.name;\n';
        js += tabs + '\t\t\t\tfor(var i=0; i < 4; i++){\n';
        js += tabs + '\t\t\t\t\tif(fourColorStateGroupings[i].indexOf(stateName) !== -1){\n';
        js += tabs + '\t\t\t\t\t\treturn colorArray[i].toLowerCase();\n';
        js += tabs + '\t\t\t\t\t}\n';
        js += tabs + '\t\t\t\t}\n';
        js += tabs + '\t\t\t});\n';
        js += tabs + '\t\t\tbreak;\n';

        js += tabs + '\t\tcase "' + ColoringSchemeType.GRADIENT_COLORING + '":\n';
        js += tabs + '\t\t$.when(dataSets[coloring.dataSet.value.name].dataIsLoaded).done(function() {\n';
        js += tabs + '\t\tvar data = dataSets[coloring.dataSet.value.name].data;\n';
        js += tabs + '\t\t\tvar dataField = coloring.dataField.value;\n';
        js += tabs + '\t\t\tvar startColor = coloring.startColor.value.toLowerCase();\n';
        js += tabs + '\t\t\tvar endColor = coloring.endColor.value.toLowerCase();\n';
        js += tabs + '\t\t\tvar min = d3.min(data, function(d) { return +d[dataField]; });\n';
        js += tabs + '\t\t\tvar max = d3.max(data, function(d) { return +d[dataField]; });\n';
        js += tabs + '\t\t\tif(min === undefined || max === undefined){\n';
        js += tabs + '\t\t\t\tpath.style("fill", function(d){\n';
        js += tabs + '\t\t\t\t\treturn \'' + viewModel.DEFAULT_MAP_COLOR.toLowerCase() + '\';\n';
        js += tabs + '\t\t\t\t});\n';
        js += tabs + '\t\t\t}\n'; //end if

        js += tabs + '\t\t\tvar gradient = d3.scale.linear().domain([min, max]).range([startColor, endColor]);\n';
        js += tabs + '\t\t\tpath.style("fill", function(d) {\n';
        js += tabs + '\t\t\t\tvar stateName = d.properties.name;\n';
        js += tabs + '\t\t\t\tvar keyName = coloring.keyField.value;\n';
        js += tabs + '\t\t\t\tfor(var i=0; i<data.length; i++){\n';
        js += tabs + '\t\t\t\t\tif(data[i][keyName] === stateName){\n';
        js += tabs + '\t\t\t\t\t\treturn gradient(data[i][dataField]);\n';
        js += tabs + '\t\t\t\t\t}\n';

        js += tabs + '\t\t\t\tif(i === data.length-1){\n';
        js += tabs + '\t\t\t\t\treturn \'' + viewModel.DEFAULT_MAP_COLOR.toLowerCase() + '\';\n';
        js += tabs + '\t\t\t\t}\n';
        js += tabs + '\t\t\t\t}\n'; //end for
        js += tabs + '\t\t\t});\n'; //end path.style function
        js += tabs + '\t\t});\n'; //end d3.csv
        js += tabs + '\t\tbreak;\n';

        js += tabs + '\t\t}\n'; // end updateColoring
        js += tabs + '\t}\n\n'; // end updateColoring

        return js;
    }

    USMap.prototype.getJs = function(googleAnalytics) {
        var vm = this.viewModel;
        var js = '';

        var w = $('#waved-workspace').width();
        var w2 = w * vm.width.originalValue/100;
        var h = $('#waved-workspace').height();
        var h2 = h * vm.width.originalValue/100;
        var scale = w*1.3*vm.width.value/100;


        // TODO: only export these functions once
        // addStateDataToTrigger
        js += 'function addStateDataToTrigger(d, mapWidget) {\n';
        js += '\tvar name = d.properties.name;\n';
        js += '\tvar abbrev = d.properties.abbreviation;\n';
        js += '\taddDataToTrigger(mapWidget, \'state\', name);\n';
        js += '\taddDataToTrigger(mapWidget, \'stateAbbreviation\', abbrev);\n';
        js += '\t// Iterate through each bound DataSet and add data values to the trigger\n';
        js += '\t// only for the state matching the specified name.\n';
        js += '\tfor (var i = 0; i < widgets[mapWidget].boundData.length; i++) {\n';
        js += '\t\tvar data = dataSets[widgets[mapWidget].boundData[i]].data;\n';
        js += '\t\tfor (var j = 0; j < data.length; j++) {\n';
        js += '\t\t\tfor (var key in data[j]) {\n';
        js += '\t\t\t\tvar lowerVal = data[j][key].toLowerCase();\n';
        js += '\t\t\t\tif (lowerVal === name.toLowerCase() || lowerVal === abbrev.toLowerCase()) {\n';
        js += '\t\t\t\t\tfor (var k in data[j]) {\n';
        js += '\t\t\t\t\t\taddDataToTrigger(mapWidget, widgets[mapWidget].boundData[i], k, data[j][k]);\n';
        js += '\t\t\t\t\t}\n';
        js += '\t\t\t\t\tbreak;\n';
        js += '\t\t\t\t}\n';
        js += '\t\t\t}\n';
        js += '\t\t}\n';
        js += '\t}\n';
        js += '}\n\n';

        // Initial map properties.
        var nameString = '"' + vm.name.originalValue + '"';
        js += 'widgets[' + nameString + '].properties.x = ' + vm.x.getState().value + ';\n';
        js += 'widgets[' + nameString + '].properties.y = ' + vm.y.getState().value + ';\n';
        js += 'widgets[' + nameString + '].properties.visible = ' + vm.visible.getState().value + ';\n';
        js += 'widgets[' + nameString + '].properties.scale = ' + vm.width.getState().value + ';\n';
        js += 'widgets[' + nameString + '].properties.strokeColor = "' + vm.strokeColor.getState().value + '";\n';
        js += 'widgets[' + nameString + '].properties.coloring = ' + JSON.stringify(vm.coloring.getState().value) + ';\n';

        js += 'function renderUSMap(map) {\n';
        js += '\tvar scale = workspaceWidth*1.3*map.properties.scale/100;\n'; //1.3 is a magic number\n';
        js += '\tvar width = workspaceWidth * map.properties.scale/100;\n';
        js += '\tvar height = workspaceHeight * map.properties.scale/100;\n';
        js += '\tvar projection = d3.geo.albersUsa().scale(scale).translate(([width/2, height/2]));\n';
        js += '\tvar path = d3.geo.path().projection(projection);\n';
        js += getColoringJs(vm, '\t');
        js += '\td3.select("#" + map.id).selectAll("svg").remove();\n';
        js += '\tvar svg = d3.select("#" + map.id)\n';
        js += '\t\t.append("svg")\n';
        js += '\t\t.attr("height", ' +  h2 + ')\n';
        js += '\t\t.attr("width", '  + w2 + ');\n';
        js += '\tvar states = svg.append("g");\n';
        js += '\td3.json(\'./data/states.json\', function(json) {\n';
        js += '\t\tstates.selectAll("path")\n';
        js += '\t\t.data(json.features)\n';
        js += '\t\t.enter()\n';
        js += '\t\t.append("path")\n';
        js += '\t\t.attr("d", path)\n';
        js += '\t\t.style("stroke", function(d) {\n';
        js += '\t\t\treturn map.properties.strokeColor;\n';
        js += '\t\t})\n';
        js += '\t\t.on("mouseover", function(d) {\n';
        js += '\t\t\taddStateDataToTrigger(d, \'' + this.viewModel.name.originalValue + '\');\n';
        js += '\t\t})\n';
        js += '\t\t.on("mousemove", function(d) {\n';
        js += '\t\t\taddStateDataToTrigger(d, \'' + this.viewModel.name.originalValue + '\');\n';
        js += '\t\t})\n';
        js += '\t\t.on("mouseout", function(d) {\n';
        js += '\t\t\taddStateDataToTrigger(d, \'' + this.viewModel.name.originalValue + '\');\n';
        js += '\t\t})\n';
        js += '\t\t.on("click", function(d) {\n';
        js += '\t\t\taddStateDataToTrigger(d, \'' + this.viewModel.name.originalValue + '\');\n';
        if (vm.logGoogleAnalytics.value) {
            js += '\t\t\t_gaq.push([\'_trackEvent\', \'' + googleAnalytics.eventCategory.originalValue + '\', \'click-' + vm.name.originalValue + '-\' + d.properties.name]);\n';
        }
        js += '\t\t});\n';
        js += '\t\tupdateColoring(states, map.properties.coloring);\n';
        js += '\t});\n';
        js += '}\n\n';

        js += 'renderUSMap(widgets[' + nameString + ']);\n\n';
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