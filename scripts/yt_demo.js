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
	var generator, slide;
	$('#Load').click(function() {
		generator = new YouTubeSlideGenerator({label: "Picasso", uri: "blah"}, true);						
		generator.addVideoSlide("fCrD15VKgr0", 5000, 10000, 15000);
		generator.addVideoSlide("emkjVXE_2Do", 5000, 10000, 15000);
	});
	
	$('#Play').click(function(){
		if (slide)
			slide.stop();
	
		if (!generator.ready){
			console.log("Waiting on buffer");
			generator.once("prepared", function(){
				slide = generator.next();
				slide.start();
			});
		}
		else{
			slide = generator.next();
			slide.start();
		}
		
	});
	
	$('#Check').click(function(){;
		$('#result').html(generator.player[0].getVideoLoadedFraction() + '_' + generator.player[1].getVideoLoadedFraction());
	});
  });	
})(requirejs);

