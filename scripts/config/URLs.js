define(function () {
  "use strict";
  var dirName = "/LODStories";
  return {
    abstracts: dirName + "/descriptions?jsoncallback=?",
    festivalspeech: "http://ec2-54-69-252-89.us-west-2.compute.amazonaws.com/festival_service-1.0-SNAPSHOT/rest/audiotest/jsonfull/?jsoncallback=?",
	ranking: dirName + "/rankServlet?jsoncallback=?",
    singlepath: dirName + "/rest/path/single/?jsoncallback=?",
	hashRetrieve: dirName + "/retrieveHash?",
	hashStore:  dirName + "/saveHash?",
    jplayerSWF: "/scripts/swf"
  };
});
