const request = require('request').defaults({maxRedirects:100});
const iconv = require('iconv-lite');

require('events').EventEmitter.prototype._maxListeners = 100;

request({
  method: 'GET',
  encoding: null,
  headers : {
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/64.0.3282.167 Chrome/64.0.3282.167 Safari/537.36'
  },
  uri: 'https://zoo.utkonos.ru'
}, (err, res, body) => {
  if (!err && res.statusCode === 200) {
    // body = iconv.decode(body, 'win1251');
    console.log(body);
  }
  else console.log('error: ', err);
});

