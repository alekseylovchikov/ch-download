'use strict';

const path = require('path');
const fs = require('fs');

function findNotExistingSubtitle(videos, downloadFolder) {
    let i = 0;
    for (let video of videos) {
        const name = video.name.toString().replace(/[^A-Za-zА-Яа-я\d\s]/gmi, '').replace('Урок ', '');
        let filename = `${downloadFolder}${path.sep}${name}.vtt`;
        if (fs.existsSync(filename)) {
            console.log(`File "${name}" already exists`.red);
            i++;
        } else {
            break ;
        }
    }
    return i;
}

module.exports = findNotExistingSubtitle;
