'use strict';

const fs = require('fs');
const path = require('path');
const progress = require('request-progress');
const request = require('request');

const findNotExistingVideo = require('src/download/findNotExistingVideo');
const cleanLine = require('src/download/cleanLine');
const writeWaitingInfo = require('src/download/writeWaitingInfo');

function downloadVideos(logger, videos, downloadFolder, lessonNumbers) {
  if (lessonNumbers !== null) {
    downloadSelectively(logger, videos, downloadFolder, lessonNumbers);
    return true;
  }
  downloadAll(logger, videos, downloadFolder);
  return true;
}

function downloadSelectively(logger, videos, downloadFolder, lessonNumbers) {
  var i = 0;
  if (lessonNumbers[i] >= videos.length) {
    return false;
  }
  console.log(`Will be downloaded videos number ${lessonNumbers.join(', ')}`.blue);
  const loopArr = function(videos) {
    downloadOneVideo(logger, downloadFolder, videos[lessonNumbers[i] - 1], function() {
      i++;
      if (i < videos.length && i < lessonNumbers.length) {
        loopArr(videos);
      }
    });
  }
  loopArr(videos);
  return true;
}

function downloadAll(logger, videos, downloadFolder) {
  var x = findNotExistingVideo(videos, downloadFolder),
      lessonNumbers = [];
  if (x >= videos.length)
    return false;
  for (let i = x; i < videos.length; i++) {
    lessonNumbers.push(i);
  }
  console.log(`Will be downloaded videos number ${lessonNumbers.join(', ')}`.blue);
  const loopArray = function(videos) {
    downloadOneVideo(logger, downloadFolder, videos[x], function() {
      x++;
      if (x < videos.length) {
        loopArray(videos);
      }
    });
  }
  loopArray(videos);
  return true;
}

function downloadOneVideo(logger, downloadFolder, video, nextVideo) {
  console.log(`Start download video: ${video.name}`.blue);
  progress(request(video.url), { throttle: 2000, delay: 1000 })
    .on('progress', function(state) {
      writeWaitingInfo(state);
    })
    .on('error', function(err) {
      console.log(`${err}`.red);
    })
    .on('end', function() {
      cleanLine();
      console.log(`End download video ${video.name}`.green);
      logger.write(`${video.name}\n`);
      nextVideo();
    })
    .pipe(fs.createWriteStream(`${downloadFolder}${path.sep}${video.name}.mp4`));
}

module.exports = downloadVideos;
