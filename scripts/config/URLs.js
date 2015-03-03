define(function () {
  "use strict";
  //var dirName = "/LODStories-1.0.0-SNAPSHOT";
  var dirName = window.location.pathname.slice(0,window.location.pathname.slice(1).indexOf('/')+1);
  return {
    abstracts: dirName + "/descriptions?jsoncallback=?",
    festivalspeech: "http://ec2-54-69-252-89.us-west-2.compute.amazonaws.com/festival_service-1.0-SNAPSHOT/rest/audiotest/jsonfull/?jsoncallback=?",
	ranking: dirName + "/rankServlet?jsoncallback=?",
    singlepath: dirName + "/rest/path/single/?jsoncallback=?",
	hashRetrieve: dirName + "/retrieveHash?",
	hashStore:  dirName + "/saveHash?",
	hashFilter: dirName + "/filterHash?",
	hashRate: dirName + "/rateHash?",
    jplayerSWF: "/scripts/swf",
	
	//main html pages
	main: dirName+"/html/linkeddataeduapp.html",
	demo: dirName+"/html/lodstories_demo.html",
	videos: dirName+"/html/lodstories_videos.html",
	single: dirName+"/html/SingleRelationshpDemo.html"
  };
});
