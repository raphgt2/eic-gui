(function (requirejs) {
    "use strict";

    requirejs.config({
        shim: {
            'lib/jquery': {
                exports: 'jQuery'
            },
            'lib/d3': {
                exports: 'd3'
            },
            'lib/jqyerUI': {
                deps: ['lib/jquery__ui']
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
            'lib/jquery__ui': {
                deps: ['lib/jquery']
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

    require(['eic/PresentationController','eic/PiecesUI','eic/VideoExplorer','config/URLs'], function(PresentationController, PiecesUI, VideoExplorer, urls){

        var hashId = location.hash.slice(1);

        function unescapeString(str){
            str = str.replace(/\\\\/g,"\\");
            str = str.replace(/\\0/g, "\0");
            str = str.replace(/\\n/g, "\n");
            str = str.replace(/\\r/g, "\r");
            str = str.replace(/\\'/g, "'");
            str = str.replace(/\\"/g, '"');
            str = str.replace(/\\Z/g, "\x1a");

            return str;
        }

        $.ajax({
            url: urls.hashRetrieve,
            type: 'GET',
            data: {hashID: hashId},
            success: function (data) {
                var path = JSON.parse(unescapeString(data));
                path.hashID = hashId;

                $("#body").css("display", "block");

                var controller = new PresentationController(path, {generatorOptions: {videoOptions: {maxVideoCount: 0}}});
                var view = new PiecesUI(controller);
                view.initControls();
            },
            error: function(error){
                location.hash = "";
                $("#searchWindow").css("display", "inline");
				
				var video_explorer = new VideoExplorer();

                //var path_finder = new PathFinder();
            }
        });



    });

})(requirejs);