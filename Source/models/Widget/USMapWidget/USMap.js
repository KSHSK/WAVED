define([
        'models/Widget/USMapWidget/USMapViewModel',
        'models/Constants/WidgetTemplateName',
        'models/Event/Trigger',
        'models/Constants/ColoringSchemeType',
        '../Widget',
        'util/defined',
        'knockout',
        'jquery'
    ],function(
        USMapViewModel,
        WidgetTemplateName,
        Trigger,
        ColoringSchemeType,
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
        return '<div id="' + this.viewModel.name.value + '"></div>';
    };


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
                js += 'path.style("fill", function(d) {\n';
                js += 'return "';
                js += defined(coloringScheme.color.value) ? coloringScheme.color.value.toLowerCase() : viewModel.DEFAULT_MAP_COLOR.toLowerCase();
                js += '";\n';
                js += '});\n';
                break;
            case ColoringSchemeType.FOUR_COLORING:
                js += 'var fourColorStateGroupings = [\n';
                js += '["Alaska", "Alabama", "Arkansas", "Connecticut", "Delaware", "Illinois", "Maine", "Michigan", "Minnesota", "Montana", "Nebraska", "New Mexico", "Nevada", "Virginia"],\n';
                js += '["Arizona", "District of Columbia", "Kansas", "Kentucky", "Mississippi", "North Carolina", "Oregon", "Pennsylvania", "Rhode Island", "Texas", "Vermont", "Wisconsin", "Wyoming"],\n';
                js += '["California", "Colorado", "Georgia", "Idaho", "Indiana", "Louisiana", "Massachusetts", "Missouri", "New Jersey", "South Dakota", "West Virginia"],\n';
                js += '["Florida", "Hawaii", "Iowa", "Maryland", "New Hampshire", "New York", "North Dakota", "Ohio", "Oklahoma", "South Carolina", "Tennessee", "Utah", "Washington"]\n';
                js += '];\n\n';
                js += 'var colorArray = ["' + coloringScheme.getColorArray()[0] + '", "' + coloringScheme.getColorArray()[1];
                js += '", "' + coloringScheme.getColorArray()[2] + '", "' + coloringScheme.getColorArray()[3] + '"];\n\n';
                js += 'path.style("fill", function(d) {\n';
                js += 'var stateName = d.properties.name;\n';
                js += 'for(var i=0; i < 4; i++){\n';
                js += 'if(fourColorStateGroupings[i].indexOf(stateName) !== -1){\n';
                js += 'return colorArray[i].toLowerCase();\n';
                js += '}\n';
                js += '}\n';
                js += '});\n';
                break;
            case ColoringSchemeType.GRADIENT_COLORING:
                js += 'd3.csv(\'./data/' + coloringScheme.dataSet.value.filename + '\', function(error, data) {\n';
                js += 'var dataField = \'' + coloringScheme.dataField.value + '\';\n';
                js += 'var startColor = \'' + coloringScheme.startColor.value.toLowerCase() + '\';\n';
                js += 'var endColor = \'' + coloringScheme.endColor.value.toLowerCase() + '\';\n';
                js += 'var min = d3.min(data, function(d) { return +d[dataField]; });\n';
                js += 'var max = d3.max(data, function(d) { return +d[dataField]; });\n';
                js += 'if(min === undefined || max === undefined){\n';
                js += 'path.style("fill", function(d){\n';
                js += 'return \'' + viewModel.DEFAULT_MAP_COLOR.toLowerCase() + '\';\n';
                js += '});\n';
                js += '}\n'; //end if

                js += 'var gradient = d3.scale.linear().domain([min, max]).range([startColor, endColor]);\n';
                js += 'path.style("fill", function(d) {\n';
                js += 'var stateName = d.properties.name;\n';
                js += 'var keyName = \'' + coloringScheme.keyField.value + '\';\n';
                js += 'for(var i=0; i<data.length; i++){\n';
                js += 'if(data[i][keyName] === stateName){\n';
                js += 'return gradient(data[i][dataField]);\n';
                js += '}\n';

                js += 'if(i === data.length-1){\n';
                js += 'return \'' + viewModel.DEFAULT_MAP_COLOR + '\';\n';
                js += '}\n';
                js += '}\n'; //end for
                js += '});\n'; //end path.style function
                js += '});\n'; //end d3.csv
                break;
            default:
                break;
        }

        js += '}\n\n'; // end updateColoring

        return js;
    }

    USMap.prototype.getJs = function() {
        var vm = this.viewModel;
        var js = '';

        var w = $('#waved-workspace').width();
        var w2 = w * vm.width.value/100;
        var h = $('#waved-workspace').height();
        var h2 = h * vm.width.value/100;
        var scale = w*1.3*vm.width.value/100;

        //TODO trigger stuff

        js += 'function addStateDataToTrigger(d){\n';
        js += '//todo\n';
        js += '}\n\n';
        js += 'var scale = ' + w + '*1.3*' + vm.width.value/100 + '; //1.3 is a magic number\n';
        js += 'var projection = d3.geo.albersUsa().scale(scale).translate(([' + w2 + '/2, ' + h2 + '/2]));\n';
        js += 'var path = d3.geo.path().projection(projection);\n';
        js += getColoringJs(vm);
        js += 'var svg = d3.select("#' + vm.name.value + '")\n';
        js += '.append("svg")\n';
        js += '.attr("height", ' +  h2 + ')\n';
        js += '.attr("width", '  + w2 + ');\n';
        js += 'var states = svg.append("g");\n';
        js += 'd3.json(\'./data/states.json\', function(json) {\n';
        js += 'states.selectAll("path")\n';
        js += '.data(json.features)\n';
        js += '.enter()\n';
        js += '.append("path")\n';
        js += '.attr("d", path)\n';
        js += '.attr("stroke", "white")\n';
        js += '.style("fill", function(d) {\n';
        js += 'return "' + vm.coloring.value.getType() + '";\n';
        js += '})\n';
        js += '.on("mouseover", function(d) {\n';
        js += 'addStateDataToTrigger(d);\n';
        js += '})\n';
        js += '.on("mousemove", function(d) {\n';
        js += 'addStateDataToTrigger(d);\n';
        js += '})\n';
        js += '.on("mouseout", function(d) {\n';
        js += 'addStateDataToTrigger(d);\n';
        js += '})\n';
        js += '.on("click", function(d) {\n';
        js += 'addStateDataToTrigger(d);\n';
        js += '});\n';
        js += 'updateColoring(states);';
        js += '});\n';

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