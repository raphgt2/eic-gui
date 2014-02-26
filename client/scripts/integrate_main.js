/*
* LODStory Main Javascript
* Copyright 2014, LOD Story Team - University of Southern California - Information Sciences Institute
* Licensed under 
*/





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
	  'lib/jquery__ui': {
		deps: ['lib/jquery']
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

        require(['eic/PresentationController', 'eic/PresentationController2','eic/PiecesUI','eic/SlideEditor'], function(PresentationController, PresentationController2, PiecesUI, SlideEditor){
                var jsonObject,view,controller;
           // $.getJSON("../data_json/hash_object_test_1.json", function(data){
                        
                        jsonObject = {
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
            "uri": "http://dbpedia.org/resource/Hillary_Rodham_Clinton"
        },
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
                        controller = new PresentationController2(jsonObject);
                        view = new PiecesUI(controller);
                        //controller.init();
                        console.log("Controller I ", controller);
                        view.initControls();
						console.log("Hash Object Output", jsonObject);
            // var editing = new EditingNodes();
            // console.log("Test Editing Nodes: ", editing);
            // editing.EnableUIanimation();
            // $("#lastStep").click(function(){
                    // editing.grabMovieNav();
            // });
            
            
            // view.init();
                        // console.log("Controller II", controller);
                        // console.log("View", view);
                        
                        
                controller.once("slide_generation_finished", function(){
					console.log("Controllers", controller);
					console.log("Hash Object Output", jsonObject);
					var editor = new SlideEditor(controller.generator, controller.path, controller, jsonObject);
					
					
					
					
						//editor.initElementCollection();
						//editor.EnableUIAnimation();
//	        	});

                        
                        
                        
                        //view = new PiecesUI(controller);
                        // var controller = new PresentationController(jsonObject);
                        // view = new PiecesUI(controller);
                        // controller.makeMovie();
                        // controller.init();
                        // view.init();
                        
                        
                 });
//                 
                // $("#generateVideoEditor").click(function(){
                        // console.log("controller", controller);
                        // console.log("Hash Object Output", jsonObject);
                // });
                        
            //var controller = new PresentationController(jsonObject);
              //  view = new PiecesUI(controller);
                //controller.makeMovie();
            //controller.init();
            //view.init();;;;
        });
 
})(requirejs);