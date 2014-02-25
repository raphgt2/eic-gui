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
		
		
					
        $("#play-button").click(function(){	
			 $.ajax({
				 url: urls.singlepath,
				 type: 'GET',
				 dataType: 'jsonp',
				 success: function (data) {					 

					 if (data.res === 'OK') {
						var controller = new PresentationController(data, false, false);
						var view = new PiecesUI(controller);
						view.initControls();
						
						player.playMovie();
					}
					else{
						alert("Problem loading path from server end");
					}
				 },
				 error: function (error) {
					console.log(error);
					alert(error.responseText);
				 }
			 
           });                
		 });
  });
  
  /*var controller = new PresentationController(),
        view = new PiecesUI(controller);
    controller.init();
    view.init();*/
})(requirejs);

