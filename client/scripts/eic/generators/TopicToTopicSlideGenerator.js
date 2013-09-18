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
  'config/URLs',
  ],
  function ($, CompositeSlideGenerator, LoadingSlideGenerator, TopicSlideGenerator, ErrorSlideGenerator, Summarizer, urls) {
    "use strict";
    
    /*
    * CLEANUP
    **/

    var defaultDuration = 1000;

    function TopicToTopicSlideGenerator(startTopic, endTopic) {
      CompositeSlideGenerator.call(this);
      this.startTopic = startTopic;
      this.endTopic = endTopic;
      this.ready=false;
    }

    $.extend(TopicToTopicSlideGenerator.prototype,
      CompositeSlideGenerator.prototype,
      {
        init: function () {
          if (this.startTopic) {
            if (!this.initedStart) {
              CompositeSlideGenerator.prototype.init.call(this);
              this.addGenerator(this.loader = new LoadingSlideGenerator());
              this.initedStart = true;
            }

            if (this.endTopic && !this.initedEnd) {
              var self = this;
              $.ajax({
                type: "GET",
                url: urls.paths,
                dataType: "JSON",
                data: {
                  from: this.startTopic.uri,
                  to: this.endTopic.uri
                },
                error: function () {
                  self.addGenerator(new ErrorSlideGenerator('No path between ' + self.startTopic.label + ' and ' + self.endTopic.label + ' could be found.'));
                  self.loader.stopWaiting();
                },
                success: function (path) {
                  var summ = new Summarizer();
                  $(summ).one('generated', function (event, story) {
                    story.steps.forEach(function (step) {
                      self.addGenerator(new TopicSlideGenerator(step.topic, step.text));
                    });
                    
			        setTimeout(function(){						
						self.waitforReady(0,function(){		
							self.loader.stopWaiting();
							self.ready=true;
							self.emit('topic slides ready');									
						})
					},3000);   
                  });
                  summ.summarize(path);
                }
              });
              this.initedEnd = true;
            }
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
