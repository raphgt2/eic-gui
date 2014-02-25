define(function () {
  "use strict";

  return {
    autocompletion: "http://pathfinding.restdesc.org/prefixes",
    abstracts: "http://pathfinding.restdesc.org/descriptions",
    topics: "http://pathfinding.restdesc.org/subjects",
    speech: "http://speech.everythingisconnected.be/synthesizer/?jsoncallback=?",
    festivalspeech: "http://localhost:7001/festival_service/rest/audiotest/jsonfull/?jsoncallback=?",
    //paths: "http://pathfinding.restdesc.org/paths",
    paths: "http://localhost:7001/festival_service/rest/path/sample/?jsoncallback=?",
    //singlepath: "http://127.0.0.1:8080/festival_service-1.0-SNAPSHOT/rest/path/single",
	singlepath: "http://127.0.0.1:7001/festival_service/rest/path/sample",
    jplayerSWF: "/scripts/swf"
  }
});
