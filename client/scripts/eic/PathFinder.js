/*
* LODStory Path Finder
* Copyright 2014, LOD Story Team - University of Southern California - Information Sciences Institute
* Licensed under 
*/


define(['lib/jquery', 'eic/Logger', 'lib/d3','eic/PresentationController2','eic/PiecesUI','eic/SlideEditor'],
  function ($, Logger, d3,PresentationController2, PiecesUI, SlideEditor) {
    "use strict";
    var logger = new Logger("PathFinder");
  		
    function PathFinder(hashObj) {
    	/* Define HTML Elements*/
		
				
				
		/* Define Constants and Data */
		this.URLRef = new Object;
				this.URLRef['Bill Clinton'] = "http%3A%2F%2Fdbpedia.org%2Fresource%2FBill_Clinton";
				this.URLRef['Hillary Rodham Clinton'] = "http%3A%2F%2Fdbpedia.org%2Fresource%2FHillary_Rodham_Clinton";
				this.URLRef['Ray Bradbury'] = "http%3A%2F%2Fdbpedia.org%2Fresource%2FRay_Bradbury";
		this.w = 150;
    	this.h = 580;
    	this.i = 0;
    	this.url_ref = new Object;
    	this.duration = 500;
    	this.root = new Object;
    	this.appendList = [];
    	this.diagramDepth = 0;
    	this.round = 1;
		this.appendMap = new Object();
		this.mainDepth = 1;
		this.tree = new Object();
		this.diagnal = new Object;
		this.userPath = [];
		this.userHash = hashObj; 
		this.keyWord = '';	
		this.vis = new Object
		this.diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });		
//var tree = d3.layout.tree()
//	.size([h, w]);
		this.initLinkedDataEdu();
    	
		
    }

    /* Member functions */
    PathFinder.prototype = {
      // Starts the movie about the connection between the user and the topic.
      initLinkedDataEdu: function () {
      	console.log("[===================Initialize Linked Data Edu App===================]");
      	var self=this;
      	$.getJSON('../data_json/uri_matching.json', function(data) {
      		self.url_ref = data;
      	});
      	$('#search').keyup(function() {
			var searchField = $('#search').val();
			var myExp = new RegExp(searchField, "i");
			
			console.log("URI Data: ", self.url_ref, searchField);
			var output = '<ul class="dropdown-menu" id="searchUpdate" role="menu" aria-labelledby="dropdownMenu1">';
			$.each(self.url_ref, function(key, val) {
				console.log(key, val.name.search(myExp));
				if ((val.name.search(myExp) != -1)) {
					console.log("Yes");
					output += '<li role="presentation"><a class="searchItem" role="menuitem" tabindex="-1" href="#">';
					output += val.name;
					output += '</li>';
				}else{console.log("No");}
			});
			output += '</ul>';
			$('#liveSearch').html(output);
			$(".searchItem").click(function(){
				var uriMatch = new RegExp($(this).html());
				$.each(self.url_ref, function(key, val) {
					console.log(key, val.name.search(myExp));
					if ((val.name.search(uriMatch) != -1)) {
						$("#liveSearchResult").html(val.uri);
						
					}else{console.log("No");}
			});
				$('#search').val($(this).html());
				self.keyWord = $(this).html(); 
				$('#liveSearch').empty();
			});
		});
		

      	
      	
      	
      	
      	
      	
      	
      	$("#draw").click(function(){
      		self.keyWord = $("#input").val();
      		self.addNode($("#liveSearchResult").html(), $("#search").val());
      		$("#searchWindow").css("display", "none");
      		$("#canvasWindow").css("display", "block");
      		self.tree = d3.layout.tree().size([self.h, self.w]);
      		self.vis = d3.select("#chart").append("svg:svg")
					     .attr("width", self.w + 240)
					     .attr("height", self.h )
					  	 .append("svg:g")
					     .attr("transform", "translate(40,0)");
			
			$("#finish").click(function(){
				/*Shift Screen*/
				self.generateHashObject();
				$("#canvasWindow").css("display", "none");
				$("#body").css("display", "block");
				console.log("userPath", self.userPath);
				
				/*Prepare Video Editor*/
            	var controller = new PresentationController2(self.userHash);
	            var view = new PiecesUI(controller);
	            console.log("Controller I ", controller);
	            view.initControls();
				console.log("Hash Object Output", self.userHash);
		        controller.once("slide_generation_finished", function(){
					console.log("Controllers", controller);
					console.log("Hash Object Output", self.userHash);
					var editor = new SlideEditor(controller.generator, controller.path, controller, self.userHash);
		        });
            });
			$("#chart").click(function(){
				$("#relation").empty();
			});
			$(".redraw").click(function(){
				location.reload();
			});
      	});
      	
      },
      addNode: function(nodeURI, name){
      	console.log("[===================Add New Node===================]");
      	var self = this;
      	var searchURI = "/LODStories-1.0.0-SNAPSHOT/rankServlet?uri=";
			searchURI += nodeURI;
			searchURI += '&num=7';
		console.log(searchURI);
		d3.json(searchURI, function(json){
		//json.x0 = 800;
  		//json.y0 = 0;
			console.log("json: ", json, nodeURI, name);
			if (json){
				if (self.round == 1){
					self.history = json;
					self.appendMap[self.keyWord] = json;
					self.appendMap[self.keyWord].name = name;
					self.appendMap[self.keyWord].search = 1;
					console.log("====>AppendMap", self.appendMap);
					for (var i = 0; i < json.children.length; i++){
						json.children[i].search = 0;
						json.children[i].children = null;
						self.appendMap[json.children[i].name] = json.children[i];
					}
				}
				else {
					self.appendMap[name].search = 1;
					self.appendMap[name].children = json.children;
					for (var i = 0; i < json.children.length; i++){
						json.children[i].search = 0;
						json.children[i].children = null;
						self.appendMap[json.children[i].name] = json.children[i];
					}
					console.log("====>AppendMap", self.appendMap);
				}
				console.log("history test: ", self.history);
			////	root = jQuery.extend(true, {}, history);
				self.root = self.history;
				self.updateCanvas(self.root);
			}
			else {
				alert("no available data for ' " + name + " '");
			}
		});
	 },//addNode
	 updateCanvas: function(source){
	 	console.log("[===================Update Canvas===================]");
	 	var self = this;
	 	
	 	if (self.round != 1){
			var getWidth = self.getTreeWidth(self.root);
		}
		self.round ++;
		
		var nodes = self.tree.nodes(self.root).reverse();
	
	// Update the nodes…
		var node = self.vis.selectAll("g.node")
		   .data(nodes, function(d) { return d.id || (d.id = ++self.i); });
		
		var nodeEnter = node.enter().append("svg:g")
		    .attr("class", "node")
		    .attr("transform", function(d) { 
		    	console.log("nodeEnter: ", d);
		    	return "translate(" + source.y0 + "," + source.x0+20 + ")"; 
		    })
		    .on("click", function(d){
		    	console.log("Click Test: ", d);
		    	self.click(d);
		    })
		    .on("mouseover", function(d){
		   		var output = self.nodeMouseOver(d.name, d.relation);
		    });	
				
	// Enter any new nodes at the parent's previous position.
		nodeEnter.append("svg:circle")
		   	 	 .attr("r", 5.5)
		   		 .style("fill", function(d) { 
					 return d.children || d._children ? "lightsteelblue" : "#fff"; 
				 });
		      
		nodeEnter.append("svg:text")
				 .attr("class", "textNormal")
			     .attr("x", function(d) { return d.children || d._children ? 15 : 8; })
				 .attr("y", function(d){
					 	return d.children || d._children ? -13 : 0;
				 })
	    		 .attr("dy", ".35em")
	    		 .style("fill", function(d){
	    		 	return d.children || d._children ? "#ff4719" : "#000";
	    		  })
	      		 .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
	      		 .text(function(d) { return d.name; })
	
		nodeEnter.transition()
				 .duration(self.duration)
				 .attr("transform", function(d) {
					 if (d.depth > self.diagramDepth){
					 	 self.diagramDepth = d.depth;
					 }
					 return "translate(" + d.y + "," + d.x + ")"; 
				 })
		      	 .style("opacity", 1);
			
		node.transition()
		    .duration(self.duration)
		    .attr("transform", function(d) { 
		    	return "translate(" + d.y + "," + d.x + ")"; 
		    })
		    .style("opacity", 1);
		    
		 
		node.exit().transition()
		      .duration(self.duration)
		      .attr("transform", function(d) {
			    console.log("nodeRemove: ", d);
				return "translate(" + source.y + "," + source.x + ")"; 
				})
		      .style("opacity", 1e-6)
		      .remove();
	
			
	// Update the links…
		var link = self.vis.selectAll("path.link")
		      		  .data(self.tree.links(nodes), function(d) { 
							return d.target.id; 
					  });
		
	// Enter any new links at the parent's previous position.
		  link.enter().insert("svg:path", "g")
		      .attr("class", "link")
		      .attr("d", function(d) {
		        var o = {x: source.x0, y: source.y0};
		        return self.diagonal({source: o, target: o});
		      })
		      .transition()
		      .duration(self.duration)
		      .attr("d", self.diagonal)
		      .attr("source", function(d){
		      	return d.source.name;
		      })
		      .attr("target", function(d){
		      	return d.target.name;
		      });		  
			
	
		 
	// Transition links to their new position.
		  link.transition()
		      .duration(self.duration)
		      .attr("d", self.diagonal);
		 
	// Transition exiting nodes to the parent's new position.
		  link.exit().transition()
		      .duration(self.duration)
		      .attr("d", function(d) {
		        var o = {x: source.x, y: source.y};
		        return self.diagonal({source: o, target: o});
		      })
		      .remove();
		      
		//$("path").on("mouseover", function(){
		$("path").mouseover(function(){	
			var selected = self.linkMouseOver($(this).attr("source"), $(this).attr("target"));
			$(this).mousemove(function(e){
				var mouse = self.getMousePosition(e.pageX, e.pageY);
			})
		});
		
		
	//highlight nodes and links
		var getHighlight = self.highlightPath();	 
	
	// Stash the old positions for transition.
		  nodes.forEach(function(d) {
		    d.x0 = d.x;
		    d.y0 = d.y;
		  });
	 },//updateCanvas
     click: function(d) {
     	var self = this;
     	console.log("Click Data Test", d);
     	console.log("Self Test", self);
		if (d.search == 1){		
			if (d.children) {
			  d._children = d.children;
			  d.children = null;
			  
			  self.mainDepth = 0;
			  var getDepth = self.getTreeWidth(self.root);		
			  self.w = (self.mainDepth) * 200;
			  console.log("mainDepth: ", self.mainDepth, " , w: ", self.w);
			  self.tree.size([self.h, self.w]);
			  
//			  this.update(d);
			} 
			else {
			  d.children = d._children;
			  d._children = null;
			  
			  self.mainDepth = 0;
			  var getDepth = self.getTreeWidth(self.root);
			  self.w = (self.mainDepth) * 200;
			  console.log("mainDepth: ", self.mainDepth, " , w: ", self.w);
			  $("svg").attr("width", self.w + 200 + "");
			  self.tree.size([self.h, self.w]);
			  //this.update(d);
			}
			this.update(d);
		}
		else if (d.search == 0){
			self.mainDepth = 0;	
			var getDepth = self.getTreeWidth(self.root);
			self.w = (self.mainDepth + 1) * 200;
			console.log("mainDepth: ", self.mainDepth, " , w: ", self.w);
			$("svg").attr("width", self.w + 200 + "");
			self.tree.size([self.h, self.w]);
			self.addNode(d.uri, d.name);
		}
			self.userPath = [];
			self.trackPath(d);
			console.log("HIGHLIGHTPATH: ", self.userPath);
	  },
	    getMousePosition: function(x, y){
	  	  console.log(x, y);
		  $("#relation").css("top", y - 90 + "")
			            .css("left", x - 100 + "")
					  	.css("display", "block");
	    },
	    nodeMouseOver: function(name, catalog) {
			// $("#name").empty();
			// $("#catalog").empty();
			// var nameContent = "Name: " + name;
			// var catalogContent = "Catalog: " + catalog;
			// $("#name").append(nameContent);
			// $("#catalog").append(catalogContent);
		},
		linkMouseOver: function(source, target) {
			console.log(source, "~", target);
			$("#relation").empty();
			var relationContent = '<p id="relationContent" class="close" style="color:white;">This is a relation between <b>' + source + '</b> and <b>' + target +'</b>';
			$("#relation").append(relationContent);
			$(".close").click(function(){
				$("#relation").empty();
			});
		},
		getTreeWidth: function(treeRoot){
			var self = this;
			console.log("Root Test: ", self.root);
			if (treeRoot.children == null){
				if (treeRoot.depth > self.mainDepth){
					self.mainDepth = treeRoot.depth;
				}
			}
			else {
				for (var i = 0; i < treeRoot.children.length; i++){
					self.getTreeWidth(treeRoot.children[i]);
				}
			}
		},
		highlightPath: function(){
			var self = this;
			
			var allNodes = self.vis.selectAll("g.node");
			var allLinks = self.vis.selectAll("path.link");
			console.log("allNodes: ", allNodes);
			console.log("allLinks: ", allLinks);
			for (var i = 0; i < allNodes[0].length; i++){
				if (allNodes[0][i].__data__.search == 1){
					allNodes[0][i].childNodes[0].style.fill = "lightsteelblue";
					allNodes[0][i].childNodes[1].style.fill = "ff3300";
				}
			}
			for (var i = 0; i < allLinks[0].length; i++){
				if (allLinks[0][i].__data__.target.children != null & allLinks[0][i].__data__.source.search == 1){
				//if (allLinks[0][i].__data__.target.search == 1 & allLinks[0][i].__data__.source.search == 1){
					allLinks[0][i].style.stroke = "#4747d1";
					allLinks[0][i].style.strokeWidth = "4.5px";
				}
				else {
					allLinks[0][i].style.stroke = "#ccc";
					allLinks[0][i].style.strokeWidth = "3px";
				}
			}
		},
		trackPath: function(data) {
			var self = this;
			
			self.userPath.unshift(data);
			if (data.parent != null){
				self.trackPath(data.parent);
			}
		},
		generateHashObject: function(){
			var self = this;
			
			self.userHash.hash = "h-3690378823082678040";
			//userHash.execution_time = 1220;
			//userHash.novelty = 0.11111111;
			//console.log("userPath", userPath);
			console.log("User Path Test: ", self.userPath);
			self.userHash.source = new Object();
			self.userHash.source.name = self.userPath[0].name;
			self.userHash.source.uri = self.userPath[0].uri;
			self.userHash.destination = new Object();
			self.userHash.destination.name = self.userPath[self.userPath.length - 1].name;
			self.userHash.destination.uri = self.userPath[self.userPath.length - 1].uri;
			self.userHash.path = [];
			for (var i = 0; i < self.userPath.length; i++){
				if (self.userPath[i].relation != "none"){
					var linktype = new Object;
					linktype.type = "link";
					linktype.inverse = true;
					linktype.uri = self.userPath[i].relation;
					self.userHash.path.push(linktype);
				}
				var nodetype = new Object;
				nodetype.type = "node";
				nodetype.name = self.userPath[i].name;
				nodetype.uri = self.userPath[i].uri;
				self.userHash.path.push(nodetype);
			}
			console.log(self.userHash);
		}
    };

    return PathFinder;
  });
