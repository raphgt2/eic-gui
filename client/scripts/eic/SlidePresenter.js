/*!
 * EIC SlidePresenter
 * Copyright 2012, Multimedia Lab - Ghent University - iMinds
 * Licensed under GPL Version 3 license <http://www.gnu.org/licenses/gpl.html> .
 */
define(['lib/jquery', 'eic/Logger', 'eic/WAVPlayer'], function ($, Logger, WAVPlayer) {
  "use strict";
  var logger = new Logger("SlidePresenter");
 
  // Init jPlayer
/*  var $audioContainer = $('<div>').addClass('audio').appendTo($('body'));
  $audioContainer.jPlayer({
    errorAlerts: true,
    swfPath: urls.jplayerSWF,
    supplied: "mp3",
    wmode: "window"
  });
*/
 
var audioContainer = new WAVPlayer();
  /*
   * CLEANUP
   **/
 
  function SlidePresenter(container, generator) {
    this.$container = $(container);
    this.generator = generator;
  }
 
  SlidePresenter.prototype = {
    start: function () {
      if (this.started)
        return;
 
      this.generator.init();
 
      var self = this;
      var currentSlide, nextSlide;
 
      function loadNext() {
        // if slides are available, load them
        if (self.generator.hasNext()) {
          logger.log('Loading new slide');
          nextSlide = self.generator.next();
 
          // If the next has audio, but playback is still going on
          if (nextSlide.audioURL && audioContainer.isPlaying())
            // Wait until playback has ended to show the next slide
            audioContainer.once('wav_ended', showNext);
          else
            // The next slide can start, since no audio will overlap
            showNext();
        }
        // else, wait for new slides to arrive
        else {
          self.generator.once('newSlides', loadNext);
          logger.log('No pending slides');
        }
      }
 
      function showNext() {
        logger.log('Showing next slide');
        // remove children that are still transitioning out
        self.$container.children('.transition-out').remove();
        // start the transition of other children
        var children = self.$container.children();
        children.addClass('transition-out');
        window.setTimeout(function () {
          children.remove();
        }, 1000);
 
        // start next slide
        self.$container.prepend(nextSlide.$element);
        nextSlide.start();
 
        // stop the previous slide
        if (currentSlide)
          currentSlide.stop();
        currentSlide = nextSlide;
 
        // if slide contains a description, send it to TTS service
        if (currentSlide.audioURL) {
          logger.log("Audio found in slide", currentSlide.audioURL);
          audioContainer.addTrack(currentSlide.audioURL,true);
          logger.log("Playing", currentSlide.audioURL);
        }
        if (nextSlide.duration)
          window.setTimeout(loadNext, nextSlide.duration);
      }
      loadNext();
 
      this.started = true;
    }
  };
 
  return SlidePresenter;
});
