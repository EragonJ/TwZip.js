/*
 * var twZip = new TwZip({
 *   dataOrigin: 'local|http://xxx.xxx.xx',
 * });
 *
 * TwZip.search('臺北市', function(data) {});
 *
 * Without data:
 * {
 *   summary: []
 * }
 *
 * With data:
 * {
 *   "summary":[
 *     "中正區",
 *     "大同區",
 *     "中山區",
 *     "松山區",
 *     "大安區",
 *     "萬華區",
 *     "信義區",
 *     "士林區",
 *     "北投區",
 *     "內湖區",
 *     "南港區",
 *     "文山區"
 *   ]
 * }
 *
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

      this._reField = {};
      this._reField[0] = /[縣市島台]/;
      this._reField[1] = /([鄉市鎮區台]|群島)/;
      this._reField[2] = /([路街巷村段台]|市場)/;
    },
    _fetchData: function(zipFields) {
      var self = this;

      // we would fetch the summary
      zipFields.push(this.summarySuffix);

      var deferred = $.getJSON(this.dataOrigin + zipFields.join('/'));
      return deferred;
    },
    /*
     *  We would try to tokenize userInput to get fields.
     */
    _processUserInput: function(userInput, layer, _cachedArray) {
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
        return this._processUserInput(otherField, layer + 1, _cachedArray);
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
    _inCache: function(zipFields) {
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
      summary = this._changeDataToObject(summary);

      console.log(zipFields);
      if (zipFields.length === 0) {
        this._zipCache = summary;
      }
      else if (zipFields.length === 1) {
        this._zipCache = summary;
      }
      else if (zipFields.length === 2) {
        this._zipCache[zipFields[0]] = summary;
      }
      else if (zipFields.length === 3) {
        this._zipCache[zipFields[0]][zipFields[1]] = summary;
      }
      else {
        this._zipCache[zipFields[0]][zipFields[1]][zipFields[2]] = summary;
      }
    },
    search: function(userInput, cb) {
      var zipFields;
      var cacheZip;
      var self;
      var deferredList = [];
      var partOfZipcodeList = [];
      cb = cb || function() {};

      userInput = this._transformCommonWords(userInput);
      zipFields = this._processUserInput(userInput);

      // twZip.search('');
      if (zipFields.length === 0) {
        if (!this._inCache([])) {
          var deferred = this._fetchData([]);
          deferredList.push(deferred);
          partOfZipcodeList.push([]);
        }
      }
      // twZip.search('台北市信義區信義路')
      else {
        for (var i = 0; i < zipFields.length; i++) {
          // ['台北市', '信義區', '信義路'] would be
          // ['台北市']
          // ['台北市', '信義區']
          // ['台北市', '信義區', '信義路']
          var partOfZipcode = zipFields.slice(0, i + 1);
          partOfZipcodeList.push(partOfZipcode);

          if (!this._inCache(partOfZipcode)) {
            var deferred = this._fetchData(partOfZipcode);
            deferredList.push(deferred);
          }
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
          cb(this._inCache(zipFields));
        }.bind(this));
      }
      else {
        cb(this._inCache(zipFields));
      }
    }
  };

  // only expose needed methods
  exports.TwZip = TwZip;
}(window));
