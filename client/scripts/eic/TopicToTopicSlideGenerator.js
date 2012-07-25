define(['lib/jquery', 'eic/CombinedSlideGenerator', 'eic/IntroductionSlideGenerator'],
function ($, CombinedSlideGenerator, IntroductionSlideGenerator) {
  "use strict";

  var defaultDuration = 1000;

  function TopicToTopicSlideGenerator(startTopic, endTopic) {
    CombinedSlideGenerator.call(this);
    this.startTopic = startTopic;
    this.endTopic = endTopic;
  }

  $.extend(TopicToTopicSlideGenerator.prototype,
           CombinedSlideGenerator.prototype,
  {
    init: function () {
      CombinedSlideGenerator.prototype.init.call(this);
      this.addGenerator(new IntroductionSlideGenerator());
    }
  });
  
  
  return TopicToTopicSlideGenerator;
});