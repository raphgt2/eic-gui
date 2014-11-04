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

        require(['eic/PresentationController', 'eic/PresentationController2','eic/PiecesUI','eic/SlideEditor','eic/PathFinder'], function(PresentationController, PresentationController2, PiecesUI, SlideEditor, PathFinder){
			
			var hashId = location.hash.slice(1);
		  
			$.ajax({
				url: "/LODStories-1.0.0-SNAPSHOT/retrieveHash?",	
				type: 'GET',
				data: {hashID: location.hash.slice(1)},
				success: function (path) {
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
					$("#searchWindow").css("display", "inline");
			
					var jsonObject = {
						"source": {
							"name": "Hillary Rodham Clinton",
							"uri": "http://dbpedia.org/resource/Hillary_Rodham_Clinton"
						},
						"destination": {
							"name": "William Joseph Burns",
							"uri": "http://dbpedia.org/resource/William_Joseph_Burns"
						},
						"path": [
							{
								"type": "node",
								"name": "Hillary Rodham Clinton",
								"uri": "http://dbpedia.org/resource/Hillary_Rodham_Clinton"
							},
							{
								"type": "link",
								"inverse": true,
								"uri": "http://dbpedia.org/ontology/deputy"
							},
							{
								"type": "node",
								"name": "William Joseph Burns",
								"uri": "http://dbpedia.org/resource/William_Joseph_Burns"
							}
						]
					};

					var path_finder = new PathFinder(jsonObject);
				}
			});
            
            
            
        });
 
})(requirejs);