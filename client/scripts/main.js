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
    var path = {'hash':'h-3690378823082678040','source':{'name':'Ray Bradbury','uri':'http://dbpedia.org/resource/Ray_Bradbury'},'destination':{'name':'Blue Mink','uri':'http://dbpedia.org/resource/Blue_Mink'},'path':[{'type':'node','uri':'http://dbpedia.org/resource/Ray_Bradbury'},{'type':'link','inverse':true,'uri':'http://dbpedia.org/ontology/influencedBy'},{'type':'node','uri':'http://dbpedia.org/resource/George_Orwell'},{'type':'link','inverse':true,'uri':'http://dbpedia.org/ontology/influencedBy'},{'type':'node','uri':'http://dbpedia.org/resource/James_Joyce'},{'type':'link','inverse':true,'uri':'http://dbpedia.org/ontology/birthPlace'},{'type':'node','uri':'http://dbpedia.org/resource/Dublin'},{'type':'link','inverse':true,'uri':'http://dbpedia.org/ontology/isPartOf'},{'type':'node','uri':'http://dbpedia.org/resource/Leinster'},{'type':'link','inverse':true,'uri':'http://dbpedia.org/ontology/leaderName'},{'type':'node','uri':'http://dbpedia.org/resource/Fine_Gael'},{'type':'link','inverse':true,'uri':'http://dbpedia.org/ontology/colour'},{'type':'node','uri':'http://dbpedia.org/resource/Blue'},{'type':'link','inverse':true,'uri':'http://dbpedia.org/ontology/connotation'},{'type':'node','uri':'http://dbpedia.org/resource/Sky'},{'type':'link','inverse':true,'uri':'http://dbpedia.org/ontology/associatedBand'},{'type':'node','uri':'http://dbpedia.org/resource/Blue_Mink'}]};
    //console.log(path);
    var controller = new PresentationController2(path),
        view = new PiecesUI(controller);
        //controller.makeMovie();
    //controller.init();
    //view.init();
    view.initControls();
    
    controller.once('slide_generation_finished', function(){
		new SlideEditor(controller.generator, controller.path);
	});
  });
})(requirejs);

