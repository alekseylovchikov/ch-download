const axios = require('axios');

function getToken(e_mail, password) {
  return new Promise((resolve, reject) => {
    axios({
      url: 'https://coursehunters.net/api/auth/login',
      method: 'put',
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      data: JSON.stringify({ e_mail: e_mail, password: password }),
    })
      .then(res => {
        if (res.data.token) resolve(res.headers['set-cookie'][0] + '; accessToken=' + res.data.token);
      })
      .catch(err => reject(err));
  });
};

module.exports = getToken;