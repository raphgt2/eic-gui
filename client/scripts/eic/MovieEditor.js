define(['lib/jquery','eic/Logger','eic/SlidePresenter','eic/pluginsniff'],
function($,Logger,SlidePresenter){
	var logger = new Logger("MovieEditor");
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
	
	function MovieEditor($slides, generator){
		this.generator=generator;
				
		var html_obj=document.createElement("div");
		document.body.appendChild(html_obj);
		
		$(html_obj).append("<button id=playButton>Play!</button>");
		$("#playButton").click(function(){			//Check that all slides have loaded (with the user changes) before attempting to play
			generator.generators[1].waitforReady(0,function(){
				if (generator.generators[0].ready){
					if (generator.generators[2].ready){
						logger.log("Beginning presentation");
						new SlidePresenter($slides, generator).start(); document.body.removeChild(html_obj);
					}
					else {
						generator.generators[2].once(function(){
							logger.log("Beginning presentation");
							new SlidePresenter($slides, generator).start(); document.body.removeChild(html_obj);
						});
					}
				}
				else {
					generator.generators[0].once(function(){
						logger.log("Beginning presentation");
						new SlidePresenter($slides, generator).start(); document.body.removeChild(html_obj);
					});
				}
			});
		});
		
		var container_obj=document.createElement("div");
		html_obj.appendChild(container_obj);
		
		//Intro slide
		createAudioObj("a",container_obj,generator.generators[0]);
		
		//topic slides
		for (i=1; i<generator.generators[1].generators.length; i++) //first generator in the TopicToTopicSlideGenerator is the Loading Slide
		{
			createAudioObj(i,container_obj,generator.generators[1].generators[i]);
		}
		
		//Outro slide
		createAudioObj("b",container_obj,generator.generators[2]);
		
	}
	
	function createAudioObj(i,container_obj,slide)
	{
		var slide_div=document.createElement("div");
		container_obj.appendChild(slide_div);
		$(slide_div).append("<div><textarea id='text"+i+"'>"+slide.description+"</textarea><input id='send"+i+"' type='submit' value='Send' /></div>");
		$('#send'+i).click(function() {
			slide.resendSpeech($('#text'+i).val());
			$("#track"+i).remove();
			addAudio(slide_div,slide,i);
		});
		addAudio(slide_div,slide,i);
	}
	
	function addAudio(html_obj, slide,id){
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
	
    
    MovieEditor.prototype = {
		
	};
	
	return MovieEditor;

});
