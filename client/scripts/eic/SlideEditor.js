define(['lib/jquery', 'eic/Logger', 'lib/jqueryUI','eic/AudioEditor',
  'eic/generators/IntroductionSlideGenerator', 'eic/generators/OutroductionSlideGenerator',
  'eic/generators/TopicToTopicSlideGenerator', 'eic/generators/CompositeSlideGenerator',
  'eic/generators/ErrorSlideGenerator', 'eic/TopicSelector', 'eic/generators/CustomSlideGenerator', 'eic/SlidePresenter', 'eic/PresentationController'],
  function ($, Logger, jqueryUI, AudioEditor,
    IntroductionSlideGenerator, OutroductionSlideGenerator,
    TopicToTopicSlideGenerator, CompositeSlideGenerator,
    ErrorSlideGenerator, TopicSelector, CustomSlideGenerator, SlidePresenter, PresentationController) {
    "use strict";
    var logger = new Logger("SlideEditor");
  		
    function SlideEditor(generator, path, controller, hashObj) {
      this.curTopic = null;
      this.tempSlides = {};
      this.topicToTopic = generator.generators[1];
      this.hash_object = path;
      
      
      
      //EDITING NODES//
    	this._data_source = controller.generator.generators[1].generators;
    	this._path = hashObj.path;
    	this._Slide_Element_Collection = new Object();
    	this._Play_Sequence = [];
    	this._curNode = this._path[0];
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

		//show the editing box
		//var myNode = document.getElementById("init");
		//myNode.innerHTML = '';
		// var myNode2 = document.getElementById("del");
		// myNode2.innerHTML = '';
		$('#videoEditor').css('display', 'inline');

        
        // Create the slides panel
        var $slides = $('<div>').addClass('slides2'),
            $wrapper = $('<div>').addClass('slides2-wrapper')
                                 .append($slides);
                                 
        this.$slides = $slides;

        // Hide the main panel and show the slides panel
        $('#moviePreview').append($wrapper);
        $wrapper.hide().fadeIn($.proxy($slides.hide(), 'fadeIn', 1000));
        
        // Hide the main panel and show the slides panel
        //$('#screen').append($wrapper);
        //$wrapper.hide().fadeIn($.proxy(this.$slides.hide(), 'fadeIn', 1000));
          /*
          this.topicToTopic = new TopicToTopicSlideGenerator(this.startTopic, this.endTopic);
          this.topicToTopic.init();
          */
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
        		var $button = $('<button>').attr("class", "btn btn-sm btn-primary nodeNavBtn")
        	    	.attr("id", topics[i].topic.label)
        	    	.attr("order", i)
        	    	.html(topics[i].topic.label);
        		$button.click(function(){ 
        			$("#movie-nav-bar").html('');
        			self.switchTopic(this.id, topics, self.curTopic); 
        			self.restoreCurrentNode($(this).attr("order"));
	    			self.PrepareNode($(this).attr("order"));
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
          //}, 500);
          
          setTimeout(function() {
          	self.initElementCollection();
			self.EnableUIAnimation();

          }, 5000);
      },
      
      switchTopic: function(id, topics, prevTopic){
      	//set the previous slide's chosen topics
      	var prevSlides = prevTopic.getSlides();
      	for(var val in prevSlides){
      		var s = prevSlides[val];
      		for(var i = 0; i < s.length-1; i++){
      			var imgs = s[i].$element.clone().find('img');
      			//console.log(img);
      			for(var j = 0; j < this._Play_Sequence.length; j++){
      				if(imgs[0].src == this._Play_Sequence[j]) prevTopic.setEditedSlide(s[i]);
      				//break;
      			}
      		}
      	}
  		
  		//make sure none of the current slide's topics have been put back
  		var eSlides = prevTopic.getEditedSlides();
  		for(var i = 0; i < eSlides.length; i++){
  			var imgs = eSlides[i].$element.clone().find('img');
  			var present = false;
  			for(var j = 0; j < this._Play_Sequence.length; j++){
  				console.log("HERPADERPDERP");
  				console.log(imgs[0].src);
  				console.log(this._Play_Sequence[j]);
  				if(imgs[0].src == this._Play_Sequence[j]) present = true;
  			}
  			if(present == false) prevTopic.deleteEditedSlide(i);
  		}
  		
  		//
	  	for(var i = 1; i < topics.length; i++){
	  		if(topics[i] !== undefined && topics[i].topic.label == id){

	  			this.curTopic = topics[i];
	  			this.audio_editor.setTopic(this.curTopic);

	  			var slide = topics[i].next();
	  			//this.$slides.children('.transition-out').remove();
        		// start the transition of other children
        		var children = this.$slides.children();
          	    children.remove();
        		this.$slides.append(slide.$element);
        		
        		var self = this;
        		
        		//add appropriate slides to edit box
        		var slides = topics[i].getSlides();
        		var editedSlides = topics[i].getEditedSlides();
        		
        		
        		for(var val in slides){
      		    	if(val == 'img' || val == 'map'){
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
      							imgs.attr('id', val + 's' + i);
      							$(imgs).click(function () {
      								self.setContent(this.id, i, 'img');
      							});
      							$('#imgs').append('<li id=img' + i + '></li>')
      							$('#img' + i + '').addClass('ui-state-default nodeElementBarContentWrap btn btn-default');
      							$('#img' + i + '').append(imgs[0])
      							$('#imgs' + i + '').addClass('nodeElementBarContent');
      						}
      					}
      				}
      		    	if(val == 'vid'){
      		    		var s = slides[val];
      		    		this.tempSlides['vid'] = s;
      		    		$('#vids').children().remove();
      		    		$('#vids').css('display', 'inline');
      		    		//console.log(s[0]);
      					for(var i = 0; i < s.length; i++){
      						var vids = s[i].$element.clone().find('img');
      						vids.attr('id', 'vids' + i);
      						$(vids).click(function () {
      							self.setContent(this.id, i, 'vid');
      						});
      						//$('#vids').append(vids[0]);
      						$('#vids').append('<li id=vid' + i + '></li>')
      						$('#vid' + i + '').addClass('ui-state-default nodeElementBarContentWrap btn btn-default');
      						$('#vid' + i + '').append(vids[0])
      						$('#vids' + i + '').addClass('nodeElementBarContent');
      					}
      				}
      			}
      			for(var i = 0; i < editedSlides.length; i++){
        			var theImg = editedSlides[i].$element.clone().find('img');
        			$('#movie-nav-bar').append('<li id=hurr' + i + '></li>');
      				$('#hurr' + i + '').addClass('ui-state-default btn btn-default movieNavElementWrap');
      				$('#hurr' + i + '').css('display', 'block');
      				$('#hurr' + i + '').append('<img src=' + theImg[0].src + " id=hurrs+" + i + " class='nodeElementBarContent'>");
        		}
      			break;	
	  		}
	  	}
	  },

      setContent: function(id, index, type){
      	var arr = this.tempSlides[type];

      	if(id == 'imgs0' || id == 'maps0' || id == 'vids0') this.curTopic.setCurSlide(arr[0]);
      	else if(id == 'imgs1' || id == 'maps1' || id == 'vids1') this.curTopic.setCurSlide(arr[1]);
      	else if(id == 'imgs2' | id == 'maps2' || id == 'vids2') this.curTopic.setCurSlide(arr[2]);
      	else this.curTopic.setCurSlide(arr[index]);
      	
      	this.$slides.children('.transition-out').remove();
        // start the transition of other children
        var children = this.$slides.children();
        children.remove();
        var newSlide = this.curTopic.next().$element.clone().find('img');
        newSlide.css('display', 'block');
        newSlide.addClass('imgPreview')
        this.$slides.append(newSlide[0]);
      },
      
      getTopictoTopic: function(){
      	return this.topicToTopic;
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
    		for(var i = 1; i < this._data_source.length; i++){
    			this._data_source[i].slide_order = [];
    			//this._data_source[i].prepare();
    			var slides = this._data_source[i].getSlides();
    			console.log(slides);
    			var img = slides.img;
    			var vid = slides.vid;
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
    		
    	},
    	restoreCurrentNode: function(n){
    		console.log("RESTORE NODE");
    		this._data_source[n-1].slide_order = this._Play_Sequence;
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
    		this._Play_Sequence = this._data_source[n].slide_order;
    	},
    	EnableUIAnimation: function(){
    		var self = this;
    		console.log("UI Animation");

    		$('#lastStep').click(function(){
    			console.log("Hash Object Test: ", self._hash);
    		});
    		$('#play-button').click(function () {
	      		logger.log("Play Button Click", self._hash);
	          	console.log("Play Button Click Test II: ", self._hash);
	          	$('#body').html('');
	          	
	          	$('#body').html("<div id='screen'> </div>");
                 
                $('#screen').css({
					display: 'none',
					position: 'relative',
					margin: 'auto',
					overflow: 'hidden',
					height: 600,
					width: 800,
					'vertical-align': 'middle',
                });
                
                $('#screen').show();               
	          	
	          	var play = new PresentationController(self._hash, true, true);
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
					console.log("self", self);
					self.grabMovieNav();
				}
			});
			$( "#movie-nav-bar, .node-element-list" ).disableSelection();
    	},
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
    /////
      
    };

    return SlideEditor;
  });
