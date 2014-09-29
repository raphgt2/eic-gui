/*
* LODStory Slide Editor
* Copyright 2014, LOD Story Team - University of Southern California - Information Sciences Institute
* Licensed under 
*/

define(['lib/jquery', 'eic/Logger', 'eic/AudioEditor',
  'eic/generators/IntroductionSlideGenerator', 'eic/generators/OutroductionSlideGenerator',
  'eic/generators/TopicToTopicSlideGenerator', 'eic/generators/CompositeSlideGenerator',
  'eic/generators/ErrorSlideGenerator', 'eic/TopicSelector', 'eic/generators/CustomSlideGenerator', 'eic/SlidePresenter', 'eic/PresentationController','lib/jquery__ui'],
  function ($, Logger, AudioEditor,
    IntroductionSlideGenerator, OutroductionSlideGenerator,
    TopicToTopicSlideGenerator, CompositeSlideGenerator,
    ErrorSlideGenerator, TopicSelector, CustomSlideGenerator, SlidePresenter, PresentationController,jquery__ui) {
    "use strict";
    var logger = new Logger("SlideEditor");
  		
    function SlideEditor(generator, path, controller, hashObj) {
      this.curTopic = null;
      this.tempSlides = {};
      this.topicToTopic = controller.topicToTopic;
      this.hash_object = path;
      
      
      
      //EDITING NODES//
		this._data_source = controller.topicToTopic;
			
    	this._path = hashObj.path;
    	this._Slide_Element_Collection = new Object();
    	this._Play_Sequence = [];
    	this._curNode = this._path[0];
    	this._curIndex = 1;
    	this._hash = hashObj;
    	//var self = this;
    	
    	var self = this;
    	
    	this.audio_editor = new AudioEditor();

      
      logger.log("Created slideEditor");
      this.startEdit();
    }

    /* Member functions */

    SlideEditor.prototype = {
      // Starts the movie about the connection between the user and the topic.
      startEdit: function () {
		$('#videoEditor').css('display', 'block');

        
        // Create the slides panel
        var $slides = $('<div>').addClass('slides2'),
            $wrapper = $('<div>').addClass('slides2-wrapper')
                                 .append($slides);
                                 
        this.$slides = $slides;

        // Hide the main panel and show the slides panel
        $('#moviePreview').append($wrapper);
        $wrapper.hide().fadeIn($.proxy($slides.hide(), 'fadeIn', 1000));
        
          var self = this;
          
          //give time for the initialization to finish
          //setTimeout(function () {
          	//adding the grid
        	var topics = [];
        	
          	for(var i = 0; i < self.topicToTopic.generators.length; i++){
           		topics.push(self.topicToTopic.generators[i]);
           		self.topicToTopic.generators[i].prepare();
        	}
        	
        	var firstInit = false;
        	for(var i = 1; i < topics.length; i++){
        		var $button = $('<button>').attr("class", "btn btn-sm btn-info nodeNavBtn")
        	    	.attr("id", topics[i].topic.label)
        	    	.attr("order", i)
        	    	.html(topics[i].topic.label);
        		$button.click(function(){ 
        			$("#movie-nav-bar").html('');
        			self.switchTopic(this.id, topics, self.curTopic); 
        			var index = $(this).attr("order");
        			self.restoreCurrentNode(index);
	    			self.PrepareNode(index);
	    			self._curIndex = index;
        		});
        		$('#nodeNavBar').append($button);
        		if(!firstInit && topics[i] !== undefined){
        			self.curTopic = topics[i];
        			var slide = topics[i].next();
        			firstInit = true;
        			self.$slides.append(slide.$element);
        		}
        	}
        	self.switchTopic(topics[1].topic.label, topics, topics[1]);
        	$('#img-element-list-wrap').css('display', 'inline');
            $('#vid-element-list-wrap').css('display', 'none');
          //}, 500);
          
          setTimeout(function() {
          	self.initElementCollection();
			self.EnableUIAnimation();

          }, 10);
      },
      
      switchTopic: function(id, topics, prevTopic){
      	//set the previous slide's chosen topics
      	var prevSlides = prevTopic.getSlides();
      	for(var val in prevSlides){
      		var s = prevSlides[val];
      		for(var i = 0; i < s.length; i++){
      			var imgs = s[i].$element.clone().find('img');
      			var vids = s[i].slide_info.data.videoID;
      			var vidsString = 'http://img.youtube.com/vi/' + vids + '/default.jpg';
      			for(var j = 0; j < this._Play_Sequence.length; j++){
      				if(imgs[0] != undefined && imgs[0].src == this._Play_Sequence[j]) prevTopic.setEditedSlide(s[i]);
      				if(vidsString == this._Play_Sequence[j]) prevTopic.setEditedSlide(s[i]);
      			}
      		}
      	}
  		
  		//make sure none of the current slide's topics have been put back
  		var eSlides = prevTopic.getEditedSlides();
  		for(var i = 0; i < eSlides.length; i++){
  			var imgs = eSlides[i].$element.clone().find('img');
  			var present = false;
  			for(var j = 0; j < this._Play_Sequence.length; j++){
  				if(imgs[0] == undefined){
  					var vids = eSlides[i].slide_info.data.videoID;
  					var vidsString = 'http://img.youtube.com/vi/' + vids + '/default.jpg';
  					if(vidsString == this._Play_Sequence[j]) present = true;
  				} else if(imgs[0].src == this._Play_Sequence[j]) present = true;
  			}
  			if(present == false) prevTopic.deleteEditedSlide(i);
  		}
  		
  		//
	  	for(var i = 1; i < topics.length; i++){
	  		if(topics[i] !== undefined && topics[i].topic.label == id){

	  			this.curTopic = topics[i];
	  			this.audio_editor.setTopic(this.curTopic);

	  			var slide = topics[i].next();
        		// start the transition of other children
        		var children = this.$slides.children();
          	    children.remove();
        		this.$slides.append(slide.$element);
        		
        		var self = this;
        		
        		//add appropriate slides to edit box
        		var slides = topics[i].getSlides();
        		var editedSlides = topics[i].getEditedSlides();
        		
        		var imgcnt = 0;
        		var vidcnt = 0;
        		for(var val in slides){
      		    	if(val == 'img' || val == 'map'){
      		    	    imgcnt++;
      		    		var s = slides['img'];
      		    		this.tempSlides['img'] = s;
      					$('#imgs').children().remove();

      					for(var i = 0; i < s.length; i++){
      						var isEdited = false;
      						for(var j = 0; j < editedSlides.length; j++){
      							if(editedSlides[j] == s[i]){
      								isEdited = true;
      								break;
      							}
      						}
      						if(!isEdited){
      							var imgs = s[i].$element.clone().find('img'); //get just the image link
      							imgs.attr('id', val + 's' + i)
      								.attr('class', 'nodeElementBarContent');
      							$(imgs).click(function () {
      								self.setContent(this.id, i, 'img');
      							});
      							$('#imgs').append('<li id=img' + i + '></li>');
      							$('#img' + i + '').addClass('ui-state-default nodeElementBarContentWrap btn btn-default');
      							$('#img' + i + '').append(imgs[0]);
      							$('#imgs' + i + '').addClass('nodeElementBarContent');
      						}
      					}
      				}
      		    	if(val == 'vid'){
      		    	    vidcnt++;
                        var s = slides['vid'];
                        this.tempSlides['vid'] = s;
                        $('#vids').children().remove();
                        for(var i = 0; i < s.length; i++){
                        	var isEdited = false;
      						for(var j = 0; j < editedSlides.length; j++){
      							if(editedSlides[j] == s[i]){
      								isEdited = true;
      								break;
      							}
      						}
      						if(!isEdited){
                          		var vids = s[i].slide_info.data.videoID;
                         		$('#vids').append('<li id=vid' + i + '></li>');
                         		$('#vid' + i + '').addClass('ui-state-default nodeElementBarContentWrap btn btn-default');
                         		$('#vid' + i + '').append('<img id=vids' + i + ' src=http://img.youtube.com/vi/' + vids + '/default.jpg>');
                         		$('#vids' + i + '').addClass('nodeElementBarContent');
                         		$('#vids' + i).click(function () {
                         		    var id = "vids" + i;
                         			self.setContent(id, i, 'vid');
                         		});
                        	}
                        }
                     }
      			}

      			if(imgcnt == 0) $("#imgerr").css('display', 'inline');
      			else $("#imgerr").css('display', 'none');

      			if(vidcnt == 0) $("#viderr").css('display', 'inline');
                else $("#viderr").css('display', 'none');

      			for(var i = 0; i < editedSlides.length; i++){
        			var theImg = editedSlides[i].$element.clone().find('img');
        			$('#movie-nav-bar').append('<li id=hurr' + i + '></li>');
      				$('#hurr' + i + '').addClass('ui-state-default btn btn-default movieNavElementWrap');
      				$('#hurr' + i + '').css('display', 'block');
        			if(theImg[0] == undefined){
        				var theVid = editedSlides[i].slide_info.data.videoID;
					  $('#hurr' + i + '').append('<img src=http://img.youtube.com/vi/' + theVid + "/default.jpg id=hurrs+" + i + " class='nodeElementBarContent'>");
        			} else $('#hurr' + i + '').append('<img src=' + theImg[0].src + " id=hurrs+" + i + " class='nodeElementBarContent'>");
        		}
      			break;	
	  		}
	  	}
	  },

      setContent: function(id, index, type){
      	var arr = this.tempSlides[type];

        /*TODO: BETTER WAY TO DO THIS!!!!*/
      	if(id == 'imgs0' || id == 'maps0' || id == 'vids0') this.curTopic.setCurSlide(arr[0]);
      	else if(id == 'imgs1' || id == 'vids1') this.curTopic.setCurSlide(arr[1]);
      	else if(id == 'imgs2' || id == 'vids2') this.curTopic.setCurSlide(arr[2]);
      	else if(id == 'imgs3' || id == 'vids3') this.curTopic.setCurSlide(arr[3]);
      	else if(id == 'imgs4' || id == 'vids4') this.curTopic.setCurSlide(arr[4]);
      	else if(id == 'imgs5' || id == 'vids5') this.curTopic.setCurSlide(arr[5]);
      	else if(id == 'imgs6' || id == 'vids6') this.curTopic.setCurSlide(arr[6]);
      	else if(id == 'imgs7' || id == 'vids7') this.curTopic.setCurSlide(arr[7]);
      	else this.curTopic.setCurSlide(arr[index]);
      	
      	this.$slides.children('.transition-out').remove();
        // start the transition of other children
        var children = this.$slides.children();
        children.remove();
        var newSlide;
        if(type == 'vid'){
            newSlide = this.curTopic.next().slide_info.data.videoID;
            this.$slides.append('<img src=http://img.youtube.com/vi/' + newSlide + "/default.jpg class='imgPreview'>")
        } else {
            newSlide = this.curTopic.next().$element.clone().find('img');
            newSlide.addClass('imgPreview');
            this.$slides.append(newSlide[0]);
        }
      },
      
      getTopictoTopic: function(){
      	//return this.topicToTopic;
      	return this._data_source;
      },
      
      getSlides: function(){
      	return this.$slides;
      },
      
      playSlide: function(){
      	var currentSlide = this.curTopic.next();
      	currentSlide.start();
      	var self = this;
      	setTimeout(function() {
      		self.curTopic.next().stop();
		}, currentSlide.duration);
      },
      
      pauseSlide: function(){
      	this.curTopic.next().stop();
      },
    	initElementCollection: function(){
    		var self = this;
    		console.log("Data_Source", this._data_source);
    		for(var i = 1; i < this._data_source.generators.length; i++){
    			//this._data_source[i].slide_order = [];
    			this._data_source.generators[i].slide_order = [];
    			//this._data_source[i].prepare();
    			var slides = this._data_source.generators[i].slides;
    			logger.log(slides);
    			var img = slides.img;
    			var vid = slides.vid;
    			//console.log("img", img);
    			//console.log("vid", vid);
    			for (var j = 0; j < img.length; j++){
    				//console.log(img[j].slides_info.data);
    				this._Slide_Element_Collection[img[j].slide_info.data.url]=img[j].slide_info;
    			}
    			for (var k = 0; k < vid.length; k++){
    				this._Slide_Element_Collection[vid[k].slide_info.data.videoID]=vid[k].slide_info;
    			} 
    		}
    		
    	},
    	restoreCurrentNode: function(n){
    		var self = this;
    		console.log("Self Test", self);
    		console.log("RESTORE NODE", n);
    		for (var i = 0; i < this._Play_Sequence.length; i++){
    			if (this._Play_Sequence[i].indexOf("youtube") != -1){
    				var vidID = this._Play_Sequence[i].substring(26,37);
    				this._Play_Sequence[i] = vidID;
    				console.log("vidID", vidID);
    			}
    		}
    		this._data_source.generators[n].slide_order = this._Play_Sequence;
    		var slide_content = new Array;
    		console.log("THIS", this);
    		for (var i = 0; i < this._Play_Sequence.length; i++){
    			console.log(i, this._Play_Sequence[i]);
    			slide_content.push(this._Slide_Element_Collection[this._Play_Sequence[i]]);
    		}
    		console.log("slide_content", slide_content);
    		if (slide_content[0] != undefined){
    			this._curNode.slide_description = slide_content;
    		}
    		
    		
    		console.log("Updated Hash", this._hash);
    	},
    	PrepareNode: function(n){
    		console.log("PREPARE NODE");
    		//this.grabMovieNav();
    		this._curNode = this._path[2*(n-1)];
    		this._Play_Sequence = this._data_source.generators[n].slide_order;
    	},
    	EnableUIAnimation: function(){
    		var self = this;
    		console.log("UI Animation");

    		$('#lastStep').click(function(){
    			console.log("Hash Object Test: ", self._hash);
    		});
    		$('#play-button').click(function () {
    			
	      		logger.log("Play Button Click", self._hash);
	          	//console.log("Play Button Click Test II: ", self._hash);
	          	$('#ytholder').html('');
	          	self.restoreCurrentNode(self._curIndex);
	          	$('#screen').remove();
	          	$('#editor').css('display', 'none');
	          	$(document.body).append("<div id='screen'> </div>");

                $('#screen').css({
					display: 'none',
					position: 'relative',
					margin: 'auto',
					overflow: 'hidden',
					height: 600,
					width: 800,
					'vertical-align': 'middle',
                });
                
                //$('#screen').show();               
	          	
	          	var play = new PresentationController(self._hash, false, true);
	          	console.log("PresentationController: ", play, play.path.path);
				play.playMovie();
	      	});

	      	$('#play-slide').click(function () {
	                 if($('#play-slide').html() == 'Play Slide'){
	                          $('#play-slide').html('Pause Slide');
	                          self.playSlide();
	                  }
	                  else{
	                          $('#play-slide').html('Play Slide');
	                          self.pauseSlide();
	                  }
	      	});
    		
    		$( ".node-element-list" ).sortable({
			  connectWith: "#movie-nav-bar",
			  helper: "clone",
		      appendTo: "#videoEditor",
		      revert: true,
		      scroll: false,
		      receive: function(event, ui){
		      	ui.item.removeClass("movieNavElementWrap")
					   .addClass("nodeElementBarContentWrap");
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
					$("#movieNavBarWrap").css("border", "2px solid black");
				},
				out: function(event, ui){
					$("#movieNavBarWrap").css("border", "1px solid gray");
					//$("#movie-nav-bar").css("background", "grey");
				},
				receive: function(event, ui){
					console.log("Receive!");
					ui.item.removeClass("nodeElementBarContentWrap")
						   .addClass("movieNavElementWrap");
					$('#movie-nav-bar').css("padding", "3px");
				},
				update: function(event, ui){

					//console.log("Update!");
					//console.log("self", self);
					self.grabMovieNav();
				}
			});
			$( "#movie-nav-bar, .node-element-list" ).disableSelection();
    	},
    	grabMovieNav: function(){
    		var movieNav = $("#movie-nav-bar .nodeElementBarContent");
    		//console.log(movieNav[0]);
    		var navlist = [movieNav.length];
    		 for (var i = 0; i<movieNav.length; i++){
    			 navlist[i] = movieNav[i].src;
    		 }
    		//console.log("Movie Nav: ", navlist);
    		if (movieNav[0] == undefined){
    			//console.log("yes");
    			$("#movie-nav-bar").css("padding", "50px");
    		}
    		this._Play_Sequence = navlist;
    	}
    /////
      
    };

    return SlideEditor;
  });
