'use strict';

const request = require('request');
const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const download = require('download');
const path = require('path');
const progress = require('request-progress');
const colors = require('colors');

function printHeader() {
  console.log('#############################'.green);
  console.log('###  CH DOWNLOADER 0.0.2  ###'.green);
  console.log('### this is alpha version ###'.toUpperCase().green);
  console.log('#############################\n'.green);
}

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

function printUsage() {
  let filename = path.basename(process.argv[1]);
  console.log(`usage: node ${filename} -u course-url`.yellow);
  console.log(`  -u, --url: https://coursehunters.net/course_name`.yellow);
}

const index = process.argv.indexOf('--course-url');

if (index > -1) {
  printHeader();

  const logger = fs.createWriteStream('videos.txt', { flags: 'a' });
  console.log('Create videos.txt file'.blue);

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
  printUsage();
}
