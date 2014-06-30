/*!
* EIC YouTubeSlideGenerator
*
* This class generates slides that contain YouTube videos
*
* Copyright 2012, Multimedia Lab - Ghent University - iMinds
* Licensed under GPL Version 3 license <http://www.gnu.org/licenses/gpl.html> .
*/
define(['lib/jquery', 'eic/generators/BaseSlideGenerator', 'eic/Logger'],
function ($, BaseSlideGenerator, Logger) {
  "use strict";
  
  /*
* CLEANUP
**/
  var logger = new Logger("YouTubeSlideGenerator");
  var playerCount = 0;
    
  var scriptFlag = false;
  
  //Try to grab the api once, and only once
  $.getScript("http://www.youtube.com/player_api", function () {
	scriptFlag=true;
  });

  /** Generator of YouTube videos using the YouTube API
* The option parameter is a hash consisting of
* - the maximum number of videos to return
* - the maximum duration (in milliseconds) of a video
* - the skipping duration (in milliseconds) at the beginning of the video
*/
  function YouTubeSlideGenerator(topic, preload, options) {
    BaseSlideGenerator.call(this);

    this.topic = topic;
	this.preload = preload;
    options = options || {};
    this.maxVideoCount = options.maxVideoCount || 2;
    this.maxVideoDuration = options.maxVideoDuration || 5000;
    this.skipVideoDuration = options.skipVideoDuration || 10000;
    this.orderMethod = options.orderMethod || 'relevance';
    this.totalDuration = 0;
    this.slides = [];
  }

  $.extend(YouTubeSlideGenerator.prototype,
           BaseSlideGenerator.prototype,
  {
    /** Checks whether any slides are left. */
    hasNext: function () {
      return this.slides.length > 0;
    },

    /** Fetches a list of images about the topic. */
    init: function () {
      if (this.inited)
        return;
      
      var self = this;	
	  
	  if (!scriptFlag){
		$.getScript("http://www.youtube.com/player_api", function () {
			searchVideos(self, 0, self.maxVideoCount, 0);
		});
	  }
	  else{
		searchVideos(self, 0, self.maxVideoCount, 0);
	  }
      
      this.inited = true;
      this.status = "inited";
    },

    /** Advances to the next slide. */
    next: function () {
      return this.slides.shift();
    },
    
    /** Prepare video by playing and pausing it, in order to prebuffer its contents. */
    prepare: function () {
      var self = this, player = self.player;
      
      // if we did not start preparations yet, and the player object is ready
      if (player && player.playVideo) {
        // start preparing by playing the video
        self.status = "preparing";
        player.playVideo();
        
        // as soon as the video plays, pause it (give it 0.2 seconds to actually register the fact that it had started playing?)...
        player.addEventListener('onStateChange', function () {
          // ...but only if we're still in preparation mode (and not playing for real)
          if (self.status === "preparing" && player.getPlayerState() == window.YT.PlayerState.PLAYING)
            setTimeout(function(){
				if (self.status === "preparing")
					player.pauseVideo();}, 200);
        });
      }
	  else{
		self.once('playerReady', function(){
			if (self.status != "stopped"){
				player.playVideo();
				// as soon as the video plays, pause it (give it 0.2 seconds to actually register the fact that it had started playing?)...
				player.addEventListener('onStateChange', function () {
				  // ...but only if we're still in preparation mode (and not playing for real)
				  if (self.status === "preparing" && player.getPlayerState() == window.YT.PlayerState.PLAYING)
					setTimeout(function(){
						if (self.status === "preparing")
							player.pauseVideo();}, 200);
				});
			}
		});
	  }
    },

    /** Adds a new video slide. */
    addVideoSlide: function (videoID, Duration, Start, Stop) {
		
		var self = this, start, end, duration;
		
		if (!scriptFlag){
			$.getScript("http://www.youtube.com/player_api", function () {
				addSlide();
			});
		}
		else{
			addSlide();
		}
		
		function addSlide(){
			if (!Start && !Stop){
				start = self.skipVideoDuration,
				end = self.skipVideoDuration + self.maxVideoDuration;
				if (Duration <= self.maxVideoDuration + self.skipVideoDuration)
					end = Duration;
				if (Duration < self.maxVideoDuration + self.skipVideoDuration && duration >= self.maxVideoDuration)
					start = 0;
			}
			else if (!Start){
				end = Stop;
				if ((Stop-Duration)<=0)
					start = 0;
				else
					start = Stop-Duration;
			}
			else if (!Stop){
				start = Start;
				end = Start+Duration;
			}
			else{
				start = Start;
				end = Stop;
			}
			duration = end - start;

			//Just a random error handler to prevent stalling on videos
			if (!duration)
				duration = 5000;

			self.totalDuration += duration;
			

			// create a container that will hide the player
			var playerId = 'ytplayer' + (++playerCount),
				$container = $('<div>').append($('<div>').prop('id', playerId))
									 .css({ width: 0, height: 0, overflow: 'hidden' });
			$('#ytholder').append($container);

			// create the player in the container
			var player = self.player = new window.YT.Player(playerId, {
				playerVars: {
					autoplay: 0,
					controls: 0,
					start: (start / 1000),
					end: (end / 1000),
					wmode: 'opaque'
				},
				videoId: videoID,
				width: 800,
				height: 600,
				events: { 
					onReady: function (event) { 
						event.target.mute(); 
						self.emit('playerReady');
						if (self.preload){
							//player.cueVideoById(videoID, start/1000, 'large'); 
							self.prepare();
						}
					}
				}
			});

			// create a placeholder on the slide where the player will come
			var $placeholder = $('<div>'),
			  slide = self.createBaseSlide('youtube', $placeholder, duration);
			 

			// if the slide starts, move the player to the slide
			slide.once('started', function () {
				// flag our state to make sure prepare doesn't pause the video
				self.status = 'started';

				// make video visible
				var offset = $placeholder.offset();

				//Avoid playVideo errors by making sure the player is ready...
				if (player.playVideo){
					player.playVideo();
				}
				else{
					self.once('playerReady', function(){
						if (self.status == "started")
							player.playVideo();
					});
				}
					
				$container.css({
					// move to the location of the placeholder
					position: 'absolute',
					top: offset.top,
					left: offset.left,
					// and make the container show its contents
					width: 'auto',
					height: 'auto',
					overflow: 'auto'
				});
			});
			slide.once('stopped', function () {
				self.status = "stopped";
				$container.fadeOut(function () {
					if (scriptFlag)
						player.stopVideo();
					
					$container.remove();
				});
			});

			slide.slide_info = {
				type: "YouTubeSlide",
				data: {
					videoID: videoID,
					start: start,
					end: end,
					duration: duration,  
				},
			};

			self.slides.push(slide);
			self.emit('newSlides');
		}	
    },
  });
  
  function searchVideos(self, startResults, maxResult, skip) {
	  	  
    if (maxResult > 50) { //YouTube API restriction
      maxResult = 50;
    }
    var inspected = 0;
    var resultCounter = startResults;
    $.ajax('https://gdata.youtube.com/feeds/api/videos?v=2&max-results=' + maxResult + '&orderby=' + self.orderMethod + '&alt=jsonc&q=' + self.topic.label + "&format=5")
     .success(function (response) {
        var items, itemCount;
        if (response.data.items)
			items = response.data.items;
		else
			items = 0;
			
        itemCount = Math.min(items.length, self.maxVideoCount);
        for (var i = 0; i < itemCount; i++)
          self.addVideoSlide(items[i].id, items[i].duration * 1000);
      });
  }

  return YouTubeSlideGenerator;
});
