"use strict";

const cheerio = require("cheerio");
let request = require("request");
request = request.defaults({
  jar: true,
});

const videoMaterialScriptContainerSelector =
  ".main-content script:nth-of-type(2)";

const getCourseId = ($) => {
  const lessonsScriptContainer = $(videoMaterialScriptContainerSelector);

  if (lessonsScriptContainer.get().length) {
    const lessonsScriptCode = lessonsScriptContainer.get()[0].children[0].data;

    const courseId = lessonsScriptCode.replace(/\s/g, "").match(/axios.get\('\/api\/v1\/course\/(\d+)\/lessons'\)/)[1];

    return courseId;
  } else {
    return null;
  }
};

const courseMaterialsAnchorSelector =
  ".course-wrap-bottom .ml-15 a:nth-of-type(2)";
const getCourseMaterialsUrl = ($) => {
  const materialsAnchorEl = $(courseMaterialsAnchorSelector);
  return materialsAnchorEl.get()[0]?.attribs.href;
};

function getVideos(url, token) {
  const options = { url };
  if (token) {
    const cookie = request.cookie(token);
    options.headers = {
      Cookie: cookie,
    };
  }
  return new Promise((resolve, reject) => {
    request(options, async function (err, res, html) {
      if (!err) {
        let $ = cheerio.load(html);
        const courseId = getCourseId($);

        if (!courseId) {
          console.log(
            "\nPlease check the course url or This course is only available to premium users!"
              .red
          );
          console.log("Try using credentials!".red);
          return;
        }

        const options = {
          url: `https://coursehunter.net/api/v1/course/${courseId}/lessons`
        };

        if (token) {
          const cookie = request.cookie(token);
          options.headers = {
            Cookie: cookie,
          };
        }

        request(options, function (err, res) {
          if (!err) {
            const lessonsData = JSON.parse(res.body);
            resolve({
              result: lessonsData.map((lesson) => lesson.file),
              names: lessonsData.map((lesson) => {
                const str = lesson.title.replace(
                  /\s\|\s\d{2}:\d{2}:\d{2}/g,
                  ""
                );
                const match = str.match(/\d+\.\s.*/g);
                if (match && match.length) {
                  return match[0];
                }

                return str;
              }),
              urlMaterials: getCourseMaterialsUrl($),
            });
          }
        });
      } else {
        reject(err);
      }
    });
  });
}

module.exports = getVideos;
