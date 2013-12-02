var us_map = {
    // Holds JSONs with filenames and data
    // For storing in our db, do we need a way to compact all of these into 1 JSON object?
    // Need a way to list all of these somewhere and update it dynamically when new data is loaded
    data: [],
    svg: "",
    projection: "",
    width: 0,
    height: 0,
    highlightingEnabled: false,
    renderCircles: false,
    color: "black",
    _gaq: [],
    UA: "",
    stateZoomEnabled: false,
    centered: null,
    g: null,
    
    /* Generate the map of the US */
    render: function() {
        // This is the jQuery way of adding attributes to a JSON object
        widgets.push(this);
        $.extend(state.widgets, {"us_map":{}});

        $("#widget-selector").append("<option id='us-map-widget-option'>US Map</option>");
        $("#us-map-widget-option").on("click", function(){
            $("#data-selector").empty();
            for (var i = 0; i < us_map.data.length; i++) {
                $("#data-selector").append("<option>"+ us_map.data[i].filepath +"</option>");
            }
        });
        
        // Default values
        if(us_map.width <= 0){
            us_map.width = 800;
        }
        if(us_map.height <= 0){
            us_map.height = 500;
        }
        
        us_map.projection = d3.geo.albersUsa().translate(([us_map.width/2.0, us_map.height/2.0]));
        var path = d3.geo.path().projection(us_map.projection);
        
        // Put the svg inside the preview div
        us_map.svg = d3.select("#" + constants.MAP_PREVIEW_ID)
            .append("svg")
            .attr("width", us_map.width)
            .attr("height", us_map.height);
        
        us_map.g = us_map.svg.append("g");
        
        d3.json("data/states.json", function(error, json){
            if(error){
                console.log(error);
            }
            else {                
                us_map.g.append("g")
                    .attr("id", "states")
                    .selectAll("path")
                    .data(json.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("stroke", "white")
                    .on("mouseover", function(d){
                        if (us_map.highlightingEnabled){
                            d3.select(this).style("opacity", 0.5);
                        }
                        
                        if (us_map.tooltip) {
                        	var coords = d3.mouse(this);
							var x = coords[0];
							var y = coords[1];

							d3.select("#tooltip")
									.style("left", x + "px")
									.style("top", y + "px")
									.select("#state-name")
									.text(d.properties.name);
							
							d3.select("#tooltip").classed("hidden", false);
                        }
                    })
                    .on("mousemove", function(d) {
                    	if (us_map.tooltip) {
							var coords = d3.mouse(this);
							var x = coords[0];
							var y = coords[1];

							d3.select("#tooltip")
									.style("left", x + "px")
									.style("top", y + "px");
						}
                    })
                    .on("mouseout", function(d) {
                        d3.select(this).style("opacity", 1.0);    
                        
                        if (us_map.tooltip) {
                        	d3.select("#tooltip").classed("hidden", true);
                        }
                    })
                    .on("click", function(d){
                        if(us_map.stateZoomEnabled){
                            us_map.state_zoom(d);
                        }
                    });
                
                us_map.g.append("path")
                    .datum(topojson.mesh(json, json, function(a, b){ return a !== b; }))
                    .attr("id", "state-borders")
                    .attr("d", path);
            }
        });
        
        // Default values for state
        state.widgets.us_map.render = true;
        state.widgets.us_map.bound_data = [];
        state.widgets.us_map.circle_element = {};
        state.widgets.us_map.width = us_map.width;
        state.widgets.us_map.height = us_map.height;
        state.widgets.us_map.highlightingEnabled = us_map.highlightingEnabled;
        state.widgets.us_map.tooltip = us_map.tooltip;
        state.widgets.us_map.stateZoomEnabled = us_map.stateZoomEnabled;
    },
    
    /* Get the svg object */
    get_svg: function() {
        return us_map.svg;
    },
    
    /* Randomly colors each state */
    colorize: function(color) {
    
        // Update the model and state.
        us_map.color = color;
        state.widgets.us_map["color"] = color;
        
        us_map.svg.selectAll("path")
            .style("fill", function(d) {
                if (us_map.color === "random") {
                    var letters = '0123456789ABCDEF'.split('');
                    var color = '#';
                    for (var i = 0; i < 4; i++) {
                        color += letters[Math.round(Math.random() * 15)];
                    }
                    color = color.substr(0, 3) + "DD" + color.substr(3);
                    return color;
                } else {
                    return us_map.color;
                }
            }
        );
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
        
        if (us_map_state && us_map_state.render === true) {
            us_map.width = us_map_state.width;
            us_map.height = us_map_state.height;
            us_map.highlightingEnabled = us_map_state.highlightingEnabled;
            us_map.tooltip = us_map_state.tooltip;
            us_map.stateZoomEnabled = us_map_state.stateZoomEnabled;
            
            us_map.render();
            state.widgets.us_map.data_filter = us_map_state.data_filter;
            
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
                    for(var i = 0; i < us_map.data.length; i++){
                        if(us_map_state.circle_element.data === us_map.data[i].filepath){
                        
                        	var options = {
								data: us_map.data[i],
								color: us_map_state.circle_element.color,
								lat: us_map_state.circle_element.lat,
								lon: us_map_state.circle_element.lon,
								size: us_map_state.circle_element.size,
								opacity: us_map_state.circle_element.opacity
							};
							
                            us_map.circle_element.render(options);
                            break; // This break might not be needed?
                        }
                    }
                }
            
                if (us_map_state.color) {
                    us_map.colorize(us_map_state.color);
                }
                
                if (typeof us_map_state.UA !== 'undefined') {
                    us_map.add_analytics(us_map_state.UA);
                }
            }, 500);
        }
    },
    
    // TODO: Rename circle_element to glyphs or something since we now
    // provide a way to choose between whether glyphs are circles or rectangles.
    circle_element: {
        // Assumes the data we want is the first element of the data array in us_map
        // Assumes we know that the data file is correct and has lat, long and such
        // Has a hard-coded filter
        render: function(options, filterOptions) {
        
            us_map.renderCircles = true;
            us_map.circle_element.data = options.data.filepath;
            us_map.circle_element.size = options.size;
            us_map.circle_element.color = options.color;
            us_map.circle_element.opacity = options.opacity;
            us_map.circle_element.lat = options.lat;
            us_map.circle_element.lon = options.lon;
            
            if(state.widgets.us_map.circle_element == null) {
                state.widgets.us_map.circle_element = {};
            }
            
            if (!us_map.data.length) {
                alert("Bind data to the widget first!");
                return;
            }
            
            // This should probably not be local to this function
            // TODO: Make domain based on actual data values and range based on user input.
            var populationRadiusScale = d3.scale.linear()
                                    .domain([1000,500000])
                                    .range([2,10])
                                    .clamp(true); 
            
			var data;
            
            if (typeof filterOptions !== 'undefined') {
                state.widgets.us_map.data_filter = filterOptions;
            }

            if (typeof state.widgets.us_map.data_filter !== 'undefined') {
                filterOptions = state.widgets.us_map.data_filter;
            	data = us_map.data[filterOptions.data].data;
				
				
				us_map.circle_element.filter = true;
				us_map.circle_element.filterOperator = filterOptions.operator;
				us_map.circle_element.value = filterOptions.value;
				us_map.circle_element.field = filterOptions.field;
				
            	data = data.filter(function(d) {
            		if (filterOptions.operator === '<') {
            			return d[filterOptions.field] < filterOptions.value;
            		} else if (filterOptions.operator === '<=') {
            			return d[filterOptions.field] <= filterOptions.value;
            		} else if (filterOptions.operator === '=') {
            			return d[filterOptions.field] === filterOptions.value;
            		} else if (filterOptions.operator === '>=') {
            			return d[filterOptions.field] >= filterOptions.value;
            		} else if (filterOptions.operator === '>') {
            			return d[filterOptions.field] > filterOptions.value;
            		} else if (filterOptions.operator === '!=') {
            			return d[filterOptions.field] !== filterOptions.value;
            		}
            	});
            } else {
				data = options.data.data;
            }
            
            var n = us_map.g.selectAll("circle")
            			.data(data, function(d) {
            				return d.GEOID10; 	// TODO: don't use this arbitrary field, since it might not exist.
            			});
            
            // Create the circles
            n.enter()
                .append("circle")
                .attr("cx", function(d, i) {
                    var coords = us_map.projection([d[options.lon], d[options.lat]]);
                    if (coords !== null) {
                        return us_map.projection([d[options.lon], d[options.lat]])[0];                            
                    }
                })
                .attr("cy", function(d, i) {
                    var coords = us_map.projection([d[options.lon], d[options.lat]]);
                    if (coords !== null) {
                        return us_map.projection([d[options.lon], d[options.lat]])[1];                            
                    }
                })
                .attr("r", function(d, i) {
                    var coords = us_map.projection([d[options.lon], d[options.lat]]);
                    if (coords !== null) {
                        return populationRadiusScale(d[options.size]);
                    }
                })
                .style("fill", options.color)
                .style("opacity", options.opacity);
                
                
            // Update glyphs
            n.attr("cx", function(d, i) {
                    var coords = us_map.projection([d[options.lon], d[options.lat]]);
                    if (coords !== null) {
                        return us_map.projection([d[options.lon], d[options.lat]])[0];                            
                    }
                })
                .attr("cy", function(d, i) {
                    var coords = us_map.projection([d[options.lon], d[options.lat]]);
                    if (coords !== null) {
                        return us_map.projection([d[options.lon], d[options.lat]])[1];                            
                    }
                })
                .attr("r", function(d, i) {
                    var coords = us_map.projection([d[options.lon], d[options.lat]]);
                    if (coords !== null) {
                        return populationRadiusScale(d[options.size]);
                    }
                })
                .style("fill", options.color)
                .style("opacity", options.opacity);
                
            // Remove glyphs
            n.exit()
            	.remove();
            
            state.widgets.us_map.circle_element.data = options.data.filepath;
            state.widgets.us_map.circle_element.render = true;
            state.widgets.us_map.circle_element.color = options.color;
            state.widgets.us_map.circle_element.opacity = options.opacity;
            state.widgets.us_map.circle_element.size = options.size;
            state.widgets.us_map.circle_element.lat = options.lat;
            state.widgets.us_map.circle_element.lon = options.lon;
            
        }
    },
    
    // This function doesn't actually need to do anything except update the state
    // You generate the script with all the specific google analytics code during generation
    add_analytics: function(UA) {        
    
        // Update widget's properties
        us_map.UA = UA;
        
        // Update application state
        state.widgets.us_map.UA = UA;
    },
    
    set_highlighting: function(enable) {
        us_map.highlightingEnabled = enable;
        
        // Update state
        state.widgets.us_map.highlightingEnabled = enable;
    },
    
    set_tooltip: function(enable) {
        us_map.tooltip = enable;
        
        state.widgets.us_map.tooltip = enable;
    },
    
    set_state_zoom: function(enable){
        us_map.stateZoomEnabled = enable;
        
        state.widgets.us_map.stateZoomEnabled = enable;
    },
    
    
    state_zoom: function(d){
        var x, y, k;
        
        if(d && us_map.centered !== d){
            var centroid = d3.geo.path().projection(us_map.projection).centroid(d);
            x = centroid[0];
            y = centroid[1];
            k=4;
            us_map.centered = d;
        }
        else{
            x = us_map.width/2.0;
            y = us_map.height/2.0;
            k = 1;
            us_map.centered = null;
        }
        
        us_map.g.transition()
            .duration(750)
            .attr("transform", "translate(" 
                + us_map.width/2.0 + "," 
                + us_map.height/2.0 + ")scale(" 
                + k + ")translate(" 
                + -x + "," + -y + ")")
            .style("stroke-width", 1.5/k + "px");
    },
    
    get_GA_header_script: function() {
        if (us_map.UA.length !== 0) {
            function GASetup() {
                var _gaq = _gaq || [];
                _gaq.push(['_setAccount', us_map.UA]);
                _gaq.push(['_trackPageview']);
                (function() {
                    var ga=document.createElement('script');
                    ga.type='text/javascript';
                    ga.async=true;
                    ga.src=('https:'==document.location.protocol ? 'https://ssl' :'http://www') + '.google-analytics.com/ga.js';
                    var s=document.getElementsByTagName('script')[0];
                    s.parentNode.insertBefore(ga,s);
                })();
            }
            
            var str = GASetup.toString().replace("us_map.UA", "'" +us_map.UA + "'");
            return str.substring(str.indexOf("{") + 1, str.lastIndexOf("}"));            
        }
        
        return "";
    },
    
    exportJS: function() {
                    
        var colorFunc;
        if (us_map.color === "random") {
            colorFunc = "var letters = '0123456789ABCDEF'.split('');" + "\n" +
                        "\t\t\t\t" + "var color = '#';"  + "\n" +
                        "\t\t\t\t" + "for (var i = 0; i < 4; i++) {" + "\n" +
                        "\t\t\t\t" + "\t" + "color += letters[Math.round(Math.random() * 15)];" + "\n" +
                        "\t\t\t\t" + "}" + "\n" +
                        "\t\t\t\t" + "color = color.substr(0, 3) + \"DD\" + color.substr(3);" + "\n" +
                        "\t\t\t\t" + "return color;"; 
        } else {
            colorFunc = "return \"" + us_map.color + "\";";
        }
        
        // TODO: There are hardcoded values in here that should be tied to some variables eventually
        var state_zoom_func = 
            "var x, y, k;" + "\n" +
        
		"\t\t\t\t" + "if(d && centered !== d){" + "\n" + 
            "\t\t\t\t\t" + "var centroid = path.centroid(d);" + "\n" +
            "\t\t\t\t\t" + "x = centroid[0];" + "\n" +
            "\t\t\t\t\t" + "y = centroid[1];" + "\n" +
            "\t\t\t\t\t" + "k=4;" + "\n" +
            "\t\t\t\t\t" + "centered = d;" + "\n" +
		"\t\t\t\t" +  "}" + "\n" +
		"\t\t\t\t" +  "else{" + "\n" +
			"\t\t\t\t\t" + "x = " + us_map.width/2.0 + ";" + "\n" +
			"\t\t\t\t\t" + "y = " + us_map.height/2.0 + ";" + "\n" +
        	"\t\t\t\t\t" + "k = 1;" + "\n" +
			"\t\t\t\t\t" + "centered = null;" + "\n" +
        "\t\t\t\t" + "}" + "\n" +
        "\t\t\t\t" + "g.transition()" + "\n" +
        "\t\t\t\t" + ".duration(750)" + "\n" +
        "\t\t\t\t" + ".attr(\"transform\", \"translate(\"" + "\n" +
			"\t\t\t\t\t" + "+ " + us_map.width/2.0 + "+ \",\"" + "\n" +
			"\t\t\t\t\t" + "+ " + us_map.height/2.0 + " +\")scale(\"" + "\n" + 
			"\t\t\t\t\t" + "+ k + \")translate(\"" + "\n" + 
			"\t\t\t\t\t" + "+ -x + \",\" + -y + \")\")" + "\n" +
		"\t\t\t\t" + ".style(\"stroke-width\", 1.5/k + \"px\");";
        
        console.log(state_zoom_func);
        
        var tooltipHoverString = "";
        var tooltipMoveString = "";
        var tooltipOutString = "";
        
        if (us_map.tooltip) {
        	tooltipHoverString += "var coords = d3.mouse(this);" + "\n" +
							"\t\t\t\t" + "var x = coords[0];" + "\n" +
							"\t\t\t\t" + "var y = coords[1];" + "\n" +

							"\t\t\t\t" + "d3.select(\"#tooltip\")" + "\n" +
							"\t\t\t\t\t" + ".style(\"left\", (x + 20) + \"px\")" + "\n" +
							"\t\t\t\t\t" + ".style(\"top\", (y - 42)+ \"px\")" + "\n" +
							"\t\t\t\t\t" + ".select(\"#state-name\")" + "\n" +
							"\t\t\t\t\t" + ".text(d.properties.name);" + "\n" +
							
							"\t\t\t\t" + "d3.select(\"#tooltip\").classed(\"hidden\", false);" + "\n";
							
			tooltipMoveString += "var coords = d3.mouse(this);" + "\n" +
							"\t\t\t\t" + "var x = coords[0];" + "\n" +
							"\t\t\t\t" + "var y = coords[1];" + "\n" +

							"\t\t\t\t" + "d3.select(\"#tooltip\")" + "\n" +
							"\t\t\t\t\t" + ".style(\"left\", (x + 20) + \"px\")" + "\n" +
							"\t\t\t\t\t" + ".style(\"top\", (y - 42) + \"px\");" + "\n";
							
			tooltipOutString += "d3.select(\"#tooltip\").classed(\"hidden\", true);" + "\n";
        }
        
        var renderCircleString = "";
        if (us_map.renderCircles) {
        	
        	var filepath = us_map.circle_element.data;
        	var lon = us_map.circle_element.lon;
        	var lat = us_map.circle_element.lat;
        	var size = us_map.circle_element.size;
        	var color = us_map.circle_element.color;
        	var opacity = us_map.circle_element.opacity;
        	
        	var filterString = "";
        	if (us_map.circle_element.filter) {
        		var operator = us_map.circle_element.filterOperator;
				var value = us_map.circle_element.value;
				var field = us_map.circle_element.field;
				
				filterString = "\t\t\t\t.filter(function(d){" + "\n" +
							   "\t\t\t\t\treturn d." + field + " " + operator + " " + value + ";" + "\n" +
								"\t\t\t\t})";
        	}
        
            renderCircleString = 
                // Filepath should be selected from the map's state.                 
                ("\t" + "// Create glyphs" + "\n" +
                "\t" + "d3.csv(\""+ filepath +"\", function(error, data) {" + "\n" + 
                "\t" + "\t" + "if (error) {" + "\n" + 
                "\t" + "\t" + "\t" + "console.log(error)" + "\n" + 
                "\t" + "\t" + "} else {" + "\n" + 
                // This will eventually be a user defined scale.
                "\t" + "\t" + "\t" + "var populationRadiusScale = d3.scale.linear().domain([1000,500000]).range([2,10]).clamp(true);" + "\n" + 
                
                "\t" + "\t" + "\t" + "g.selectAll(\"circle\")" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + ".data(data" + ((filterString.length === 0) ? "" : filterString) + ")" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + ".enter()" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + ".append(\"circle\")" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + ".attr(\"cx\", function(d, i) {" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + "\t" + "var coords = projection([d." + lon + ", d." + lat + "]);" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + "\t" + "if (coords !== null) {" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + "\t" + "\t" + "return projection([d." + lon + ", d." + lat + "])[0];" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + "\t" + "}" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + "})" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + ".attr(\"cy\", function(d, i) {" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + "\t" + "var coords = projection([d." + lon + ", d." + lat + "]);" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + "\t" + "if (coords !== null) {" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + "\t" + "\t" + "return projection([d." + lon + ", d." + lat + "])[1];" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + "\t" + "}" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + "})" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + ".attr(\"r\", function(d, i) {" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + "\t" + "var coords = projection([d." + lon + ", d." + lat + "]);" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + "\t" + "if (coords !== null) {" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + "\t" + "\t" + "return populationRadiusScale(d." + size + ");" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + "\t" + "}" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + "})" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + ".style(\"fill\", \"" + color + "\")" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + ".style(\"opacity\", " + opacity + ");" + "\n" + 
                "\t" + "\t" + "}" + "\n" + 
                "\t" + "});" + "\n");
        }
          
        return ("\t" + "// Create SVG Container" + "\n" +
        		"\t" + "var svg = d3.select(\"#" + constants.EXPORT_CONTAINER_ID + "\")" + "\n" +
                "\t" + "\t" + ".append(\"svg\")" + "\n" +
                "\t" + "\t" + ".attr(\"width\", " + us_map.width + ")" + "\n" +
                "\t" + "\t" + ".attr(\"height\", " + us_map.height + ");" + "\n\n" +
                
                "\t" + "var projection = d3.geo.albersUsa().translate(([" + us_map.width/2.0 + ", " + us_map.height/2.0 + "]));" + "\n" +
                "\t" + "var path = d3.geo.path().projection(projection);" + "\n\n" + 
                "\t" + "var g = svg.append(\"g\");" + "\n" +
                "\t" + "var centered = null;" + "\n" +
                "\n" +
                "\t" + "// Load state geometry and create map." + "\n" +
                "\t" + "d3.json(\"data/states.json\", function(error, json) {" + "\n" +
                "\t" + "if(error) {" + "\n" +
                "\t" + "\t" + "console.log(error)" + "\n" +
                "\t" + "}" + "\n" + 
                "\t" + "else {" + "\n" + 
                "\t" + "\t" + "g.append(\"g\")" + "\n" + 
                "\t" + "\t" + "\t" + ".attr(\"id\", \"states\")" + "\n" + 
                "\t" + "\t" + "\t" + ".selectAll(\"path\")" + "\n" + 
                "\t" + "\t" + "\t" + ".data(json.features)" + "\n" + 
                "\t" + "\t" + "\t" + ".enter()" + "\n" + 
                "\t" + "\t" + "\t" + ".append(\"path\")" + "\n" + 
                "\t" + "\t" + "\t" + ".attr(\"d\", path)" + "\n" + 
                "\t" + "\t" + "\t" + ".attr(\"stroke\", \"white\")" + "\n" + 
                "\t" + "\t" + "\t" + ".style(\"fill\", function(d) {" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + colorFunc + "\n" + 
                "\t" + "\t" + "\t" + "})" + "\n" + 
                "\t" + "\t" + "\t" + ".on(\"mouseover\", function(d){" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + (us_map.highlightingEnabled ? "d3.select(this).style(\"opacity\", 0.5);" : "") + "\n" +
                "\t" + "\t" + "\t" + "\t" + (us_map.tooltip ? tooltipHoverString : "") + "\n" +
                "\t" + "\t" + "\t" + "})" + "\n" + 
                "\t" + "\t" + "\t" + ".on(\"mousemove\", function(d){" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + (us_map.tooltip ? tooltipMoveString : "") + "\n" +
                "\t" + "\t" + "\t" + "})" + "\n" + 
                "\t" + "\t" + "\t" + ".on(\"mouseout\", function(d){" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + (us_map.highlightingEnabled ? "d3.select(this).style(\"opacity\", 1.0);" : "") + "\n" +
                "\t" + "\t" + "\t" + "\t" + (us_map.tooltip ? tooltipOutString : "") + "\n" +
                "\t" + "\t" + "\t" + "})" + "\n" + 
                "\t" + "\t" + "\t" + ".on(\"click\", function(d){" + "\n" + 
                // For debugging
                "\t" + "\t" + "\t" + "\t" + "console.log('Clicked ' + d.properties.name);" + "\n" +
                // Add zooming on click
                "\t" + "\t" + "\t" + "\t" + (us_map.stateZoomEnabled ? state_zoom_func : "") + "\n" +
                // TODO: Use exported application's name for tracking events.
                "\t" + "\t" + "\t" + "\t" + (us_map.UA.length === 0 ? "" : "_gaq.push(['_trackEvent', 'ExportedPrototype', 'click-'+d.properties.name]);") + "\n" +                 
                "\t" + "\t" + "\t" + "});" + "\n" +
                renderCircleString + "\n" + 
                "\t" + "}" + "\n"
                 + "})");
    }
};
