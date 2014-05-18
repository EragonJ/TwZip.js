var fs = require('fs');
var path = require('path');
var lineReader = require('line-reader');
var rimraf = require('rimraf');

var baseFolder = path.join(__dirname, 'data', 'db');
var zipFile = path.resolve(__dirname, 'data', 'original', 'twZip.10303.csv');
var hash = {};
var DEBUG = false;

// cleanup first
if (fs.existsSync(baseFolder)) {
  rimraf.sync(baseFolder);
}

// then create
fs.mkdirSync(baseFolder);

// read all lines:
lineReader.eachLine(zipFile, function(line) {
  var c = line.split(',');

  // {
  //   '臺北市': true,
  //   '臺中市': true,
  //   ...
  // }
  if (!hash[c[1]]) {
    hash[c[1]] = {};
  }

  if (!hash[c[1]][c[2]]) {
    hash[c[1]][c[2]] = {};
  }

  if (!hash[c[1]][c[2]][c[3]]) {
    hash[c[1]][c[2]][c[3]] = [];
  }
  
  hash[c[1]][c[2]][c[3]].push(line);

  // {
  //   '臺北市': {
  //     '中正區': true,
  //     '大同區': true,
  //     ...
  //   },
  //   '臺中市': {
  //     ...
  //   }
  // }
}).then(function () {

  // creat all city folders
  var cityNames = Object.keys(hash);

  // create a summary of all cities
  fs.writeFileSync(path.join(baseFolder, 'summary.json'),
    JSON.stringify({
      summary: cityNames
  }));

  cityNames.forEach(function(cityName) {

    var strictNames = Object.keys(hash[cityName]);
    var cityFolderPath = path.join(baseFolder, cityName);

    if (!DEBUG) {
      fs.mkdirSync(cityFolderPath);
      fs.writeFileSync(path.join(cityFolderPath, 'summary.json'),
        JSON.stringify({
          summary: strictNames
      }));
    }

    // create all strict folders
    strictNames.forEach(function(strictName) {
      var roadNames = Object.keys(hash[cityName][strictName]);
      var strictFolderPath = path.join(baseFolder, cityName, strictName);

      if (!DEBUG) {
        fs.mkdirSync(strictFolderPath);
        fs.writeFileSync(path.join(strictFolderPath, 'summary.json'),
          JSON.stringify({
            summary: roadNames
        }));
      }

      // create all road folders
      roadNames.forEach(function(roadName) {
        var roadFolderPath = path.join(
          baseFolder, cityName, strictName, roadName);

        // TODO
        // let's process this part for future use
        if (!DEBUG) {
          fs.mkdirSync(roadFolderPath);
          fs.writeFileSync(path.join(roadFolderPath, 'summary.json'),
            JSON.stringify({
              summary: hash[cityName][strictName][roadName]
          }));
        }
      });
    });
  });
});
