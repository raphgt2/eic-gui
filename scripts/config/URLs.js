define(function () {
  "use strict";
  var dirName = "/LODStories";
  return {
    abstracts: dirName + "/descriptions?jsoncallback=?",
    festivalspeech: "http://lodstories.isi.edu/festival_service-1.0-SNAPSHOT/rest/audiotest/jsonfull/?jsoncallback=?",
	ranking: dirName + "/rankServlet?jsoncallback=?",
    singlepath: dirName + "/rest/path/single/?jsoncallback=?",
    jplayerSWF: "/scripts/swf"
  };
});
