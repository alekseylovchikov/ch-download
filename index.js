'use strict';

const request = require('request');
const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const download = require('download');
const path = require('path');
const progress = require('request-progress');
const colors = require('colors');
const readline = require('readline');

function getFlagIndex(flags_versions) {
  let indexFlag = -1;
  for (let flag of flags_versions) {
    let index = process.argv.indexOf(flag)
    if ( index > -1)
      indexFlag = index;
  }
  return indexFlag;
}

function validateParams(flags, indexUrlFlag, indexDirFlag) {
  if (indexUrlFlag == -1 || indexUrlFlag === process.argv.length - 1 ||
      indexDirFlag === process.argv.length - 1 ||
      isNextFlag(flags, process.argv[indexUrlFlag + 1]) ||
      isNextFlag(flags, process.argv[indexDirFlag + 1]))
        printUsage();
}

function isNextFlag(flags, param) {
  for (let elem in flags) {
    if (flags[elem].includes(param))
      return true;
  }
  return false;
}

function printUsage() {
  let filename = path.basename(process.argv[1]);
  console.log(`usage: node ${filename} -u course-url [-d dirname]`.yellow);
  console.log(`  -u, --url: https://coursehunters.net/course_name`.yellow);
  console.log(`  -d, --dir: download folder, default <course_name>`.yellow);
  process.exit(0);
}

function printHeader() {
  console.log('#############################'.green);
  console.log('###  CH DOWNLOADER 0.0.2  ###'.green);
  console.log('### this is alpha version ###'.toUpperCase().green);
  console.log('#############################\n'.green);
}

function getLastSegment(url) {
  let parts = url.split('/');
  return parts.pop() || parts.pop(); // handle potential trailing slash
}

function createFolder(downloadFolder) {
  const sep = path.sep;
  const initDir = path.isAbsolute(downloadFolder) ? sep : '';
  downloadFolder.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(parentDir, childDir);
    try {
      fs.mkdirSync(curDir);
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
      if (curDir == makeDownloadFolderPath(downloadFolder))
        console.log(`Directory ${curDir} already exists`.blue);
      return curDir;
    }
    console.log(`Directory ${curDir} created`.blue);
    return curDir;
  }, initDir);
}

function makeDownloadFolderPath(downloadFolder) {
  const sep = path.sep;
  const folders = process.argv[1].split(sep);
  folders.pop();
  folders.push(downloadFolder);
  const downloadFolderPath = folders.join(sep);
  return downloadFolderPath;
}

function createLogger(downloadFolder) {
  const logFile =`${downloadFolder}${path.sep}videos.txt`
  fs.existsSync(logFile) ?
    console.log(`File ${logFile} already exists`.blue) :
    console.log(`File ${logFile} created`.blue);
  const logger = fs.createWriteStream(logFile, { flags: 'a' });
  return logger;
}

function getVideos(url) {
	return new Promise(function(resolve, reject) {
		let result = [];
		let names = [];
		request(url, function(err, res, html) {
			if (!err) {
				let $ = cheerio.load(html);
				$('#lessons-list').filter(function() {
					let data = $(this);
					const dataArray = data
						.children()
						.children()
						.toArray();
					const filterData = dataArray.filter(
						el => el.name === 'link' && el.attribs.itemprop === 'contentUrl'
					);
					const filterSpan = dataArray.filter(el => el.name === 'span');
					filterSpan.map(el => {
            if (el.name === 'span') {
              const videoName = el.children[0].data.replace(/[\/:*?"<>|]/g, '');
              names.push(videoName);
            }
					});
					filterData.map(el => {
						result.push(el.attribs.href);
					});
					resolve({ result, names });
				});
			} else {
				reject(err);
			}
		});
	});
}

function writeWaitingInfo(state) {
  cleanLine();
  const percent = (state.percent * 100).toFixed(2),
        transferred = formatBytes(state.size.transferred),
        total = formatBytes(state.size.total),
        remaining = Math.round(state.time.remaining),
        speed = formatBytes(state.speed),
        text = `${percent}% | ${transferred} / ${total} | ${speed}/sec | ${remaining} sec`;
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

function downloadVideos(videos)
{
  var x = findNotExistingVideo(videos);
  if (x >= videos.length)
    return ;
  const loopArray = function(videos) {
    downloadOneVideo(videos[x], function() {
      x++;
      if (x < videos.length) {
          loopArray(videos);
      }
    });
  }
  loopArray(videos);
}

function findNotExistingVideo(videos)
{
  let i = 0;
  for (let video of videos) {
    if (fs.existsSync(`${downloadFolder}${path.sep}${video.name}.mp4`)) {
      console.log(`File \'${video.name}\' already exists`.blue);
      i++;
    } else {
      break ;
    }
  }
  return i;
}

function downloadOneVideo(video, nextVideo) {
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

const url = 'url';
const dirName = 'dirName';
let flags = { url: ['--url', '-u'], dirName: ['--dir', '-d'] };
const indexUrlFlag = getFlagIndex(flags.url);
const indexDirFlag = getFlagIndex(flags.dirName);

validateParams(flags, indexUrlFlag, indexDirFlag);
printHeader();

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
    downloadVideos(videos);
})
.catch(err => console.log(`${err}`.red));
