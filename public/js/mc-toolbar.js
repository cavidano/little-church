
$(document).on('mousemove', function(event){
  var mouse_x = event.pageX;
  var toolbar = $('#milestone-toolbar');

  if (mouse_x < toolbar.width()){
    toolbar.addClass('active');
  } else{
    toolbar.removeClass('active');
  }

});

var toggle_baseline = $('#toggle-baseline');
var toggle_fonts = $('#toggle-font-helpers');

toggle_baseline.click(function() {
  $('#baseline').toggleClass('active');
});

toggle_fonts.click(function() {
  $('h1, h2, h3, h4, h5, p, li').toggleClass('highlight');
});