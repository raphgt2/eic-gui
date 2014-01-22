define(['lib/jquery', 'eic/Logger',
  'eic/generators/IntroductionSlideGenerator', 'eic/generators/OutroductionSlideGenerator',
  'eic/generators/TopicToTopicSlideGenerator', 'eic/generators/CompositeSlideGenerator',
  'eic/generators/ErrorSlideGenerator', 'eic/TopicSelector', 'eic/generators/CustomSlideGenerator', 'eic/SlidePresenter', 'eic/PresentationController'],
  function ($, Logger,
    IntroductionSlideGenerator, OutroductionSlideGenerator,
    TopicToTopicSlideGenerator, CompositeSlideGenerator,
    ErrorSlideGenerator, TopicSelector, CustomSlideGenerator, SlidePresenter, PresentationController) {
    "use strict";
    var logger = new Logger("SlideEditor");
  		
    function SlideEditor(generator, path) {
      this.curTopic = null;
      this.tempSlides = {};
      this.topicToTopic = generator.generators[1];
      this.hash_object = path;
      
      var self = this;
      
      $('#play-button').click(function () {
          	logger.log(self.hash_object);
          	$('#body').html('');
          	new PresentationController(self.hash_object).playMovie();
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
      
      logger.log("Created slideEditor");
      //logger.log(generator.generators[1]);
      
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
          setTimeout(function () {
          	//adding the grid
        	var topics = [];
        	
          	for(var i = 0; i < self.topicToTopic.generators.length; i++){
           		topics.push(self.topicToTopic.generators[i]);
           		self.topicToTopic.generators[i].prepare();
        	}
        	
        	var firstInit = false;
        	for(var i = 1; i < topics.length; i++){
        		var $button = $('<button>').attr("class", "btn btn-sm btn-primary")
        	    	.attr("id", topics[i].topic.label)
        	    	.html(topics[i].topic.label);
        		$button.click(function(){ 
        			self.switchTopic(this.id, topics); 
        			$("#movie-nav-bar").html('');
        		});
        		$('#nodeNavBar').append($button);
        		if(!firstInit && topics[i] !== undefined){
        			self.curTopic = topics[i];
        			var slide = topics[i].next();
        			firstInit = true;
        			self.$slides.append(slide.$element);
        		}
        	}
        	self.switchTopic(topics[1].topic.label, topics);
          }, 500);
      },
      
      switchTopic: function(id, topics){
	  	for(var i = 1; i < topics.length; i++){
	  		if(topics[i] !== undefined && topics[i].topic.label == id){
	  			this.curTopic = topics[i];
	  			var slide = topics[i].next();
	  			this.$slides.children('.transition-out').remove();
        		// start the transition of other children
        		var children = this.$slides.children();
          	    children.remove();
        		this.$slides.append(slide.$element);
        		
        		var self = this;
        		
        		//add appropriate slides to edit box
        		var slides = topics[i].getSlides();
        		for(var val in slides){
      		    	if(val == 'img' || val == 'map'){
      		    		var s = slides['img'];
      		    		this.tempSlides['img'] = s;
      					$('#imgs').children().remove();
      					for(var i = 0; i < s.length; i++){
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
      					//li.append('<div>').addClass('nodeInformation').html()
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
      }
      
    };

    return SlideEditor;
  });
