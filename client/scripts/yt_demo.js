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

  require(['eic/generators/YouTubeSlideGenerator'], function (YouTubeSlideGenerator) {
	var slide;
	$('#Load').click(function() {
		slide = new YouTubeSlideGenerator("Los angeles", true);						
		slide.addVideoSlide("fCrD15VKgr0", 5000, 10000, 15000);
	});
	
	$('#Play').click(function(){
		var nextSlide;
		if (!slide.ready){
			console.log("Waiting on buffer");
			slide.once("prepared", function(){
				nextSlide = slide.next();
				nextSlide.start();
			});
		}
		else{
			nextSlide = slide.next();
			nextSlide.start();
		}
		
	});
	
	$('#Check').click(function(){
		$('#result').html('');
		$('#result').html(slide.player.getVideoLoadedFraction());
	});
  });	
})(requirejs);

