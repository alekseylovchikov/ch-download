const axios = require('axios');
const progress = require('request-progress');
const download = require('download');
const request = require('request');
const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const path = require('path');

const logger = fs.createWriteStream('videos.txt', { flags: 'a' });

let j = request.jar();

function getVideos(url, cookie) {
	return new Promise((resolve, reject) => {
		const result = [];
		const names = [];
		j.setCookie(cookie, url);
		request({ url: url, jar: j }, function(err, res, html) {
			if (!err) {
				const $ = cheerio.load(html);
				$('#lessons-list').filter(function() {
					const data = $(this);
					const dataArray = data.children().children().toArray();
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

module.exports = getVideos;
