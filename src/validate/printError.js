'use strict';

function printError(errorString) {
  console.log(errorString.red);
  process.exit(1);
}

module.exports = printError;
