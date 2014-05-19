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
      this._reField[1] = /([鄉市鎮區]|群島)/;
      this._reField[2] = /([路街巷村段]|市場)/;
    },
    _fetchData: function(zipFields, cb) {
      var self = this;

      // we would fetch the summary
      zipFields.push(this.summarySuffix);
      
      $.ajax({
        url: this.dataOrigin + zipFields.join('/')
      }).done(function(data) {
        var summary = data.summary;
        summary = self._changeDataToObject(summary);

        if (zipFields.length === 1) {
          self._zipCache = summary;
        }
        else if (zipFields.length === 2) {
          self._zipCache[zipFields[0]] = summary;
        }
        else if (zipFields.length === 3) {
          self._zipCache[zipFields[0]][zipFields[1]] = summary;
        }
        else {
          self._zipCache[zipFields[0]][zipFields[1]][zipFields[2]] = summary;
        }

        cb(summary); 
      });
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
      // add more rules here
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
        if (!this._zipCache[zipFields[0]][zipFields[1]]) {
          return false;
        }
        return this._zipCache[zipFields[0]][zipFields[1]];
      }
      else {
        if (!this._zipCache[zipFields[0]][zipFields[1]][zipFields[2]]) {
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
    search: function(userInput, cb) {
      var zipFields;
      var cacheZip;
      cb = cb || function() {};

      userInput = this._transformCommonWords(userInput);
      zipFields = this._processUserInput(userInput);
      cacheZip = this._inCache(zipFields);

      if (cacheZip) {
        cb(cacheZip);
      }
      else {
        this._fetchData(zipFields, cb);
      }
    }
  };

  // only expose needed methods
  exports.TwZip = TwZip;
}(window));
