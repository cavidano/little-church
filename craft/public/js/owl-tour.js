$(window).load(function () {

  $('#project-tour .owl-carousel > div').each(function(){
    $('.dots').append('<li><span></span></li>');
  });

  var owl = $('#project-tour .owl-carousel');

  owl.owlCarousel({
    items: 1,
    loop: true,
    autoheight: true,
    responsiveRefreshRate: 100,
    dotsContainer: '.dots',
  });

  $('#tour-dots > li').click(function () {
      owl.trigger('to.owl.carousel', [$(this).index(), 300]);
  });

  $('.dots > li').click(function () {
      owl.trigger('to.owl.carousel', [$(this).index(), 300]);
  });

  $('.previous-next > .previous').click(function() {
      owl.trigger('prev.owl.carousel');
  });
  
  $('.previous-next > .next').click(function() {
      owl.trigger('next.owl.carousel');
  });

});

