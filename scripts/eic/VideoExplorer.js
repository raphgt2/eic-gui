/*
* LODStories Video Explorer
* Copyright 2014, LOD Story Team - University of Southern California - Information Sciences Institute
* Licensed under 
*/


define(['lib/jquery', 'eic/Logger', 'lib/d3','eic/PresentationController','eic/PiecesUI', 'eic/SlideEditor', 'eic/HashParser', 'eic/Summarizer', 'config/URLs'],
function ($, Logger, d3,PresentationController, PiecesUI, SlideEditor, HashParser, Summarizer, urls) {  
	"use strict";
	var logger = new Logger("PathFinder");

	//Constructor
	function VideoExplorer(options) {
		this.options = options || {};
		this.init();
	}

	//Member functions
	VideoExplorer.prototype = {
		init: function(){
			var self = this;
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
					var label = HashParser.prototype.generateLabelFromUri(val.uri);
					if ((label.search(myExp) != -1)) {
						output += '<li role="presentation"><a class="searchItem" role="menuitem" tabindex="-1" href="#">';
						output += label;
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
					type: 'POST',
					data: {startNode: startLabel},
					success: function (data) {
						console.log(data);
						$("#searchWindow").css("display", "none");
						$("#videoList").show();
						for (var i=0; i<data.hashObjects.length; i++){
							$('#videoList').append("<tr><td class='videoID'>"+data.hashObjects[i].hashID+
												"</td><td class='videoThumbnailImage'>"+data.hashObjects[i].thumbnail+
												"</td><td class='videoTitle'>"+data.hashObjects[i].title+
												"</td><td class='videoAuthor'>"+data.hashObjects[i].author+
												"</td><td class='videoPath'>"+data.hashObjects[i].path+
												"</td><td class='videoRating'>"+data.hashObjects[i].rating+"</td></tr>");
						}
						
						$("tr").click(function(){							
							if ($(this).children("td.videoID").length>0){
								var selectedVid = $(this).children("td.videoID")[0];
								selectedVid = $(selectedVid).text();
								console.log(selectedVid);
								
								$.ajax({
									url: urls.hashRetrieve,
									type: 'GET',
									dataType: 'json',
									data: {hashID: selectedVid},
									success: function (data) {
										if (!data.hash){
											alert("Error loading video");
										}
										else{
											var path = JSON.parse(HashParser.prototype.unescapeString(data.hash));
											path.hashID = selectedVid;
											
											$("#videoList").hide();
											$('#screen').html('');
											$('#subtitles').text('');
											$('#screenWrap').show();

											var controller = new PresentationController(path, self.options);
											var view = new PiecesUI(controller);
											view.initControls();
										}
									},
									error: function(error){
										console.log(error);
										alert("Error loading video");
									}
								});
							}
							else
								console.log("header");
						});
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