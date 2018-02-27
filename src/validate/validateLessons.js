'use strict';

const printError = require('src/validate/printError');

function validateLessons(lessonsString) {
  const regExpComma = /\s*,\s*/,
        regExpDash = /\s*-\s*/,
        lessonList = lessonsString.split(regExpComma),
        toManyDash = 'Bad number of dash after -l or --lessons, should be e.g.: "1-5, 7, 10, 12-15"',
        badLessonsCharacter = 'Should be only numeric characters, "-" or "," after -l or --lessons',
        zeroNumber = 'Please type number of lessons more for 1';
  for (let item of lessonList) {
    const dashCounter = (item.match(/-/g) || []).length;
    if (dashCounter > 1) {
      printError(toManyDash);
    } else if (dashCounter === 1) {
      const periodList = item.split(regExpDash);
      for (let element of periodList) {
        if (!isNumeric(element)) {
          printError(badLessonsCharacter);
        } else if (element === '0') {
          printError(zeroNumber);
        }
      }
    } else if (dashCounter === 0) {
      if (!isNumeric(item)) {
        printError(badLessonsCharacter);
      } else if (item === '0') {
        printError(zeroNumber);
      }
    }
  }
}

function isNumeric(str){
  return /^\d+$/.test(str);
}

module.exports = validateLessons;
