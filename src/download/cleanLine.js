'use strict';

const readline = require('readline');

function cleanLine() {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0, null);
}

module.exports = cleanLine;
