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

  function search(words, nextLayer) {
    twZip.search(words, function(data) {
      var optionDOM;
      var options = [];
      Object.keys(data).forEach(function(key) {
        optionDOM = document.createElement('option');
        optionDOM.textContent = key;
        options.push(optionDOM);
      });

      $('#select' + nextLayer).empty().append(options);
    });
  }

  window.twZip = twZip;
});
