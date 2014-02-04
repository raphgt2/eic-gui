define(['lib/jquery', 'eic/Logger', 'lib/d3','eic/PresentationController2','eic/PiecesUI','eic/SlideEditor'],
  function ($, Logger, d3,PresentationController2, PiecesUI, SlideEditor) {
    "use strict";
    var logger = new Logger("PathFinder");
  		
    function PathFinder(hashObj) {
    	/* Define HTML Elements*/
		
				
				
		/* Define Constants and Data */
		this.URLRef = new Object;
				this.URLRef['Bill_Clinton'] = "http%3A%2F%2Fdbpedia.org%2Fresource%2FBill_Clinton";
				this.URLRef['Hillary_Rodham_Clinton'] = "http%3A%2F%2Fdbpedia.org%2Fresource%2FHillary_Rodham_Clinton";
				this.URLRef['Ray_Bradbury'] = "http%3A%2F%2Fdbpedia.org%2Fresource%2FRay_Bradbury";
		this.w = 150;
    	this.h = 580;
    	this.i = 0;
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
      	console.log("Draw: ", $("#draw"));
      	
      	$("#draw").click(function(){
      		self.keyWord = $("#input").val();
      		self.addNode(self.keyWord, self.keyWord);
      		$("#searchWindow").css("display", "none");
      		$("#canvasWindow").css("display", "block");
      		self.tree = d3.layout.tree().size([self.h, self.w]);
      		self.vis = d3.select("#chart").append("svg:svg")
					     .attr("width", self.w + 200)
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
					console.log("Hash Object Output", jsonObject);
					var editor = new SlideEditor(controller.generator, controller.path, controller, jsonObject);
		        });
            });
			
			$("redraw").click(function(){
				location.reload();
			});
      	});
      	
      },
      addNode: function(nodeURI, name){
      	console.log("[===================Add New Node===================]");
      	var self = this;
      	var searchURI = "/Maven_DataVisualization-0.0.1-SNAPSHOT/rankServlet?uri=";
			searchURI += self.URLRef[nodeURI];
			searchURI += '&num=5';
		console.log(searchURI);
		d3.json("../data_json/computer.json", function(json){
		//json.x0 = 800;
  		//json.y0 = 0;
			console.log("json: ", json, nodeURI, name);
			if (json){
				if (self.round == 1){
					self.history = json;
					self.appendMap[self.keyWord] = json;
					self.appendMap[self.keyWord].name = json.name;
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
		    	return "translate(" + source.y0 + "," + source.x0 + ")"; 
		    })
		    .on("click", function(d){
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
			     .attr("x", function(d) { return d.children || d._children ? 13 : 8; })
				 .attr("y", function(d){
					 	return d.children || d._children ? -13 : 0;
				 })
	    		 .attr("dy", ".35em")
	    		 .style("fill", function(d){
	    		 	return d.children || d._children ? "#ffff00" : "#fff";
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
		if (d.search == 1){		
			if (d.children) {
			  d._children = d.children;
			  d.children = null;
			  
			  self.mainDepth = 0;
			  var getDepth = getTreeWidth(self.root);		
			  self.w = (self.mainDepth) * 120;
			  console.log("mainDepth: ", self.mainDepth, " , w: ", w);
			  self.tree.size([h, w]);
			  self.update(d);
			} else {
			  d.children = d._children;
			  d._children = null;
			  
			  self.mainDepth = 0;
			  var getDepth = self.getTreeWidth(self.root);
			  self.w = (mainDepth) * 120;
			  console.log("mainDepth: ", self.mainDepth, " , w: ", w);
			  $("svg").attr("width", self.w + 120 + "");
			  self.tree.size([self.h, self.w]);
			  this.update(d);
			}
		}
		else if (d.search == 0){
			self.mainDepth = 0;	
			var getDepth = self.getTreeWidth(self.root);
			self.w = (self.mainDepth + 1) * 120;
			console.log("mainDepth: ", self.mainDepth, " , w: ", self.w);
			$("svg").attr("width", self.w + 120 + "");
			self.tree.size([self.h, self.w]);
			self.addNode(d.uri, d.name);
		}
			self.userPath = [];
			self.trackPath(d);
			console.log("HIGHLIGHTPATH: ", self.userPath);
	  },
	    getMousePosition: function(x, y){
	  	  console.log(x, y);
		  $("#relation").css("top", y - 130 + "")
			            .css("left", x - 100 + "")
					  	.css("display", "block");
	    },
	    nodeMouseOver: function(name, catalog) {
			$("#name").empty();
			$("#catalog").empty();
			var nameContent = "Name: " + name;
			var catalogContent = "Catalog: " + catalog;
			$("#name").append(nameContent);
			$("#catalog").append(catalogContent);
		},
		linkMouseOver: function(source, target) {
			console.log(source, "~", target);
			$("#relation").empty();
			var relationContent = '<p id="relationContent" class="close">This is a relation between <b>' + source + '</b> and <b>' + target +'</b></p><h5 id="close">close</h5>';
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
					allNodes[0][i].childNodes[1].style.fill = "ffff00";
				}
			}
			for (var i = 0; i < allLinks[0].length; i++){
				if (allLinks[0][i].__data__.target.children != null & allLinks[0][i].__data__.source.search == 1){
				//if (allLinks[0][i].__data__.target.search == 1 & allLinks[0][i].__data__.source.search == 1){
					allLinks[0][i].style.stroke = "#ff6600";
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
