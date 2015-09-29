var request = require('request'),
  cheerio = require('cheerio'),
  fs = require('fs'),
  search = 'growth+hacking',
  url = 'https://www.google.com/search?q=' + search,
  collection = {},
  totalResults = 0,
  resultsDownloaded = 0;

function file() {
  resultsDownloaded++;

  if (resultsDownloaded !== totalResults) {
    return;
  }

  var words = [];

  for (prop in collection) {
    words.push({
      word: prop,
      count: collection[prop]
    });
  }

  words.sort(function(a,b) {
    return b.count - a.count;
  });

  console.log(words.slice(0, 20));
}

var searchFile = fs.readFileSync('words.txt', 'utf8', function(error, data) {
  if (error) {
    return error;
  } else {
    return data;
  }
});

request(url, function(error, response, body) {
  if (error) {
    console.log("Couldn't get page because of error: " + error);
  }

  var $ = cheerio.load(body),
    links = $('.r a');


  links.each(function(i, link) {
    var url = $(link).attr('href');
    url = url.replace('/url?q=', '').split('&')[0];
    if (url.charAt(0) === '/') {
      return;
    }
    totalResults++;

    request(url, function(error, response, body) {
      if (error) {
        console.log("Couldn't get page because of error: " + error);
        return;
      }

      var $page = cheerio.load(body),
        text = $page('body').text();

      text = text
              .replace(/\s+/g, " ")
					    .replace(/[^a-zA-Z ]/g, "")
					    .toLowerCase();

      text.split(' ').forEach(function(word) {
        if (word.length < 4 || word.length > 20) {
          return;
        }
        if (searchFile.indexOf(word) > -1) {
          return;
        }
        if (collection[word]) {
          collection[word]++;
        } else {
          collection[word] = 1;
        }
      });
      file();
    });
  });
});
