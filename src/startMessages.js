const axios = require('axios');
const colors = require('colors');

const startMessages = () => {
  console.log('#############################'.bgWhite.black);
  console.log('### CH DOWNLOADER 0.0.3   ###'.bgWhite.black);
  console.log('### ALPHA VERSION ###'.bgWhite.black);
  console.log('#############################\n'.bgWhite.black);
};

module.exports = startMessages;
