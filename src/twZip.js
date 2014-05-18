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
    this.options = $.extend(userOptions, {
      dataOrigin: 'local'
    });

    this._init();
  };

  TwZip.prototype = {
    _init: function() {
      this._reField = {};
      this._reField[0] = /[縣市島台]/;
      this._reField[1] = /([鄉市鎮區]|群島)/;
      this._reField[2] = /([路街巷村段]|市場)/;
    },
    _fetchData: function(cb) {
      $.ajax(this.dataOrigin).done(cb);
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
    search: function(userInput, cb) {
      var processedUserInput = this._processUserInput(userInput);
      this._fetchData(cb);
    }
  };

  // only expose needed methods
  exports.TwZip = TwZip;
}(window));
