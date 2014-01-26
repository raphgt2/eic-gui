define(['lib/jquery','eic/Logger','eic/SlidePresenter','eic/pluginsniff'],
function($,Logger,SlidePresenter){
	var logger = new Logger("AudioEditor");
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
	
	function AudioEditor(){
		this.curTopic = null;
		this.previousText;		//Used to avoid excessive speech resends
	
	}
	
	AudioEditor.prototype={
		setTopic: function(topic)
		{
			this.curTopic = topic;
			$('#textDescription').val(topic.hash_object.audio_text);
			this.addAudio(topic);
			
			var self = this;		
			
			$('#textDescription').blur(function() {
				if (self.previousText[i]==$('#textDescription').val()){
					return;
				}
				
				self.curTopic.resendSpeech($('#textDescription').val());
				self.addAudio(self.curTopic);
			});
			
			$('#textDescription').focus(function(){
				self.previousText=$('#textDescription').val();
			});
				
			$('#editTestDescription').click(function() {	
				if (self.curTopic.hash_object.audio_text == self.curTopic.hash_object.defaultText){
					return;
				}
				
				self.curTopic.resendSpeech(self.curTopic.hash_object.defaultText);
				$('#textDescription').val(self.curTopic.hash_object.defaultText);
				self.addAudio(self.curTopic);
			});
		},
		
		addAudio: function(slide){
			//REPLACE ALL THE HTML_OBJECTS
			if (slide.ready){
				if (plugintype=="Audio"){
		             $('#playButtonGroup').html(
		                "<audio id='audioPlayer' src='"+slide.audioURL+"' controls='true'/>");
		        }
		        else if (plugintype=="QuickTime"){
		             $('#playButtonGroup').html(
		                "<embed id='audioPlayer' src='" + slide.audioURL + "' controller='true' enablejavascript='true' autoplay='false' loop='false'>");
		        }
		        else if (plugintype=="Windows Media"){
		             $('#playButtonGroup').html(
		                "<embed id='audioPlayer' src='" + slide.audioURL + "' width='200' height='100' Enabled='true' AutoStart='false' ShowControls='true'>");
		        }
		        else if (plugintype=="VLC"){
		             $('#playButtonGroup').html(
		                "<embed id='audioPlayer' target='" + slide.audioURL + "' width='200' height='100' autoplay='false' controls='true'>");
		        }
			}
			else{
				slide.once('newSlides', function(){
					logger.log(id+": finished waiting");
					if (plugintype=="Audio"){
			             $('#playButtonGroup').html(
			                "<audio id='audioPlayer' src='"+slide.audioURL+"' controls='true'/>");
			        }
			        else if (plugintype=="QuickTime"){
			             $('#playButtonGroup').html(
			                "<embed id='audioPlayer' src='" + slide.audioURL + "' controller='true' enablejavascript='true' autoplay='false' loop='false'>");
			        }
			        else if (plugintype=="Windows Media"){
			             $('#playButtonGroup').html(
			                "<embed id='audioPlayer' src='" + slide.audioURL + "' width='200' height='100' Enabled='true' AutoStart='false' ShowControls='true'>");
			        }
			        else if (plugintype=="VLC"){
			             $('#playButtonGroup').html(
			                "<embed id='audioPlayer' target='" + slide.audioURL + "' width='200' height='100' autoplay='false' controls='true'>");
			        }	
				});
			}
		}
	};

	return AudioEditor;

});
