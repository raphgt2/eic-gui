(function (requirejs) {
  "use strict";

  requirejs.config({
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
	  },	  
    },
  });

  require(['eic/PresentationController', 'eic/PresentationController2','eic/PiecesUI', 'eic/SlideEditor'], function (PresentationController, PresentationController2, PiecesUI, SlideEditor) {
    var path = {
    "hash": "h-3690378823082678040",
    "source": {
        "name": "Hillary Rodham Clinton",
        "uri": "http://dbpedia.org/resource/Hillary_Rodham_Clinton"
    },
    "destination": {
        "name": "War of 1812",
        "uri": "http://dbpedia.org/resource/War_of_1812"
    },
    "path": [
        {
            "type": "node",
            "name": "Hillary Rodham Clinton",
            "uri": "http://dbpedia.org/resource/Hillary_Rodham_Clinton",
            'slide_description':[	{	
				'type':'GoogleImageSlide',	
				'data':{
					'duration':'2000',	
					'url':'http://www.shootuporputup.co.uk/wp-content/uploads/2011/07/number1.png'
				}},{
				'type':'YouTubeSlide',
				'duration':'5000',
				'data':{
					'videoID':'bTvr_2v-0HI',
					'start':'10000',
					'end':'13000'
				}},{	
				'type':'GoogleImageSlide',	
				'data':{
					'duration':'3000',
					'url':'http://cast.thirdage.com/files/originals/number%202.jpg'
				}},]},
        {
            "type": "link",
            "inverse": true,
            "uri": "http://dbpedia.org/ontology/deputy"
        },
        {
            "type": "node",
            "name": "William Joseph Burns",
            "uri": "http://dbpedia.org/resource/William_Joseph_Burns"
        },
        {
            "type": "link",
            "inverse": true,
            "uri": "http://dbpedia.org/ontology/birthPlace"
        },
        {
            "type": "node",
            "name": "Fort Bragg",
            "uri": "http://dbpedia.org/resource/Fort_Bragg"
        },
        {
            "type": "link",
            "inverse": true,
            "uri": "http://dbpedia.org/ontology/location"
        },
        {
            "type": "node",
            "name": "Harnett County, North Carolina",
            "uri": "http://dbpedia.org/resource/Harnett_County,_North_Carolina"
        },
        {
            "type": "link",
            "inverse": true,
            "uri": "http://dbpedia.org/ontology/place"
        },
        {
            "type": "node",
            "name": "Battle of Averasborough",
            "uri": "http://dbpedia.org/resource/Battle_of_Averasborough"
        },
        {
            "type": "link",
            "inverse": true,
            "uri": "http://dbpedia.org/ontology/isPartOfMilitaryConflict"
        },
        {
            "type": "node",
            "name": "American Civil War",
            "uri": "http://dbpedia.org/resource/American_Civil_War"
        },
        {
            "type": "link",
            "inverse": true,
            "uri": "http://dbpedia.org/ontology/commander"
        },
        {
            "type": "node",
            "name": "Edwin M. Stanton",
            "uri": "http://dbpedia.org/resource/Edwin_M._Stanton"
        },
        {
            "type": "link",
            "inverse": true,
            "uri": "http://dbpedia.org/ontology/president"
        },
        {
            "type": "node",
            "name": "James Buchanan",
            "uri": "http://dbpedia.org/resource/James_Buchanan"
        },
        {
            "type": "link",
            "inverse": true,
            "uri": "http://dbpedia.org/ontology/battle"
        },
        {
            "type": "node",
            "name": "War of 1812",
            "uri": "http://dbpedia.org/resource/War_of_1812"
        }
    ]
};

//console.log(path);
    var controller = new PresentationController2(path),
        view = new PiecesUI(controller);
        //controller.makeMovie();
    //controller.init();
    //view.init();
    view.initControls();
    
    controller.once('slide_generation_finished', function(){
		var player = new PresentationController(controller.path, true, true);
		player.playMovie();
	});
  });
})(requirejs);

