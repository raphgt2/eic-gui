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

  require(['eic/TTSService2'], function (TTSService2) {
	  var plugintype;
	  	
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
			var selector = document.getElementById("Voices");
			var selected = document.getElementById("Voices").selectedIndex;
			var voice= selector.options[selected].value;
			
			$('#result').html('loading...');		
		
			var tts = new TTSService2();
			var text = $('#text').val();
			tts.once('speechReady',function(event,data){
				if (plugintype=="Audio"){
					 $('#result').html(
						"<audio src='"+data.snd_url+"' controls='true'/>");
				}
				else if (plugintype=="QuickTime"){
					 $('#result').html(
						"<embed src=\"" + data.snd_url + "\" width='500' height='500' enablejavascript='true' autoplay='false' loop='false'>");
				}
				else if (plugintype=="Windows Media"){
					 $('#result').html(
						"<embed src=\"" + data.snd_url + "\" width='500' height='500' Enabled='false' AutoStart='false'>");
				}
				else if (plugintype=="VLC"){
					 $('#result').html(
						"<embed type='application/x-vlc-plugin' pluginspage='http://www.videolan.org'width='500' height='500' target='"+snd_url+"' controls='false' autoplay='false' loop='false'/>" + 
							"<object classid='clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921' codebase='http://download.videolan.org/pub/videolan/vlc/last/win32/axvlc.cab'></object>"
				)}			
			});
			
			tts.once('speechError',function(event,data){
				$('#result').html("Something went wrong");
			});
			
			tts.getSpeech(text, voice);
		 });
	 });
		
})(requirejs);

