/* Filter */

function initialFilter() {

  var items = $('.events-filter li'),
      item = items.first();

  filter(item);

  items.click(function(){ filter($(this)); })

}

function rememberFilter() {

  var item = $('.events-filter li.active');

  filter(item);

}

function filter(item) {
  
  var group = item.data('group'),
      items = $('.events-filter li'),
      otherItems = items.not(item),
      events = $('.event-item[data-group=' + group + ']'),
      otherEvents = $('.event-item').not(events);

  otherItems.removeClass('active');
  item.addClass('active');

  events.show();
  otherEvents.hide();

};

$(document).ready(function(){ initialFilter(); });













