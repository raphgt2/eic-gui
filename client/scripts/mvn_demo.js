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

  require(['eic/TTSService', 'lib/jplayer.min', 'config/URLs'], function (TTSService, JPlayer, urls) {
	  var plugintype;
	  
	  var $audioContainer = $('<div>').addClass('audio').appendTo($('body'));	
	  $audioContainer.jPlayer({
		errorAlerts: true,
		swfPath: urls.jplayerSWF,
		supplied: "mp3",
		wmode: "window"
	});	
	  	
	if (Audio){
        if (document.createElement('audio').canPlayType("audio/wav"))
            plugintype="Audio";
        else
            plugintype=Plugin.getPluginsForMimeType("audio/wav");
    }
    else{
        plugintype=Plugin.getPluginsForMimeType("audio/wav");
    }
				
        
        $('#send').click(function() {
			
			$('#result').html('loading...');		
		
			var tts = new TTSService();
			var text = $('#text').val();
			tts.once('speechReady',function(event,data){
				$audioContainer.jPlayer("setMedia", {mp3: data.snd_url}).jPlayer("play");
			});
			
			tts.once('speechError',function(event,data){
				$('#result').html("Something went wrong");
			});
			
			tts.getSpeech(text);
		 });
	 });
		
})(requirejs);

