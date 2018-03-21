const colors = require('colors');
const request = require('request');
const {promisify} = require('util');
const iconv = require('iconv-lite');
const parser = require("fast-html-parser");
let {readFile, writeFile, existsSync, mkdirSync} = require('fs');

writeFile = promisify(writeFile);
readFile = promisify(readFile);

const _readFile = name => readFile(name + '.txt', {encoding: 'utf8'});
const fileToArray = name => readFile(name + '.txt', {encoding: 'utf8'}).then(res => res.replace(/\|/g, '').split('\n').map(el => el.trim()));
const requestPromise = (options, encoding) => {
  return new Promise((resolve, reject) => {
    request(options, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        if(encoding) body = iconv.decode(body, 'win1251');
        resolve({href: res.request.href, body: body});
      }
      else reject(`error: ${err}, ${res && res.statusCode ? `statusCode: ${res.statusCode}` : ''}`);
    })
  })
};
let domainsAll = [], ignore = [], checkCounter = 0,
  domains = new Set(), siteNow = '';

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
    if (i === domainsAll.length - 1) console.log(`size: ${domains.size}, time: ${+new Date() - t1}`.bgGreen);
  });
};
const writeKeywords = async (domain, href, data) => {
  const dir = './sites';

  if (!existsSync(dir)) mkdirSync(dir);
  await writeFile(`${dir}/${(domain)}.txt`, `${href} ${[...data].join(' ')}`);
};

const checkKey = async (url, encoding) => {
  console.log(`checkKey: ${url}`.bgBlue);
  checkCounter++;
  let encodingNext;
  try {
    let {href, body} = await requestPromise({
      method: 'GET',
      encoding: (encoding ? null : 'utf8'),
      headers : {
        'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/64.0.3282.167 Chrome/64.0.3282.167 Safari/537.36'
      },
      uri: 'http://' + url
    }, !!encoding);
    const document = parser.parse(body);
    let keywords = [];
    ['meta', 'h1', 'h2', 'h3', 'title'].forEach(e => {
      keywords.push([...document.querySelectorAll(e)].map((el) => {
        return (e === 'meta' && el.rawAttrs.includes('keywords') && el.rawAttrs.split(/.*content=\\?('|")/)[1]) || el.structuredText ?
          (e === 'meta' ? el.rawAttrs.split(/.*content=\\?('|")/)[1].split(/\\?('|")/)[0] : el.structuredText) : ''
      }).join(' '));
    }, 0);
    const keywordsArray = keywords
      .map(el => el.split(/[,.; \n\t\s]/).filter(el => !!el.trim()))
      .join(',')
      .toLowerCase()
      .split(',')
      .filter(el => !!el.trim()
      );
    let keySet = new Set(keywordsArray.filter(el => el.match(/[a-zA-Zа-яА-я]/)));
    console.log(`keywords: ${keywordsArray.length}, keySet: ${keySet.size}`.bgCyan);
    console.log(`${href}`.green);
    console.log(`${[...keySet]}`.cyan);

    if(keySet.size * 10 > keywordsArray.length || siteNow === url) {
      if (!!keySet.size) {
        await writeKeywords(url, href, keySet);
        // const fileContent = await _readFile(`./sites/${(url)}`);
        // console.log(`${fileContent}`.blue);
      }
      console.log(keywords);
    } else {
      siteNow = url;
      checkCounter--;
      encodingNext = true
    }
  }
  catch (err) {
    console.log(`${url} ${err}`.bgRed)
  }
  console.log(`count: ${checkCounter}, domains size: ${domains.size}`.yellow);
  if (checkCounter < domains.size) checkKey([...domains][checkCounter], encodingNext)
};

try {
  readAndVariableFile()
    .then(() => checkKey([...domains][0]))
    .catch(err => console.log(`try -> catch ${err}`.bgRed))
}
catch (error) {
  console.log(`1 ${error}`.bgRed);
}
