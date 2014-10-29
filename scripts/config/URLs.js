define(function () {
  "use strict";
  var dirName = "/LODStories-1.0.0-SNAPSHOT";
  return {
    abstracts: dirName + "/descriptions?jsoncallback=?",
    festivalspeech: "http://lodstories.isi.edu/festival_service-1.0-SNAPSHOT/rest/audiotest/jsonfull/?jsoncallback=?",
	ranking: dirName + "/rankServlet?jsoncallback=?",
    singlepath: dirName + "/rest/path/single/?jsoncallback=?",
	hashRetrieve: dirName + "/retrieveHash?",
	hashStore:  dirName + "/saveHash?",
    jplayerSWF: "/scripts/swf"
  };
});
