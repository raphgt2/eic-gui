define(['lib/jquery','eic/SlidePresenter'],
function($,SlidePresenter){
	
	function MovieEditor($slides, generator){
		this.generator=generator;
				
		var button_obj=document.createElement("div");
		document.body.appendChild(button_obj);
		
		$(button_obj).append("<button id=playButton>Play!</button>");
		$("#playButton").click(function(){
			if (generator.generators[1].ready){
				logger.log("Beginning presentation");	
				new SlidePresenter($slides, generator).start();
			}
			else{
				logger.log("Beginning presentation");
				generator.generators[1].once('topic slides ready', function(){new SlidePresenter($slides, generator).start(); document.body.removeChild(button_obj);});
			}
		});
		
		var container_obj=document.body.appendChild(document.createElement("div"));
		var slide_div;
		var 
		
		for (var i=0; i<generators.generators[i].generators.length(); i++)
		{
			slide_div=document.createElement("div");
			$(slide_div).append("<div><textarea id='text"+i+"'></textarea><input id='send"+i+"' type='submit' value='Send'/></div>");
			$("#send"+i).click(function(){
				generators.generators[i].generators[i].resendSpeech($('#text'+i).val());
			});
			
			container_obj.appendChild(slide_div);
		}
		
	}
	
    
    MovieEditor.prototype = {
		
	};
	
	return MovieEditor;

});
