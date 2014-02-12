/**
 * @author Dipa
 */
define(['lib/jquery', 'eic/Logger', 'eic/TTSService',
  'eic/generators/CompositeSlideGenerator', 'eic/generators/GoogleImageSlideGenerator',
  'eic/generators/GoogleMapsSlideGenerator', 'eic/generators/TitleSlideGenerator', 'eic/generators/YouTubeSlideGenerator'],
  function ($, Logger, TTSService,
    CompositeSlideGenerator, GoogleImageSlideGenerator,
    GoogleMapsSlideGenerator, TitleSlideGenerator, YouTubeSlideGenerator) {
    "use strict";
    var logger = new Logger("FinalizedTopicSlideGenerator");

    /*
    * CLEANUP
    **/

    function FinalizedTopicSlideGenerator(topic, hash_object) {
      CompositeSlideGenerator.call(this);
	  
	  this.hash_object = hash_object;
      this.generators = [];
      this.topic = topic;
      this.first = true;
      this.durationLeft = 0;
      this.audioURL ='';
      this.ready=false;
      
      //stuff
      this.curSlide = -1;
      this.slides = [];
      this.firstSlide = new TitleSlideGenerator(this.topic);
    }

    $.extend(FinalizedTopicSlideGenerator.prototype,
             CompositeSlideGenerator.prototype,
      {
        /** Checks whether at least one child generator has a next slide. */
        hasNext: function () {
          if (this.durationLeft <= 0)
            return false;
          else
            return this.slides.length > 0;
        },

        /** Initialize all child generators. */
        init: function () {
          if (this.inited)
            return;
		
		var self  = this;
		  if (this.hash_object.slide_description) {
			  logger.log("slide description found", this.hash_object.slide_description);
			  if (this.hash_object.slide_description.length == 0){
				  //Create all generators depending on the type of the topic
					switch (this.topic.type) {
					case "http://dbpedia.org/ontology/PopulatedPlace":
						this.addGenerator(new GoogleImageSlideGenerator(this.topic), false);
						this.addGenerator(new YouTubeSlideGenerator(this.topic), false);
						this.addGenerator(new GoogleMapsSlideGenerator(this.topic), false);
						break;
					default:
						this.addGenerator(new GoogleImageSlideGenerator(this.topic), false);
						this.addGenerator(new YouTubeSlideGenerator(this.topic), false);
						break;
					}
			  }			  
			  this.hash_object.slide_description.forEach(function(description){
				  var slide;
				  switch(description.type){
					  case "GoogleImageSlide":
						slide = new GoogleImageSlideGenerator(self.topic);
						var image = new Image();
						$(image).load(function () {
							// add the image if it loads and we still need slides
							slide.addImageSlide(image.src, description.data.duration);
						});
						image.src = description.data.url;		
						self.addGenerator(slide,true);
						
						break;
					  case "YouTubeSlide":
						slide = new YouTubeSlideGenerator(self.topic);
						self.addGenerator(slide,true);
						
						//Check if we've gotten the youtube API yet, otherwise grab it and wait for the functions to be visible before trying to make the slide
						if (!window.YT){
							$.getScript("http://www.youtube.com/player_api", function () {
								setTimeout(function(){
									slide.addVideoSlide(description.data.videoID, (description.data.end-description.data.start), description.data.start, description.data.end);
								},3000);
							});
						}
						else
							slide.addVideoSlide(description.data.videoID, (description.data.end-description.data.start), description.data.start, description.data.end);
						
						break;
					  /*case "GoogleMapSlide":
						break;					*/
				  }
				  
			  });
		  }
		  else{
			//Create all generators depending on the type of the topic
			logger.log("no slide description found, going to default");
			
			switch (this.topic.type) {
			case "http://dbpedia.org/ontology/PopulatedPlace":
				this.addGenerator(new GoogleImageSlideGenerator(this.topic), false);
				this.addGenerator(new YouTubeSlideGenerator(this.topic), false);
				this.addGenerator(new GoogleMapsSlideGenerator(this.topic), false);
				break;
			default:
				this.addGenerator(new GoogleImageSlideGenerator(this.topic), false);
				this.addGenerator(new YouTubeSlideGenerator(this.topic), false);
				break;
			}
		  }

          var tts = new TTSService();
          tts.once('speechReady', function (event, data) {
            self.durationLeft = Math.floor(data.snd_time);
            //Add extra time because IE definitely needs a plugin, which takes time to embed
            if (navigator.userAgent.indexOf('MSIE') !=-1)
				self.durationLeft +=5000;
				
			self.hash_object.audio_time = self.durationLeft;
				
            self.audioURL = data.snd_url;
            logger.log('Received speech for topic', self.topic.label);
            self.ready=true;
            // When speech is received, 'remind' the presenter that the slides are ready
            self.emit('newSlides');
          });
          
          //Fallback if speech fails is to simply make the slide play 5 seconds of silence...at least there will be pictures
			tts.once('speechError', function(event, data){
				self.durationLeft = 5000;
				self.hash_object.audio_time = self.durationLeft;
				
				self.audioURL = null;
				logger.log('Failed to receive speech for topic', self.topic.label);
				self.ready=true;
				// When speech is received, 'remind' the presenter that the slides are ready
				self.emit('newSlides');
			});
          
          logger.log('Getting speech for topic', this.topic.label);
          tts.getSpeech(this.hash_object.audio_text, 'en_GB');

          this.inited = true;
        },
        
        next: function () {
          var slide;

          if (this.first) {
            // make sure first slide is always a titleslide
            slide = this.firstSlide.next();
			slide.audioURL = this.audioURL;

            // prepare other generators
            this.generators.forEach(function (g) { g.prepare(); });

            this.first = false;

            logger.log('Added first slide on ', this.topic.label);

          }
          else {
            slide = this.slides.shift();

            // shorten the slide if it would take too long
            if (slide.duration > this.durationLeft)
              slide.duration = Math.min(slide.duration, this.durationLeft + 1000);
            // if no more slides are left, this one is allotted the remaining duration
            else if (this.generators.length <= 1 && !this.hasNext())
              slide.duration = this.durationLeft;
          }

          this.durationLeft -= slide.duration;
          logger.log('New slide: duration ', slide.duration, 'ms,', this.durationLeft, 'ms left');

          return slide;
        },
        
        resendSpeech: function(text){
			if (this.hash_object.audio_text==text){
				return;
			}
			
			this.ready=false;
			var self = this,
				tts = new TTSService();
			tts.once('speechReady', function (event, data) {
				self.durationLeft = Math.floor(data.snd_time);
				//Add extra time because IE definitely needs a plugin, which takes time to embed
				if (navigator.userAgent.indexOf('MSIE') !=-1)
					self.durationLeft +=5000;
					
				self.hash_object.audio_time = self.durationLeft;
				
				self.audioURL = data.snd_url;
				logger.log('Received speech for topic', self.topic.label);
				self.ready=true;
				// When speech is received, 'remind' the presenter that the slides are ready
				self.emit('newSlides');
			});
			
			//Fallback if speech fails is to simply make the slide play 5 seconds of silence...at least there will be pictures
			tts.once('speechError', function(event, data){
				self.durationLeft = 5000;
				self.hash_object.audio_time = self.durationLeft;
				
				self.audioURL = null;
				logger.log('Failed to receive speech for topic', self.topic.label);
				self.ready=true;
				// When speech is received, 'remind' the presenter that the slides are ready
				self.emit('newSlides');
			});
			
			logger.log('Getting speech for topic', this.topic.label);
			tts.getSpeech(text, 'en_GB');	
			this.hash_object.audio_text=text;
		},
		
		updateHash: function(){
			var combinedInfo = [];
			var slide_count=0;
			var duration=this.durationLeft;
					
			for (var i = 0; i < this.generators.length; i++){
				slide_count+=this.generators[i].slides.length;
			}
			
			if (!this.hash_object.slide_description){
				// randomly pick a generator and select its next slide
				var generator;			
				for (var i=0; i<slide_count; i++){
					do {
						generator = this.generators[Math.floor(Math.random() * this.generators.length)];
					} while (!generator.hasNext())
					this.slides.push(generator.next());
				}
			}
			else{
				for (var i=0; i< this.generators.length; i++){
					while (this.generators[i].hasNext())
						this.slides.push(this.generators[i].next());
				}				
			}

			for (var i=0; i<slide_count; i++){
				try{
					combinedInfo.push(this.slides[i].slide_info);
					if (i==slide_count-1)
						this.slides[i].slide_info.data.duration = duration;
					else
						duration-=this.slides[i].slide_info.data.duration;
						

				}
				catch(e){
					logger.log(i, ' ', slide_count);
				}
			}
			this.hash_object.slide_description = combinedInfo;

		},
		
		prepare: function () {
          //this.curSlide = this.firstSlide;
          //this.curSlide.audioURL = this.audioURL;

          // prepare other generators
          this.generators.forEach(function (g) { g.prepare(); });

          //add all the slides for each generator
          for(var val in this.generatorsHash){
          	var s = [];
          	for(var i = 0; i < 3 && this.generatorsHash[val].hasNext() && 
          		this.generatorsHash[val].next !== undefined; i++){
          		s.push(this.generatorsHash[val].next());
          	}
          	this.slides[val] = s;
          }
          	
          logger.log('Added slides on ', this.topic.label);
        },
        
        currentSlide: function (){
			if (this.curSlide>=0)
				return this.slides[this.curSlide];
			else
				return this.firstSlide.demo();
		},
        
        nextSlide: function () {
        	this.curSlide++;
        },
        
        getSlides: function() {
        	return this.slides;
        },
        
        setCurSlide: function (slide) {
        	this.curSlide = slide;	
        },
        
        getTest: function () {
        	return this.testSlides;
        }
      });
    return FinalizedTopicSlideGenerator;
  });


