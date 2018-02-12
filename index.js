'use strict';

const axios = require('axios');
const progress = require('request-progress');
const request = require('request');
const https = require('https');
const fs = require('fs');
const path = require('path');
//
const auth = require('./src/auth');
const start = require('./src/start');
const startMessages = require('./src/startMessages');

startMessages();

const logger = fs.createWriteStream('videos.txt', { flags: 'a' });
console.log('Create videos.txt file'.blue);

const email = process.argv.indexOf('-e');
const password = process.argv.indexOf('-p');

if (email > -1 && password > -1) {
	const e = process.argv[email + 1];
	const p = process.argv[password + 1];
	if (e && p) {
		auth(e, p)
			.then(res => {
				if (res.data.token) {
					const cookie = request.cookie('accessToken=' + res.data.token);
					start(cookie);
				}
			})
			.catch(err => console.log(err));
	} else {
		start('');
	}
} else {
	start('');
}
