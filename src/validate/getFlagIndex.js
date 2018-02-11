'use strict';

function getFlagIndex(flags_versions) {
  let indexFlag = -1;
  for (let flag of flags_versions) {
    let index = process.argv.indexOf(flag)
    if ( index > -1)
      indexFlag = index;
  }
  return indexFlag;
}

module.exports = getFlagIndex;
