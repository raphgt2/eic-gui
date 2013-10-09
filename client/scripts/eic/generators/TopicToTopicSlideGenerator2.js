/*!
 * EIC TopicToTopicSlideGenerator
 * Copyright 2012, Multimedia Lab - Ghent University - iMinds
 * Licensed under GPL Version 3 license <http://www.gnu.org/licenses/gpl.html> .
 */
define(['lib/jquery',
  'eic/generators/CompositeSlideGenerator',
  'eic/generators/LoadingSlideGenerator',
  'eic/generators/TopicSlideGenerator',
  'eic/generators/ErrorSlideGenerator',
  'eic/Summarizer',
  'eic/Logger'
  ],
  function ($, CompositeSlideGenerator, LoadingSlideGenerator, TopicSlideGenerator, ErrorSlideGenerator, Summarizer, Logger) {
    "use strict";
    
    var logger = new Logger("TopicToTopicSlideGenerator2");
    /*
    * CLEANUP
    **/

    var defaultDuration = 1000;

    function TopicToTopicSlideGenerator(path) {
      CompositeSlideGenerator.call(this);
      this.ready=false;
      this.path=path;
    }

    $.extend(TopicToTopicSlideGenerator.prototype,
      CompositeSlideGenerator.prototype,
      {
        init: function () {
            if (!this.initedStart) {
              CompositeSlideGenerator.prototype.init.call(this);
              this.addGenerator(this.loader = new LoadingSlideGenerator());
              this.initedStart = true;
            }

            if (!this.initedEnd) {
              var self = this;
              
              var summ = new Summarizer();
                  $(summ).one('generated', function (event, story) {
                    story.steps.forEach(function (step) {
                      self.addGenerator(new TopicSlideGenerator(step.topic, step.defaultText, step.text));
                    });
                    
			        setTimeout(function(){						
						self.waitforReady(0,function(){		
							self.loader.stopWaiting();
							self.ready=true;
							self.emit('topic slides ready');									
						})
					},3000);   
                  });
              summ.summarize(this.path);            
              
              this.initedEnd = true;
            }
        },
    
        waitforReady: function(i,callback){
			var self=this;
			if (i>this.generators.length){
				i++;
				callback();
				return;
			}			
			if (!this.generators[i])	{ //Check the slideGenerator exists
				i++;
				this.waitforReady(i,callback);
			}
			else if (!this.generators[i].topic)	{ //Check that this is a TopicSlideGenerator exists
				i++;
				this.waitforReady(i,callback);
			}
			else if (this.generators[i].ready){
				i++;
				this.waitforReady(i,callback);
			}
			else{
				this.generators[i].once('newSlides', function(){
					i++; 
					self.waitforReady(i,callback);
				});
			}
		},
        
        setStartTopic: function (startTopic) {
          if (this.startTopic)
            throw "startTopic already set";
          this.startTopic = startTopic;
          this.init();
        },
    
        setEndTopic: function (endTopic) {
          if (this.endTopic)
            throw "endTopic already set";
          this.endTopic = endTopic;
          this.init();
        }
      });
  
  
    return TopicToTopicSlideGenerator;
  });
