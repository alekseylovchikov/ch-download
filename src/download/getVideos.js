'use strict';

const cheerio = require('cheerio');
let request = require('request');
request = request.defaults({
  jar: true
});

const videoMaterialScriptContainerSelector = '.flex-player-item .main-content script:nth-of-type(2)';
const getLessonsData = $ => {
  const lessonsScriptContainer = $(videoMaterialScriptContainerSelector);
  const lessonsScriptCode = lessonsScriptContainer.get()[0].children[0].data;
  const coursesObjMatches = lessonsScriptCode.match(/({"title":)(.*)("})/g).slice(1);

  return coursesObjMatches.map(courseString => {
    const parsedCourseObj = JSON.parse(courseString);
    return {
      ...parsedCourseObj,
      subtitle: parsedCourseObj.subtitle.replace(/(\[)(.*)(])/, '')
    }
  });
}

const courseMaterialsAnchorSelector = '.course-wrap-bottom a[title="Download course materials"]'
const getCourseMaterialsUrl = $ => {
  const materialsAnchorEl = $(courseMaterialsAnchorSelector)
  return materialsAnchorEl.get()[0].attribs.href;
}

function getVideos(url, token) {
  const options = { url };
  if (token) {
    const cookie = request.cookie(token);
    options.headers = {
      Cookie: cookie
    };
  }
  return new Promise((resolve, reject) => {
    request(options, function(err, res, html) {
      if (!err) {
        let $ = cheerio.load(html);
        const lessonsData = getLessonsData($)
        resolve({
          result: lessonsData.map(lesson => lesson.file),
          names: lessonsData.map(lesson => lesson.title.replace(/[\/:*?"<>|]/g, '')),
          urlMaterials: getCourseMaterialsUrl($)
        })
      } else {
        reject(err)
      }
    })
  })
}

module.exports = getVideos;
