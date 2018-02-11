'use strict';

const cheerio = require('cheerio');
const request = require('request');

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
