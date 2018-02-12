const axios = require('axios');
const progress = require('request-progress');
const request = require('request');
const fs = require('fs');
const getVideos = require('./getVideos');

function start(cookie) {
	const index = process.argv.indexOf('-u');
	if (index > -1) {
	  const courseUrl = process.argv[index + 1];
	  const videos = [];
		getVideos(courseUrl, cookie)
	    .then(data => {
	      data.result.map((url, i) => {
	        videos.push({ url, name: data.names[i] });
	      });
	      console.log('Start download videos, please wait...');
	      videos.map(video => {
	        console.log(`Start download video: ${video.name}`.blue);
	        progress(request(video.url), { throttle: 2000, delay: 1000 })
	          .on('progress', function(state) {})
	          .on('error', function(err) {
	            console.log(`${err}`.red);
	          })
	          .on('end', function() {
	            console.log(`End download video ${video.name}`.green);
	          })
	          .pipe(fs.createWriteStream(`${video.name}.mp4`));
	      });
	  })
	  .catch(err => console.log(`${err}`.red));
	} else {
	  console.log('Use: node index --course-url <course-url>'.blue);
	}
}

module.exports = start;
