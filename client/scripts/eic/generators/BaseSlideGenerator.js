define(['lib/jquery', 'lib/jvent'],
function ($, EventEmitter) {
  "use strict";
  
  var defaultDuration = 1000;

  /** Generator that serves as a base for other generators. */
  function BaseSlideGenerator() {
    EventEmitter.call(this);
  }

  BaseSlideGenerator.prototype = {
    /** Initialize the generator. */
    init: function () {},
    
    /** Returns whether there any more. */
    hasNext: function () { return false; },

    /** Get the next slide. */
    next: function () { return null; },
    
    /** Prepare the upcoming slides if applicable (not guaranteed to be called). */
    prepare: function () { },
    
    /** Create a base slide witht the specified class, content, and duration. */
    createBaseSlide: function (cssClass, content, duration) {
      var slide = new EventEmitter();
      
      // Create slide element.
      slide.$element = $('<div>').addClass('slide')
                                 .addClass(cssClass)
                                 .append(content);

      // Set duration.
      slide.duration = duration;
      
      // Set start and stop functions.
      slide.start = $.proxy(slide, 'emit', 'started');
      slide.stop  = $.proxy(slide, 'emit', 'stopped');
      
      return slide;
    },
  };
  
  return BaseSlideGenerator;
});
