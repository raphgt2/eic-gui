define(['lib/jquery', 'eic/Logger',
  'eic/generators/IntroductionSlideGenerator', 'eic/generators/OutroductionSlideGenerator',
  'eic/generators/TopicToTopicSlideGenerator', 'eic/generators/CompositeSlideGenerator',
  'eic/generators/ErrorSlideGenerator', 'eic/TopicSelector', 'eic/generators/CustomSlideGenerator', 'eic/SlidePresenter'],
  function ($, Logger,
    IntroductionSlideGenerator, OutroductionSlideGenerator,
    TopicToTopicSlideGenerator, CompositeSlideGenerator,
    ErrorSlideGenerator, TopicSelector, CustomSlideGenerator, SlidePresenter) {
    "use strict";
    var logger = new Logger("SlideEditor");
  		
    function SlideEditor($slides, generator, path) {
      this.curTopic = null;
      this.tempSlides = {};
      this.$slides = $slides;
      this.topicToTopic = generator.generators[1];
      this.hash_object = path;
      
      var self = this;
      $('#play-button').click(function () {
          	//self.controller.playMovie(self.editor.getTopictoTopic(), self.editor.getSlides());
          	new SlidePresenter($slides, generator).start();
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
      $('#next-slide').click(function(){
		  self.nextSlide();
	  });
	  
	  
	  //Audio stuff
	  /*$('#textDescription').blur(function() {
				if (self.previousText[i]==$('#textDescription').val()){
					$('editTestDescription').hide();
					return;
				}
				slide.resendSpeech($('#textDescription').val());
				
				$('cancelTestDescription').val("Undo");
				$('cancelTestDescription').show();
				$('editTestDescription').hide();
				if (slide.hash_object.defaultText==$('#textDescription').val())
					$('defaultTestDescription').hide();
				else
					$('defaultTestDescription').show();
			});
			
			$('#textDescription').focus(function(){
				self.previousText[i]=$('#textDescription').val()
				if (slide.hash_object.defaultText==$('#textDescription').val())
					$('defaultTestDescription').hide();
				else
					$('defaultTestDescription').show();
			});
			
			$('#textDescription').bind('input propertychange', function() {
				$('editTestDescription').show();
				$('cancelTestDescription').hide();
				if (slide.hash_object.defaultText==$('#textDescription').val())
					$('defaultTestDescription').hide();
				else
					$('defaultTestDescription').show();
			});
			
			$('editTestDescription').click(function() {
				if (self.previousText[i]==$('#textDescription').val()){
					$('editTestDescription').hide();
					return;
				}
				slide.resendSpeech($('#textDescription').val());
				$("#track"+i).remove();
				self.addAudio(slide_div,slide,i);
				
				$('cancelTestDescription').val("Undo");
				$('cancelTestDescription').show();
				$('editTestDescription').hide();
				if (slide.hash_object.defaultText==$('#textDescription').val())
					$('defaultTestDescription').hide();
				else
					$('defaultTestDescription').show();					
			});
			
			$('cancelTestDescription').click(function() {
				if (self.previousText[i]==$('#textDescription').val()){
					$('cancelTestDescription').hide();
					return;					
				}
				slide.resendSpeech(self.previousText[i]);
				var temp=self.previousText[i];
				self.previousText[i]=$('#textDescription').val();
				$('#textDescription').val(temp);
				$("#track"+i).remove();
				self.addAudio(slide_div,slide,i);
				
				if ($('cancelTestDescription').val()=="Undo")
					$('cancelTestDescription').val("Redo");
				else
					$('cancelTestDescription').val("Undo");
					
				if (slide.hash_object.defaultText==$('#textDescription').val())
					$('defaultTestDescription').hide();
				else
					$('defaultTestDescription').show();
			});
			
			$('defaultTestDescription').click(function() {				
				if (slide.hash_object.defaultText==$('#textDescription').val()){
					$('defaultTestDescription').hide();
					return;
				}
				self.previousText[i]=$('#textDescription').val();
				slide.resendSpeech(slide.hash_object.defaultText);
				$('#textDescription').val(slide.hash_object.defaultText);
				
				self.addAudio(slide_div,slide,i);
				
				$('cancelTestDescription').val("Undo");
				$('cancelTestDescription').show();
				$('defaultTestDescription').hide();
			});*/
      
      this.startEdit();
    }

    /* Member functions */

    SlideEditor.prototype = {
      // Starts the movie about the connection between the user and the topic.
      startEdit: function () {
		//show the editing box
		var myNode = document.getElementById("init");
		myNode.innerHTML = '';
		// var myNode2 = document.getElementById("del");
		// myNode2.innerHTML = '';
		$('#videoEditor').css('display', 'inline');
          
          var self = this;
          
          //give time for the initialization to finish
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
        			var slide = topics[i].firstSlide.demo();
        			firstInit = true;
        			self.$slides.append(slide.$element);
        		}
        	}
      },
      
      switchTopic: function(id, topics){
	  	for(var i = 1; i < topics.length; i++){
	  		if(topics[i] !== undefined && topics[i].topic.label == id){
	  			this.curTopic = topics[i];
	  			
	  			if (this.curTopic.curSlide>= this.curTopic.slides.length-1)
					$('#next-slide').hide();
				else
					$('#next-slide').show();
					
	  			var slide = topics[i].currentSlide();
	  			this.$slides.children('.transition-out').remove();
        		// start the transition of other children
        		var children = this.$slides.children();
          	    children.remove();
        		this.$slides.append(slide.$element);
        		
        		var self = this;
        		
        		//logger.log("topics[" + i + "]", topics[i]);
        		//add appropriate slides to edit box
        		var slides = topics[i].slides;
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
        this.$slides.append(this.curTopic.nextSlide().$element);
      },
      
      getSlides: function(){
      	return this.$slides;
      },
      
      playSlide: function(){
      	var currentSlide = this.curTopic.currentSlide();
      	currentSlide.start();
      	var self = this;
      	setTimeout(function() {
      		currentSlide.stop();
		}, currentSlide.duration);
      },
      
      pauseSlide: function(){
      	this.curTopic.currentSlide().stop();
      },
      
      nextSlide: function(){
		  var children = this.$slides.children();
          	    children.remove();
		  this.curTopic.nextSlide();
		  var slide = this.curTopic.currentSlide();
		  this.$slides.append(slide.$element);
		  
		  logger.log(this.curTopic.curSlide + " " + this.curTopic.slides.length);
		  if (this.curTopic.curSlide>= this.curTopic.slides.length-1)
			$('#next-slide').hide();
	  }
    };

    return SlideEditor;
  });
