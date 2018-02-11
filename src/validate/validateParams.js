'use strict';

const path = require('path');

function validateParams(flags, indexUrlFlag, indexDirFlag) {
  if (indexUrlFlag == -1 || indexUrlFlag === process.argv.length - 1 ||
      indexDirFlag === process.argv.length - 1 ||
      isNextFlag(flags, process.argv[indexUrlFlag + 1]) ||
      isNextFlag(flags, process.argv[indexDirFlag + 1]))
        printUsage();
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
  console.log(`usage: node ${filename} -u course-url [-d dirname]`.yellow);
  console.log(`  -u, --url: https://coursehunters.net/course_name`.yellow);
  console.log(`  -d, --dir: download folder, default <course_name>`.yellow);
  process.exit(0);
}

module.exports = validateParams;
