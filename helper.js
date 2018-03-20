const request = require('request');

request({
  method: 'GET',
  headers : {
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/64.0.3282.167 Chrome/64.0.3282.167 Safari/537.36'
  },
  uri: 'http://' + 'ньютон74.рф'
}, (err, res, body) => {
  if (!err && res.statusCode === 200) {
    console.log({href: res.request.href});
  }
  else console.log('error: ', err);
})

