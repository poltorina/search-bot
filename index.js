const {readFile} = require('fs');
const {promisify} = require('util');
const request = require('request');
const parser = require("fast-html-parser")

const fileToArray = name => promisify(readFile)(name + '.txt', {encoding: 'utf8'}).then(res => res.trim().split('\n'));
const requestPromise = options => {
  return new Promise((resolve, reject) => {
    request(options, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        resolve({href: res.request.href, body: body});
      }
      else reject('error: ', err, options);
    })
  })
};
let domainsAll = [], keys = [], ignore = [],
  domains = new Set(), result = new Map();

let t1 = +new Date();
const readAndVariableFile = async () => {
  domainsAll = await fileToArray('domains');
  keys = await fileToArray('keys');
  ignore = await fileToArray('ignore');

  domainsAll.forEach((el, i) => {
    let elSplit = el.split('.');

    if (!ignore.includes(elSplit[elSplit.length - 2] + '.' + elSplit[elSplit.length - 1])) {
      while (elSplit.length > 1) {
        domains.add(elSplit.join('.'));
        elSplit.shift();
      }
    }
    if (i === 958319) {
      console.log(domains);
      console.log(+new Date() - t1);
    }
  });
};

const checkKey = async url => {
  let {href, body} = await requestPromise({
    method: 'GET',
    json: true,
    uri: 'http://' + url
  });
  const document = parser.parse(body);

  keys.forEach(el => {
    if(document.structuredText.includes(el)) console.log(href, el);
  })

};

try {
  readAndVariableFile()
    .then(() => {
      domains.forEach(el => checkKey(el));
    })
    .catch(err => console.log('catch', err))
}
catch (error) {
  console.log(error);
}


