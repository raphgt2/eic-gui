/*
* LODStory Slide Editor
* Copyright 2014, LOD Story Team - University of Southern California - Information Sciences Institute
* Licensed under 
*/

define(['lib/jquery', 'eic/Logger', 'lib/jvent', 'config/URLs', 'eic/AudioEditor',
  'eic/generators/IntroductionSlideGenerator', 'eic/generators/OutroductionSlideGenerator', 'eic/generators/CompositeSlideGenerator',
  'eic/generators/ErrorSlideGenerator', 'eic/TopicSelector', 'eic/generators/CustomSlideGenerator', 'eic/SlidePresenter', 'eic/PresentationController','lib/jquery__ui'],
  function ($, Logger, EventEmitter, urls, AudioEditor,
    IntroductionSlideGenerator, OutroductionSlideGenerator, CompositeSlideGenerator,
    ErrorSlideGenerator, TopicSelector, CustomSlideGenerator, SlidePresenter, PresentationController,jquery__ui) {
    "use strict";
    var logger = new Logger("SlideEditor");
  		
    function SlideEditor(generator, path, controller, hashObj) {
		EventEmitter.call(this);
		
		this.curTopic = null;
		this.tempSlides = {};
		this.topics = controller.topicToTopic.generators;
		this.hash_object = path;      
      
      //EDITING NODES//
			
    	this._path = hashObj.path;
    	this._Slide_Element_Collection = new Object();
    	this._Play_Sequence = [];
    	this._curNode = this._path[0];
    	this._curIndex = 1;
    	this._hash = hashObj;
    	//var self = this;
    	
    	var self = this;
    	
		this.players = [];
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
        	
          	for(var i = 0; i < self.topics.length; i++){
           		self.topics[i].prepare();
        	}
        	
        	var firstInit = false;
        	for(var i = 1; i < self.topics.length; i++){
        		var $button = $('<button>').attr("class", "btn btn-sm btn-info nodeNavBtn")
        	    	.attr("id", self.topics[i].topic.label)
        	    	.attr("order", i)
        	    	.html(self.topics[i].topic.label);
        		$button.click(function(){ 
        			$("#movie-nav-bar").html('');
        			self.switchTopic(this.id, self.curTopic); 
        			var index = $(this).attr("order");
        			self.restoreCurrentNode(index);
	    			self.PrepareNode(index);
	    			self._curIndex = index;
        		});
        		$('#nodeNavBar').append($button);
        		if(!firstInit && self.topics[i] !== undefined){
        			self.curTopic = self.topics[i];
        			var slide = self.topics[i].next();
        			firstInit = true;
        			self.$slides.append(slide.$element);
        		}
        	}
        	self.switchTopic(self.topics[1].topic.label, self.topics[1]);
        	$('#img-element-list-wrap').css('display', 'inline');
            $('#vid-element-list-wrap').css('display', 'none');
          //}, 500);
          
          setTimeout(function() {
          	self.initElementCollection();
			self.EnableUIAnimation();

          }, 10);
      },
      
      switchTopic: function(id, prevTopic){
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
	  	for(var i = 1; i < this.topics.length; i++){
	  		if(this.topics[i] !== undefined && this.topics[i].topic.label == id){

	  			this.curTopic = this.topics[i];
	  			this.audio_editor.setTopic(this.curTopic);

	  			var slide = this.topics[i].next();
        		// start the transition of other children
        		var children = this.$slides.children();
          	    children.remove();
        		this.$slides.append(slide.$element);
        		
        		var self = this;
        		
        		//add appropriate slides to edit box
        		var slides = self.topics[i].getSlides();
        		var editedSlides = self.topics[i].getEditedSlides();
        		
        		var imgcnt = 0;
        		var vidcnt = 0;

                $("#img-load").css('display', 'none');
                $("#vid-load").css('display', 'none');

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

      			if(imgcnt == 0)
                {
                    $("#img-none").css('display', 'inline');
                    $('img-none').addClass('alert alert-danger');
                    $("img-none").text('No images found');
                }
      			else $("#img-none").css('display', 'none');

      			if(vidcnt == 0)
                {
                    $("#vid-none").css('display', 'inline');
                    $('#vid-none').addClass('alert alert-danger');
                    $('#vid-none').text('No videos found');
                }
                else $("#vid-none").css('display', 'none');

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
    		console.log("Data_Source", this.topics);
    		for(var i = 1; i < this.topics.length; i++){
    			this.topics[i].slide_order = [];
    			var slides = this.topics[i].slides;;
    			var img = slides.img;
    			var vid = slides.vid;
    			for (var j = 0; j < img.length; j++){
    				this._Slide_Element_Collection[img[j].slide_info.data.url]=img[j].slide_info;
    			}
    			for (var k = 0; k < vid.length; k++){
    				this._Slide_Element_Collection[vid[k].slide_info.data.videoID]=vid[k].slide_info;
    			} 
    		}
    		
    	},
    	restoreCurrentNode: function(n){
    		var self = this;
    		//console.log("Self Test", self);
    		console.log("RESTORE NODE", n);
    		for (var i = 0; i < this._Play_Sequence.length; i++){
    			if (this._Play_Sequence[i].indexOf("youtube") != -1){
    				var vidID = this._Play_Sequence[i].substring(26,37);
    				this._Play_Sequence[i] = vidID;
    				//console.log("vidID", vidID);
    			}
    		}
    		this.topics[n].slide_order = this._Play_Sequence;
    		var slide_content = new Array;
    		console.log("THIS", this);
    		for (var i = 0; i < this._Play_Sequence.length; i++){
       			slide_content.push(this._Slide_Element_Collection[this._Play_Sequence[i]]);
    		}
    		console.log("slide_content", slide_content);
    		if (slide_content[0] != undefined){
    			this._curNode.slide_description = slide_content;
				this._curNode.temp = false;		//Indicate that the slide description is an actual thing
    		}
    	},
    	PrepareNode: function(n){
    		console.log("PREPARE NODE");
    		this._curNode = this._path[2*(n-1)];
    		this._Play_Sequence = this.topics[n].slide_order;
    	},
    	EnableUIAnimation: function(){
    		var self = this;
    		console.log("UI Animation");

    		$('#lastStep').click(function(){
    			console.log("Hash Object Test: ", self._hash);
    		});
    		$('#play-button').click(function () {
				
				//Hide the editor so that it's not possible to click the play button multiple times...
				$('#editor').css('display', 'none');
    			
				self.restoreCurrentNode(self._curIndex);

				//Give a second for the last node's edits to process before checking the hash
				setTimeout(function(){
					self.evaluateHash();
				},1000);
				
				if (self.evaluated){
					logger.log("Evaluated hash", self._hash);						
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
					//self.cleanYTHolder();
					var play = new PresentationController(self._hash, false, true);
					console.log("PresentationController: ", play, play.path.path);
					play.playMovie();
				}
				else{
					self.once('hash evaluated', function(){
						logger.log("Evaluated hash", self._hash);					
						$('#screen').remove();
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
						//self.cleanYTHolder();
						var play = new PresentationController(self._hash, false, true);
						console.log("PresentationController: ", play, play.path.path);
						play.playMovie();
					});
				}
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
			
			$('#save-button').click(function(){
				self.restoreCurrentNode(self._curIndex);
				
				//Give a second for the last node's edits to process before saving the hash
				setTimeout(function(){
					self.saveHash(self.hash_object.hashID);
				}, 1000);
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
				},
				receive: function(event, ui){
					console.log("Receive!");
					ui.item.removeClass("nodeElementBarContentWrap")
						   .addClass("movieNavElementWrap");
					$('#movie-nav-bar').css("padding", "3px");
				},
				update: function(event, ui){
					self.grabMovieNav();
				}
			});
			$( "#movie-nav-bar, .node-element-list" ).disableSelection();
    	},
    	grabMovieNav: function(){
    		var movieNav = $("#movie-nav-bar .nodeElementBarContent");
    		var navlist = [movieNav.length];
    		 for (var i = 0; i<movieNav.length; i++){
    			 navlist[i] = movieNav[i].src;
    		 }

    		if (movieNav[0] == undefined){;
    			$("#movie-nav-bar").css("padding", "50px");
    		}
    		this._Play_Sequence = navlist;
    	},
		//Used at the end to run through the hash object and update the durations of chosen image/vid slides, as well as saving players for selected videos
		//Create a pseudo-slide_description for default vids so that we don't waste time trying to load new ones
		evaluateHash: function (){
		logger.log("evaluating hash");
			var i,j;
			var topics = this.topics;
			for (i=1; i<topics.length; i++){
				if (!topics[i].hash_object.slide_description){
					topics[i].updateHash();
				}
				//Only do proper time updates if the slide_description was real
				else if (!topics[i].hash_object.temp){
					var parts = 0;
					for (j=0; j<topics[i].hash_object.slide_description.length; j++){
						if (topics[i].hash_object.slide_description[j].type == "YouTubeSlide")
							parts+=3
						else
							parts+=1;
					}
					for (j=0; j<topics[i].hash_object.slide_description.length; j++){
						if (topics[i].hash_object.slide_description[j].type == "YouTubeSlide"){	
							topics[i].hash_object.slide_description[j].data.duration = Math.floor((topics[i].hash_object.audio_time*3)/parts);
							if (topics[i].hash_object.slide_description[j].player)
								this.players.push(topics[i].hash_object.slide_description[j].player.playerId);
						}
						else
							topics[i].hash_object.slide_description[j].data.duration = Math.floor(topics[i].hash_object.audio_time/parts);		
					}
				}
			}
			//Make sure NOT to start cleaning the ytholder or starting the presentation controller until the entire hash has been looped through				
			this.evaluated = true;
			logger.log("finished evaluation");
			this.emit('hash evaluated');
		},
		//Keep all youtube players, since well need them again if we implement replay function
		/*cleanYTHolder: function(){
			var i;
			
			//add a class to the players we wanna save
			for (i=0; i<this.players.length; i++){
				$('#container_'+this.players[i]).addClass('save');
			}
			
			//Now remove the extraneous players
			$('#ytholder').children().not('.save').remove();
		}*/
		saveHash: function(hashID){		
			var hash = JSON.parse(JSON.stringify(this.hash_object));
			var self = this;
			
			//Nodes are found every 2 steps in the path (other half of the steps are links)
			for (var i=0; i< hash.path.length; i+=2){
				//Dereference temporary slide descriptions
				if (hash.path[i].temp){
					delete hash.path[i].slide_description;
					delete hash.path[i].temp;
				}
				//else save the description if it has one, but unreference all youtube player-related objects
				else if (hash.path[i].slide_description){
					for (var j=0; j<hash.path[i].slide_description.length; j++){
						if (hash.path[i].slide_description[j].type == "YouTubeSlide"){
							delete hash.path[i].slide_description[j].player;
						}
					}
				}
			}
			
			console.log(hash);
			console.log(this.hash_object);
			
			function escapeString(str){			
				str = str.replace(/\\/g,"\\\\");
				str = str.replace(/\0/g, "\\0");
				str = str.replace(/\n/g, "\\n");
				str = str.replace(/\r/g, "\\r");
				str = str.replace(/'/g, "\\'");
				str = str.replace(/"/g, '\\"');
				str = str.replace(/\x1a/g, "\\Z");
				
				return str;
			}
			
			$.ajax({
				url: urls.hashStore,	
				type: 'POST',
				data: {hashID: hashID, hash: escapeString(JSON.stringify(hash))},
				success: function (data) {
					location.hash=data.trim();
					self.hash_object.hashID = data.trim();
					alert("Your movie can be accessed at "+window.location.href);
				},
				error: function(error){
					alert("Could not save movie");
				}
			});
		}
		
      
    };

    return SlideEditor;
  });
