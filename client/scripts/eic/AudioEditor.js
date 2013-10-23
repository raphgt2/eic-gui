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
	
	function AudioEditor($slides, generator, path){
		this.hash_object = path;
		this.generator=generator;
		this.previousText=new Array();		//Used as part of an undo feature
		
		var html_obj=document.createElement("div");
		document.body.appendChild(html_obj);
		
		var self = this;		
		$(html_obj).append("<button id=playButton>Play!</button>");
		$("#playButton").click(function(){			//Check that all slides have loaded (with the user changes) before attempting to play
			generator.generators[1].waitforReady(0,function(){
				if (generator.generators[0].ready){
					if (generator.generators[2].ready){
						logger.log("Beginning presentation");
						logger.log('revised hash_object:', self.hash_object);
						new SlidePresenter($slides, generator).start(); document.body.removeChild(html_obj);
					}
					else {
						generator.generators[2].once(function(){
							logger.log("Beginning presentation");
							logger.log('revised hash_object:', self.hash_object);
							new SlidePresenter($slides, generator).start(); document.body.removeChild(html_obj);
						});
					}
				}
				else {
					generator.generators[0].once(function(){
						if (generator.generators[2].ready){
							logger.log("Beginning presentation");
							logger.log('revised hash_object:', self.hash_object);
							new SlidePresenter($slides, generator).start(); document.body.removeChild(html_obj);
						}
						else {
							generator.generators[2].once(function(){
								logger.log("Beginning presentation");
								logger.log('revised hash_object:', self.hash_object);
								new SlidePresenter($slides, generator).start(); document.body.removeChild(html_obj);
							});
						}
					});
				}
			});
		});
		
		var container_obj=document.createElement("div");
		html_obj.appendChild(container_obj);
		
		//Intro slide
		this.createAudioObj(0,container_obj,generator.generators[0]);
		
		//topic slides
		for (i=1; i<generator.generators[1].generators.length; i++) //first generator in the TopicToTopicSlideGenerator is the Loading Slide
		{
			this.createAudioObj(i+1,container_obj,generator.generators[1].generators[i]);
		}
		
		//Outro slide
		this.createAudioObj(generator.generators[1].generators.length+1,container_obj,generator.generators[2]);
		
		
		logger.log('original hash_object', path);
	}
	
	AudioEditor.prototype={
	
		createAudioObj: function(i,container_obj,slide)
		{
			var self=this;
			var slide_div=document.createElement("div");
			container_obj.appendChild(slide_div);
			$(slide_div).append("<div><textarea id='text"+i+"'>"+slide.hash_object.audio_text+"</textarea><input id='send"+i+"' type='submit' value='Save' /><input id='undo"+i+"' type='submit' value='Undo' /><input id='default"+i+"' type='submit' value='Default' /></div>");
			this.previousText[i]=slide.hash_object.audio_text;
			$('#undo'+i).hide();
			$('#default'+i).hide();
			$('#send'+i).hide();
			
			$('#text'+i).blur(function() {
				if (self.previousText[i]==$('#text'+i).val()){
					$('#send'+i).hide();
					return;
				}
				slide.resendSpeech($('#text'+i).val());
				$("#track"+i).remove();
				self.addAudio(slide_div,slide,i);
				
				$('#undo'+i).val("Undo");
				$('#undo'+i).show();
				$('#send'+i).hide();
				if (slide.hash_object.defaultText==$('#text'+i).val())
					$('#default'+i).hide();
				else
					$('#default'+i).show();
			});
			
			$('#text'+i).focus(function(){
				self.previousText[i]=$('#text'+i).val()
				if (slide.hash_object.defaultText==$('#text'+i).val())
					$('#default'+i).hide();
				else
					$('#default'+i).show();
			});
			
			$('#text'+i).bind('input propertychange', function() {
				$('#send'+i).show();
				$('#undo'+i).hide();
				if (slide.hash_object.defaultText==$('#text'+i).val())
					$('#default'+i).hide();
				else
					$('#default'+i).show();
			});
			
			$('#send'+i).click(function() {
				if (self.previousText[i]==$('#text'+i).val()){
					$('#send'+i).hide();
					return;
				}
				slide.resendSpeech($('#text'+i).val());
				$("#track"+i).remove();
				self.addAudio(slide_div,slide,i);
				
				$('#undo'+i).val("Undo");
				$('#undo'+i).show();
				$('#send'+i).hide();
				if (slide.hash_object.defaultText==$('#text'+i).val())
					$('#default'+i).hide();
				else
					$('#default'+i).show();					
			});
			
			$('#undo'+i).click(function() {
				if (self.previousText[i]==$('#text'+i).val()){
					$('#undo'+i).hide();
					return;					
				}
				slide.resendSpeech(self.previousText[i]);
				var temp=self.previousText[i];
				self.previousText[i]=$('#text'+i).val();
				$('#text'+i).val(temp);
				$("#track"+i).remove();
				self.addAudio(slide_div,slide,i);
				
				if ($('#undo'+i).val()=="Undo")
					$('#undo'+i).val("Redo");
				else
					$('#undo'+i).val("Undo");
					
				if (slide.hash_object.defaultText==$('#text'+i).val())
					$('#default'+i).hide();
				else
					$('#default'+i).show();
			});
			
			$('#default'+i).click(function() {				
				if (slide.hash_object.defaultText==$('#text'+i).val()){
					$('#default'+i).hide();
					return;
				}
				self.previousText[i]=$('#text'+i).val();
				slide.resendSpeech(slide.hash_object.defaultText);
				$('#text'+i).val(slide.hash_object.defaultText);
				
				$("#track"+i).remove();
				self.addAudio(slide_div,slide,i);
				
				$('#undo'+i).val("Undo");
				$('#undo'+i).show();
				$('#default'+i).hide();
			});
			
			this.addAudio(slide_div,slide,i);
			
			var description_div = document.createElement("div");
			container_obj.appendChild(description_div);
		},
		
		addAudio: function(html_obj, slide,id){
			if (slide.ready){
				if (plugintype=="Audio"){
		             $(html_obj).append(
		                "<audio id='track" + id + "' src='"+slide.audioURL+"' controls='true'/>");
		        }
		        else if (plugintype=="QuickTime"){
		             $(html_obj).append(
		                "<embed id='track" + id + "' src='" + slide.audioURL + "' controller='true' enablejavascript='true' autoplay='false' loop='false'>");
		        }
		        else if (plugintype=="Windows Media"){
		             $(html_obj).append(
		                "<embed id='track" + id + "' src='" + slide.audioURL + "' width='200' height='100' Enabled='true' AutoStart='false' ShowControls='true'>");
		        }
		        else if (plugintype=="VLC"){
		             $(html_obj).append(
		                "<embed id='track" + id + "' target='" + slide.audioURL + "' width='200' height='100' autoplay='false' controls='true'>");
		        }
			}
			else{
				slide.once('newSlides', function(){
					logger.log(id+": finished waiting");
					if (plugintype=="Audio"){
			             $(html_obj).append(
			                "<audio id='track" + id + "' src='"+slide.audioURL+"' controls='true'/>");
			        }
			        else if (plugintype=="QuickTime"){
			             $(html_obj).append(
			                "<embed id='track" + id + "' src='" + slide.audioURL + "' controller='true' enablejavascript='true' autoplay='false' loop='false'>");
			        }
			        else if (plugintype=="Windows Media"){
			             $(html_obj).append(
			                "<embed id='track" + id + "' src='" + slide.audioURL + "' width='200' height='100' Enabled='true' AutoStart='false' ShowControls='true'>");
			        }
			        else if (plugintype=="VLC"){
			             $(html_obj).append(
			                "<embed id='track" + id + "' target='" + slide.audioURL + "' width='200' height='100' autoplay='false' controls='true'>");
			        }	
				});
			}
		}
	};

	return AudioEditor;

});
