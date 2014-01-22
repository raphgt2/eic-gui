define(['lib/jquery', 'lib/jqueryUI','eic/Logger'],
  function ($, jqueryUI, Logger) {
    "use strict";
    var logger = new Logger("Editing Node");
    
    function EditingNodes(controller, hashObj){
    	console.log("NOW WE START WITH EDITING THE NODES");
    	this.a = 10;
    	this.b = 3;
    	this._data_source = controller.generator.generators[1].generators;
    	this._path = hashObj.path;
    	this._Slide_Element_Collection = new Object();
    	this._Play_Sequence = [];
    	this.curNode = this._path[0];
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
    	initElementCollection: function(){
    		console.log("Data_Source", this._data_source);
    		for(var i = 1; i < this._data_source.length; i++){
    			this._data_source[i].prepare();
    			var img = this._data_source[i].slides.img;
    			var vid = this._data_source[i].slides.vid;
    			console.log("img", img);
    			console.log("vid", vid);
    			for (var j = 0; j < img.length; j++){
    				//console.log(img[j].slides_info.data);
    				this._Slide_Element_Collection[img[j].slide_info.data.url]=img[j].slide_info;
    			}
    			for (var k = 0; k < vid.length; k++){
    				this._Slide_Element_Collection[vid[k].slide_info.data.videoID]=vid[k].slide_info;
    			} 
    		}
    		
    		$(".nodeNavBtn").click(function(){
    			console.log($(this).attr("order"));
    			//this.PrepareNode($(this).attr("order"));
    		});
    	},
    	EnableUIAnimation: function(){
    		console.log("UI Animation");
    		$( ".node-element-list" ).sortable({
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
					console.log("Receive!");
					ui.item.removeClass("nodeElementBarContentWrap")
						   .addClass("movieNavElementWrap")
				},
				update: function(event, ui){
					console.log("Update!");
				}
			});
			$( "#movie-nav-bar, .node-element-list" ).disableSelection();
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