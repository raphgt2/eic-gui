/*!
 * EIC PresentationController
 * Copyright 2012, Multimedia Lab - Ghent University - iMinds
 * Licensed under GPL Version 3 license <http://www.gnu.org/licenses/gpl.html> .
 */
define(['lib/jquery', 'eic/Logger', 'eic/FacebookConnector','eic/generators/LoadingSlideGenerator',
  'eic/generators/IntroductionSlideGenerator', 'eic/generators/OutroductionSlideGenerator', 'eic/generators/TopicToTopicSlideGenerator',
  'eic/generators/TopicToTopicSlideGenerator2', 'eic/generators/CompositeSlideGenerator',
  'eic/generators/ErrorSlideGenerator', 'eic/SlidePresenter', 'eic/TopicSelector', 'config/URLs'],
  function ($, Logger, FacebookConnector, LoadingSlideGenerator,
    IntroductionSlideGenerator, OutroductionSlideGenerator, TopicToTopicSlideGenerator,
    TopicToTopicSlideGenerator2, CompositeSlideGenerator,
    ErrorSlideGenerator, SlidePresenter, TopicSelector, urls) {
    "use strict";
    var logger = new Logger("PresentationController");

    function PresentationController(path, intro, outro) {
      this.path = path;
      this.intro = intro;
      this.outro = outro;
	  
	  this.topicToTopic;
    }

    /* Member functions */

    PresentationController.prototype = {
      init: function () {
        logger.log("Initializing");
      },

      // Starts the movie about the connection between the user and the topic.
      playMovie: function () {

        // Create the slides panel
        var $slides = $('<div>').addClass('slides'),
            $wrapper = $('<div>').addClass('slides-wrapper')
                                 .append($slides);

        // Hide the main panel and show the slides panel
		$('#screen').show();
        $('#screen').append($wrapper);
        $wrapper.hide().fadeIn($.proxy($slides.hide(), 'fadeIn', 1000));

        // Add introduction, body, and outroduction generators
        //logger.log("Creating slides from", this.startTopic.label, "to", this.endTopic.label);
        var generator = new CompositeSlideGenerator();
        
		this.startTopic=this.path.source;
		this.endTopic=this.path.destination;
		
		var loader = new LoadingSlideGenerator()
		generator.addGenerator(loader);
		
		if (this.intro)
			generator.addGenerator(new IntroductionSlideGenerator(this.startTopic, this.profile));
		
		this.topicToTopic = new TopicToTopicSlideGenerator(this.path, loader)
		generator.addGenerator(this.topicToTopic);
		logger.log(this.topicToTopic);
		
		if (this.outro)
			generator.addGenerator(new OutroductionSlideGenerator(this.startTopic, this.endTopic));

		//To prevent any slide-skipping, don't go into playback mode until all slides are at least done (waiting on topic slide audio)   
		/*if (this.topicToTopic.ready){
			logger.log("New hash: " + this.path);
			new SlidePresenter($slides, generator).start();
		}
		else{
			this.topicToTopic.once('topic slides ready', function(){
				logger.log("New hash: " + this.path);
				new SlidePresenter($slides, generator).start();				
			});
		}*/
		
		//Go straight to "playing" so that the loading slide shows
		new SlidePresenter($slides, generator).start();

    }};


    /* Properties */

    // The startTopic property also initializes the introduction,
    // so the movie can be buffered earlier and thus start faster.
    /*Object.defineProperty(PresentationController.prototype, "startTopic", {
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
