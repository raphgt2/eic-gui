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
		$("#playButton").click(function(){
			if (generator.generators[1].ready){
				logger.log("Beginning presentation");	
				new SlidePresenter($slides, generator).start();
				document.body.removeChild(html_obj);
			}
			else{
				logger.log("Beginning presentation");
				generator.generators[1].once('topic slides ready', function(){new SlidePresenter($slides, generator).start(); document.body.removeChild(html_obj);});
			}
		});
		
		var container_obj=html_obj.appendChild(document.createElement("div"));
		var slide_div;
		logger.log(generator.generators[1].generators.length);
		
		//Intro slide
		slide_div=document.createElement("div");
		$(slide_div).append("<div><textarea id='texta'>"+generator.generators[0].description+"</textarea><input id='senda' type='submit' value='Send' /></div>");
		/*$(slide_div).append("<div><textarea id='text'></textarea><input id='send' type='submit' value='Send' /></div>");
		$('#send').click(function() {
			alert("a");
		});*/
		
		$("#senda").click(function(){
			alert("a");
			generators.generators[0].resendSpeech($('#texta').val());
			$("#tracka").remove();
			addAudio(slide_div,generator.generators[0],'a');
		});
		addAudio(slide_div,generator.generators[0],'a');
		container_obj.appendChild(slide_div);
		
		//topic slides
		for (var i=1; i<generator.generators[1].generators.length; i++) //first generator in the TopicToTopicSlideGenerator is the Loading Slide
		{
			slide_div=document.createElement("div");
			$(slide_div).append("<div><textarea id='text"+i+"'>"+generator.generators[1].generators[i].description+"</textarea><input id='send"+i+"' type='submit' value='Send'/></div>");
			$("#send"+i).click(function(){
				alert("!");
				generator.generators[1].generators[i].resendSpeech($('#text'+i).val());
				$("#track"+i).remove();
				addAudio(slide_div,generator.generators[1].generators[i],i);
			});

			addAudio(slide_div,generator.generators[1].generators[i],i);			
			container_obj.appendChild(slide_div);
		}
		
		//Outro slide
		slide_div=document.createElement("div");
		$(slide_div).append("<div><textarea id='textb'>"+generator.generators[2].description+"</textarea><input id='sendb' type='submit' value='Send'/></div>");
		$("#sendb").click(function(){
			generators.generators[2].resendSpeech($('#textb').val());
			addAudio(slide_div,generator.generators[2],'b');
		});
		addAudio(slide_div,generator.generators[2],'b');
		container_obj.appendChild(slide_div);
		
	}
	
	function addAudio(html_obj, slide,id){
		logger.log(id+": "+slide.description);
		if (slide.ready){
			logger.log("1");
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
			logger.log("2");
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
