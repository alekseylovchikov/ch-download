const request = require('request');
const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const download = require('download');
const path = require('path');
const progress = require('request-progress');
const colors = require('colors');

console.log('#############################'.bgWhite.black);
console.log('### CH DOWNLOADER 0.0.1   ###'.bgWhite.black);
console.log('### this is alpha version ###'.toUpperCase().bgWhite.black);
console.log('#############################\n'.bgWhite.black);

function getVideos(url) {
    return new Promise(function(resolve, reject) {
        let result = [];
        let names = [];
        request(url, function(err, res, html) {
            if(!err) {
                let $ = cheerio.load(html);
                $('#lessons-list').filter(function() {
                    let data = $(this);
                    const dataArray = data.children().children().toArray();
                    const filterData = dataArray.filter(el => el.name === 'link' && el.attribs.itemprop === 'contentUrl');
                    const filterSpan = dataArray.filter(el => el.name === 'span');
                    filterSpan.map(el => {
                        if (el.name === 'span') {
                            names.push(el.children[0].data);
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

process.argv.forEach(function (val, index, array) {
    let videos = [];
    if (index === 2) {
        getVideos(val)
            .then(data => {
                data.result.map((url, index) => {
                    videos.push({ url, name: data.names[index] });
                });
                console.log('Start download video, please wait...');
                videos.map(video => {
                    progress(request(video.url), { throttle: 2000, delay: 1000 })
                        .on('progress', function(state) {
                            console.log(`\nDownload video: ${video.name}...`.blue);
                            console.log('Progress:', `${state.percent}\n`.blue);
                        })
                        .on('error', function(err) {
                            console.log(`${err}`.red);
                        })
                        .on('end', function () {
                            console.log(`Video ${video.name} downloaded!`.green);
                        })
                        .pipe(fs.createWriteStream(`${video.name}.mp4`));
                });
            })
            .catch(err => console.log(`${err}`.red));
    }
});