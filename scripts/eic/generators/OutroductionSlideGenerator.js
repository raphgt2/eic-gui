/*!
 * EIC OutroductionSlideGenerator
 * Copyright 2012, Multimedia Lab - Ghent University - iMinds
 * Licensed under GPL Version 3 license <http://www.gnu.org/licenses/gpl.html> .
 */
define(['lib/jquery', 'eic/generators/BaseSlideGenerator', 'eic/TTSService', 'lib/jvent'],
function ($, BaseSlideGenerator, TTSService, EventEmitter) {
  "use strict";

	var tts = new TTSService();
  /*
   * CLEANUP
   * Add Path
   **/

  /** Generator that creates outroductory slides */
  function OutroductionSlideGenerator(startTopic, endTopic, duration) {
    if (!startTopic)
      throw "The OutroductionSlideGenerator has no starttopic";

    BaseSlideGenerator.call(this);

    this.startTopic = startTopic;
    this.hash_object = endTopic;		//used to be known as 'endTopic'
    this.duration = duration || 1000;
    this.ready=false;
  }

  $.extend(OutroductionSlideGenerator.prototype,
           BaseSlideGenerator.prototype,
  {
      init: function () {
        if (!this.inited) {
          var self = this;
          self.createSpeech();
          this.inited = true;
        }
      },

      /** Checks whether the outro slide has been shown. */
      hasNext: function () {
        return this.done !== true;
      },

      /** Advances to the outro slide. */
      next: function () {
        if (!this.hasNext())
          return;

        var self = this,
            $outro = $('<h1>').text("The End."),
            slide = this.createBaseSlide('outro', $outro, this.duration);
        slide.once('started', function () {
          setTimeout(function () {
           addNavigation($outro.parent());
          }, 500);
        });
        slide.audioURL = this.audioURL;
		slide.audio_text = this.hash_object.audio_text;

        this.done = true;

        return slide;
      },

      createSpeech: function () {
        var self = this,
			 tts = new TTSService();

        var text = "  The end!"

		self.hash_object.audio_text=text;
        tts.getSpeech(text, 'en_GB', function (response) {
          self.audioURL = response.snd_url;
          self.ready=true;
          self.emit('newSlides');
        });
      },

      resendSpeech: function(text) {
		var self = this,
			 tts = new TTSService();
		self.hash_object.audio_text=text;
		this.ready=false;
        tts.getSpeech(text, 'en_GB', function (response) {
			self.audioURL = response.snd_url;
			self.ready=true;
			self.emit('newSlides');
		});
	  }
    });

  function addNavigation($container) {
    var $nav = $('<div />')
    .addClass('navigation')
    .appendTo($container);

     $('<span>')
        .addClass('button')
        .appendTo($nav)
        .click(function () {
          window.location = "/LODStories-1.0.0-SNAPSHOT/html/lodstories_demo.html";
        })
   .text('Start over');

    $('<span>')
    .addClass('button')
    .appendTo($nav)
    .click(function () {
     //window.location.reload();
     $('#screenWrap').hide();
     $('#editor').show();
    })
    .text('Back to editor');
	
	$('<span>')
    .addClass('button')
    .appendTo($nav)
    .click(function () {
		$('#play-button').click();
    })
    .text('Replay');
  }

  function addShares($container, self) {
    var $buttons = $('<div>', {'class': 'share'});
    $container.append($('<h2>').text('Share:'), $buttons);
  }

  return OutroductionSlideGenerator;
});
