'use strict';

const path = require('path');
const fs = require('fs');

function findNotExistingVideo(videos, downloadFolder) {
  let i = 0;
  for (let video of videos) {
    const name = video.name.toString().replace(/[^A-Za-zА-Яа-я\d\s]/gmi, '').replace('Урок ', '');
    let filename = `${downloadFolder}${path.sep}${name}.mp4`;
    if (fs.existsSync(filename) && isCompletelyDownloaded(name, downloadFolder)) {
      console.log(`File "${name}" already exists`.red);
      i++;
    } else {
      break ;
    }
  }
  return i;
}

function isCompletelyDownloaded(videoName, downloadFolder) {
  const downloadedVideos = findDownloadedVideos(downloadFolder);
  if (typeof downloadedVideos === 'undefined' || downloadedVideos.length === 0) {
    return true;
  }
  for (let downloadedVideoName of downloadedVideos) {
    if (videoName === downloadedVideoName)
      return true;
  }
  return false;
}

function findDownloadedVideos(downloadFolder) {
  const logFile =`${downloadFolder}${path.sep}videos.txt`;
  if (!fs.existsSync(logFile)) return [];
  return fs.readFileSync(logFile).toString().split("\n");
}

module.exports = findNotExistingVideo;
