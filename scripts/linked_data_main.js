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

        require(['eic/PresentationController2','eic/PiecesUI','eic/SlideEditor','eic/PathFinder', 'config/URLs'], function(PresentationController2, PiecesUI, SlideEditor, PathFinder, urls){
			
			var hashId = location.hash.slice(1);
			
			function unescapeString(str){			
				str = str.replace(/\\\\/g,"\\");
				str = str.replace(/\\0/g, "\0");
				str = str.replace(/\\n/g, "\n");
				str = str.replace(/\\r/g, "\r");
				str = str.replace(/\\'/g, "'");
				str = str.replace(/\\"/g, '"');
				str = str.replace(/\\Z/g, "\x1a");
				
				return str;
			}
		  
			$.ajax({
				url: urls.hashRetrieve,	
				type: 'GET',
				data: {hashID: hashId},
				success: function (data) {
					var path = JSON.parse(unescapeString(data));
					path.hashID = hashId;
					
					$("#editor").css("display", "inline");
					$("#body").css("display", "block");
					
					var controller = new PresentationController2(path);
					var view = new PiecesUI(controller);
					view.initControls();
					
					controller.once('slide_generation_finished', function(){
						var editor = new SlideEditor(controller.generator, controller.path, controller, path);
					});
				},
				error: function(error){
					location.hash = "";
					$("#searchWindow").css("display", "inline");

					var path_finder = new PathFinder();
				}
			});
            
            
            
        });
 
})(requirejs);