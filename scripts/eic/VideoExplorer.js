/*
* LODStories Video Explorer
* Copyright 2014, LOD Story Team - University of Southern California - Information Sciences Institute
* Licensed under 
*/


define(['lib/jquery', 'eic/Logger', 'lib/d3','eic/PresentationController2','eic/PiecesUI', 'eic/SlideEditor', 'eic/Summarizer', 'config/URLs'],
function ($, Logger, d3,PresentationController2, PiecesUI, SlideEditor, Summarizer, urls) {  
	"use strict";
	var logger = new Logger("PathFinder");

	//Constructor
	function VideoExplorer() {
	
		this.init();
	}

	//Member functions
	VideoExplorer.prototype = {
		init: function(){
			var startLabel='';
			var url_ref;
			$.getJSON('../data_json/uri_matching.json', function(data) {
				url_ref = data;
			});

			$('#search').keyup(function() {
				var searchField = $('#search').val();
				var myExp = new RegExp(searchField, "i");
				var output = '<ul class="dropdown-menu" id="searchUpdate" role="menu" aria-labelledby="dropdownMenu1">';
				$.each(url_ref, function(key, val) {
					//console.log(key, val.name.search(myExp));
					if ((val.name.search(myExp) != -1)) {
						output += '<li role="presentation"><a class="searchItem" role="menuitem" tabindex="-1" href="#">';
						output += val.name;
						output += '</li>';
					}
				});
				output += '</ul>';
				$('#liveSearch').html(output);
				$(".searchItem").click(function(){
					startLabel = $(this).html();
					$('#search').val(startLabel);
					$('#liveSearch').empty();
				});
			});
			$("#searchButton").click(function(){
				if (startLabel=='')
					return;
					
				$.ajax({
					url: urls.hashFilter,
					type: 'GET',
					data: {startNode: startLabel},
					success: function (data) {
						console.log(data);
					},
					error: function(error){
						$("#messageBox").html("No videos for "+startLabel+" found. Why don't you <a href='/LODStories/html/lodstories_demo.html'>create one</a>?");
					}
				});
			});
		}
	};
   
   return VideoExplorer;
});