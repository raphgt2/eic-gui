(function (requirejs) {
    "use strict";

    requirejs.config({
        shim: {
            'lib/jquery': {
                exports: 'jQuery'
            },
            'lib/d3': {
                exports: 'd3'
            },
            'lib/jqyerUI': {
                deps: ['lib/jquery__ui']
            },
            'lib/jquery.ui.core': {
                deps: ['lib/jquery']
            },
            'lib/jquery.ui.widget': {
                deps: ['lib/jquery.ui.core']
            },
            'lib/jquery.ui.position': {
                deps: ['lib/jquery.ui.core']
            },
            'lib/jquery.ui.autocomplete': {
                deps: ['lib/jquery.ui.core', 'lib/jquery.ui.widget', 'lib/jquery.ui.position']
            },
            'lib/jquery__ui': {
                deps: ['lib/jquery']
            },
            'lib/jvent': {
                exports: 'jvent'
            },
            'lib/jplayer.min': {
                deps: ['lib/jquery']
            },
            'lib/prefixfree.jquery': {
                deps: ['lib/prefixfree.min']
            },
            'eic/pluginsniff':{
                exports: 'pluginsniff'
            },
            'lib/base64_handler':{
                exports: 'base64_handler'
            },
        },
    });

    require(['eic/PresentationController2','eic/PiecesUI','eic/SlideEditor','eic/PathFinder', 'eic/HashParser', 'config/URLs'], 
	function(PresentationController2, PiecesUI, SlideEditor, PathFinder, HashParser, urls){

        var hashId = location.hash.slice(1);		
		var exitButtons = [];
	
		var button = $('<span>')
				.addClass('button')
				.click(function () {
				  window.location = window.location.pathname.slice(0,window.location.pathname.slice(1).indexOf('/')+1)+"/html/lodstories_demo.html";
				})
		   .text('Start over');
		exitButtons.push(button);
	   
		button = $('<span>')
		.addClass('button')
		.click(function () {
		 //window.location.reload();
		 $('#screenWrap').hide();
		 $('#editor').show();
		})
		.text('Back to editor');
		exitButtons.push(button);
		
		button = $('<span>')
		.addClass('button')
		.click(function () {
			$('#play-button').click();
		})
		.text('Replay');
		exitButtons.push(button);
		
		var options = {
			generatorOptions: {
				videoOptions: {
					maxVideoCount: 2
				}
			},
			outroOptions:{
				outroButtons: exitButtons
			}
		};

        $.ajax({
            url: urls.hashRetrieve,
            type: 'GET',
			dataType: 'json',
            data: {hashID: hashId},
            success: function (data) {
				//If there's no hash field, then the query failed. Go to search mode
				if (!data.hash){
					location.hash = "";
					$("#searchWindow").css("display", "inline");

					var path_finder = new PathFinder(options);
				}
				else{
					var path = JSON.parse(HashParser.prototype.unescapeString(data.hash));
					path.hashID = hashId;

					$("#editor").css("display", "inline");
					$("#body").css("display", "block");

					var controller = new PresentationController2(path, options);
					var view = new PiecesUI(controller);
					view.initControls();

					controller.once('slide_generation_finished', function(){
						var editor = new SlideEditor(controller.generator, controller.path, controller, path);
					});
				}
            },
            error: function(error){
                location.hash = "";
                $("#searchWindow").css("display", "inline");
				
				//Display the top 5 vids?
				$.ajax({
					url: urls.hashFilter,
					type: 'POST',
					data: {startIndex: 0},
					success: function(data){
						for (var i=0; i<data.hashObjects.length; i++){
							var item = document.createElement('span'); 
							$(item).addClass('thumbnailWrapper');
							item.videoID = data.hashObjects[i].hashID;
							$(item).append("<img src='"+data.hashObjects[i].thumbnail+"' class='vidThumbnail'>");
							$("#recommendedVideos").append(item);
						}
					},
					complete: function(){
					console.log(urls.videos);
						$(".thumbnailWrapper").click(function(){
							var selectedVid = $(this)[0].videoID;
							console.log(selectedVid);
							window.location = urls.videos+"#"+selectedVid;
							window.reload();
						});
						$("#recommendedVideos").append("<span><a href='"+urls.videos+"'>See more</a></span>")
					}
				});				

                var path_finder = new PathFinder(options);
            }
        });



    });

})(requirejs);