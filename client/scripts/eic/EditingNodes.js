define(['lib/jquery', 'lib/jqueryUI','eic/Logger'],
  function ($, jqueryUI, Logger) {
    "use strict";
    var logger = new Logger("Editing Node");
    
    function EditingNodes(){
    	console.log("NOW WE START WITH EDITING THE NODES");
    	this.a = 10;
    	this.b = 3;
    	var self = this;
    	
    	this.add();
    	this.subtract();
    }
    
    EditingNodes.prototype = {
    	add: function(){
    		console.log("10+3", this.a + this.b);
    	},
    	subtract: function(){
    		console.log("10-3", this.a - this.b);
    	},
    	EnableUIanimation: function(){
    		$( "#node-element-list-img" ).sortable({
			  connectWith: "#movie-nav-bar",
			  helper: "clone",
		      appendTo: "#videoEditor",
		      revert: true,
		      scroll: false,
		      receive: function(event, ui){
		      	ui.item.removeClass("movieNavElementWrap")
					   .addClass("nodeElementBarContentWrap")
		      }
		      // drag: function(event, ui){
		      	// ui.helper.css({
		      		// "width":$(this).css("width"),
		      		// "height":$(this).css("height")
		      	// });
		      // }
		    });
		    
		    $("#movie-nav-bar").sortable({
				connectWith: ".node-element-list",
				helper:"clone",
				appendTo:"#videoEditor",
				revert: true,
				scroll: false,
				over: function(event, ui){
					$("#movie-nav-bar").css("background", "yellow");
				},
				out: function(event, ui){
					$("#movie-nav-bar").css("background", "grey");
				},
				receive: function(event, ui){
					
					ui.item.removeClass("nodeElementBarContentWrap")
						   .addClass("movieNavElementWrap")
				}
			});
			$( "#movie-nav-bar, #node-element-list" ).disableSelection();
    	},
    	grabMovieNav: function(){
    		var movieNav = $("#movie-nav-bar .nodeInformation");
    		var navlist = [movieNav.length];
    		for (var i = 0; i<movieNav.length; i++){
    			navlist[i] = movieNav[i].innerHTML;
    		}
    		console.log("Movie Nav: ", navlist);
    	}
    	
    };


    return EditingNodes;
  });