define(function () {
  "use strict";

  return {
    autocompletion: "http://pathfinding.restdesc.org/prefixes",
    abstracts: "http://pathfinding.restdesc.org/descriptions",
    topics: "http://pathfinding.restdesc.org/subjects",
    festivalspeech: "http://speech.everythingisconnected.be/synthesizer/?jsoncallback=?",
    festivalcheck: "http://10.120.91.70:7001/festival_service/rest/audiotest/jsonfull/?jsoncallback=?",
    //festivalcheck: "http://localhost:7001/festival_service/rest/audiotest/jsonfull/?jsoncallback=?",
    //paths: "http://pathfinding.restdesc.org/paths",
    paths: "http://localhost:7001/festival_service/rest/path/sample/?jsoncallback=?",
    singlepath: "http://localhost:7001/festival_service/rest/path/single/?jsoncallback=?",
    jplayerSWF: "/scripts/swf"
  }
});
