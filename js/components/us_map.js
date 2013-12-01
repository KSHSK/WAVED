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
    
    /* Generate the map of the US */
    render: function() {
        // This is the jQuery way of adding attributes to a JSON object
        widgets.push(this);
        $.extend(state.widgets, {"us_map":{}});
        
        $("#map-generate-button").attr("disabled", "disabled");
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
                    }
                );
            }
        });
        
        // Default values for state
        state.widgets.us_map.render = true;
        state.widgets.us_map.bound_data = [];
        state.widgets.us_map.circle_element = {};
        state.widgets.us_map.width = us_map.width;
        state.widgets.us_map.height = us_map.height;
        state.widgets.us_map.highlightingEnabled = us_map.highlightingEnabled;
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
        
        if (us_map_state.render === true) {
            us_map.width = us_map_state.width;
            us_map.height = us_map_state.height;
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
        render: function(options) {
        
            us_map.renderCircles = true;
            
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
            
            var data = options.data.data;
            
            // Create the circles
            us_map.svg.selectAll("circle")
                .data(data)
                .enter()
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
            us_map.svg.selectAll("circle")
                .data(data)
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
        
        // Hack until how we're packaging data with the download is decided
        // TODO: Update d.Lon, d.Lat w/ the options passed in to glyph render function, same w/ data filepath
        var renderCircleString = "";
        if (us_map.renderCircles) {
        	
        	var filepath = state.widgets.us_map.circle_element.data;
        	var lon = state.widgets.us_map.circle_element.lon;
        	var lat = state.widgets.us_map.circle_element.lat;
        	var size = state.widgets.us_map.circle_element.size;
        	var color = state.widgets.us_map.circle_element.color;
        	var opacity = state.widgets.us_map.circle_element.opacity;
        
            renderCircleString = 
                // Filepath should be selected from the map's state.                 
                ("\t" + "d3.csv(\""+ filepath +"\", function(error, data) {" + "\n" + 
                "\t" + "\t" + "if (error) {" + "\n" + 
                "\t" + "\t" + "\t" + "console.log(error)" + "\n" + 
                "\t" + "\t" + "} else {" + "\n" + 
                // This will eventually be a user defined scale.
                "\t" + "\t" + "\t" + "var populationRadiusScale = d3.scale.linear().domain([1000,500000]).range([2,10]).clamp(true);" + "\n" + 
                
                "\t" + "\t" + "\t" + "svg.selectAll(\"circle\")" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + ".data(data)" + "\n" + 
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
          
        return ("\t" + "var svg = d3.select(\"#" + constants.EXPORT_CONTAINER_ID + "\")" + "\n" +
                "\t" + ".append(\"svg\")" + "\n" +
                "\t" + ".attr(\"width\", " + us_map.width + ")" + "\n" +
                "\t" + ".attr(\"height\", " + us_map.height + ");" + "\n\n" +
                
                "\t" + "var projection = d3.geo.albersUsa().translate(([" + us_map.width/2.0 + ", " + us_map.height/2.0 + "]));" + "\n" +
                "\t" + "var path = d3.geo.path().projection(projection);" + "\n\n" + 
                
                // TODO: We need to export data/states.json with the finished application
                "\t" + "d3.json(\"data/states.json\", function(error, json) {" + "\n" +
                "\t" + "if(error) {" + "\n" +
                "\t" + "\t" + "console.log(error)" + "\n" +
                "\t" + "}" + "\n" + 
                "\t" + "else {" + "\n" + 
                "\t" + "\t" + "svg.selectAll(\"path\")" + "\n" + 
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
                "\t" + "\t" + "\t" + "})" + "\n" + 
                "\t" + "\t" + "\t" + ".on(\"mouseout\", function(d){" + "\n" + 
                "\t" + "\t" + "\t" + "\t" + (us_map.highlightingEnabled ? "d3.select(this).style(\"opacity\", 1.0);" : "") + "\n" +                 
                "\t" + "\t" + "\t" + "})" + "\n" + 
                "\t" + "\t" + "\t" + ".on(\"click\", function(d){" + "\n" + 
                // For debugging
                "\t" + "\t" + "\t" + "\t" + "console.log('Clicked ' + d.properties.name);" + "\n" +
                // TODO: Use exported application's name for tracking events.
                "\t" + "\t" + "\t" + "\t" + (us_map.UA.length === 0 ? "" : "_gaq.push(['_trackEvent', 'ExportedPrototype', 'click-'+d.properties.name]);") + "\n" +                 
                "\t" + "\t" + "\t" + "});" + "\n" +
                renderCircleString + "\n" + 
                "\t" + "}" + "\n"
                 + "})");
    }
};
