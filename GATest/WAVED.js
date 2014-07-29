$(document).ready(function() {
var workspaceWidth = 600;
var workspaceHeight = 400;
// START DATA
/*
 * Subscribe to changes in dataset using the given key with a callback function.
 * Using an existing key overwrites the existing callback function,
 */
var dataSubscribe = function(dataSetName, key, callbackFunction) {
	dataSets[dataSetName].onChange[key] = callbackFunction;
};

/*
 * Unsubscribe the given keys callback function to the dataset
 */
var transferDataSubscription = function(oldDataSetName, newDataSetName, key) {
	var callbackFunction = dataSets[oldDataSetName].onChange[key];
	delete dataSets[oldDataSetName].onChange[key];
	if (typeof callbackFunction !== 'undefined') {
		dataSubscribe(newDataSetName, key, callbackFunction);
	}
};

// Initialize Data sets
var dataSets = {};
dataSets['data_full'] = {
	'dataIsLoaded' : $.Deferred(),
	'loadedData': [],
	'data': [],
	'onChange': {},
	'updateData': $.noop
};

dataSets['heat'] = {
	'dataIsLoaded' : $.Deferred(),
	'loadedData': [],
	'data': [],
	'onChange': {},
	'updateData': $.noop
};

// Load Data
d3.csv('data/data_full.csv', function (loadedData) { 
	dataSets['data_full'].loadedData = loadedData;
	dataSets['data_full'].data = loadedData;
	dataSets['data_full'].dataIsLoaded.resolve();
});

d3.csv('data/heat.csv', function (loadedData) { 
	dataSets['heat'].loadedData = loadedData;
	dataSets['heat'].data = loadedData;
	dataSets['heat'].dataIsLoaded.resolve();
});

// END DATA

// Trigger Functions
function addDataToTrigger(widgetName, name, key, value) {
	if (arguments.length === 3) {
		widgets[widgetName].triggerData[name] = key;
		return;
	}
	if (typeof (widgets[widgetName].triggerData[name]) === 'undefined') {
		widgets[widgetName].triggerData[name] = {};
	}
	widgets[widgetName].triggerData[name][key] = value;
}

function addMouseDataToTrigger(event, widgetName){
	var workspace = $('#waved-container');
	addDataToTrigger(widgetName, 'x', 100 * (event.pageX - workspace.offset().left) / workspace.width());
	addDataToTrigger(widgetName, 'y', 100 * (event.pageY - workspace.offset().top) / workspace.height());
}

// Template Helper Functions
function getTemplateMatches(str) {
	var index = 1;
	var matches = [];
	var templateRegex = /{{([ _.\w]+)}}/g;
	var match;
	while ((match = templateRegex.exec(str)) !== null) {
		matches.push(match[index]);
	}
	return matches;
}

var defined = function(value) {
	return (typeof value !== 'undefined');
};

function replaceTemplates(triggerName, actionValue) {
	var templates = getTemplateMatches(actionValue);
	if (templates.length === 0) {
		return actionValue;
	}
	var temp = actionValue;
	if (typeof actionValue === 'number') {
		temp = actionValue.toString();
	}

	for (var i = 0; i < templates.length; i++) {
		if (defined(widgets[triggerName].triggerData[templates[i]])) {
			temp = temp.replace('{{' + templates[i]+ '}}', widgets[triggerName].triggerData[templates[i]]);
		}
		else {
			var index = templates[i].indexOf('.');
			if (index > -1) {
				var dataName = templates[i].slice(0, index);
				var fieldName = templates[i].slice(index + 1);
				var triggerData = widgets[triggerName].triggerData[dataName];
				if (defined(triggerData) && defined(triggerData[fieldName])) {
					temp = temp.replace('{{' + templates[i] + '}}', triggerData[fieldName]);
				}
			}
		}
	}


	var returnValue;
	if (typeof actionValue === 'number') {
		returnValue = parseFloat(temp);
	}
	else {
		returnValue = temp;
	}

	return returnValue;
}

// Events
$('#widget-USMap1').on('click', function(event) {
	addMouseDataToTrigger(event, 'USMap1');

	$('#widget-TextBlock1').html(replaceTemplates('USMap1', 'hi {{state}}<br>{{x}}<br>{{y}}<br>heat: {{heat.heat}}'));

});

$('#widget-USMap1').on('click', function(event) {
	addMouseDataToTrigger(event, 'USMap1');

	$('#widget-TextBlock1').css('left', replaceTemplates('USMap1', '{{x}}%'));
	$('#widget-TextBlock1').css('top', replaceTemplates('USMap1', '{{y}}%'));

});

$('#widget-USMap1').on('click', function(event) {
	addMouseDataToTrigger(event, 'USMap1');

	widgets["USMap1"].properties.strokeColor = 'red';

	renderUSMap(widgets["USMap1"]);
});

// Initialize Widgets
var widgets = {};
widgets['USMap1'] = {
	'id': 'widget-USMap1',
	'boundData': ['data_full', 'heat'],
	'triggerData': {},
	'properties': {}
};

// Function to add trigger data for USMap templating
function addStateDataToTrigger(d, mapWidget) {
	var name = d.properties.name;
	var abbrev = d.properties.abbreviation;
	addDataToTrigger(mapWidget, 'state', name);
	addDataToTrigger(mapWidget, 'stateAbbreviation', abbrev);
	// Iterate through each bound DataSet and add data values to the trigger
	// only for the state matching the specified name.
	for (var i = 0; i < widgets[mapWidget].boundData.length; i++) {
		var data = dataSets[widgets[mapWidget].boundData[i]].data;
		for (var j = 0; j < data.length; j++) {
			for (var key in data[j]) {
				var lowerVal = data[j][key].toLowerCase();
				if (lowerVal === name.toLowerCase() || lowerVal === abbrev.toLowerCase()) {
					for (var k in data[j]) {
						addDataToTrigger(mapWidget, widgets[mapWidget].boundData[i], k, data[j][k]);
					}
					break;
				}
			}
		}
	}
}

var projection;
widgets["USMap1"].properties.x = 0;
widgets["USMap1"].properties.y = 0;
widgets["USMap1"].properties.visible = true;
widgets["USMap1"].properties.scale = 100;
widgets["USMap1"].properties.strokeColor = "Black";
widgets["USMap1"].properties.coloring = {"color":{"value":"LightGrey"},"type":"SolidColoringScheme"};

// Coloring Function
function updateColoring(states, coloring) {
	var path = states.selectAll("path");
	switch(coloring.type){
		case "SolidColoringScheme":
			path.style("fill", function(d) {
				return coloring.color.value;
			});
			break;
		case "FourColoringScheme":
			var fourColorStateGroupings = [
				["Alaska", "Alabama", "Arkansas", "Connecticut", "Delaware", "Illinois", "Maine", "Michigan", "Minnesota", "Montana", "Nebraska", "New Mexico", "Nevada", "Virginia"],
				["Arizona", "District of Columbia", "Kansas", "Kentucky", "Mississippi", "North Carolina", "Oregon", "Pennsylvania", "Rhode Island", "Texas", "Vermont", "Wisconsin", "Wyoming"],
				["California", "Colorado", "Georgia", "Idaho", "Indiana", "Louisiana", "Massachusetts", "Missouri", "New Jersey", "South Dakota", "West Virginia"],
				["Florida", "Hawaii", "Iowa", "Maryland", "New Hampshire", "New York", "North Dakota", "Ohio", "Oklahoma", "South Carolina", "Tennessee", "Utah", "Washington"]
			];

			var colorArray = [coloring.color1.value, coloring.color2.value, coloring.color3.value, coloring.color4.value];

			path.style("fill", function(d) {
				var stateName = d.properties.name;
				for(var i=0; i < 4; i++){
					if(fourColorStateGroupings[i].indexOf(stateName) !== -1){
						return colorArray[i].toLowerCase();
					}
				}
			});
			break;
		case "GradientColoringScheme":
		$.when(dataSets[coloring.dataSet].dataIsLoaded).done(function() {
		var data = dataSets[coloring.dataSet].data;
			var dataField = coloring.dataField;
			var startColor = coloring.startColor.value.toLowerCase();
			var endColor = coloring.endColor.value.toLowerCase();
			var min = d3.min(data, function(d) { return +d[dataField]; });
			var max = d3.max(data, function(d) { return +d[dataField]; });
			if(min === undefined || max === undefined){
				path.style("fill", function(d){
					return 'lightgrey';
				});
			}
			var gradient = d3.scale.linear().domain([min, max]).range([startColor, endColor]);
			path.style("fill", function(d) {
				var stateName = d.properties.name;
				var keyName = coloring.keyField;
				for(var i=0; i<data.length; i++){
					if(data[i][keyName] === stateName){
						return gradient(data[i][dataField]);
					}
				if(i === data.length-1){
					return 'lightgrey';
				}
				}
			});
		});
		break;
	}
}

// Render USMap Function
function renderUSMap(map) {
	var scale = workspaceWidth*1.3*map.properties.scale/100;
	var width = workspaceWidth * map.properties.scale/100;
	var height = workspaceHeight * map.properties.scale/100;
	projection = d3.geo.albersUsa().scale(scale).translate(([width/2, height/2]));
	var path = d3.geo.path().projection(projection);
	d3.select("#" + map.id).selectAll("svg").remove();
	var svg = d3.select("#" + map.id)
		.append("svg")
		.attr("height", height)
		.attr("width", width);
	var states = svg.append("g");
	d3.json('./data/states.json', function(json) {
		states.selectAll("path")
		.data(json.features)
		.enter()
		.append("path")
		.attr("d", path)
		.style("stroke", function(d) {
			return map.properties.strokeColor;
		})
		.on("mouseover", function(d) {
			addStateDataToTrigger(d, 'USMap1');
		})
		.on("mousemove", function(d) {
			addStateDataToTrigger(d, 'USMap1');
		})
		.on("mouseout", function(d) {
			addStateDataToTrigger(d, 'USMap1');
		})
		.on("click", function(d) {
			addStateDataToTrigger(d, 'USMap1');
			_gaq.push(['_trackEvent', 'GATest', 'click-USMap1-' + d.properties.name]);
		});
		updateColoring(states, map.properties.coloring);
	});
}

// Render the USMap in its initial state
renderUSMap(widgets["USMap1"]);

widgets['TextBlock1'] = {
	'id': 'widget-TextBlock1',
	'boundData': [],
	'triggerData': {},
	'properties': {}
};

$('#widget-TextBlock1').on('click', function() {	_gaq.push(['_trackEvent', 'GATest', 'click-TextBlock1']);});

});