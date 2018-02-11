'use strict';

const path = require('path');
const fs = require('fs');

function findNotExistingVideo(videos, downloadFolder)
{
  let i = 0;
  for (let video of videos) {
    let filename = `${downloadFolder}${path.sep}${video.name}.mp4`;
    if (fs.existsSync(filename) && isCompletelyDownloaded(video.name, downloadFolder)) {
      console.log(`File \'${video.name}\' already exists`.blue);
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
