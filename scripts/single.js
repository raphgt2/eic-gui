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

  require(['eic/PresentationController', 'eic/PiecesUI', 'config/URLs'], function (PresentationController, PiecesUI, urls) {
		$('#frame').show();
		
		$(document).ready(function(){
			$('#screenWrap').html("<div id='screen' style =' height:465px; width: 758px'> </div>");
			$.ajax({
                type: "GET",
                url: urls.singlepath,
                dataType: "json",
                error: function (error) {
                  self.addGenerator(new ErrorSlideGenerator('No path between found.'));
                  self.loader.stopWaiting();
                },
                success: function (path) {
                	document.getElementById('subject').innerHTML = path.source.name;
                	document.getElementById('object').innerHTML = path.destination.name;
                	var controller = new PresentationController(path, false, false);
					controller.playMovie();
                }
           });         
		});

					
        $("#playButton").click(function(){
			$('#ytholder').html('');
			$('#screenWrap').html("<div id='screen' style =' height:465px; width: 758px'> </div>");
			validate(5);
			//answer[0] = 0; answer[1] = 0; answer[2] = 0; answer[3] = 0;
			//var mongoClient = new MongoClient(new Server('localhost',27107,{'native_parser':true}));
			//var db = mongoClient.db('itunes');
			
			//app.get('/start', function (req, res) {    
			//    db.collection('collectionName').insert({req.data}, function (err, doc) {
			           //rest of code 
			//    });    
			//});
			
			 $.ajax({
                type: "GET",
                url: urls.singlepath,
                dataType: "json",
				success: function(path){
					if (!path.hash){
						alert("Internal server error");
						console.log(path);
					}
					else{
						document.getElementById('subject').innerHTML = path.source.name;
	                	document.getElementById('object').innerHTML = path.destination.name;
						var controller = new PresentationController(path, false, false);
						var view = new PiecesUI(controller);
						view.initControls();
					}
				},
				error: function(error){
					alert("error" + error.status);
					console.log(error);
				}
           });                
		 });
  });
  
})(requirejs);

