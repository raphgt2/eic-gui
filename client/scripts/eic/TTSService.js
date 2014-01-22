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
      this.finished = false;
      this.attempt = 0;
    }

    TTSService.prototype = {
      getSpeech: function (text, lang, callback) {
        var self = this;

        logger.log('Requesting audio URL ' + text);
        sendSpeech();
        
         function sendSpeech(){
			if (self.finished)
				return;
			
			if (self.attempt==4){
				self.finished = true;
				logger.log('Error receiving speech (timed out)', text);
				self.emit('speechError', text);
				return;
			}
			 
			setTimeout(function(){	
				if (!self.finished){
					self.attempt++;
					sendSpeech(self.attempt);
				}
			},3000);
			 
			 $.ajax({
				 url: urls.speech,
				 type: 'GET',
				 data: { req_text: text},
				 dataType: 'jsonp',
				 success: function (data) {					 
					 												
					 if (data.res === 'OK') {
						self.finished = true;
						logger.log('Received audio URL', text + 'url:' + data.snd_url);
							
						if (callback)
							callback(data);
						
						self.emit('speechReady', data);
					 }
					 else {
						if (self.attempt==4){
							logger.log('Error receiving speech1', data);
							self.emit('speechError', data);
						}
						else{
							logger.log('Error with speech, new attempt: ' + self.attempt);
							self.attempt++;
							sendSpeech();
						}
					 }
				 },
				 error: function (error) {
					if (attempt==4){
						logger.log('Error receiving speech2', error);
						self.emit('speechError', error);
					}
					else{
						logger.log('Error with speech2, new attempt: ' + self.attempt);
							self.attempt++;
							sendSpeech();
					}
				 }
			 });
		}
      }
    };

    return TTSService;
  });
