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

  require(['eic/PresentationController', 'eic/PiecesUI', 'config/URLs'], function (PresentationController, PiecesUI, urls) {
		$('#frame').show();
		
		$(document).ready(function(){
			$.ajax({
                type: "GET",
                url: urls.singlepath,
                dataType: "jsonp",
                error: function () {
                  self.addGenerator(new ErrorSlideGenerator('No path between found.'));
                  self.loader.stopWaiting();
                },
                success: function (path) {
					var controller = new PresentationController(path, true, false);
					var view = new PiecesUI(controller);
					view.initControls();
                }
           });         
		});
					
        $("#play-button").click(function(){	
			 $.ajax({
                type: "GET",
                url: urls.singlepath,
                dataType: "jsonp",
                error: function () {
                  self.addGenerator(new ErrorSlideGenerator('No path between found.'));
                  self.loader.stopWaiting();
                },
                success: function (path) {
					var controller = new PresentationController(path, true, false);
					var view = new PiecesUI(controller);
					view.initControls();
                }
           });                
		 });
  });
  
  
  /*var controller = new PresentationController(),
        view = new PiecesUI(controller);
    controller.init();
    view.init();*/
})(requirejs);

