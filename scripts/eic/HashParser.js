define([], function () {
	//Dummy class whose sole purpose is to escape and unescape hash objects for mysql-appropriate strings...doesn't need to be instantiated to work
	function HashParser() {
	}
	
	HashParser.prototype = {
		escapeString: function(str){			
			str = str.replace(/\\/g,"\\\\");
			str = str.replace(/\0/g, "\\0");
			str = str.replace(/\n/g, "\\n");
			str = str.replace(/\r/g, "\\r");
			str = str.replace(/'/g, "\\'");
			str = str.replace(/"/g, '\\"');
			str = str.replace(/\x1a/g, "\\Z");
			
			return str;
		},
		unescapeString: function(str){
            str = str.replace(/\\\\/g,"\\");
            str = str.replace(/\\0/g, "\0");
            str = str.replace(/\\n/g, "\n");
            str = str.replace(/\\r/g, "\r");
            str = str.replace(/\\'/g, "'");
            str = str.replace(/\\"/g, '"');
            str = str.replace(/\\Z/g, "\x1a");

            return str;
        }
	};
	return HashParser;
});