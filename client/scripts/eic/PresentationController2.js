/*!
 * EIC PresentationController
 * Copyright 2012, Multimedia Lab - Ghent University - iMinds
 * Licensed under GPL Version 3 license <http://www.gnu.org/licenses/gpl.html> .
 */
define(['lib/jquery', 'eic/Logger', 'eic/FacebookConnector',
  'eic/generators/IntroductionSlideGenerator', 'eic/generators/OutroductionSlideGenerator', 'eic/generators/TopicToTopicSlideGenerator',
  'eic/generators/TopicToTopicSlideGenerator2', 'eic/generators/CompositeSlideGenerator',
  'eic/generators/ErrorSlideGenerator', 'eic/SlidePresenter', 'eic/TopicSelector', 'eic/SlideEditor',  'config/URLs','lib/jvent'],
  function ($, Logger, FacebookConnector,
    IntroductionSlideGenerator, OutroductionSlideGenerator, TopicToTopicSlideGenerator,
    TopicToTopicSlideGenerator2, CompositeSlideGenerator,
    ErrorSlideGenerator, SlidePresenter, TopicSelector, SlideEditor, urls, EventEmitter) {
    "use strict";
    var logger = new Logger("PresentationController");

    function PresentationController(path) {
      this.facebookConnector = new FacebookConnector();
      this.topicSelector = new TopicSelector(this.facebookConnector);
      this.path = path;
      this.slides = {};
      this.generator;
      logger.log("Created PresentationController2");
    }

    /* Member functions */

    PresentationController.prototype = {
      init: function () {
        logger.log("Initializing");
      },

      // Lets the user connect with a Facebook account.
      connectToFacebook: function () {
        this.facebookConnector.connect();
      },

      // Starts the movie about the connection between the user and the topic.
      playMovie: function () {
        //if (!this.startTopic) throw "No start topic selected.";
        //if (!this.endTopic) throw "No end topic selected.";
        //if (!this.intro) throw "The introduction was not initialized";

        // Create the slides panel
        //var $slides = $('<div>').addClass('slides'),
        //    $wrapper = $('<div>').addClass('slides-wrapper')
        //                         .append($slides);

        // Hide the main panel and show the slides panel
        //$('#screen').append($wrapper);
        //$wrapper.hide().fadeIn($.proxy($slides.hide(), 'fadeIn', 1000));

        // Add introduction, body, and outroduction generators
        //logger.log("Creating slides from", this.startTopic.label, "to", this.endTopic.label);
        var self = this;
        this.generator = new CompositeSlideGenerator();
        
	   this.startTopic=this.path.source;
	   this.endTopic=this.path.destination;
				
	   this.generator.addGenerators([
			new IntroductionSlideGenerator(this.startTopic, this.profile),
			new TopicToTopicSlideGenerator2(this.path),
			new OutroductionSlideGenerator(this.profile || this.startTopic, this.endTopic)
		]);

		//To prevent any slide-skipping, don't go into editor mode until all slides are at least done (waiting on topic slide audio)   
		// I know that the second generator in the array is the one with topic slides...    
		if (this.generator.generators[1].ready){
			logger.log("New hash: " + this.path);
			new SlideEditor(self.generator, self.path);
		}
		else{
			this.generator.generators[1].once('topic slides ready', function(){logger.log("New hash: " + this.path); new SlideEditor(self.generator, self.path)});
		}

      }
    };

    /* Properties */

    // The startTopic property also initializes the introduction,
    // so the movie can be buffered earlier and thus start faster.
/*    Object.defineProperty(PresentationController.prototype, "startTopic", {
      get: function () { return this._startTopic; },
      set: function (startTopic) {
        logger.log("Start topic set to", startTopic.label);
        this._startTopic = startTopic;
        delete this.intro;

        // If the topic is an error, show the error slide
        if (startTopic instanceof Error)
          this.intro = new ErrorSlideGenerator(startTopic);
        // Otherwise, create an actual introduction slide
        else
          this.intro = new IntroductionSlideGenerator(startTopic, this.profile);
        // Initialize the intro right away, avoiding delay when starting the movie
        this.intro.init();
      }
    });
*/
    return PresentationController;
  });
