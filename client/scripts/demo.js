/*jshint browser: true*/
 
(function (requirejs) {
  "use strict";
 
  requirejs.config({
    baseUrl : 'scripts',
    shim: {
      'lib/jquery': {
        exports: 'jQuery'
      },
      'lib/jquery.ui.core': {
        deps: ['lib/jquery']
      },
      'lib/jquery.ui.widget': {
        deps: ['lib/jquery.ui.core']
      },
      'lib/jquery.ui.position': {
        deps: ['lib/jquery.ui.core']
      },
      'lib/jquery.ui.autocomplete': {
        deps: ['lib/jquery.ui.core', 'lib/jquery.ui.widget', 'lib/jquery.ui.position']
      },
      'lib/jvent': {
        exports: 'jvent'
      },
      'lib/jplayer.min': {
        deps: ['lib/jquery']
      },
      'lib/prefixfree.jquery': {
        deps: ['lib/prefixfree.min']
      },
	  'eic/pluginsniff':{
		exports: 'pluginsniff'
	  },
	  'lib/base64_handler':{
		exports: 'base64_handler'
	  }
    },
  });
 
  var scripts = ['lib/jquery',
    'eic/WAVPlayer',
    'eic/pluginsniff',
    'eic/SlidePresenter',
    'eic/FacebookConnector',
    'eic/TTSService',
    'eic/generators/BaseSlideGenerator',
    'eic/generators/IntroductionSlideGenerator',
    'eic/generators/CompositeSlideGenerator',
    'eic/generators/GoogleImageSlideGenerator',
    'eic/generators/TitleSlideGenerator',
    'eic/generators/TopicSlideGenerator',
    'eic/generators/FBProfilePhotosGenerator',
    'eic/generators/YouTubeSlideGenerator',
    'eic/generators/IntroductionSlideGenerator'];
 
  requirejs(scripts, function (jQuery) {
    var scriptHolder = {};
    for (var i = 0; i < scripts.length; i++)
      scriptHolder[scripts[i].replace(/^(\w+\/)*/, '')] = arguments[i];
    if (window.startApplication)
      window.startApplication(jQuery, scriptHolder);
  });
})(window.requirejs);
