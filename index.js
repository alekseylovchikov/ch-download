'use strict';

require('app-module-path').addPath(__dirname);

const request = require('request');
const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const download = require('download');
const path = require('path');
const progress = require('request-progress');
const colors = require('colors');
const readline = require('readline');

const validateParams = require('src/validate/validateParams');
const getFlagIndex = require('src/validate/getFlagIndex');
const createFolder = require('src/create/createFolder');
const createLogger = require('src/create/createLogger');
const downloadVideos = require('src/download/downloadVideos.js');
const getVideos = require('src/download/getVideos.js');
const versionCheck = require('github-version-checker');
const pkg = require('./package.json');

function printHeader() {
  console.log('#############################'.green);
  console.log(`###  CH DOWNLOADER ${pkg.version}  ###`.green);
  console.log('### this is alpha version ###'.toUpperCase().green);
  console.log('#############################\n'.green);
}

function checkNewVersion(startDownloading) {
  const options = {
    repo: 'alekseylovchikov/ch-download',
    currentVersion: pkg.version,
    includePreReleases: true
  };

  versionCheck(options, function (update, error) {
    if (error) throw error;
    if (update) {
      console.log('An update is available!');
      console.log('New version: ' + update.tag_name);
      console.log('Details here: ' + update.html_url);
    }

    console.log('Starting app...\n');
    startDownloading();
  });
}

function startDownloading() {
  const courseUrl = process.argv[indexUrlFlag + 1];
  const downloadFolder = (indexDirFlag == -1) ?
    getLastSegment(courseUrl) :
    process.argv[indexDirFlag + 1];

  createFolder(downloadFolder);
  const logger = createLogger(downloadFolder);

  const videos = [];
  getVideos(courseUrl)
    .then(data => {
      data.result.map((url, i) => {
        videos.push({ url, name: data.names[i] });
      });
      console.log('Start download videos, please wait...');
      downloadVideos(logger, videos, downloadFolder);
  })
  .catch(err => console.log(`${err}`.red));
}

function getLastSegment(url) {
  let parts = url.split('/');
  return parts.pop() || parts.pop(); // handle potential trailing slash
}

const url = 'url';
const dirName = 'dirName';
let flags = { url: ['--url', '-u'], dirName: ['--dir', '-d'] };
const indexUrlFlag = getFlagIndex(flags.url);
const indexDirFlag = getFlagIndex(flags.dirName);

validateParams(flags, indexUrlFlag, indexDirFlag);
printHeader();
checkNewVersion(startDownloading);
