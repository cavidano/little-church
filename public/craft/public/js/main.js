/* Inline SVG with PNG backup */

var svgeezy;
svgeezy.init(false, 'png');

/* Sub nav hovers */

var header_drop_downs = $('header ul.main-navigation > li');
var menu_off_canvas = $('#menu-off-canvas');

var dynamicAccs = $('#menu-off-canvas');

var menuToggle = function(e){

  e.stopPropagation();

  var icon = $('#toggle-menu span.fa');

  icon.toggleClass('fa-bars fa-times');

  menu_off_canvas.toggleClass('active');
  $('#wrap').toggleClass('active'); 

};

$('#toggle-menu').click(menuToggle);

$('#wrap').click(function(n){
  if ($(this).hasClass('active')){
    menuToggle(n);
    $('#toggle-menu > a').removeClass('active');  
  }
});

function sub_nav_hover_on(){
  if($(this).find('ul.sub').length) {
    $(this).find('ul.sub').addClass('active');
  } else{
    return;
  }
}
 
function sub_nav_hover_off() {
  if($(this).find('ul.sub').length) {
    $(this).find('ul.sub').removeClass('active');
  } else{
    return;
  }
}

header_drop_downs.hoverIntent({
  over: sub_nav_hover_on,
  out: sub_nav_hover_off,
  timeout: 300
});

/* Accordions */

var accGroup = dynamicAccs.find('nav > ul > li').has('ul');
var accGroup_button = accGroup.has('ul').children('a');

accGroup.addClass('accordion');
accGroup.children('ul').addClass('acc-panel');
accGroup.children().removeClass('active');

accGroup_button.each(function(){

  $(this).addClass('acc-button');
  
  if ($(this).hasClass('active')) {
    $(this).append('<span class="fa fa-chevron-up"></span>' );  
  } else {
    $(this).append('<span class="fa fa-chevron-down"></span>' );  
  }
});

function init_accordions(){  

  $('.acc-button:not(.inactive), .toggle').click(function(e){
    
    e.preventDefault();

    var button = $(this);

    var icon = $(button).find('.fa');

    var otherButtons = $('.accordion').find('.acc-button.active').not(button); 

    var otherIcons = $(otherButtons).find('.fa');

    otherButtons.removeClass('active');
    $(this).toggleClass('active');

    icon.toggleClass('fa-chevron-up fa-chevron-down');
    otherIcons.removeClass('fa-chevron-up fa-chevron-down').addClass('fa-chevron-down');

    otherButtons.next().slideUp('fast');
    button.next('.acc-panel').slideToggle('fast', function() {
      // Animation complete.
    });
  });
}

/* Smart Resize */

(function($, sr){

  var debounce = function (func, threshold, execAsap) {
      var timeout;

      return function debounced () {
          var obj = this, args = arguments;
          function delayed () {
              if (!execAsap){
                func.apply(obj, args);
              }
              timeout = null;
          }

          if (timeout){
              clearTimeout(timeout);
          } else if (execAsap){
              func.apply(obj, args);
          }
          timeout = setTimeout(delayed, threshold || 100);
      };
  };

  $.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})($,'smartresize');

$(window).smartresize(function(){
  $('.dd-menu').trigger('update');
});

/* Owl Carousel */

$(window).load(function () {

  var marquee = $('.marquee.owl-carousel');

  $('.marquee.owl-carousel > div').each(function(){
    $('.dots').append('<li><span></span></li>');
  });

  marquee.owlCarousel({
    items: 1,
    responsiveRefreshRate: 100,
    dotsContainer: '.dots',
    callbacks: true,
  });

  $('.dots > li').click(function () {
    marquee.trigger('to.owl.carousel', [$(this).index(), 300]);
  });

  // Virtual Tour
  
  var virtual_tour = $('#virtual-tour > div.owl-carousel');

  $('#virtual-tour div.owl-carousel > div').each(function() {
    var index = $(this).index() + 1;
    $('.numbers').append('<li><a href="#">' + index + '</a></li>');
  });

  virtual_tour.on('initialized.owl.carousel changed.owl.carousel', function(e) {
    if (!e.namespace){ return; }
    var carousel = e.relatedTarget;
    $('ul.counter > li > span').html(carousel.relative(carousel.current()) + 1 + '&nbsp;of&nbsp;' + carousel.items().length);
  }).owlCarousel({
    items: 1,
    responsiveRefreshRate: 100,
    dotsContainer: '.numbers',
    callbacks: true,
    loop: true
  });

  $('.numbers > li').click(function (e) {
    e.preventDefault();
    virtual_tour.trigger('to.owl.carousel', [$(this).index(), 300]);
  });

  $('#pagination .previous').click(function() {
      virtual_tour.trigger('prev.owl.carousel');
  });
  
  $('#pagination .next').click(function() {
      virtual_tour.trigger('next.owl.carousel');
  });

});

$(window).ready(function () {

  // Remove mpty <p> tags :(
  $('p').filter(function () { return this.innerHTML === ""; }).remove();

  init_accordions();

  $('.dd-menu').customSelect();

  $('.keep-rhythm').keepTheRhythm({
    verticalAlignment: 'top',
    spacing: 'padding',
    baseLine: 12 // $base-line-height OR $base-line-height / 2 
  });

  // Magnific Popups

  var standardOptions = { 
    closeOnContentClick: false,
    preloader: true,
    callbacks: {
      open: function() {
        $('html').addClass('popup-active');
      },
      close: function() {
        $('html').removeClass('popup-active');
      },
      ajaxContentAdded: function() { }
    } 
  };

  $('a.gallery').on('click', function () {
    
    var items = [];
    $($(this).attr('href')).find('div').each(function() {
      items.push( {
        src: $(this) 
      } );
    });
      
    $.magnificPopup.open($.extend({}, standardOptions, {
      type:'inline',
      items:items,
      
      gallery: {
        enabled: true 
      },

      image: {
        titleSrc: function(items) {
          return items.attr('alt').text();
        }
      }

    }));
  });

  $('a.ajax').magnificPopup($.extend({}, standardOptions, {
      type: 'ajax',
      overflowY: 'auto',
      closeBtnInside: true
  }));

  $('a:has(span.fa-search-plus)').magnificPopup($.extend({}, standardOptions, {
    type: 'image',
    overflowY: 'auto',
    
    gallery:{
      enabled:true
    }
  }));

  $('#menu-off-canvas .main-navigation > li.selected > ul.sub').show();
  $('#menu-off-canvas .main-navigation > li.selected').find('.fa-chevron-down').toggleClass('fa-chevron-down fa-chevron-up');

});

/* Buttons */

$('.top').click(function(){
    $('html, body').animate({ scrollTop: 0 }, 1000);
    return false;
});

$('button.disabled, a[href="#"]').click(function(e) {
  e.preventDefault();
});

$('a[rel="_blank"]').each(function(){
  $(this).attr('target', '_blank');
});


$(document).ready(function() {

    $("#newsletter-form").validate({

        rules: {
            email: {
                required: true,
                email: true
            }
        },

        highlight: function(element) {
            $(element).closest('div').removeClass('success').addClass('error');
        },

        success: function(element) {
            $(element).closest('div').removeClass('error');
            $(element).remove();
        },

        submitHandler: function(form){

            $.ajax({
                url : '/php/newsletter-handler.php',
                type : 'post',
                data: $(form).serialize(),

                success : function() {
                    $('button[type=submit]').addClass('disabled');
                    $('input[name=email]').val('Thanks for signing up!');

                    $('button.disabled').click(function(e) {
                      e.preventDefault();
                    });
                }

            });

            return false;
        }

    }); // end validation

});