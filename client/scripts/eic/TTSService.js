/*!
* EIC TTSService
* Copyright 2012, Multimedia Lab - Ghent University - iMinds
* Licensed under GPL Version 3 license <http://www.gnu.org/licenses/gpl.html> .
*/

//FESTIVAL INDEPENDENT VERSION OF THIS CLASS
//
//
//


define(['lib/jquery', 'eic/Logger', 'lib/jvent', 'config/URLs', 'lib/base64_handler'],
  function ($, Logger, EventEmitter, urls) {
    "use strict";
    var logger = new Logger("TTSService");     

    function TTSService() {
      EventEmitter.call(this);
    }

    TTSService.prototype = {
      getSpeech: function (text, lang, callback) {
        var self = this;

        logger.log('Requesting audio URL ' + text);
        sendSpeech(0);
        
        
         function sendSpeech(attempt){
			 $.ajax({
				 url: urls.speech,
				 type: 'GET',
				 data: { req_text: text},
				 dataType: 'jsonp',
				 success: function (data) {					 
					 												
					 if (data.res === 'OK') {
						logger.log('Received audio URL', text + 'url:' + data.snd_url);
							
						if (callback)
							callback(data);
						
						self.emit('speechReady', data);
					 }
					 else {
						if (attempt==4){
							logger.log('Error receiving speech1', data);
							self.emit('speechError', data);
						}
						else{
							logger.log('Error with speech, new attempt: ' + attempt);
							sendSpeech(attempt+1);
						}
					 }
				 },
				 error: function (error) {
					if (attempt==4){
						logger.log('Error receiving speech2', error);
						self.emit('speechError', error);
					}
					else{
						logger.log('Error with speech, new attempt: ' + attempt);
						sendSpeech(attempt+1);
					}
				 }
			 });
		}
      }
    };

    return TTSService;
  });
