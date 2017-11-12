'use strict';

const request = require('request');
const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const download = require('download');
const path = require('path');
const progress = require('request-progress');
const colors = require('colors');

console.log('#############################'.bgWhite.black);
console.log('### CH DOWNLOADER 0.0.2   ###'.bgWhite.black);
console.log('### this is alpha version ###'.toUpperCase().bgWhite.black);
console.log('#############################\n'.bgWhite.black);

const logger = fs.createWriteStream('videos.txt', { flags: 'a' });
console.log('Create videos.txt file'.blue);

function getVideos(url) {
	return new Promise(function(resolve, reject) {
		let result = [];
		let names = [];
		request(url, function(err, res, html) {
			if (!err) {
				let $ = cheerio.load(html);
				$('#lessons-list').filter(function() {
					let data = $(this);
					const dataArray = data
						.children()
						.children()
						.toArray();
					const filterData = dataArray.filter(
						el => el.name === 'link' && el.attribs.itemprop === 'contentUrl'
					);
					const filterSpan = dataArray.filter(el => el.name === 'span');
					filterSpan.map(el => {
            if (el.name === 'span') {
              const videoName = el.children[0].data.replace(/[\/:*?"<>|]/g, '');
              logger.write(`${videoName}\n`);
              names.push(videoName);
            }
					});
					filterData.map(el => {
						result.push(el.attribs.href);
					});
					resolve({ result, names });
				});
			} else {
				reject(err);
			}
		});
	});
}

const index = process.argv.indexOf('--course-url');

if (index > -1) {
  const courseUrl = process.argv[index + 1];
  const videos = [];
	getVideos(courseUrl)
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
