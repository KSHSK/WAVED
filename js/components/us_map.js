var us_map = {
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
	}
};