const request = require('request');
const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const download = require('download');
const path = require('path');

// fs.mkdirSync('./output');
// console.log('make dir output');
// result.map((video, index) => {
//     download(video).then(data => {
//         console.log(`download file ${video} done!`);
//         if (index < 10) {
//             index = `0${index}`;
//         }
//         fs.writeFileSync(`output/${index}.mp4`, data);  
//     });
// });

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
                    download(video.url).then(result => {
                        console.log(`download file ${video.name} done!`);
                        fs.writeFileSync(`output/${video.name}.mp4`, result);  
                    });
                });
            })
            .catch(err => console.log(err));
    }
});