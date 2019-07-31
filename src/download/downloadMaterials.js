'use strict';

const fs = require('fs');
const path = require('path');
const progress = require('request-progress');
const request = require('request');

const cleanLine = require('src/download/cleanLine');
const writeWaitingInfo = require('src/download/writeWaitingInfo');

function downloadMaterials(urlMaterials, downloadFolder) {
    let materialsName = urlMaterials.split('/');
    materialsName = materialsName[materialsName.length - 1];
    console.log(`Start download materials: ${materialsName}`.blue);
    progress(request(encodeURI(urlMaterials)), { throttle: 2000, delay: 1000 })
        .on('progress', function(state) {
            writeWaitingInfo(state);
        })
        .on('error', function(err) {
            console.log(`${err}`.red);
        })
        .on('end', function() {
            cleanLine();
            console.log(`End download materials - ${materialsName}`.green);
        })
        .pipe(fs.createWriteStream(`${downloadFolder}${path.sep}${materialsName}`));
}

module.exports = downloadMaterials;
