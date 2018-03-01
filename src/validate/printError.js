'use strict';

function printError(errorString) {
  console.log(errorString.red);
  process.exit(0);
}

module.exports = printError;
