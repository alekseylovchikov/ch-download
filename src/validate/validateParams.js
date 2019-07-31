'use strict';

const path = require('path');

const getFlagIndex = require('src/validate/getFlagIndex');
const validateLessons = require('src/validate/validateLessons');

function validateParams(flags, indexUrlFlag, indexDirFlag) {
  const indexLessonsFlag = getFlagIndex(flags.lessons);
  if (indexUrlFlag == -1 || indexUrlFlag === process.argv.length - 1 ||
      indexDirFlag === process.argv.length - 1 ||
      indexLessonsFlag === process.argv.length - 1 ||
      isNextFlag(flags, process.argv[indexUrlFlag + 1]) ||
      isNextFlag(flags, process.argv[indexDirFlag + 1]) ||
      isNextFlag(flags, process.argv[indexLessonsFlag + 1]))
        printUsage();
  if (indexLessonsFlag !== -1) {
    validateLessons(process.argv[indexLessonsFlag + 1]);
  }
}

function isNextFlag(flags, param) {
  for (let elem in flags) {
    if (flags[elem].includes(param))
      return true;
  }
  return false;
}

function printUsage() {
  let filename = path.basename(process.argv[1]);
  console.log(`usage: node ${filename} -u course-url [-d dirname] [-l lessons]`.yellow);
  console.log(`  -u, --url: https://coursehunter.net/course_name`.yellow);
  console.log(`  -d, --dir: download folder, default <course_name>`.yellow);
  console.log(`  -e, --email: your email from coursehunter.net`.yellow);
  console.log(`  -p, --pass: your password from coursehunter.net`.yellow);
  console.log(`  -l, --lessons: download only listed lessons, e.g.: "1-5, 7, 10, 12-15" or 3-7,9,11,15-20`.yellow);
  process.exit(0);
}

module.exports = validateParams;
