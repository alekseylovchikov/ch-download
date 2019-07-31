'use strict';

const cheerio = require('cheerio');
let request = require('request');
request = request.defaults({
  jar: true
});

function getVideos(url, token) {
  return new Promise(function(resolve, reject) {
    let result = [];
    let names = [];
    const options = { url: url };
    if (token) {
      const cookie = request.cookie(token);
      options.headers = {
        Cookie: cookie
      };
    }
    request(options, function(err, res, html) {
      if (!err) {
        let $ = cheerio.load(html);
        let videoMaterials = $('section.section-block');
        let urlMaterials;
        if (videoMaterials !== undefined && videoMaterials.length) {
          let linkMaterials = videoMaterials.children().children().toArray();
          if (linkMaterials.length) {
            urlMaterials = linkMaterials.filter(
                el => el.name === 'a'
            );
            if (urlMaterials !== undefined && urlMaterials.length) {
              urlMaterials = urlMaterials[0].attribs.href;
            }
          }
        }
        $('#lessons-list').filter(function() {
          let data = $(this);
          const dataArray = data
            .children()
            .children()
            .toArray();
          const filterData = dataArray.filter(
            el => el.name === 'link' && el.attribs.itemprop === 'contentUrl'
          );
          const filterSpan = dataArray.filter(el => el.name === 'div' && el.attribs.class === 'lessons-name');
          filterSpan.map(el => {
            if (el.name === 'div') {
              const index = Number(el.parent.attribs['data-index']);
              let videoName = 'Lesson ' + (index + 1);
              if (el.children && el.children[0]) {
                videoName = `${index + 1} ` + el.children[0].data.replace(/[\/:*?"<>|]/g, '');
              }
              names.push(videoName);
            }
          });
          filterData.map(el => {
            result.push(el.attribs.href);
          });
          resolve({ result, names, urlMaterials });
        });
      } else {
        reject(err);
      }
    });
  });
}

module.exports = getVideos;
