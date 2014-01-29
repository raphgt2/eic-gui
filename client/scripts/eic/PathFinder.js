define(['lib/jquery', 'eic/Logger', 'lib/d3'],
  function ($, Logger, d3) {
    "use strict";
    var logger = new Logger("PathFinder");
  		
    function PathFinder(generator, path, controller, hashObj) {
    	/* Define HTML Elements*/
    	this.chartHTML = '<div id="chart">';
			 	chartHTML += '<div id="nodeInfo">';
				chartHTML += '<h3 id="info">Information</h3>';
				chartHTML += '<p class = "infoContent" id="name"> </p>';
				chartHTML += '<p class = "infoContent" id="catalog"> </p>';
				chartHTML += '<img id="stickyNote" src="img/stickyNotes.png" />';
				chartHTML += '</div></div>';
		
		this.searchBoxHTML = '<div id="searchBox">';
				searchBoxHTML += '<h1>Linked Data Education</h1>';
				searchBoxHTML += '<input id="input" />';
				searchBoxHTML += '<button id="draw">Draw</button>';
				searchBoxHTML += '</div>';
		
		this.stickyNote ='<div id="nodeInfo">';
				stickyNote +='<h3 id="info">Information</h3>';
				stickyNote +='<p class = "infoContent" id="name"> </p>';
				stickyNote +='<p class = "infoContent" id="catalog"> </p>';
				stickyNote +='<img id="stickyNote" src="img/stickyNotes.png" />';
				stickyNote +='</div>';
				
		this.redraw = '<button id="redraw">Redraw</button>';
		this.finish = '<button id="finish">Finish</button>';	    		
		this.relationBox = '<div id="relation" style="display: none;"></div>';
		
		this.URLRef = new Object;
				URLRef['Bill Clinton'] = "http%3A%2F%2Fdbpedia.org%2Fresource%2FBill_Clinton";
				URLRef['Hillary Clinton'] = "http%3A%2F%2Fdbpedia.org%2Fresource%2F";
				URLRef['Ray Bradbury'] = "http%3A%2F%2Fdbpedia.org%2Fresource%2F";
				
				
		/* Define Constants and Data */
		this.w = 150;
    	this.h = 580;
    	this.i = 0;
    	this.duration = 500;
    	this.root;
    	this.appendList = [];
    	this.diagramDepth = 0;
    	this.round = 1;
		this.appendMap = new Object();
		this.mainDepth = 1;
		this.tree = new Object();
		this.diagnal = new Object;
		
		
var userPath = [];
var userHash = new Object(); 
var keyWord		
//var diagonal = d3.svg.diagonal()
 //   .projection(function(d) { return [d.y, d.x]; });		
//var tree = d3.layout.tree()
//	.size([h, w]);
    	
		
    }

    /* Member functions */
    PathFinder.prototype = {
      // Starts the movie about the connection between the user and the topic.
      startEdit: function () {},

		
    	grabMovieNav: function(){
    		var movieNav = $("#movie-nav-bar .nodeElementBarContent");
    		console.log(movieNav);
    		var navlist = [movieNav.length];
    		 for (var i = 0; i<movieNav.length; i++){
    			 navlist[i] = movieNav[i].src;
    		 }
    		console.log("Movie Nav: ", navlist);
    		this._Play_Sequence = navlist;
    	}
      
    };

    return PathFinder;
  });
