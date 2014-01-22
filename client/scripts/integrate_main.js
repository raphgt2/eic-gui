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

	require(['eic/PresentationController', 'eic/PresentationController2','eic/PiecesUI','eic/EditingNodes'], function(PresentationController, PresentationController2, PiecesUI, EditingNodes){
		var jsonObject,view,controller;
	    $.getJSON("../data_json/hash_object_test_1.json", function(data){
			jsonObject = data;
			controller = new PresentationController2(jsonObject);
			view = new PiecesUI(controller);

			//controller.init();
            view.initControls();
            
            controller.once("slide_generation_finish", function(){
            	alert("controller finish");
            	var editor = new SlideEditor(controller.generator, controller.path);
            });
            
			console.log("Hash Object Output", jsonObject);
			console.log("controller", controller);
			
			console.log("Controller I ", controller);
            var editing = new EditingNodes();
            console.log("Test Editing Nodes: ", editing);
            editing.EnableUIanimation();
            $("#lastStep").click(function(){
            	editing.grabMovieNav();
            });
            
            
            view.init();
			console.log("Controller II", controller);
			console.log("View", view);

	});
 
})(requirejs);

