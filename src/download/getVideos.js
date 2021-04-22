"use strict";

const cheerio = require("cheerio");
let request = require("request");
request = request.defaults({
  jar: true,
});

const getCourseId = ($) => {
  const courseIdScriptSelector =
    "body.theme_dark .container.pt-20 .comment-form + script";

  const courseIdScript = $(courseIdScriptSelector);

  if (courseIdScript && courseIdScript.get().length) {
    const courseIdScriptText = courseIdScript.get()[0].children[0].data;

    const match = courseIdScriptText.match(/\d+/);

    let courseId;
    if (match) {
      courseId = match[0];
    }

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
            "\nInvalid course URL or Only available to premium users!".red
          );
          console.log("Try using different credentials!".red);
          return;
        }

        const options = {
          url: `https://coursehunter.net/course/${courseId}/lessons`,
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
