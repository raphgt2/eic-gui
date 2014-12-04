/*!
 * EIC Summarizer
 * Copyright 2012, Multimedia Lab - Ghent University - iMinds
 * Licensed under GPL Version 3 license <http://www.gnu.org/licenses/gpl.html> .
 */
define(['lib/jquery', 'eic/Logger', 'config/URLs', 'eic/TTSService'], function ($, Logger, urls, TTSService) {
  //"use strict";
  var logger = new Logger("Summarizer");

  /*
   * CLEANUP
   **/

  function Summarizer() {
    this.result = {
      topics : [],
      links : []
    };
  }

  Summarizer.prototype = {
    summarize : function (data) {

      logger.log('Started summarization');

      var path = data.path;
      var self = this;

      /**
       * Generate the result formatted as the 'test' .json
       */
      function formatResult(result, vertices) {			
        for (var i = 1; i < result.topics.length; i++) {
          var glue = '';
          /*var sentence = result.links[i - 1][Math.round(Math.random())];
          switch (sentence.type) {
          case 'direct':
            glue = result.topics[i - 1].topic.label + sentence.value + result.topics[i].topic.label + '. ';
            break;
          case 'indirect':
            glue = result.topics[i].topic.label + sentence.value + result.topics[i - 1].topic.label + '. ';
            break;
          }*/
          glue = self.generateRelationshipSentence(result.topics[i - 1].topic.label, result.topics[i].topic.label, result.links[i - 1].value, result.links[i - 1].inverse) + '. ';
          
          result.topics[i].topic.previous =  result.topics[i - 1].topic.label;
          result.topics[i].hash_object.defaultText = glue + result.topics[i].hash_object.defaultText;
          
          if (!result.topics[i].hash_object.audio_text)
			result.topics[i].hash_object.audio_text=result.topics[i].hash_object.defaultText;
		  //updating the hash object
		  //vertices[i].audio_text = result.topics[i].text;
        }
        
        //to handle the first node
		if (!result.topics[0].hash_object.audio_text)
		  result.topics[0].hash_object.audio_text=result.topics[0].hash_object.defaultText;
		//vertices[0].audio_text = result.topics[0].text;
		
        return {
          steps: result.topics
        };
      }

      function retrieveTranscriptions(edges) {

        function retrieveTranscription(index, edge) {
          var  property = edge.uri.substr(edge.uri.lastIndexOf('/') + 1);
          logger.log('Extracting sentence for', edge.uri);
          //logger.log('edge test', edge);
          //Split the string with caps
          /*var parts = property.match(/([A-Z]?[^A-Z]*)/g).slice(0, -1);

          if (parts[0] === 'has' || parts[0] === 'is') {
            parts.shift();
          }

          var sentence = [
            {
              type: 'indirect',
              value: edge.inverse ? '\'s ' + decodeURIComponent(parts.join(' ').toLowerCase()) + ' is ' : '\'s the ' + decodeURIComponent(parts.join(' ').toLowerCase()) + ' of '
            },
            {
              type: 'direct',
              value: edge.inverse ? '\'s the ' + decodeURIComponent(parts.join(' ').toLowerCase()) + ' of ' : '\'s ' + decodeURIComponent(parts.join(' ').toLowerCase()) + ' is '
            }
          ];*/

          self.result.links[index] = 
          {
			  inverse: edge.inverse,
			  value: property
		  };

          if ((self.result.topics.length + self.result.links.length) === path.length) {
            $(self).trigger('generated', formatResult(self.result));
          }

          //logger.log('Property', property);
          //logger.log('Generated sentence', index, ':', self.result.links[index][0].value);
        }

        $(edges).each(retrieveTranscription);
      }

      function retrieveAbstracts(vertices) {	  
		  
        var uri = vertices.map(function (vertice) { return vertice.uri; });
        $.ajax({
          url: urls.abstracts,
          dataType: 'jsonp',
          data: {
            uri: uri.join(',')
          },
		  timeout: 30000,
          success: function (abstracts) {
            //if (!abstracts.length || abstracts.length === 0)
			//	logger.log('No abstracts found');

            function retrieveAbstract(index, vertice) {
              var uri = vertice.uri || '';
              var tregex = /\n|([^\r\n.!?]+([.!?]+|$))/gim;

              function getLabel(item) {
                if (item.label)
                  return item.label;

                var label = uri.substr(uri.lastIndexOf('/') + 1);

                return label.replace(/[^A-Za-z0-9]/g, ' ');
              }

              function getDescription(item) {
			    var maxSentences = 1;
                var abstract = item.abstract || '';
                var sentences = abstract.match(tregex) || [];
				var word;
				
				
				for (var i=0; i<sentences.length; i++){
					word = sentences[i].split(" ");
					if (word[word.length-1].length<3)
						  maxSentences += 1;
					else
						break;
				}
                var desc = sentences.slice(0, maxSentences).join(' ');
                return desc;
              }

              var item = abstracts[uri] || {},
                  desc = getDescription(item);
                  
              vertice.defaultText = desc;
              
              self.result.topics[index] = {
                topic : {
                  type: item.type || '',
                  label: getLabel(item)
                },
                hash_object: vertice
                //defaultText : desc,
                //text: vertice.audio_text,
                //slide_description: vertice.slide_description
              };

              if ((self.result.topics.length + self.result.links.length) === path.length) {
                $(self).trigger('generated', formatResult(self.result, vertices));
              }
			  logger.log('created', self.result.topics[index]);
              logger.log('Resource', vertice);
              logger.log('Extracted text', desc);
            }

            $(vertices).each(retrieveAbstract);
          },
          error: function (err) {
            logger.log('Error retrieving abstracts', err);
            
            //Try to just run even without any actual extracted descriptions?
            var abstracts = [];
            
            function retrieveAbstract(index, vertice) {
              var uri = vertice.uri || '';
              var tregex = /\n|([^\r\n.!?]+([.!?]+|$))/gim;

              function getLabel(item) {
                if (item.label)
                  return item.label;

                var label = uri.substr(uri.lastIndexOf('/') + 1);
				label = decodeURI(label);
				return label.replace(/_/g,' ');
                //return label.replace(/[^A-Za-z0-9]/g, ' ');
              }

              function getDescription(item) {
			    var maxSentences = 1;
                var abstract = item.abstract || '';
                var sentences = abstract.match(tregex) || [];
				var word;
				
				
				for (var i=0; i<sentences.length; i++){
					word = sentences[i].split(" ");
					if (word[word.length-1].length<3)
						  maxSentences += 1;
					else
						break;
				}
                var desc = sentences.slice(0, maxSentences).join(' ');
                return desc;
              }

              var item = abstracts[uri] || {},
                  desc = getDescription(item);
                  
              vertice.defaultText = desc;
              
              self.result.topics[index] = {
                topic : {
                  type: item.type || '',
                  label: getLabel(item)
                },
                hash_object: vertice
                //defaultText : desc,
                //text: vertice.audio_text,
                //slide_description: vertice.slide_description
              };

              if ((self.result.topics.length + self.result.links.length) === path.length) {
                $(self).trigger('generated', formatResult(self.result, vertices));
              }
			  logger.log('created', self.result.topics[index]);
              logger.log('Resource', vertice);
              logger.log('Extracted text', desc);
            }

            $(vertices).each(retrieveAbstract);
          }
        });
      }

      retrieveTranscriptions(path.filter(function (o) { return o.type === 'link'; }));
      retrieveAbstracts(path.filter(function (o) { return o.type === 'node';  }));
    },
    
    generateRelationshipSentence: function(source, target, relation, inverse){
			var subject, object, sentence;
			if(inverse == 1){
				subject = target;
				object = source;
				//sentence = subject + " is the " + relation + " of " + object;
			}else {
				subject = source;
				object = target;
				//sentence = subject + "'s " + relation + " is " + object;
			}
			var flag1 = 0, relation_lower=" ";
			for (var i = 0; i < relation.length; i++){
				
				if (/^[A-Z]/.test(relation[i])){
					relation_lower += " ";
					relation_lower += relation[i].toLowerCase();
				}else{
					relation_lower += relation[i];
				}
			}
			//console.log(relation_lower);
			switch(relation){
				case ("city"):
					sentence = subject + " locates in the city of " + object;
					break;
				case ("influenced"):
					sentence = subject + " influenced " + object;
					break;
				case ("location" || "locatedInArea"):
					sentence = subject + " locates in " + object;
					break;
				case ("knownFor"):
					sentence = subject + " is known for " + object;
					break;
				case ("training"):
					sentence = subject + " is trained by " + object;
					break;
				case ("influencedBy"):
					sentence = subject + " is influenced by " + object;
					break;
				case ("museum"):
					sentence = subject + " is exhibited in " + object;
					break;
				case ("country"||"startPoint"):
					sentence = subject + " is a" + relation_lower + " of " + object;
					break;
				case ("leaderName"):
					sentence = object + " is the leader of " + subject;
					break;
				case ("education"):
					sentence = subject + "'s education is at/with" + object;
					break;
				case ("residence"):
					sentence = subject + " lives in " + object;
					break;
				case ("foundedBy"):
					sentence = subject + " is founded by " + object;
					break;
				case ("ground"):
					sentence = subject + " is at " + object;
					break;
				case ("sportCountry"):
					sentence = object + " is the country where " + subject + " plays sports";
					break;
				case ("subsidiary"):
					sentence = subject + "'s subsidiary is at " + object;
					break;
				case ("distributingLabel"):
					sentence = object + "'s distributing label is " + subject;
					break;
				case ("recordedIn"):
					sentence = subject + " was recorded in " + object;
					break;
				case ("starring"):
					sentence = object + " starred in " + subject;
					break;
				default: 
					sentence = subject + "'s" + relation_lower + " is " + object;	  
			}
			return sentence;
			
		},
  };
  return Summarizer;
});



