const {promisify} = require('util');
const request = require('request');
const parser = require("fast-html-parser");
const colors = require('colors');
let {readFile, writeFile} = require('fs');

writeFile = promisify(writeFile);

const _readFile = name => promisify(readFile)(name + '.txt', {encoding: 'utf8'});
const fileToArray = name => promisify(readFile)(name + '.txt', {encoding: 'utf8'}).then(res => res.replace(/\|/g, '').split('\n').map(el => el.trim()));
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
let domainsAll = [], ignore = [], keys = [], checkCounter = 0,
  domains = new Set();

let t1 = +new Date();
const readAndVariableFile = async () => {
  domainsAll = await fileToArray('domains');
  ignore = await fileToArray('ignore');

  domainsAll.forEach((el, i) => {
    let elSplit = el.split('.');

    if (!ignore.includes(elSplit[elSplit.length - 2] + '.' + elSplit[elSplit.length - 1])) {
      while (elSplit.length > 1) {
        domains.add(elSplit.join('.'));
        elSplit.shift();
      }
    }
    if (i === domainsAll.length - 1) console.log(`${[...domains]}`.yellow, `${+new Date() - t1}`.blue);
  });
};
const writeKeywords = async (domain, data) => {
  try {
    await writeFile(`./sites/${encodeURIComponent(domain)}.txt`, [...data].join(' '));
  }
  catch (err) {
    console.log(err.red)
  }
};

const checkKey = async url => {
  console.log(`checkKey, ${url}`.bgYellow);
  checkCounter++;
  try {
    let {href, body} = await requestPromise({
      method: 'GET',
      headers : {
        'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/64.0.3282.167 Chrome/64.0.3282.167 Safari/537.36'
      },
      uri: 'http://' + url
    });
    const document = parser.parse(body);
    let keywords = [];
    ['meta', 'h1', 'h2', 'h3', 'title'].forEach(e => {
      keywords.push([...document.querySelectorAll(e)].map((el) => {
        return (e === 'meta' && el.rawAttrs.includes('keywords') && el.rawAttrs.split(/.*content=\\?('|")/)[1]) || el.structuredText ?
          (e === 'meta' ? el.rawAttrs.split(/.*content=\\?('|")/)[1].split(/\\?('|")/)[0] : el.structuredText) : ''
      }).join(' '));
    });
    let keySet = new Set(
      keywords
        .map(el => el.split(/[,.; \n\t\s]/).filter(el => !!el.trim()))
        .join(',')
        .toLowerCase()
        .split(',')
        .filter(el => !!el.trim() && el.match(/[a-zA-Zа-яА-я]/)));
    console.log(`${href}`.green);
    console.log(`${[...keySet]}`.cyan);
    if(!!keySet.size) await writeKeywords(href, keySet);

    const fileContent = await _readFile(`./sites/${encodeURIComponent(href)}`);
    console.log(`${fileContent}`.blue);

    console.log(keywords);

  }
  catch (err) {
    console.log(`11111 ${url}`.blue, `${err}`.red)
  }
  console.log(checkCounter, domains.size);
  if (checkCounter < domains.size) checkKey([...domains][checkCounter])
};

try {
  readAndVariableFile()
    .then(() => {
      checkKey([...domains][0]);
    })
    .catch(err => console.log('catch', err))
}
catch (error) {
  console.log(error);
}
