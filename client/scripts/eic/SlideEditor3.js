define(['lib/jquery', 'eic/Logger',
  'eic/generators/IntroductionSlideGenerator', 'eic/generators/OutroductionSlideGenerator',
  'eic/generators/TopicToTopicSlideGenerator', 'eic/generators/CompositeSlideGenerator',
  'eic/generators/ErrorSlideGenerator', 'eic/TopicSelector', 'eic/generators/CustomSlideGenerator'],
  function ($, Logger,
    IntroductionSlideGenerator, OutroductionSlideGenerator,
    TopicToTopicSlideGenerator, CompositeSlideGenerator,
    ErrorSlideGenerator, TopicSelector, CustomSlideGenerator) {
    "use strict";
    var logger = new Logger("SlideEditor");
  		
    function SlideEditor() {
      this.curTopic = null;
      this.tempSlides = {};
      this.$slides;
      this.topicToTopic = null;
    }

    /* Member functions */

    SlideEditor.prototype = {
      init: function () {
        logger.log("Initializing");
        var self = this;
	  },
      // Starts the movie about the connection between the user and the topic.
      startEdit: function () {
        if (!this.startTopic) throw "No start topic selected.";
        if (!this.endTopic) throw "No end topic selected.";
        if (!this.intro) throw "The introduction was not initialized";

		//show the editing box
		var myNode = document.getElementById("init");
		myNode.innerHTML = '';
		// var myNode2 = document.getElementById("del");
		// myNode2.innerHTML = '';
		$('#videoEditor').css('display', 'inline');
		
        // Create the slides panel
        this.$slides = $('<div>').addClass('slides');
        var $wrapper = $('<div>').addClass('slides-wrapper')
                                 .append(this.$slides);

        // Hide the main panel and show the slides panel
        $('#screen').append($wrapper);
        $wrapper.hide().fadeIn($.proxy(this.$slides.hide(), 'fadeIn', 1000));
          
          this.topicToTopic = new TopicToTopicSlideGenerator(this.startTopic, this.endTopic);
          this.topicToTopic.init();
          
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
        		var $button = $('<button>').attr("class", "btn btn-primary")
        	    	.attr("id", topics[i].topic.label)
        	    	.html(topics[i].topic.label);
        		$button.click(function(){ self.switchTopic(this.id, topics); });
        		$('#slides-row').append($button);
        		if(!firstInit && topics[i] !== undefined){
        			self.curTopic = topics[i];
        			var slide = topics[i].next();
        			firstInit = true;
        			self.$slides.append(slide.$element);
        		}
        	}
          }, 5000);
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
      					$('#imgs').append(imgs[0]);
      					}
      				}
      		    	if(val == 'vid'){
      		    		var s = slides[val];
      		    		this.tempSlides['vid'] = s;
      		    		$('#vids').children().remove();
      					for(var i = 0; i < s.length; i++){
      						var vids = s[i].$element.clone().find('img');
      						vids.attr('id', 'vids' + i);
      						$(vids).click(function () {
      							self.setContent(this.id, i, 'vid');
      						});
      						$('#vids').append(vids[0]);
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
        this.$slides.append(this.curTopic.next().$element);
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
