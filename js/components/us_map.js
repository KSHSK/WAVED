var us_map = {
	// Holds JSONs with filenames and data
	// For storing in our db, do we need a way to compact all of these into 1 JSON object?
	// Need a way to list all of these somewhere and update it dynamically when new data is loaded
	data: [],
	
	/* Generate the map of the US */
	generate: function(){
		var map_preview_document = $("#" + constants.MAP_PREVIEW_ID).contents();
		
		map_preview_document.find('head').html(constants.D3_IMPORT + "\n" + 
			constants.JQUERY_IMPORT + "\n" + 
			constants.JQUERY_UI_IMPORT + "\n" + 
			constants.COMMON_STYLE_IMPORT + "\n" + 
			constants.JQUERY_UI_STYLE_IMPORT
		);
		
		map_preview_document.find('body').append(
			"<script>" + 
				"var w = 800;" +
    			"var h = 500;" +
    			"var svg = d3.select(document.getElementById(constants.MAP_PREVIEW_ID).contentDocument.body)" +
					".append(\"svg\")" +
					".attr(\"width\", w)" + 
					".attr(\"height\", h);" + 
				"var projection = d3.geo.albersUsa().translate([w/2, h/2]);" + 
				"var path = d3.geo.path().projection(projection);" + 
				"d3.json(\"/data/states.json\", function (error, json) {" + 
				"	if(error) {" + 
				"		console.log(error);" + 
				"	}" + 
				"	else {" + 
				"		svg.selectAll(\"path\")" + 
				"			.data(json.features)" + 
				"			.enter()" + 
				"			.append(\"path\")" + 
				"			.attr(\"d\", path);" + 
				"	}" + 
				"});" + 
			"</script>"
		);
	},
	
	/* Get the svg object */
	get_svg: function(){
		return svg_element = $('#' + constants.MAP_PREVIEW_ID).contents().find('body').find('svg');
	},
	
	get_script: function(){
		console.log($('#' + constants.MAP_PREVIEW_ID).contents().find('body').find('script').html());
	},
	
	/* Randomly colors each state */
	colorize: function(){
		svg.selectAll("path")
			.style("fill", function(d){
				var letters = '0123456789ABCDEF'.split('');
			    var color = '#';
			    for (var i = 0; i < 6; i++ ) {
			        color += letters[Math.round(Math.random() * 15)];
			    }
    			
    			return color;
			});
	},
	
	bind_data: function(filepath){
		d3.csv(filepath, function(e){
			// Create a JSON object here with the filepath and parsed data
			var csvJSON = {
				"filepath": filepath,
				"data": e
			};
			us_map.data.push(csvJSON);
		});
	},
	
	circle_element: {
		// Assumes the data we want is the first element of the data array in us_map
		// Assumes we know that the data file is correct and has lat, long and such
		// Has a hard-coded filter
		render: function(){
			var data = us_map.data[0].data;
			
			// This should probably not be local to this function
			var populationRadiusScale = d3.scale.linear()
									.domain([1000,500000])
									.range([2,10])
									.clamp(true); 
			
			// Create the circles
			svg.selectAll("circle")
				.data(data)
				.enter()
				.append("circle")
				.attr("cx", function(d, i){
					var coords = projection([d.Lon, d.Lat]);
					if (coords !== null) {
						return projection([d.Lon, d.Lat])[0];            				
					}
				})
				.attr("cy", function(d, i){
					var coords = projection([d.Lon, d.Lat]);
					if (coords !== null) {
						return projection([d.Lon, d.Lat])[1];            				
					}
				})
				.attr("r", function(d, i){
					var coords = projection([d.Lon, d.Lat]);
					if (coords !== null) {
						return populationRadiusScale(d.TotPop);
					}
				})
				.style("fill", "red")
				.style("opacity", 0.75);
		}
	}
};

/*
This is the general form of the unique namespace. To call a function in this, we call 
us_map.functioncall(). To interact with the frame, we get it by calling $("#" + constants.MAP_PREVIEW_ID).contents();. The svg element is created here when generating the map. To get it we use $("#" + constants.MAP_PREVIEW_ID).contents().find('body').find('svg');. That returns the svg element and you can do whatever you want with it like appending new things.The benefit of doing things this way is that we decouple the different components from the main index page. The only things tying these components to the page are a script import at the top of the index page and the actual function calls. This makes it easy to add and remove components. We can even generate the html from these js files so they actually render a button with the appropriate onclick events. Then we can pretty much render almost the entire index page in a script.

I understand that this isn't exactly a "plugin" system in its truest form, but does allow for easy the easy addition and removal of components.
*/