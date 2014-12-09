/*
* LODStory Path Finder
* Copyright 2014, LOD Story Team - University of Southern California - Information Sciences Institute
* Licensed under 
*/


define(['lib/jquery', 'eic/Logger', 'lib/d3','eic/PresentationController2','eic/PiecesUI', 'eic/SlideEditor', 'eic/Summarizer', 'config/URLs'],
  function ($, Logger, d3,PresentationController2, PiecesUI, SlideEditor, Summarizer, urls) {
    "use strict";
    var logger = new Logger("PathFinder");
  		
    function PathFinder() {
    	/* Define HTML Elements*/
				
		/* Define Constants and Data */
		this.URLRef = new Object;
		this.w = 180;
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
		this.userHash = new Object(); 
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
		$("#liveSearchResult").html('');
      	var self=this;
      	$.getJSON('../data_json/uri_matching.json', function(data) {
      		self.url_ref = data;
      	});
      	console.log("data_Test", self.url_ref);
      	$('#search').keyup(function() {
			var searchField = $('#search').val();
			var myExp = new RegExp(searchField, "i");
			
			
			var output = '<ul class="dropdown-menu" id="searchUpdate" role="menu" aria-labelledby="dropdownMenu1">';
			$.each(self.url_ref, function(key, val) {
				//console.log(key, val.name.search(myExp));
				if ((val.name.search(myExp) != -1)) {
					output += '<li role="presentation"><a class="searchItem" role="menuitem" tabindex="-1" href="#">';
					output += val.name;
					
					output += '</li>';
				}
			});
			output += '</ul>';
			$('#liveSearch').html(output);
			$(".searchItem").click(function(){
				//var uriMatch = new RegExp($(this).html());
				var uriMatch = $(this).html();
				$.each(self.url_ref, function(key, val) {
					//console.log(key, val.name, uriMatch);
					if (val.name == uriMatch) {
						$("#liveSearchResult").html(val.uri);
					}
				});
				$('#search').val($(this).html());
				self.keyWord = $(this).html(); 
				$('#liveSearch').empty();
			});
		});
      	$("#searchButton").click(function(){
		console.log($("#liveSearchResult").html());
			if ($("#liveSearchResult").html()==='')		//Do not enter the path explorer page unless we actually have a uri
				return;
				
      		self.keyWord = $("#input").val();
      		self.addNode($("#liveSearchResult").html(), $("#search").val(), null);
      		$("#searchWindow").css("display", "none");
      		$("#canvasWindow").css("display", "block");
      		self.tree = d3.layout.tree().size([self.h, self.w]);
      		self.vis = d3.select("#chart").append("svg:svg")
					     .attr("width", self.w + 270)
					     .attr("height", self.h )
					  	 .append("svg:g")
					     .attr("transform", "translate(40,0)");
			
			$("#finish").click(function(){
				var progress = '<div class="progress progress-striped active canvas-alert"><div class="progress-bar progress-bar-success"  role="progressbar" aria-valuenow="100" aria-valuemin="1" aria-valuemax="100" style="width: 100%"><span class="sr-only">Generating Stories...</span></div></div>';
				$("#stepNavigator").append(progress);
				/*Shift Screen*/
				self.generateHashObject();
				$("#canvasWindow").css("display", "none");
				$("#editor").css("display", "inline");
				$("#body").css("display", "block");
				console.log("userPath", self.userPath);
				
				/*Prepare Video Editor*/
            	var controller = new PresentationController2(self.userHash);
	            var view = new PiecesUI(controller);
	            view.initControls();
				console.log("Hash Object Output", self.userHash);
		        controller.once("slide_generation_finished", function(){
		        	$(".canvas-alert").remove();
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
      addNode: function(nodeURI, name, data_prev){
      	//console.log("[===================Add New Node===================]");
      	var self = this;
		var progress = '<div class="progress progress-striped active canvas-alert"><div class="progress-bar"  role="progressbar" aria-valuenow="100" aria-valuemin="1" aria-valuemax="100" style="width: 100%"><span class="sr-only">Loading...</span></div></div>';
		$("#canvasStepNavigator").append(progress);
  		$.ajax({
  			url: urls.ranking,
  			//contentType:"application/x-www-form-urlencoded; charset=UTF-8",
  			dataType: 'jsonp',
			data: {uri: nodeURI, num: 7},
			success: function(json){
				console.log("Json: ", json);
				if (json){				
					if (self.round == 1){ // The Starting Node 
						self.history = json;
						self.appendMap[name] = json;
						self.appendMap[name].name = name;
						self.appendMap[name].search = 1;
						self.appendMap[name].parent = null;

						for (var i = 0; i < json.children.length; i++){
							json.children[i].search = 0;
							json.children[i].children = null;
							self.appendMap[json.children[i].name] = json.children[i];
						}
						self.root = self.history;
						self.updateCanvas(self.root);
					}
					else {
						self.userPath = [];
						self.trackPathParent(data_prev);
						var children = [];
						var newNodes=0;
						for (var i = 0; i < json.children.length; i++){
							//console.log("[*************Append Map Test****************]", self.appendMap[json.children[i].name]);
							//if (self.appendMap[json.children[i].name] == undefined){
								json.children[i].search = 0;
								json.children[i].children = null;
								self.appendMap[json.children[i].name] = json.children[i];
								var flag = 0;
								
								//Used to avoid placing the node multiple times in the same path
								for (var j = 0; j < self.userPath.length; j++){
									if (json.children[i].name == self.userPath[j].name){
										flag = 1;
										break;
									}
								}

								if (flag != 1){
									children.push(json.children[i]);
									newNodes++;
								}
						}
						
						data_prev.children = children;
						self.root = self.history;						
						
						self.updateCanvas(self.root);
						
						if (json.children.length == 0 || newNodes==0){
							//console.log("HERE 1");
							var alert_msg = '<div class="alert alert-warning canvas-alert">There are no new links for ' + name +'.</div>';
							$("#canvasStepNavigator").append(alert_msg);
							$(".canvas-alert").fadeIn(100).delay(2500).slideUp(300);
							setTimeout(function(){
								$(".canvas-alert").remove();
							},4000);
						}						
					}		
				}
				else {
					var alert_msg = '<div class="alert alert-danger canvas-alert">Oooops, no available data for ' + name +'.</div>';
						$("#canvasStepNavigator").append(alert_msg);
						$(".canvas-alert").fadeIn(100).delay(2500).slideUp(300);
						setTimeout(function(){
							$(".canvas-alert").remove();
						},4000);
				}
			}
  		})
		
	 },//addNode
	 updateCanvas: function(source){
	 	$(".canvas-alert").remove();
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
		    	return "translate(" + source.y0 + "," + source.x0 + 160 + ")"; 
		    })
		    .on("click", function(d){
		    	self.click(d);
		    })
		    .on("mouseover", function(d){
		   		var output = self.nodeMouseOver(d.name, d.relation);
		    });	

	// Enter any new nodes at the parent's previous position.
		nodeEnter.append("svg:circle")
		   	 	 .attr("r", 7)
		   		 .style("fill", function(d) { 
					 return d.children || d._children ? "lightsteelblue" : "#fff"; 
				 });
		      
		nodeEnter.append("svg:text")
				 .attr("class", "textNormal")
			     .attr("x", function(d) { return d.children || d._children ? 70 : 8; })
				 .attr("y", function(d){
					 	return d.children || d._children ? 0 : 0;
				 })
	    		 .attr("dy", ".35em")
	    		 .style("fill", function(d){
	    		 	return d.children || d._children ? "#3399ff" : "#000";
	    		  })
	      		 .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
	      		 .text(function(d) {
	      		 	var name_data = "";
	      		 	if (d.name.length > 22) {
	      		 		for (var i = 0; i < 23; i++){
	      		 			name_data += d.name[i];
	      		 		}
	      		 		name_data += '...';
	      		 	}
	      		 	else {
	      		 		name_data = d.name;
	      		 	}
	      		 	return name_data; 
	      		 })
	
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
		      })
		      .attr("id", function(d){
		      	return d.source.name+d.target.name;
		      })
		      .attr("relation", function(d){
		      	return d.target.relation;
		      })
		      .attr("inverse", function(d){
		      	return d.target.inverse;
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
			var selected = self.linkMouseOver($(this).attr("source"), $(this).attr("target"), $(this).attr("relation"), $(this).attr("inverse"));
			$(this).mousemove(function(e){
				var mouse = self.getMousePosition(e.pageX, e.pageY);
			})
		});
		
		
	//highlight nodes and links
		var getHighlight = self.highlightPath();
		self.emphasizeRecent();	 
	
	// Stash the old positions for transition.
		  nodes.forEach(function(d) {
		    d.x0 = d.x;
		    d.y0 = d.y;
		  });
	 },//updateCanvas
     click: function(d) {
     	var self = this;     	
		if (d.search == 1){		
			if (d.children) {
			  d._children = d.children;
			  d.children = null;
			  
			  self.mainDepth = 0;
			  var getDepth = self.getTreeWidth(self.root);		
			  self.w = (self.mainDepth) * 180 + 270;
			  self.tree.size([self.h, self.w - 270 + ""]);
			  self.userPath = [];
			  self.trackPathParent(d);
//			  this.update(d);
			} 
			else {
			  d.children = d._children;
			  d._children = null;
			  
			  self.mainDepth = 0;
			  var getDepth = self.getTreeWidth(self.root);
			  self.w = (self.mainDepth) * 180 + 270;
			  $("svg").attr("width", self.w);
			  self.tree.size([self.h, self.w - 270 + ""]);
			  self.userPath = [];
			  self.trackPathParent(d);
			  //this.update(d);
			}
			this.updateCanvas(d);
			
		}
		else{
			d.search = 1;
			//if ( self.appendMap[d.name].children == null){
				self.mainDepth = 0;	
				if (d.depth == self.diagramDepth){
					var getDepth = self.getTreeWidth(self.root);
					self.w = (self.diagramDepth + 1) * 180 + 270;
					$("svg").attr("width", self.w);
					self.tree.size([self.h, self.w - 270 + ""]);
				}
				self.checkRepetitive(d.parent, d.name, d);
		}		
			
	  },
	    getMousePosition: function(x, y){
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
		linkMouseOver: function(source, target, relation, inverse) {
			var self=this;
			$("#relation").empty();
			var relationContent = '<div id="relationContent" class="close" >';
			console.log(relation);
			relationContent += Summarizer.prototype.generateRelationshipSentence(source, target, relation, inverse);
			relationContent += '</div>';
			$("#relation").append(relationContent);
			$(".close").click(function(){
				$("#relation").empty();
			});
		},
		getTreeWidth: function(treeRoot){
			var self = this;
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
			for (var i = 0; i < allNodes[0].length; i++){
				if (allNodes[0][i].__data__.children != null){
					allNodes[0][i].childNodes[0].style.fill = "lightsteelblue";
					allNodes[0][i].childNodes[1].style.fill = "33ADFF";
				}
			}
			for (var i = 0; i < allLinks[0].length; i++){
				if (allLinks[0][i].__data__.target.children != null & allLinks[0][i].__data__.source.children != null){
					allLinks[0][i].style.stroke = "#4747d1";
					allLinks[0][i].style.strokeWidth = "4.5px";
				}
				else {
					allLinks[0][i].style.stroke = "#ccc";
					allLinks[0][i].style.strokeWidth = "3px";
				}
			}
			
		},
		emphasizeRecent: function(){
			var self=this;
			var allLinks = self.vis.selectAll("path.link");
			for (var i = 0; i < self.userPath.length-1; i++){
				var linkSearch = self.userPath[i].name + self.userPath[i+1].name;
				for (var j = 0; j < allLinks[0].length; j++){
					if (allLinks[0][j].id == linkSearch) {
						allLinks[0][j].style.stroke = "#ff6600";
					}
				}
			}
		},
		trackPathParent: function(data) {
			var self = this;
			self.userPath.unshift(data);
			
			if (data.parent != null){
				self.trackPathParent(data.parent);
			}
		},
		checkRepetitive: function(data, name, node) {
			var self = this;
			if (data.name == name){
				var alert_msg = '<div class="alert alert-warning canvas-alert">This node has already been explored in this path, please try other nodes. <b>If you want to include the repeated node in your story, please click it again</b></div>';
					$("#canvasStepNavigator").append(alert_msg);
					$(".canvas-alert").fadeIn(100).delay(2500).slideUp(300);
					setTimeout(function(){
						$(".canvas-alert").remove();
					},4000);
					self.userPath = [];
			  		self.trackPathParent(data);
			}
			else {
				if (data.parent != null){
					self.checkRepetitive(data.parent, name, node);
				}else{
					self.addNode(node.uri, node.name,node);
				}
			}
		},
		trackPathChildren: function(data) {
			var self = this;
			// for(var i = 0; i < data.children.length; i++){
				// if (data.children.)
			// }
		},
		generateHashObject: function(){
			var self = this;
			
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
					if (self.userPath[i].inverse == 1){
						linktype.inverse = true;
					}else {
						linktype.inverse = false;
					}
					linktype.uri = self.userPath[i].relation;
					self.userHash.path.push(linktype);
				}
				var nodetype = new Object;
				nodetype.type = "node";
				nodetype.name = self.userPath[i].name;
				nodetype.uri = self.userPath[i].uri;
				self.userHash.path.push(nodetype);
			}
		}
    };

    return PathFinder;
});
