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
    singlepath: "http://localhost:7001/festival_service/rest/path/single/?jsoncallback=?",
    jplayerSWF: "/scripts/swf"
  }
});
