define(['lib/jquery','eic/SlidePresenter'],
function($,SlidePresenter){
	
	function MovieEditor($slides, generator){
				
		var html_obj=document.createElement("div");
		document.body.appendChild(html_obj);
		
		$(html_obj).append("<button id=playButton>Play!</button>");
		$("#playButton").click(function(){new SlidePresenter($slides, generator).start()});
	}
	
    
    MovieEditor.prototype = {
	};
	
	return MovieEditor;

});
