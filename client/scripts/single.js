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

  require(['eic/PresentationController', 'eic/PiecesUI'], function (PresentationController, PiecesUI) {
		//var html_obj=document.createElement("div");
		//document.body.appendChild(html_obj);
		
		var controller = new PresentationController();
			//view = new PiecesUI(controller);
			
        //controller.init();
		//	view.init();
			
        $("#play-button").click(function(){		
			//view.drawScreen($('#screen'));
			$('screen').show();
			try {
					controller.playMovie();
            }
            // Controller errors are emergency cases we cannot handle gracefully
            catch (error) {
              window.alert("Unexpected error: " + error);
              window.location.reload();
            }
			
		 });
  });
  
  /*var controller = new PresentationController(),
        view = new PiecesUI(controller);
    controller.init();
    view.init();*/
})(requirejs);

