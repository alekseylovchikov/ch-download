'use strict';

const fs = require('fs');
const path = require('path');
const progress = require('request-progress');
const request = require('request');
const readline = require('readline');

const findNotExistingVideo = require('src/download/findNotExistingVideo');

function downloadVideos(logger, videos, downloadFolder)
{
  var x = findNotExistingVideo(videos, downloadFolder);
  if (x >= videos.length)
    return ;
  const loopArray = function(videos) {
    downloadOneVideo(logger, downloadFolder, videos[x], function() {
      x++;
      if (x < videos.length) {
        loopArray(videos);
      }
    });
  }
  loopArray(videos);
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

function writeWaitingInfo(state) {
  cleanLine();
  const percent = (state.percent * 100).toFixed(2),
        transferred = formatBytes(state.size.transferred),
        total = formatBytes(state.size.total),
        remaining = secondsToHms(state.time.remaining),
        speed = formatBytes(state.speed),
        text = `${percent}% | ${transferred} / ${total} | ${speed}/sec | ${remaining}`;
  process.stdout.write(text);
}

function cleanLine()
{
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0, null);
}

function formatBytes(bytes, decimals) {
   if (bytes == 0) return '0 Bytes';
   let k = 1024,
       dm = decimals || 2,
       sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
       i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function secondsToHms(sec) {
    var h = Math.floor(sec / 3600);
    var m = Math.floor(sec % 3600 / 60);
    var s = Math.floor(sec % 3600 % 60);
    var hh = h < 10 ? '0' + h : h;
    var mm = m < 10 ? '0' + m : m;
    var ss = s < 10 ? '0' + s : s;
    return `${hh}:${mm}:${ss}`;
}


module.exports = downloadVideos;
