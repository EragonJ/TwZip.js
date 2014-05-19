$(document).ready(function() {
  var twZip = new TwZip({
    dataOrigin: './data/db/'
  }); 

  twZip.search('', function(data) {
    console.log(data);
  });

  window.twZip = twZip;
});
