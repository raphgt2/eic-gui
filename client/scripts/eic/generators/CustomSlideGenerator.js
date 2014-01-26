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

    function CustomSlideGenerator(topic, hash_object, slides) {
      CompositeSlideGenerator.call(this);

      this.hash_object = hash_object;
      this.generators = [];
      this.topic = topic;
      this.durationLeft = 0;
      this.audioURL ='';
      this.audio = true;
      
      this.generatorsHash = {}; //take care of this
      
      //stuff
      this.curSlide = null;
      this.slides = {};
    }

    $.extend(CustomSlideGenerator.prototype,
             CompositeSlideGenerator.prototype,
      {
        /** Checks whether at least one child generator has a next slide. */
        hasNext: function () {
          if(this.curSlide != null) return true;
          else return false;
        },

        /** Initialize all child generators. */
        init: function () {
          if (this.inited)
            return;

          //Create all generators depending on the type of the topic
          switch (this.topic.type) {
          case "http://dbpedia.org/ontology/PopulatedPlace":
            this.addCutomGenerator(new GoogleImageSlideGenerator(this.topic), false, "img");
            this.addCustomGenerator(new YouTubeSlideGenerator(this.topic), false, "vid");
            this.addCustomGenerator(new GoogleMapsSlideGenerator(this.topic), false, "img");
            break;
          default:
            this.addCustomGenerator(new GoogleImageSlideGenerator(this.topic), false, "img");
            this.addCustomGenerator(new YouTubeSlideGenerator(this.topic), false, "vid");
            break;
          }

          var tts = new TTSService();
          var self = this;
          tts.once('speechReady', function (event, data) {
            self.durationLeft = Math.floor(data.snd_time);
            //Add extra time because IE definitely needs a plugin, which takes time to embed
            if (navigator.userAgent.indexOf('MSIE') !=-1)
				self.durationLeft +=5000;
				
			self.hash_object.audio_time = self.durationLeft;
				
            self.audioURL = data.snd_url;
            logger.log('Received speech for topic', self.topic.label);
            self.ready=true;
            self.audio=true;
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
				self.audio=false;
				// When speech is received, 'remind' the presenter that the slides are ready
				self.emit('newSlides');
			});
			
          logger.log('Getting speech for topic', this.topic.label);
          tts.getSpeech(this.hash_object.audio_text, 'en_GB');

          this.inited = true;
        },
        
        addCustomGenerator: function (generator, suppressInit, type) {        	
        	// initialize the generator and add it to the list
      		if (!suppressInit) generator.init();
      		this.generators.push(generator);
      		switch (type) {
      			case "img":
      				this.generatorsHash["img"] = generator;
      			case "vid":
      				this.generatorsHash["vid"] = generator;
      		}
      		// signal the arrival of new slides
      		generator.on('newSlides', this.emitNewSlidesEvent);
      		if (generator.hasNext())
        		this.emitNewSlidesEvent();
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
				self.audio=true;
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
				self.audio = false;
				// When speech is received, 'remind' the presenter that the slides are ready
				self.emit('newSlides');
			});
			
			logger.log('Getting speech for topic', this.topic.label);
			tts.getSpeech(text, 'en_GB');	
			this.hash_object.audio_text=text;
		},
        
        prepare: function () {
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
        
        getTest: function () {
        	return this.testSlides;
        }
      });
    return CustomSlideGenerator;
  });


