/*
 * TwZip.js - A jQuery plugin that can help you search Taiwan Zipcode without
 * backend support. All you have to do is setup the basic environment for
 * generated json files and that's it !
 *
 * Author: EragonJ <eragonj@eragonj.me>
 * Blog: http://eragonj.me
 *
 * @preseve
 */
(function(exports) {
  'use strict';

  if (exports.TwZip) {
    return;
  }

  var TwZip = function(userOptions) {
    this.dataOrigin = userOptions.dataOrigin;
    this.summarySuffix = 'summary.json';
    this._init();
  };

  TwZip.prototype = {
    _init: function() {
      this._zipCache = {};
      this._reField = [];
      this._reField[0] = /[縣市島台]/;
      this._reField[1] = /([鄉市鎮區台]|群島)/;
      this._reField[2] = /([路街巷村段台]|市場)/;
    },
    _fetchData: function(zipFields) {
      // path will become something like :
      //   server/台北市/信義區/信義路/summary.json
      //   server/台北市/信義區/summary.json
      //   server/台北市/summary.json
      //   server/summary.json
      var zipFields = zipFields.slice(0);
      zipFields.push(this.summarySuffix);

      var path = this.dataOrigin + zipFields.join('/');
      var deferred = $.getJSON(path);
      return deferred;
    },
    /*
     *  We would try to tokenize userInput to get fields.
     */
    _getZipFields: function(userInput, layer, _cachedArray) {
      if (!layer) {
        layer = 0;
      }
      else if (layer >= 3) {
        // we only process 3 layers right now
        return _cachedArray;
      }

      if (!_cachedArray) {
        _cachedArray = [];
      }

      var otherField;
      var matchedField;
      var matchedIndex = userInput.search(this._reField[layer]);

      // found something
      if (matchedIndex !== -1) {
        matchedField = userInput.substring(0, matchedIndex + 1);
        otherField = userInput.substring(matchedIndex + 1);

        // keep the field in the cachedArray
        _cachedArray.push(matchedField);
        return this._getZipFields(otherField, layer + 1, _cachedArray);
      }
      else {
        // can't find anything more, just return
        return _cachedArray;
      }
    },
    _transformCommonWords: function(words) {
      // we won't do anything to words in blacklist
      var reBlacklist = /(釣魚台)/g;
      if (words.match(reBlacklist)) {
        return words;
      }

      // process other words
      words = words.replace(/台/g, '臺');
      return words;
    },
    _getCache: function(zipFields) {
      if (zipFields.length === 0) {
        if ($.isEmptyObject(this._zipCache)) {
          return false;
        }
        return this._zipCache;
      }
      else if (zipFields.length === 1) {
        if (!this._zipCache[zipFields[0]]) {
          return false;
        }
        return this._zipCache[zipFields[0]];
      }
      else if (zipFields.length === 2) {
        if (!this._zipCache[zipFields[0]] ||
          !this._zipCache[zipFields[0]][zipFields[1]]) {
            return false;
        }
        return this._zipCache[zipFields[0]][zipFields[1]];
      }
      else {
        if (!this._zipCache[zipFields[0]] ||
          !this._zipCache[zipFields[0]][zipFields[1]] ||
          !this._zipCache[zipFields[0]][zipFields[1]][zipFields[2]]) {
          return false;
        }
        return this._zipCache[zipFields[0]][zipFields[1]][zipFields[2]];
      }
    },
    _changeDataToObject: function(summary) {
      var obj = {};
      summary.forEach(function(key) {
        obj[key] = false;
      });
      return obj;
    },
    _storeSummaryIntoCache: function(zipFields, data) {
      var summary = data.summary;

      // If the data is from server, then we have to transform the
      // type of data.
      if ($.isArray(summary)) {
        summary = this._changeDataToObject(summary);
      }

      // []
      if (zipFields.length === 0) {
        this._zipCache = summary;
      }
      // ['台北市']
      else if (zipFields.length === 1) {
        this._zipCache[zipFields[0]] = summary;
      }
      // ['台北市', '信義區']
      else if (zipFields.length === 2) {
        this._zipCache[zipFields[0]][zipFields[1]] = summary;
      }
      // ['台北市', '信義區', '信義路']
      else if (zipFields.length === 3) {
        this._zipCache[zipFields[0]][zipFields[1]][zipFields[2]] = summary;
      }
    },
    search: function(userInput, cb) {
      var zipFields;
      var cacheZip;
      var self;
      var deferredList = [];
      var partOfZipcode;
      var partOfZipcodeList = [];
      cb = cb || function() {};

      userInput = this._transformCommonWords(userInput);
      zipFields = this._getZipFields(userInput);

      // twZip.search('');
      if (zipFields.length === 0) {
        partOfZipcode = [];
        partOfZipcodeList.push(partOfZipcode);

        if (!this._getCache(partOfZipcode)) {
          var deferred = this._fetchData(partOfZipcode);
          deferredList.push(deferred);
        }
      }
      // twZip.search('台北市信義區信義路')
      else {
        for (var i = 0; i < zipFields.length; i++) {
          // ['台北市', '信義區', '信義路'] would be
          // ['台北市']
          // ['台北市', '信義區']
          // ['台北市', '信義區', '信義路']
          partOfZipcode = zipFields.slice(0, i + 1);
          partOfZipcodeList.push(partOfZipcode);

          var deferred;
          var cache = this._getCache(partOfZipcode);

          if (!cache) {
            deferred = this._fetchData(partOfZipcode);
          }
          else {
            // If the data has been stored in our cache, we will just fetch it
            // out and keep in a deferred object to make the interface
            // consistent.
            deferred = $.Deferred();
            deferred.resolve({
              summary: cache  
            });
          }
          deferredList.push(deferred);
        }
      }

      if (deferredList.length > 0) {
        var defer = $.when.apply($, deferredList);
        defer.done(function() {
          // there are two differnt behaviors to `done` method
          if (deferredList.length === 1) {
            this._storeSummaryIntoCache(partOfZipcodeList[0],
              arguments[0]);
          }
          else {
            $.each(arguments, function(index, eachRequest) {
              if (eachRequest && eachRequest[0]) {
                this._storeSummaryIntoCache(partOfZipcodeList[index],
                  eachRequest[0]);
              }
            }.bind(this));
          }
          cb(this._getCache(zipFields));
        }.bind(this));
      }
      else {
        cb(this._getCache(zipFields));
      }
    }
  };

  // only expose needed methods
  exports.TwZip = TwZip;
}(window));
