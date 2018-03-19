const {readFile} = require('fs');
const {promisify} = require('util');
const request = require('request');

const _readFile = promisify(readFile);

let domains = [];

const requestPromise = (options) => {
  return new Promise((resolve, reject) => {
    request(options, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        console.log(JSON.stringify(res.request.href));
        resolve(res.request.href, body);
      }
      else reject('error: ', err, options);
    })
  })
};
// _readFile('domains.txt')
//   .then(res => {
//     console.log(res);
//   });


async function main() {
  var body = await requestPromise({
    method: 'GET',
    json: true,
    uri: 'https://context.reverso.net'
  });
  console.log('Body:', body);
}
main();
