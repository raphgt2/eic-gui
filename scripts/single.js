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


  require(['eic/PresentationController', 'eic/PiecesUI', 'config/URLs','eic/Summarizer'], function (PresentationController, PiecesUI, urls,Summarizer) {
		$('#frame').show();
		
		$(document).ready(function(){
			$('#screenWrap').html("<div id='screen' style =' height:465px; width: 758px'> </div>");
			console.log(urls.singlepath);
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
                	var relation = path.path[1].uri;
                	relation = relation.substr(relation.lastIndexOf("/")+1);
                	console.log(relation);
                	var inverse = path.path[1].inverse;
                	console.log(inverse);
                	var relationContent = Summarizer.prototype.generateRelationshipSentence(path.source.name, path.destination.name, relation, inverse);
                	
                	console.log(relationContent);
                	document.getElementById('relation').innerHTML = relationContent;
                	var controller = new PresentationController(path, false, false);
					var view = new PiecesUI(controller);
					view.initControls();
                }
           });
			function detectChange() {
				var checkboxes = $('#singleCheckbox input[type="checkbox"]:checked');
				if (checkboxes.length > 0) {
					$("#play-button").removeAttr("disabled");
				}
				else {
					$("#play-button").attr("disabled", "disabled");
				}
			}
			console.log("eaf");
			
			$("#checkbox1").change(detectChange);
			$("#checkbox2").change(detectChange);
			$("#checkbox3").change(detectChange);
			$("#checkbox4").change(detectChange);
			$("#checkbox5").change(detectChange);
			console.log($("#checkbox1"));
		});
		
		function validate(subject,relation,object){
			console.log("clicked ");
			var info = {};
			var values= "";
			$("input:checkbox[name=checkbox]:checked").each(function(index, element) {
				console.log(element);
				    values += element.value + ",";
		});
			info["key"] = values; console.log(values);
			info["triple"] = subject + "," + relation + "," + object;
			console.log(info["triple"]);
			document.getElementById("checkbox1").checked = false;
			document.getElementById("checkbox2").checked = false;
			document.getElementById("checkbox3").checked = false;
			document.getElementById("checkbox4").checked = false;
			document.getElementById("checkbox5").checked = false;
			$.ajax({
				url:"/LODStories/DemoPageServlet",
				type: "GET",
				data:info,
				dataType: "json",
				complete: function(xhr, textStatus) {
					console.log(xhr.responseText);
				},
				error: function(xhr, textStatus) {
					console.log(xhr.responseText);
				}
			});
		}

					
        $("#play-button").click(function(){
			$('#screenWrap').html("<div id='screen' style =' height:465px; width: 758px'> </div>");
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
						var relation = path.path[1].uri;
	                	relation = relation.substr(relation.lastIndexOf("/")+1);
	                	var inverse = path.path[1].inverse;
	                	var relationContent = Summarizer.prototype.generateRelationshipSentence(path.source.name, path.destination.name, relation, inverse);	                	
	                	document.getElementById('relation').innerHTML = relationContent;
						validate(path.source.name,relation,path.destination.name);
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
