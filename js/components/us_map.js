var us_map = {
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
	}
};

/*
This is the general form of the unique namespace. To call a function in this, we call 
us_map.functioncall(). To interact with the frame, we get it by calling $("#" + constants.MAP_PREVIEW_ID).contents();. The svg element is created here when generating the map. To get it we use $("#" + constants.MAP_PREVIEW_ID).contents().find('body').find('svg');. That returns the svg element and you can do whatever you want with it like appending new things.The benefit of doing things this way is that we decouple the different components from the main index page. The only things tying these components to the page are a script import at the top of the index page and the actual function calls. This makes it easy to add and remove components. We can even generate the html from these js files so they actually render a button with the appropriate onclick events. Then we can pretty much render almost the entire index page in a script.

I understand that this isn't exactly a "plugin" system in its truest form, but does allow for easy the easy addition and removal of components.
*/