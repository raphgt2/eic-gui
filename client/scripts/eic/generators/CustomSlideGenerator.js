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
    var logger = new Logger("CustomSlideGenerator");

    /*
    * CLEANUP
    **/

    function CustomSlideGenerator(topic, hash_object) {
      CompositeSlideGenerator.call(this);
	  
	  this.hash_object = hash_object;
      this.generators = [];
      this.topic = topic;
      this.first = true;
      this.durationLeft = 0;
      this.audioURL ='';
      this.ready=false;
      
      //stuff
      this.curSlide = null;
      this.slides = [];
    }

    $.extend(CustomSlideGenerator.prototype,
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
          logger.log('Getting speech for topic', this.topic.label);
          tts.getSpeech(this.hash_object.audio_text, 'en_GB');

          this.inited = true;
        },
        
        /*prepare: function () {
          this.curSlide = new TitleSlideGenerator(this.topic).next();
          this.curSlide.audioURL = this.audioURL;

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
        
        next: function () {
        	return this.curSlide;
        },
        
        getSlides: function() {
        	return this.slides;
        },
        
        setCurSlide: function (slide) {
        	this.curSlide = slide;	
        },
        */
        
        next: function () {
          var slide;

          if (this.first) {
            // make sure first slide is always a titleslide
            slide = new TitleSlideGenerator(this.topic).next();
            slide.audioURL = this.audioURL;

            // prepare other generators
            this.generators.forEach(function (g) { g.prepare(); });

            this.first = false;

            logger.log('Added first slide on ', this.topic.label);

          }
          else {
            /*// randomly pick a generator and select its next slide
            var generator;
            do {
              generator = this.generators[Math.floor(Math.random() * this.generators.length)];
            } while (!generator.hasNext());*/
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
			logger.log('Getting speech for topic', this.topic.label);
			tts.getSpeech(text, 'en_GB');	
			this.hash_object.audio_text=text;
		},
		
		updateHash: function(){
			var combinedInfo = [];
			var slide_count=0;
                       
			for (var i = 0; i < this.generators.length; i++){
				slide_count+=this.generators[i].slides.length;
				combinedInfo=combinedInfo.concat(this.generators[i].slide_info);
			}
			
			
			var generator;			
			for (var i=0; i<slide_count; i++){
				do {
					generator = this.generators[Math.floor(Math.random() * this.generators.length)];
				} while (!generator.hasNext())
				this.slides.push(generator.next());
			}
			
			this.hash_object.slide_description = combinedInfo;
		},
      });
    return CustomSlideGenerator;
  });


