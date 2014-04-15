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
    this.description="";
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
            $outro = $('<h1>').text("Fin."),
            slide = this.createBaseSlide('outro', $outro, this.duration);
        slide.once('started', function () {
          setTimeout(function () {
           addNavigation($outro.parent());
          }, 500);
        });
        slide.audioURL = this.audioURL;

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
		this.description=text;
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
          window.location = "http://lodstories.isi.edu/LODStories-1.0.0-SNAPSHOT/html/lodstories_demo.html";
        })
   .text('Start over');

    $('<span>')
    .addClass('button')
    .appendTo($nav)
    .click(function () {
     //window.location.reload();
     $('#screen').remove();
     $('#editor').show();
    })
    .text('Back to editor');
  }

  function addShares($container, self) {
    var $buttons = $('<div>', {'class': 'share'});
    $container.append($('<h2>').text('Share:'), $buttons);

    /** Add Facebook button */
//    var $fblike = $('<div>').addClass("fb-like")
//                            .attr('data-href', "OUR URL")
//                            .attr('data-send', " false")
//                            .attr('data-layout', "button_count")
//                            .attr('data-width', "112")
//                            .attr('data-show-faces', "true");
//    $buttons.append($('<div>', { 'class': 'facebook' }).append($fblike));
//    // Render the button (Facebook API is already loaded)
//    window.FB.XFBML.parse();

    /** Add Tweet button */
    var tweetmessage = (self.startTopic.first_name ? 'I am ' : self.startTopic.name + ' is ') + 'connected to ' + self.hash_object.name + ' through #LinkedData! Find out how you are #connected at http://everythingisconnected.be. #iswc2012';

    var $tweet = $('<a>')
    .attr('href', 'https://twitter.com/share?text=' + tweetmessage)
                         .attr('data-lang', "en")
                         .addClass("twitter-share-button")
                         .text("Tweet")
                         .attr('url', "OUR URL");
    $buttons.append($('<div>', {'class': 'twitter'}).append($tweet));
    // Render the button
    $.getScript("https://platform.twitter.com/widgets.js");

    /** Add Google Plus button */
    // Make sure the metadata is right
//    $('html').attr('itemscope', "")
//             .attr('itemtype', "http://schema.org/Demo");
//    $('head').append($('<meta>').attr('itemprop', "name")
//                                .attr('content', "Everything is connected"));
//    $('head').append($('<meta>').attr('itemprop', "name")
//                                .attr('content', "A demonstrator to show how everything is connected."));
//
//    var $gplus = $('<div>').addClass("g-plusone")
//                           .attr('data-size', "medium")
//                           .attr('data-href', "OUR URL");
//    $buttons.append($('<div>', { 'class': 'googleplus' }).append($gplus));
//    // Render the button
//    $.getScript("https://apis.google.com/js/plusone.js");
  }

  return OutroductionSlideGenerator;
});
