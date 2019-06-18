'use strict';

const fs = require('fs');
const path = require('path');
const progress = require('request-progress');
const request = require('request');

const findNotExistingVideo = require('src/download/findNotExistingVideo');
const findNotExistingSubtitle = require('src/download/findNotExistingSubtitle');
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
  let x = findNotExistingVideo(videos, downloadFolder),
      lessonNumbers = [];
  let y = findNotExistingSubtitle(videos, downloadFolder);
  if (x >= videos.length)
    return false;
  if (y >= videos.length)
    console.log('All Subtitles was download');
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
  };
  loopArray(videos);
  return true;
}

function downloadOneVideo(logger, downloadFolder, video, nextVideo) {
  let videoName = video.name.replace('Урок ', '').replace('\\', '');
  let subtitleUrl = video.url.replace('.mp4', '.vtt');
  console.log(`Start download video: ${videoName}`.blue);

  progress(request(encodeURI(video.url)), { throttle: 2000, delay: 1000 })
    .on('progress', function(state) {
      writeWaitingInfo(state);
    })
    .on('error', function(err) {
      console.log(`${err}`.red);
    })
    .on('end', function() {
      cleanLine();
      console.log(`End download video ${videoName}`.green);
      logger.write(`${videoName}\n`);

      progress(request(encodeURI(subtitleUrl)), { throttle: 2000, delay: 1000 })
          .on('response', function (resp) {
            if (parseInt(resp.statusCode) !== 404) {
              this.pipe(fs.createWriteStream(`${downloadFolder}${path.sep}${videoName}.vtt`));
            } else {
              console.log('Subtitle does not exist');
            }
          })
          .on('progress', function(state) {
            writeWaitingInfo(state);
          })
          .on('error', function(err) {
            console.log(`${err}`.red);
            console.log('Subtitle does not exist');
          })
          .on('end', function() {
            cleanLine();
            console.log(`End download subtitle for ${videoName}`.green);
          });

      nextVideo();
    })
    .pipe(fs.createWriteStream(`${downloadFolder}${path.sep}${videoName}.mp4`));
}

module.exports = downloadVideos;
