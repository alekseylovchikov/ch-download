const axios = require('axios');
const request = require('request');
const fs = require('fs');
const progress = require('request-progress');

function auth(e_mail, password) {
	return axios({
		url: 'https://coursehunters.net/api/auth/login',
		method: 'put',
		headers: {
			'content-type': 'application/json',
			'Access-Control-Allow-Origin': '*'
		},
		data: JSON.stringify({
			e_mail: e_mail,
			password: password,
		})
	});
}

module.exports = auth;
