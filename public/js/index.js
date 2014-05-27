$(document).ready(function() {
  var twZip = new TwZip({
    dataOrigin: './data/db/'
  }); 

  // default
  search('', 1);

  // bind events
  $('#select1').on('change', function() {
    var searchWords = $(this).val();
    search(searchWords, 2); 
  });

  $('#select2').on('change', function() {
    var searchWords = $('#select1').val() + $(this).val();
    search(searchWords, 3); 
  });

  $('#input1').on('change', function() {
    var $select = $('#select4');
    twZip.search($(this).val(), function(data) {
      if (data) {
        var options = [];
        Object.keys(data).forEach(function(key) {
          optionDOM = document.createElement('option');
          optionDOM.textContent = key;
          optionDOM.value = key;
          options.push(optionDOM);
        });
        $select.empty().append(options);
      }
    });
  });

  function search(words, nextLayer) {
    // clean up following fields
    for (var i = nextLayer; i <= 3; i++) {
      $('#select' + i).empty();
    }

    // if there is any dummy words, just early return
    if (words.match('dummy')) {
      return;
    }

    twZip.search(words, function(data) {
      var optionDOM;
      var options = [];
      Object.keys(data).forEach(function(key) {
        optionDOM = document.createElement('option');
        optionDOM.textContent = key;
        optionDOM.value = key;
        options.push(optionDOM);
      });

      if (data) {
        var dummyOption = document.createElement('option');
        dummyOption.textContent = '請選擇';
        dummyOption.value = 'dummy';

        $('#select' + nextLayer)
          .empty()
          .append(dummyOption)
          .append(options);
      }
    });
  }

  window.twZip = twZip;
});
