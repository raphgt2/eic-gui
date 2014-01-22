(function (requirejs) {
  "use strict";

  requirejs.config({
    shim: {
      'lib/jquery': {
        exports: 'jQuery'
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

	require(['eic/PresentationController', 'eic/PresentationController2','eic/PiecesUI', 'eic/SlideEditor'], function(PresentationController, PresentationController2, PiecesUI, SlideEditor){
		var jsonObject,view,controller;
	    $.getJSON("../data_json/hash_object_test_1.json", function(data){
			jsonObject = data;
			controller = new PresentationController2(jsonObject);
			view = new PiecesUI(controller);
			//controller.init();
            view.initControls();
			console.log("Hash Object Output", jsonObject);
			
			controller.once("slide_generation_finished", function(){
				var editor = new SlideEditor(controller.generator, controller.path);
			});
        		//view = new PiecesUI(controller);
			// var controller = new PresentationController(jsonObject);
			// view = new PiecesUI(controller);
			// controller.makeMovie();
			// controller.init();
			// view.init();
			
			
		});
		
		// $("#generateVideoEditor").click(function(){
			// console.log("controller", controller);
			// console.log("Hash Object Output", jsonObject);
		// });
// 			
	    //var controller = new PresentationController(jsonObject);
	      //  view = new PiecesUI(controller);
	        //controller.makeMovie();
	    //controller.init();
	    //view.init();;;;
	});
 
})(requirejs);

