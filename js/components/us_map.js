var us_map = {
	// Holds JSONs with filenames and data
	// For storing in our db, do we need a way to compact all of these into 1 JSON object?
	// Need a way to list all of these somewhere and update it dynamically when new data is loaded
	data: [],
	svg: "",
	projection: "",
	w: 0,
	h: 0,
	highlightingEnabled: false,
	
	/* Generate the map of the US */
	render: function() {
		// This is the jQuery way of adding attributes to a JSON object
		$.extend(state.widgets, {"us_map":{}});
		
		$("#map-colorize-button").removeAttr("disabled");
		$("#map-bind-data-button").removeAttr("disabled");
		$("#map-render-markers-button").removeAttr("disabled");
		$("#map-analytics-button").removeAttr("disabled");
		$("#map-highlight-checkbox").removeAttr("disabled");
		
		$("#widget-selector").append("<option id='us-map-widget-option'>US Map</option>");
		$("#us-map-widget-option").on("click", function(){
			$("#data-selector").empty();
			for (var i = 0; i < us_map.data.length; i++) {
				$("#data-selector").append("<option>"+ us_map.data[i].filepath +"</option>");
			}
		});
	
		var map_preview_document = $("#" + constants.MAP_PREVIEW_ID);
		
		// Default values
		if(us_map.w <= 0){
			us_map.w = 800;
		}
		if(us_map.h <= 0){
			us_map.h = 500;
		}
		
		us_map.projection = d3.geo.albersUsa().translate(([us_map.w/2, us_map.h/2]));
		var path = d3.geo.path().projection(us_map.projection);
		
		// Put the svg inside the preview div
		us_map.svg = d3.select("#" + constants.MAP_PREVIEW_ID)
			.append("svg")
			.attr("width", us_map.w)
			.attr("height", us_map.h);
		
		d3.json("data/states.json", function(error, json){
			if(error){
				console.log(error);
			}
			else {
				us_map.svg.selectAll("path")
					.data(json.features)
					.enter()
					.append("path")
					.attr("d", path)
					.attr("stroke", "white")
					.on("mouseover", function(d){
						if(us_map.highlightingEnabled){
							d3.select(this).style("opacity", 0.5);
						}
					})
					.on("mouseout", function(d) {
						d3.select(this).style("opacity", 1.0);
					});
			}
		});
		
		state.widgets.us_map.render = true;
		state.widgets.us_map.w = us_map.w;
		state.widgets.us_map.h = us_map.h;
		state.widgets.us_map.highlightingEnabled = us_map.highlightingEnabled;
	},
	
	/* Get the svg object */
	get_svg: function() {
		return us_map.svg;
	},
	
	/* Randomly colors each state */
	colorize: function() {
		us_map.svg.selectAll("path")
			.style("fill", function(d) {
				var letters = '0123456789ABCDEF'.split('');
			    var color = '#';
			    for (var i = 0; i < 6; i++) {
			        color += letters[Math.round(Math.random() * 15)];
			    }
    			
    			return color;
			});
		
		state.widgets.us_map["color"] = true;
	},
	
	bind_data: function(filepath) {
		d3.csv(filepath, function(e) {
			// Create a JSON object here with the filepath and parsed data
			var csvJSON = {
				"filepath": filepath,
				"data": e
			};
			us_map.data.push(csvJSON);
		});
		
		// Create the JSON attr array if it doesn't exist		
		if (state.widgets.us_map.bound_data == null) {
			state.widgets.us_map.bound_data = [];
			
		}

		// Push the data file's path to the state array
		state.widgets.us_map.bound_data.push(filepath);
	},
	
	// Load the state of the map from JSON
	// Pass in the state of the us_map component
	load_state: function(us_map_state) {
	
		// Clear the state of the us_map.data array and map preview frame
		us_map.data = [];
		
		if (us_map_state.render === true) {
			us_map.w = us_map_state.w;
			us_map.h = us_map_state.h;
			us_map.highlightingEnabled = us_map_state.highlightingEnabled;
			
			us_map.render();
			
			// Everything else should require the map so they are nested here
			if (us_map_state.bound_data.length > 0) {
				for (var i = 0; i < us_map_state.bound_data.length; i++) {
					us_map.bind_data(us_map_state.bound_data[i]);
				}
			}
			
			// HACK: It takes time to actually open and process 
			// the bind_data() function, so delay calling these to make sure it's done
			window.setTimeout(function() {
				if (us_map_state.circle_element.render === true) {
					for(var i=0; i<us_map.data.length; i++){
						if(us_map_state.circle_element.data === us_map.data[i].filepath){
							us_map.circle_element.render(us_map.data[i]);
							break; // This break might not be needed?
						}
					}
				}
			
				if (us_map_state.color === true) {
					us_map.colorize();
				}
				
				if (typeof us_map_state.UA !== 'undefined') {
					us_map.add_analytics(us_map_state.UA);
				}
			}, 500);
		}
	},
	
	circle_element: {
		// Assumes the data we want is the first element of the data array in us_map
		// Assumes we know that the data file is correct and has lat, long and such
		// Has a hard-coded filter
		render: function(dataJSON) {
			if(state.widgets.us_map.circle_element == null) {
				state.widgets.us_map.circle_element = {};
			}
			
			if (!us_map.data.length) {
				alert("Bind data to the widget first!");
				return;
			}
			
			// This should probably not be local to this function
			var populationRadiusScale = d3.scale.linear()
									.domain([1000,500000])
									.range([2,10])
									.clamp(true); 
			
			var data = dataJSON.data;
			
			// Create the circles
			us_map.svg.selectAll("circle")
				.data(data)
				.enter()
				.append("circle")
				.attr("cx", function(d, i) {
					var coords = us_map.projection([d.Lon, d.Lat]);
					if (coords !== null) {
						return us_map.projection([d.Lon, d.Lat])[0];            				
					}
				})
				.attr("cy", function(d, i) {
					var coords = us_map.projection([d.Lon, d.Lat]);
					if (coords !== null) {
						return us_map.projection([d.Lon, d.Lat])[1];            				
					}
				})
				.attr("r", function(d, i) {
					var coords = us_map.projection([d.Lon, d.Lat]);
					if (coords !== null) {
						return populationRadiusScale(d.TotPop);
					}
				})
				.style("fill", "red")
				.style("opacity", 0.75);
				
			// Since we're hard coding things now, we just need to know that this function
			// was called.
			state.widgets.us_map.circle_element.data = dataJSON.filepath;
			state.widgets.us_map.circle_element.render = true;
			
			// This is how it should be in the future
			//state.widgets.us_map.circle_element.data = data;
		}
	},
	
	add_analytics: function(UA) {
		var map_preview_document = $("#" + constants.MAP_PREVIEW_ID).contents();
		
		map_preview_document.find('head').append(
			"<script type=\"text/javascript\">" + 
                "var _gaq=_gaq || [];" +
				"_gaq.push(['_setAccount','" + UA + "']);" +
				"_gaq.push(['_trackPageview']);" +
				"(function() {" +
				"	var ga=document.createElement('script');" +
				"	ga.type='text/javascript';" +
				"	ga.async=true;" +
				"	ga.src=('https:'==document.location.protocol ? 'https://ssl' :'http://www') + '.google-analytics.com/ga.js';" +
				"	var s=document.getElementsByTagName('script')[0];" +
				"	s.parentNode.insertBefore(ga,s);" +
				"})();" +
			"</script>"
		);
		
		// There's an error here. us_map.json.features doesn't exist
		us_map.svg.selectAll("path")
			.data(us_map.json.features)
			.on("click", function(d) {
				console.log(d.properties.name);
				_gaq.push(['_trackEvent', 'Prototype', 'click-'+d.properties.name]);
			});
	},
	
	set_highlighting: function(enable) {
		us_map.highlightingEnabled = enable;
		
		// Update state
		state.widgets.us_map.highlightingEnabled = enable;
	}
};
