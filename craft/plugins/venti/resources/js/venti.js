'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
    // allow for custom events.
    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;

    Object.defineProperty(Object.prototype, "indexOfKey", {
        value: function value(_value) {
            var i = 1;
            for (var key in this) {
                if (key == _value) {
                    return i;
                }
                i++;
            }
            return undefined;
        }
    });

    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    $.fn.removeStyle = function () {
        var rootStyle = document.documentElement.style;
        var remover = rootStyle.removeProperty // modern browser
        || rootStyle.removeAttribute; // old browser (ie 6-8)
        return function removeInlineCss(property) {
            if (property == null) return this.removeAttr('style');
            var proporties = property.split(/\s+/);
            return this.each(function () {
                for (var i = 0; i < proporties.length; i++) {
                    remover.call(this.style, proporties[i]);
                }
            });
        };
    }();

    // Set Venti as window object.
    window.Venti = {};
    $.extend(Venti, {});
})();

/**
 * Venti Calendar Class
 */

var VentiEvents = function () {
    function VentiEvents(options) {
        _classCallCheck(this, VentiEvents);

        this.sourceEvents();
    }

    _createClass(VentiEvents, [{
        key: 'sourceEvents',
        value: function sourceEvents() {
            var $this = this;
            var button = document.querySelectorAll('a.btn.submit.add.icon')[0];
            var items = document.querySelectorAll('.sidebar li');
            for (var i = 0; i < items.length; i++) {
                items[i].addEventListener('click', function (evt) {
                    var anchor = evt.target;
                    var group = "";
                    if (anchor.tagName === "A") {
                        group = anchor.dataset.handle;
                    } else if (anchor.tagName === "SPAN") {
                        group = anchor.parentNode.dataset.handle;
                    }
                    var href = '/venti/' + group + '/new';
                    button.href = encodeURI(href);
                });
            }
        }
    }]);

    return VentiEvents;
}();

/**
 * Venti Input Class
 */

var VentiInput = function () {
    function VentiInput(options) {
        _classCallCheck(this, VentiInput);

        this._id = options.id;
        this._input = document.getElementById(options.id);
        this._defaultEventDuration = this._input.dataset['defaultEventDuration'], this._groupMenu = null, this._storedDates = {
            state: false,
            startTime: '',
            endTime: ''
        };
        // Inlining modal for action html
        if (options.inline) {
            this.loadInline(options, this);
        } else {
            this.loadModal(options, this);
        }
    }

    _createClass(VentiInput, [{
        key: 'initEvents',
        value: function initEvents() {
            var $this = this,
                input = $this._input,
                modal = $this._modal,
                startDateInput = input.querySelectorAll('.venti-startdate--input')[0],
                endDateInput = input.querySelectorAll('.venti-enddate--input')[0],
                startDateTimeInput = input.querySelectorAll('.venti-startdate--input')[1],
                endDateTimeInput = input.querySelectorAll('.venti-enddate--input')[1],
                rrule = input.querySelectorAll('.venti-rrule--input')[0];
            var rruleDeposite = "";

            input.addEventListener('click', function (evt) {
                var elm = evt.target;
                if (elm.classList.contains('venti-eventRepeat-edit')) {
                    modal.show();
                } else if (elm.classList.contains('venti-allday--input')) {
                    $this.toggleAllDay(evt);
                } else if (elm.classList.contains('venti-repeat--input')) {
                    if (elm.checked) {
                        $this.endDateValidate(endDateInput);
                        modal.show();
                    } else {
                        modal.hide();
                    }
                    //$this.endDateFauxDisable(elm);
                    if (rrule.value !== "") {
                        $this.clearSummary();
                    }
                }
            }, false);

            startDateInput.addEventListener('focusout', function (evt) {
                var thisSDI = this;
                setTimeout(function () {
                    $this.startDateValidate(thisSDI);
                }, 200);
            }, false);

            startDateTimeInput.addEventListener('focusout', function (evt) {
                var thisSDTI = this;
                setTimeout(function () {
                    $this.startDateValidate(thisSDTI);
                }, 200);
            });

            endDateInput.addEventListener('focusout', function (evt) {
                var thisEDI = this;
                setTimeout(function () {
                    $this.endDateValidate(thisEDI);
                }, 200);
            }, false);

            endDateTimeInput.addEventListener('focusout', function (evt) {
                var thisEDTI = this;
                setTimeout(function () {
                    $this.endDateValidate(thisEDTI);
                }, 200);
            });

            if (this._groupMenu === null) {
                this._groupMenu = new Garnish.MenuBtn($('.groupbtn'));
                this._groupMenu.on('optionSelect', $.proxy(function (evt) {
                    $this.groupMenuActions(evt, $this);
                }, this));
            } else {
                this._groupmenu.showMenu();
            }

            /*document.body.addEventListener('onHide', function (evt) {
                if(evt.srcElement.id === modal.container.id){
                    var rruleInput = input.querySelectorAll('.venti-rrule--input')[0],
                        repeatCbBtn = input.querySelectorAll('.venti-repeat--input')[0];
                    if(rruleInput.value === ""){
                        repeatCbBtn.checked = false;
                        $this.endDateFauxDisable(repeatCbBtn);
                    }
                }
            },false);*/

            document.body.addEventListener('onShow', function (evt) {
                if (evt.srcElement.id === modal.container.id) {
                    rruleDeposite = rrule.value;
                    modal.schedule.setStartOn();
                    modal.schedule.setEnds();
                }
            }, false);

            document.body.addEventListener('onCancel', function (evt) {
                if (evt.srcElement.id === modal.container.id) {
                    if (rrule.value === "" || rruleDeposite !== rrule.value && rruleDeposite === "") {
                        setTimeout(function () {
                            repeat.checked = false;
                            rrule.value = rruleDeposite;
                            $this.clearSummary();
                        }, 400);
                    }
                }
            });
        }
    }, {
        key: 'loadModal',
        value: function loadModal(options) {
            var $this = this,
                rrule = $this._input.querySelectorAll('.venti-rrule--input')[0];
            Craft.postActionRequest('venti/event/modal', {
                name: options.id,
                rrule: options.values !== null ? options.values.rRule : "",
                locale: options.locale,
                inline: false
            }, function (data) {
                // Append modal content
                //[jQ]
                $('body').append(data);
                $this._modal = new VentiModal(options);

                $this.initEvents();
            });
        }
    }, {
        key: 'loadInline',
        value: function loadInline(options) {
            var $this = this;
            Craft.postActionRequest('venti/event/modal', {
                name: options.id,
                rrule: options.values !== null ? options.values.rRule : "",
                locale: options.locale,
                inline: true
            }, function (data) {
                // Append modal content
                //[jQ]
                $("#" + options.id + ' .venti-inline').append(data);
                $this._modal = new VentiModal(options);

                $this.initEvents();
            });
        }
    }, {
        key: 'toggleAllDay',
        value: function toggleAllDay(evt) {
            var $this = this,
                input = $this._input,
                startDateTime = input.querySelectorAll('.venti-startdate--input')[1],
                endDateTime = input.querySelectorAll('.venti-enddate--input')[1],
                timeFormat = input.dataset['timeFormat'],
                dateFormat = input.dataset['dateFormat'],
                endOfDay = input.dataset.eod,
                startOfDay = input.dataset.sod;

            if (evt.target.checked) {
                input.classList.add('allDay');
                if (!$this._storedDates.state) {
                    $this._storedDates.startTime = startDateTime.value;
                    $this._storedDates.endTime = endDateTime.value;
                    startDateTime.value = startOfDay;
                    endDateTime.value = endOfDay;
                    $this._storedDates.state = true;
                } else {
                    startDateTime.value = startOfDay;
                    endDateTime.value = endOfDay;
                }
            } else {
                input.classList.remove('allDay');
                if ($this._storedDates.state) {
                    startDateTime.value = $this._storedDates.startTime;
                    endDateTime.value = $this._storedDates.endTime;
                }
            }
        }
    }, {
        key: 'clearSummary',
        value: function clearSummary() {
            var $this = this,
                input = $this._input,
                modal = $this._modal,

            //[jQ]
            edit = $('.venti-eventRepeat-edit');

            input.querySelectorAll('.venti-summary--input')[0].value = "";
            input.querySelectorAll('.venti-rrule--input')[0].value = "";
            input.querySelectorAll('.venti-summary--human')[0].innerHTML = "";
            var incDates = input.querySelectorAll('.venti-included-dates')[0];
            var excDates = input.querySelectorAll('.venti-excluded-dates')[0];

            //[jQ] if visible
            if (edit.is(":visible")) {
                edit.hide();
            }

            if (!incDates.classList.contains('hidden')) {
                incDates.classList.add('hidden');
            }

            if (!excDates.classList.contains('hidden')) {
                excDates.classList.add('hidden');
            }

            modal.clearSummary();
        }
    }, {
        key: 'startDateValidate',
        value: function startDateValidate(elm) {
            var $this = this,
                input = $this._input,
                modal = $this._modal,
                startDateInput = elm,
                sdValue = startDateInput.value,
                startDateInput = input.querySelectorAll('.venti-startdate--input')[0],
                startDateTimeInput = input.querySelectorAll('.venti-startdate--input')[1],
                endDateInput = input.querySelectorAll('.venti-enddate--input')[0],
                endDateTimeInput = input.querySelectorAll('.venti-enddate--input')[1],
                edValue = endDateInput.value,
                repeatChbx = input.querySelectorAll('.venti-repeat--input')[0],
                rruleInput = input.querySelectorAll('.venti-rrule--input')[0],
                timeFormat = input.dataset['timeFormat'];

            /*
             * When StartDate focusout if no EndDate make same as StartDate
             * If EndDate is populate && repeat checkbox is checked always make EndDate = StartDate
             * Else make sure EndDate is >= StartDate
             */
            if (edValue === "") {
                endDateInput.value = sdValue;
            } else {
                var sD_Date = new Date(sdValue),
                    eD_Date = new Date(edValue);

                if (repeatChbx.checked && eD_Date == "") {
                    endDateInput.value = sdValue;
                } else {
                    if (sD_Date > eD_Date && eD_Date == "") {
                        endDateInput.value = sdValue;
                    }
                }

                /* If start date is updated and there is a recurrence set update
                 * the recurrence rule.
                 */
                if (repeatChbx.checked && rruleInput.value !== "") {
                    modal.schedule.setStartOn();
                    modal.schedule.setEnds();
                    modal.schedule.getRuleString(modal, function (data) {
                        modal.setInputValues(data);
                    });
                }
            }

            // automatically add default event duration time to start date time
            // and set end date time
            if (elm.classList.contains('ui-timepicker-input')) {
                if (endDateTimeInput.value === "" && sdValue !== "") {
                    var startDate = moment(startDateInput.value + " " + sdValue);
                    var timeDiff = parseInt($this._defaultEventDuration);
                    endDateTimeInput.value = startDate.add(timeDiff, 'minutes').formatPHP(timeFormat);
                }
            }
            //console.log("START: " + sdValue);
            //console.log("END: " + edValue);
        }
    }, {
        key: 'endDateFauxDisable',
        value: function endDateFauxDisable(elm) {
            var $this = this,
                input = $this._input;

            if (elm.checked) {
                input.classList.add('repeats');
            } else {
                input.classList.remove('repeats');
            }
        }
    }, {
        key: 'endDateValidate',
        value: function endDateValidate(elm) {
            var $this = this,
                input = $this._input,
                modal = $this._modal,
                endDateInput = elm,
                edValue = endDateInput.value,
                startDateInput = input.querySelectorAll('.venti-startdate--input')[0],
                sdValue = startDateInput.value,
                repeatChbx = input.querySelectorAll('.venti-repeat--input')[0],
                rruleInput = input.querySelectorAll('.venti-rrule--input')[0];

            if (sdValue !== "") {
                var sD_Date = new Date(sdValue),
                    eD_Date = new Date(edValue);
                if (eD_Date < sD_Date && eD_Date !== "") {
                    endDateInput.value = sdValue;
                }
                // if(repeatChbx.checked && eD_Date !== ""){
                //     endDateInput.value = sdValue;
                // }

                /* If end date is updated and there is a recurrence set update
                 * the recurrence rule.
                 */
                if (repeatChbx.checked && rruleInput.value !== "") {
                    modal.schedule.setStartOn();
                    modal.schedule.setEnds();
                    modal.schedule.getRuleString(modal, function (data) {
                        modal.setInputValues(data);
                    });
                }
            }
        }
    }, {
        key: 'groupMenuActions',
        value: function groupMenuActions(evt, $this) {
            var _fields = $('#venti-fields');
            var _spinner = $('#venti-group-menu-field .spinner');
            var input = $this._input;
            var data = evt.option.dataset;
            var groupInput = input.querySelectorAll('.venti-groupId')[0];
            var optionValue = data.value;
            var optionLabel = data.label;
            var optionColor = data.color;
            var groupBtn = evt.target.$btn[0];
            var groupBtnLabel = groupBtn.querySelectorAll('.groupbtn-label')[0];
            var groupBtnLabelClr = groupBtn.querySelectorAll('.groupbtn-color')[0];
            var saveContinueEdit = document.querySelector('.save-continue-editing');
            var saveAddAnother = document.querySelector('.save-add-another');
            var shortcurtRedirect = document.querySelector('form[data-saveshortcut-redirect]');
            var continueEditing = document.querySelector('[name=continueEditingUrl]');

            //reveal spinner
            _spinner.removeClass('hidden');

            groupInput.value = optionValue;
            groupBtnLabel.innerHTML = optionLabel;
            groupBtnLabelClr.style.backgroundColor = optionColor;

            Craft.postActionRequest('venti/event/switchGroup', Craft.cp.$container.serialize(), $.proxy(function (response, textStatus) {
                _spinner.addClass('hidden');

                if (textStatus == 'success') {
                    console.log(response.variables);
                    var fieldsPane = _fields.data('pane');
                    fieldsPane.deselectTab();
                    _fields.html(response.paneHtml);
                    fieldsPane.destroy();
                    _fields.pane();
                    Craft.initUiElements(_fields);

                    Craft.appendHeadHtml(response.headHtml);
                    Craft.appendFootHtml(response.footHtml);

                    shortcurtRedirect.dataset.saveshortcutRedirect = response.variables.continueEditingUrl;
                    continueEditing.value = response.variables.continueEditingUrl;
                    //window.Craft.path = response.variables.continueEditingUrl;
                    //saveContinueEdit.dataset.redirect = response.variables.continueEditingUrl;
                    //saveAddAnother.dataset.redirect = `venti/${response.variables.group.handle}/new`;

                    // Update the slug generator with the new title input
                    if (typeof slugGenerator != "undefined") {
                        slugGenerator.setNewSource('#title');
                    }
                }
            }, this));

            // Set the hidden input group id value
        }
    }, {
        key: 'input',
        get: function get() {
            return this._input;
        },
        set: function set(input) {
            this._input = input;
        }
    }, {
        key: 'modal',
        get: function get() {
            return this._modal;
        },
        set: function set(modal) {
            this._modal = modal;
        }
    }, {
        key: 'id',
        get: function get() {
            return this._id;
        },
        set: function set(id) {
            this._id = id;
        }
    }, {
        key: 'storedDates',
        get: function get() {
            return this._storedDates;
        },
        set: function set(storedDates) {
            this._storedDates = storedDates;
        }
    }, {
        key: 'defaultEventDuration',
        get: function get() {
            return this._defaultEventDuration;
        }
    }, {
        key: 'groupMenu',
        set: function set(menu) {
            this._groupMenu = menu;
        },
        get: function get() {
            return this._groupMenu;
        }
    }]);

    return VentiInput;
}();

/*
 * Venti Modal
 */


var VentiSchedule = function () {
    function VentiSchedule(options, modal) {
        _classCallCheck(this, VentiSchedule);

        this._options = options;
        this._container = document.getElementById(options.id + "-venti-modal");
        this._input = document.getElementById(options.id);
        this._freqSelect = this._container.querySelectorAll('.venti-frequency--select')[0];
        this._modal = modal;

        this.initEvents();
    }

    _createClass(VentiSchedule, [{
        key: 'initEvents',


        //[jQ]
        value: function initEvents() {
            var $this = this,
                mdl = $this._container,
                dp = mdl.querySelectorAll('.venti-endson-datefield')[0],
                excludeDp = mdl.querySelectorAll('.venti-exclude-datefield')[0],
                includeDp = mdl.querySelectorAll('.venti-include-datefield')[0],
                ends = mdl.querySelectorAll('.venti_endson')[0];

            // Update scheduler state
            this.freqSelect.addEventListener('change', function () {
                var sel = this,
                    idx = sel.selectedIndex;
                $this.updateState(sel.options[idx].value);
            }, false);

            dp.addEventListener('focusout', function (evt) {
                setTimeout(function () {
                    // update rule string
                    $this.getRuleString(mdl, function (data) {
                        setTimeout(function () {
                            $this._modal.setInputValues(data);
                        }, 200);
                    });
                }, 200);
            }, false);

            // Action after exclude datepicker focusout event
            excludeDp.addEventListener('focusout', function (evt) {
                var thisDP = this;
                setTimeout(function () {
                    $this.setDateElement(thisDP, evt);
                    // update rule string
                    $this.getRuleString(mdl, function (data) {
                        setTimeout(function () {
                            $this._modal.setInputValues(data);
                        }, 200);
                    });
                }, 200);
            }, false);

            // Action after incude datepicker focusout event
            includeDp.addEventListener('focusout', function (evt) {
                var thisDP = this;
                setTimeout(function () {
                    $this.setDateElement(thisDP, evt);
                    // update rule string
                    $this.getRuleString(mdl, function (data) {
                        setTimeout(function () {
                            $this._modal.setInputValues(data);
                        }, 200);
                    });
                }, 200);
            }, false);

            $("#" + mdl.id).on('click', '.delete', function () {
                $(this).parent().fadeOut(function () {
                    $(this).remove();
                    $this.getRuleString(mdl, function (data) {
                        setTimeout(function () {
                            $this._modal.setInputValues(data);
                        }, 200);
                    });
                });
            });

            ends.addEventListener('click', function (evt) {
                var parent = this,
                    elm = evt.target,
                    textInputs = parent.querySelectorAll('input[type=text]');

                if (elm.className === "venti-endson__after" && elm.checked) {

                    textInputs[0].disabled = false;
                    textInputs[0].classList.remove('disabled');
                    textInputs[1].disabled = true;
                    textInputs[1].classList.add('disabled');
                    textInputs[1].value = "";
                } else if (elm.className === "venti-endson__date" && elm.checked) {

                    textInputs[1].disabled = false;
                    textInputs[1].classList.remove('disabled');
                    textInputs[0].disabled = true;
                    textInputs[0].classList.add('disabled');
                    textInputs[0].value = "";
                } else if (elm.className === "venti-endson__never" && elm.checked) {
                    for (var i = 0; i < textInputs.length; i++) {
                        textInputs[i].disabled = true;
                        textInputs[i].classList.add('disabled');
                        textInputs[i].value = "";
                    }
                }

                // update rule string
                $this.getRuleString(mdl, function (data) {
                    setTimeout(function () {
                        $this._modal.setInputValues(data);
                    }, 200);
                });
            }, false);
        }
    }, {
        key: 'clearSummary',
        value: function clearSummary() {
            var $this = this,
                mdl = $this._container;
            mdl.querySelectorAll('.venti-summary')[0].innerHTML = "";
        }
    }, {
        key: 'updateState',
        value: function updateState(value) {
            var stateID = parseInt(value) + 1;
            this._container.dataset.state = stateID;
        }
    }, {
        key: 'setStartOn',
        value: function setStartOn() {
            var $this = this,
                input = $this._input,
                mdl = $this._container,
                startOnInput = mdl.querySelectorAll('.venti-starts-on')[0],
                startOnTimeInput = mdl.querySelectorAll('.venti-starts-on')[1],
                startDate = input.querySelectorAll('.venti-startdate--input')[0],
                startTime = input.querySelectorAll('.venti-startdate--input')[1];

            if (startDate.value !== "") {
                startOnInput.value = startDate.value;
                if (startTime.value !== "") {
                    startOnTimeInput.value = startTime.value;
                }
            }
        }
    }, {
        key: 'setEnds',
        value: function setEnds() {
            var $this = this,
                input = $this._input,
                mdl = $this._container,
                endOnInput = mdl.querySelectorAll('.venti-ends-on')[0],
                endDate = input.querySelectorAll('.venti-enddate--input')[0],
                endTime = input.querySelectorAll('.venti-enddate--input')[1];
            if (endDate.value !== "") {
                endOnInput.value = endDate.value + " " + endTime.value;
            }
        }

        //[jQ]

    }, {
        key: 'setDateElement',
        value: function setDateElement(obj, evt) {
            var input = obj,
                value = input.value,
                tab = this.getNthParent(input, 4),
                elmList = $("#" + tab.id).find('.venti_elements'),
                tempName = tab.dataset.template,
                temp = $(tempName).text(),
                elm = $(temp);

            if (value.trim() !== "") {
                elm.find('input').attr('value', value);
                elm.find('.title').append(value);
                elmList.append(elm);
                input.value = "";
            }
        }
        //[jQ]

    }, {
        key: 'getRuleString',
        value: function getRuleString(elm, callback) {
            var $this = this,
                mdl = $this._container,
                formData = $("#" + mdl.id).find(".venti_modal-form").serialize();

            Craft.postActionRequest('venti/event/getRuleString', formData, function (data) {
                if (typeof callback == 'function') {
                    callback(data);
                }
            });
        }
    }, {
        key: 'getNthParent',
        value: function getNthParent(elm, idx) {
            var el = elm,
                i = idx;
            while (i-- && (el = el.parentNode)) {}
            return el;
        }
    }, {
        key: 'container',
        get: function get() {
            return this._container;
        },
        set: function set(container) {
            this._container = container;
        }
    }, {
        key: 'overlay',
        get: function get() {
            return this._overlay;
        }
    }, {
        key: 'options',
        get: function get() {
            return this._options;
        },
        set: function set(options) {
            this._options = options;
        }
    }, {
        key: 'freqSelect',
        get: function get() {
            return this._freqSelect;
        },
        set: function set(freqsel) {
            this._freqSelect = freqsel;
        }
    }]);

    return VentiSchedule;
}();

/*
 * Venti Modal
 */


var VentiModal = function () {
    function VentiModal(options) {
        _classCallCheck(this, VentiModal);

        this._options = options;
        this._container = options.inline == false ? document.getElementById(options.id + "-venti-modal") : document.getElementById(options.namespacedId + "-venti-inline");
        this._input = document.getElementById(options.id);
        this._overlay = options.inline == false ? this._container.parentNode : this._container;
        this._dateFormat = this._input.dataset['dateFormat'];
        this._schedule = new VentiSchedule(options, this);

        this.onShow = new CustomEvent("onShow", {
            'bubbles': true,
            'cancelable': true
        });

        this.onHide = new CustomEvent("onHide", {
            'bubbles': true,
            'cancelable': true
        });

        this.onCancel = new CustomEvent("onCancel", {
            'bubbles': true,
            'cancelable': true
        });

        this.initEvents();
    }

    _createClass(VentiModal, [{
        key: 'show',
        value: function show() {
            $(this._overlay).fadeIn('fast');
            this._container.dispatchEvent(this.onShow);
        }
    }, {
        key: 'hide',
        value: function hide() {
            $(this._overlay).fadeOut('fast');
            this._container.dispatchEvent(this.onHide);
        }
    }, {
        key: 'initEvents',
        value: function initEvents() {
            var $this = this,
                input = $this._input,
                mdl = $this._container,
                sch = $this._schedule,
                done = mdl.querySelector('button.submit'),
                cancel = mdl.querySelector('button.cancel'),
                tabContainer = mdl.querySelector('.venti_modal_tabs'),
                occurencesInput = mdl.querySelector('.venti-endson-afterfield'),
                rrule = input.querySelectorAll('.venti-rrule--input')[0],
                repeat = input.querySelectorAll('.venti-repeat--input')[0],
                form = mdl.querySelector('form');
            var rruleValueDeposite = rrule.value;

            // Modal done button click event
            done.addEventListener('click', function (evt) {
                evt.preventDefault();
                sch.getRuleString(mdl, function (data) {
                    $this.setInputValues(data);
                    $this.hide();
                });
            }, false);

            cancel.addEventListener('click', function (evt) {
                evt.preventDefault();
                $this._container.dispatchEvent($this.onCancel);
                $this.hide();
                // if rrule is not set uncheck repeat toggle.
                if (rrule.value === "") {
                    repeat.checked = false;
                }
            }, false);

            $(tabContainer).on('click', 'a', function (evt) {
                evt.preventDefault();
                $this.toggleTab(evt.delegateTarget, $(this));
            });

            form.addEventListener('focusout', function (evt) {
                //if(evt.target.tagName == "SELECT" || evt.target.tagName == "INPUT") {
                if (!evt.target.classList.contains('cancel')) {
                    sch.getRuleString(mdl, function (data) {
                        setTimeout(function () {
                            $this.setInputValues(data);
                        }, 200);
                    });
                }
                //}
            });

            form.addEventListener('change', function (evt) {
                if (!evt.target.classList.contains('cancel')) {
                    sch.getRuleString(mdl, function (data) {
                        setTimeout(function () {
                            $this.setInputValues(data);
                        }, 200);
                    });
                }
            });

            occurencesInput.addEventListener('keyup', function (evt) {
                sch.getRuleString(mdl, function (data) {
                    setTimeout(function () {
                        $this.setInputValues(data);
                    }, 200);
                });
            });
        }

        //[jQ]

    }, {
        key: 'toggleTab',
        value: function toggleTab(container, tab) {
            var container = $(container).find("ul"),
                id = tab.attr("href");

            container.find(".sel").removeClass('sel');
            tab.addClass('sel');
            $(id).siblings().hide();
            $(id).show();
        }

        /*
         * Clears rRule & summary hidden input as well as text holders next
         * too repeat checkbox and event modal summary box.
         */

    }, {
        key: 'clearSummary',
        value: function clearSummary() {
            var $this = this,
                mdl = $this._container;
            mdl.querySelectorAll('.venti-summary')[0].innerHTML = "";
        }
    }, {
        key: 'setInputValues',
        value: function setInputValues(values) {
            var $this = this,
                input = $this._input,
                mdl = $this._container,
                rruleInput = input.querySelectorAll('.venti-rrule--input')[0],
                summaryInput = input.querySelectorAll('.venti-summary--input')[0],
                summaryOutput = input.querySelectorAll('.venti-summary--human')[0],
                mdlSummaryOutput = mdl.querySelectorAll('.venti-summary')[0],
                mdlSummaryWrap = mdl.querySelectorAll('.venti-summary-extra-dates')[0],
                inpIncDates = input.querySelectorAll('.venti-included-dates')[0],
                inpExcDates = input.querySelectorAll('.venti-excluded-dates')[0],
                readable = values.readable ? values.readable.capitalize() : values.readable;

            rruleInput.value = values.rrule;
            summaryOutput.innerHTML = readable;
            summaryInput.value = readable;
            mdlSummaryOutput.innerHTML = readable;

            if (values.excluded.length > 0) {
                if (!inpExcDates.classList.contains('hidden')) {
                    inpExcDates.classList.remove('hidden');
                }
                this.setExcludedDates(values.excluded);
            } else {
                if (!inpExcDates.classList.contains('hidden')) {
                    inpExcDates.classList.add('hidden');
                }
            }

            if (values.included.length > 0) {
                if (inpIncDates.classList.contains('hidden')) {
                    inpIncDates.classList.remove('hidden');
                }
                this.setIncludedDates(values.included);
            } else {
                if (!inpIncDates.classList.contains('hidden')) {
                    inpIncDates.classList.add('hidden');
                }
            }
        }
    }, {
        key: 'setExcludedDates',
        value: function setExcludedDates(values) {
            var $this = this,
                input = $this._input,
                format = this._dateFormat,
                inpExcDates = input.querySelectorAll('.venti-excluded-dates')[0],
                itemsWrap = inpExcDates.querySelectorAll('.date__items')[0];

            if (inpExcDates.classList.contains('hidden')) {
                inpExcDates.classList.remove('hidden');
            }

            var items = '\n            <span>' + values.map(function (item) {
                return '' + moment(item.date).formatPHP(format);
            }).join(", ") + '</span>\n        ';

            itemsWrap.innerHTML = items;
        }
    }, {
        key: 'setIncludedDates',
        value: function setIncludedDates(values) {
            var $this = this,
                input = $this._input,
                format = this._dateFormat,
                inpIncDates = input.querySelectorAll('.venti-included-dates')[0],
                itemsWrap = inpIncDates.querySelectorAll('.date__items')[0];

            if (inpIncDates.classList.contains('hidden')) {
                inpIncDates.classList.remove('hidden');
            }

            var items = '\n            <span>' + values.map(function (item) {
                return '' + moment(item.date).formatPHP(format);
            }).join(", ") + '</span>\n        ';

            itemsWrap.innerHTML = items;
        }
    }, {
        key: 'container',
        get: function get() {
            return this._container;
        },
        set: function set(container) {
            this._container = container;
        }
    }, {
        key: 'overlay',
        get: function get() {
            return this._overlay;
        },
        set: function set(overlay) {
            this._overlay = overlay;
        }
    }, {
        key: 'options',
        get: function get() {
            return this._options;
        },
        set: function set(options) {
            this._options = options;
        }
    }, {
        key: 'schedule',
        get: function get() {
            return this._schedule;
        },
        set: function set(schedule) {
            this._schedule = schedule;
        }
    }]);

    return VentiModal;
}();

Venti.ElementEditor = Garnish.Base.extend({
    $element: null,
    elementId: null,
    locale: null,

    $form: null,
    $fieldsContainer: null,
    $cancelBtn: null,
    $saveBtn: null,
    $spinner: null,

    $localeSelect: null,
    $localeSpinner: null,

    modal: null,

    init: function init($element, settings) {
        // Param mapping
        if ((typeof settings === 'undefined' ? 'undefined' : _typeof(settings)) == (typeof undefined === 'undefined' ? 'undefined' : _typeof(undefined)) && $.isPlainObject($element)) {
            // (settings)
            settings = $element;
            $element = null;
        }

        this.$element = $element;
        this.setSettings(settings, Venti.ElementEditor.defaults);

        this.loadModal();
    },

    setElementAttribute: function setElementAttribute(name, value) {
        if (!this.settings.attributes) {
            this.settings.attributes = {};
        }

        if (value === null) {
            delete this.settings.attributes[name];
        } else {
            this.settings.attributes[name] = value;
        }
    },

    getBaseData: function getBaseData() {
        var data = $.extend({}, this.settings.params);

        if (this.settings.locale) {
            data.locale = this.settings.locale;
        } else if (this.$element && this.$element.data('locale')) {
            data.locale = this.$element.data('locale');
        }

        if (this.settings.elementId) {
            data.elementId = this.settings.elementId;
        } else if (this.$element && this.$element.data('id')) {
            data.elementId = this.$element.data('id');
        }

        if (this.settings.elementType) {
            data.elementType = this.settings.elementType;
        }

        if (this.settings.attributes) {
            data.attributes = this.settings.attributes;
        }

        return data;
    },

    loadModal: function loadModal() {
        this.onBeginLoading();
        var data = this.getBaseData();
        //Reset locale to store locale id so modal will show correct event version to edit.
        data.locale = Craft.getLocalStorage('BaseElementIndex.locale');
        data.includeLocales = this.settings.showLocaleSwitcher;
        Craft.postActionRequest('elements/getEditorHtml', data, $.proxy(this, 'showModal'));
    },

    showModal: function showModal(response, textStatus) {
        this.onEndLoading();

        if (textStatus == 'success') {
            var $modal = $('<form class="modal venti-elementeditor-modal"></form>').appendTo(Garnish.$bod),
                $header = $('<div class="header"></div>'),
                $contents = $();

            if (response.locales) {
                var $colLeft = $('<div class="col"/>').appendTo($header),
                    $localeSelectContainer = $('<div class="select"/>').appendTo($colLeft);

                this.$localeSelect = $('<select/>').appendTo($localeSelectContainer);
                this.$localeSpinner = $('<div class="spinner hidden"/>').appendTo($colLeft);

                for (var i = 0; i < response.locales.length; i++) {
                    var locale = response.locales[i];
                    $('<option value="' + locale.id + '"' + (locale.id == response.locale ? ' selected="selected"' : '') + '>' + locale.name + '</option>').appendTo(this.$localeSelect);
                }

                this.addListener(this.$localeSelect, 'change', 'switchLocale');
            }

            $header.appendTo($modal);

            this.$form = $('<div class="body elementeditor "/>');
            this.$fieldsContainer = $('<div class="fields"/>').appendTo(this.$form);

            this.updateForm(response);
            this.onCreateForm(this.$form);

            var $footer = $('<div class="footer"></div>'),
                $buttonsContainer = response.locales ? $('<div class="col"/>').appendTo($header) : $('<div class="text--right"/>').appendTo($header);
            this.$cancelBtn = $('<div class="btn">' + Craft.t('Cancel') + '</div>').appendTo($buttonsContainer);
            this.$saveBtn = $('<input class="btn submit" type="submit" value="' + Craft.t('Save') + '"/>').appendTo($buttonsContainer);
            this.$spinner = $('<div class="spinner hidden"/>').appendTo($buttonsContainer);

            $contents = $contents.add(this.$form);
            //$contents = $contents.add($footer);

            $contents.appendTo($modal);

            if (!this.modal) {

                this.modal = new Garnish.Modal($modal, {
                    closeOtherModals: true,
                    visible: true,
                    resizable: true,
                    shadeClass: 'modal-shade dark',
                    onShow: $.proxy(this, 'onShowModal'),
                    onHide: $.proxy(this, 'onHideModal')
                });

                this.modal.$container.data('elementEditor', this);

                this.modal.on('hide', $.proxy(function () {
                    delete this.modal;
                }, this));
            } else {
                //this.modal.updateBody($modalContents);
                this.modal.updateSizeAndPosition();
            }

            // Focus on the first text input
            $modal.find('.text:first').focus();

            this.addListener(this.$cancelBtn, 'click', function () {
                this.modal.hide();
            });

            this.addListener(this.$saveBtn, 'click', this.saveElement);
        }
    },

    switchLocale: function switchLocale() {
        var newLocale = this.$localeSelect.val();

        if (newLocale == this.locale) {
            return;
        }

        this.$localeSpinner.removeClass('hidden');

        var data = this.getBaseData();
        data.locale = newLocale;

        Craft.postActionRequest('elements/getEditorHtml', data, $.proxy(function (response, textStatus) {
            this.$localeSpinner.addClass('hidden');

            if (textStatus == 'success') {
                this.updateForm(response);
            } else {
                this.$localeSelect.val(this.locale);
            }
        }, this));
    },

    updateForm: function updateForm(response) {
        this.locale = response.locale;

        this.$fieldsContainer.html(response.html);

        // Swap any instruction text with info icons
        var $instructions = this.$fieldsContainer.find('> .meta > .field > .heading > .instructions');

        for (var i = 0; i < $instructions.length; i++) {

            $instructions.eq(i).replaceWith($('<span/>', {
                'class': 'info',
                'html': $instructions.eq(i).children().html()
            })).infoicon();
        }

        Garnish.requestAnimationFrame($.proxy(function () {
            Craft.appendHeadHtml(response.headHtml);
            Craft.appendFootHtml(response.footHtml);
            Craft.initUiElements(this.$fieldsContainer);
        }, this));
    },

    saveElement: function saveElement(evt) {
        evt.preventDefault();
        var validators = this.settings.validators;

        if ($.isArray(validators)) {
            for (var i = 0; i < validators.length; i++) {
                if ($.isFunction(validators[i]) && !validators[i].call()) {
                    return false;
                }
            }
        }

        this.$spinner.removeClass('hidden');

        var data = $.param(this.getBaseData()) + '&' + this.modal.$container.serialize();
        Craft.postActionRequest('elements/saveElement', data, $.proxy(function (response, textStatus) {
            this.$spinner.addClass('hidden');

            if (textStatus == 'success') {
                if (textStatus == 'success' && response.success) {
                    if (this.$element && this.locale == this.$element.data('locale')) {
                        // Update the label
                        var $title = this.$element.find('.title'),
                            $a = $title.find('a');

                        if ($a.length && response.cpEditUrl) {
                            $a.attr('href', response.cpEditUrl);
                            $a.text(response.newTitle);
                        } else {
                            $title.text(response.newTitle);
                        }
                    }

                    this.closeModal();
                    this.onSaveElement(response);
                } else {
                    this.updateForm(response);
                    Garnish.shake(this.modal.$modal);
                }
            }
        }, this));
    },

    closeModal: function closeModal() {
        this.modal.hide();
        delete this.modal;
    },

    // Events
    // -------------------------------------------------------------------------

    onShowModal: function onShowModal() {
        this.settings.onShowModal();
        this.trigger('showModal');
    },

    onHideModal: function onHideModal() {
        this.settings.onHideModal();
        this.trigger('hideModal');
    },

    onBeginLoading: function onBeginLoading() {
        if (this.$element) {
            this.$element.addClass('loading');
        }

        this.settings.onBeginLoading();
        this.trigger('beginLoading');
    },

    onEndLoading: function onEndLoading() {
        if (this.$element) {
            this.$element.removeClass('loading');
        }

        this.settings.onEndLoading();
        this.trigger('endLoading');
    },

    onSaveElement: function onSaveElement(response) {
        this.settings.onSaveElement(response);
        this.trigger('saveElement', {
            response: response
        });
    },

    onCreateForm: function onCreateForm($form) {
        this.settings.onCreateForm($form);
    }
}, {
    defaults: {
        showLocaleSwitcher: true,
        elementId: null,
        elementType: null,
        locale: null,
        attributes: null,
        params: null,
        onShowModal: $.noop,
        onHideModal: $.noop,
        onBeginLoading: $.noop,
        onEndLoading: $.noop,
        onCreateForm: $.noop,
        onSaveElement: $.noop,

        validators: []
    }
});

/**
 * Venti Calendar Class
 */

var VentiCalendar = function () {
    function VentiCalendar(options) {
        _classCallCheck(this, VentiCalendar);

        var $this = this;
        this._id = options.id;
        this._params = options.params;
        this._input = document.getElementById(options.id);
        this._tooltip = null;
        this._cal = null;
        this._localebtn = null;
        this._locale = Craft.getLocalStorage('BaseElementIndex.locale') ? Craft.getLocalStorage('BaseElementIndex.locale') : "en_us";
        this._sources = null;
        this._localized = options.params.localized;
        this._alertModal = null;
        this._editLocales = options.params.editLocales;
        this._cpLanguage = options.params.cpLanguage ? this.mapLocales(options.params.cpLanguage) : "en";
        //FullCalendar default settings
        this._defaults = {
            customButtons: {
                localeSelectButton: {
                    text: this._params.locales[0].title,
                    click: function click(evt) {
                        if ($this._localebtn.data("menu") != "true") {
                            var $menu = $('<div class="menu" data-align="right"></div>').insertAfter(evt.currentTarget),
                                $menuList = $('<ul></ul>').appendTo($menu),
                                selOps = options.params.locales;
                            for (var i = 0; i < selOps.length; i++) {
                                if (options.params.editLocales[selOps[i].handle]) {
                                    $('<li><a data-value="' + selOps[i].handle + '">' + selOps[i].title + '</a></li>').appendTo($menuList);
                                }
                            }
                            //console.log(options.params.locales);
                            new Garnish.MenuBtn(evt.currentTarget, { onOptionSelect: $.proxy($this, "onLocaleChange", evt.currentTarget) }).showMenu();

                            $this._localebtn.data("menu", "true");
                        }
                    }
                },
                groupsToggleButton: {
                    text: Craft.t("Groups"),
                    click: $.proxy(this, "groupToggles")
                }
            },
            header: {
                left: 'title',
                center: '',
                right: this._localized === "true" ? 'localeSelectButton groupsToggleButton today prev,next ' : 'groupsToggleButton today prev,next'
            },
            viewRender: $.proxy(this, "viewRender"),
            editable: true,
            eventClick: $.proxy(this, "onEventAction"),
            eventDrop: $.proxy(this, "updateEventDates"),
            dayClick: $.proxy(function () {}),
            eventResizeStart: $.proxy(function () {}),
            eventDragStart: $.proxy(function () {}),
            //eventMouseover: $.proxy(this, "onEventAction"),
            //eventMouseout: $.proxy(this, "onMouseout"),
            eventRender: $.proxy(this, "renderEvent"),
            lang: this._cpLanguage,
            eventLimit: 6

        };

        // Initialize Calendar
        this.initCalendar();
    }

    _createClass(VentiCalendar, [{
        key: 'initCalendar',
        value: function initCalendar() {

            var settings = $.extend({}, this.params, this.defaults);

            if (Craft.getLocalStorage('Venti.eventSources')) {
                // if sources are already stored in local storage retrieve them
                this._sources = Craft.getLocalStorage('Venti.eventSources');
                settings.eventSources = this._sources;
            } else {
                this._sources = this._params.eventSources;
                // initially set the storage for sources
                Craft.setLocalStorage('Venti.eventSources', this._sources);
            }

            //init full calendar
            this._cal = $(this._id).fullCalendar(settings);

            this._localebtn = $(".fc-localeSelectButton-button");
            this.updateLocaleBtnText(this._locale);
        }
    }, {
        key: 'viewRender',
        value: function viewRender(view, element) {
            $('.fc-day-number.fc-today').wrapInner('<span class="day-number-today"></span>');
            $('.fc-localeSelectButton-button').addClass("btn menubtn");
            $('.fc-groupsToggleButton-button').addClass('btn');
        }
    }, {
        key: 'renderEvent',
        value: function renderEvent(event, element) {
            var $this = this;
            element.data({ "id": event.id, "locale": event.locale });
            if (event.multiDay || event.allDay) {
                element.addClass('fc-event-multiday');
            } else {
                element.addClass('fc-event-singleday');
                element.find('.fc-content').prepend('<span class="event_group_color" style="background-color:' + event.color + '"/>');
            }
            var content = $('<div data-eid=" ' + event.id + ' "/>'),
                title = $('<div class="event-tip--header"><h3>' + event.title + '</h3><h6><span class="event_group_color" style="background-color:' + event.color + ';"></span>' + event.group + '</h6></div>').appendTo(content),
                close = $('<span class="closer"><svg height=16px version=1.1 viewBox="0 0 16 16"width=16px xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink><defs></defs><g id=Page-1 fill=none fill-rule=evenodd stroke=none stroke-width=1><g id=close.3.3.1><g id=Group><g id=Filled_Icons_1_ fill=#CBCBCC><g id=Filled_Icons><path d="M15.81248,14.90752 L9.22496,8.32 L15.81184,1.73248 C16.06208,1.48288 16.06208,1.07776 15.81184,0.82752 C15.5616,0.57728 15.15712,0.57728 14.90688,0.82752 L8.32,7.41504 L1.73184,0.82688 C1.4816,0.57728 1.07712,0.57728 0.82688,0.82688 C0.57664,1.07712 0.57664,1.4816 0.82688,1.73184 L7.41504,8.32 L0.82688,14.90816 C0.57728,15.15776 0.57664,15.56352 0.82688,15.81312 C1.07712,16.06336 1.48224,16.06272 1.73184,15.81312 L8.32,9.22496 L14.90752,15.81184 C15.15712,16.06208 15.56224,16.06208 15.81248,15.81184 C16.06272,15.56224 16.06208,15.15712 15.81248,14.90752 L15.81248,14.90752 Z"id=Shape></path></g></g><g id=Invisible_Shape transform="translate(0.640000, 0.640000)"><rect height=15.36 id=Rectangle-path width=15.36 x=0 y=0></rect></g></g></g></g></svg></span>').appendTo(title),
                dateWrap = $('<div class="event-tip--datetime"/>').appendTo(content),
                date = $(this.tipDateFormat(event)).appendTo(dateWrap),
                repeats = parseInt(event.repeat) === 1 ? $('<div class="repeats"><strong>' + Craft.t("Repeats") + ':</strong> ' + event.summary + '</div>').appendTo(dateWrap) : '',
                buttons = event.source.canEdit === true || event.source.canDelete ? $('<div class="event-tip--actions"/>').appendTo(content) : '',
                occur = parseInt(event.repeat) === 1 && event.source.canEdit === true && $this._editLocales[event.locale] ? $('<button class="btn">' + Craft.t("Remove Occurence") + '</button>').appendTo(buttons) : '',
                del = event.source.canDelete === true && $this._editLocales[event.locale] ? $('<button class="btn">' + Craft.t("Delete") + '</button>').appendTo(buttons) : '',
                edit = event.source.canEdit === true && $this._editLocales[event.locale] ? $('<button class="btn submit">' + Craft.t("Edit") + '</button>').appendTo(buttons) : '';

            event.tooltip = $('<div/>').qtip({
                position: {
                    my: "bottom center",
                    at: "top center",
                    target: element.find('.fc-title'),
                    viewport: $("#venti-calendar"),
                    adjust: {
                        method: "shift flip"
                    }

                },
                content: {
                    text: content
                },
                show: {
                    solo: !0,
                    delay: 200
                },
                hide: {
                    fixed: !0,
                    delay: 400
                },
                style: {
                    classes: "venti-event-tip"
                }
            }).qtip('api');

            Craft.cp.addListener(edit, 'click', $.proxy(function () {
                $this.editEvent(event, element);
                event.tooltip.hide();
            }));

            Craft.cp.addListener(del, 'click', $.proxy(function () {
                $this.deleteEvent(event, element);
                event.tooltip.hide();
            }));

            Craft.cp.addListener(occur, 'click', $.proxy(function () {
                $this.removeOccurence(event, element);
                event.tooltip.hide();
            }));

            Craft.cp.addListener(close, 'click', $.proxy(function () {
                event.tooltip.hide();
            }));
        }
    }, {
        key: 'eventClick',
        value: function eventClick(calEvent, jsEvent, view) {
            this.editEvent(calEvent, $(jsEvent.currentTarget));
        }
    }, {
        key: 'onLocaleChange',
        value: function onLocaleChange(btn, selection) {
            var $this = this,
                value = $(selection).data('value');

            $this.updateLocaleBtnText(value);
            // sets Crafts local storage local variable to persist local in CP
            Craft.setLocalStorage("BaseElementIndex.locale", value);

            $this.updateEventSourceLocale($this._sources, value);
            // saves event sources in local storage
            Craft.setLocalStorage("Venti.eventSources", $this._sources);

            $this.resetEventSources();
        }
    }, {
        key: 'updateEventSourceLocale',
        value: function updateEventSourceLocale(sources, locale) {
            var srcs = sources;
            for (var i = 0; i < srcs.length; i++) {
                var urlParts = srcs[i].url.split("/"),
                    urlPartsLength = urlParts.length;
                urlParts[urlPartsLength - 1] = locale;
                srcs[i].url = urlParts.join('/');
            }

            // update instance sources variable
            this._sources = srcs;
        }
    }, {
        key: 'updateLocaleBtnText',
        value: function updateLocaleBtnText(handle) {
            var btn = $(this._localebtn);
            var locales = this._params.locales;
            var label = "";

            for (var i = 0; i < locales.length; i++) {
                if (locales[i].handle === handle) {
                    label = locales[i].title;
                    break;
                }
            }

            btn.text(label);
        }
    }, {
        key: 'resetEventSources',
        value: function resetEventSources() {
            var sources = this._sources;
            this._cal.fullCalendar('removeEventSources');
            for (var i = 0; i < sources.length; i++) {
                this._cal.fullCalendar('addEventSource', sources[i]);
            }
        }

        // On event click or mouseover

    }, {
        key: 'onEventAction',
        value: function onEventAction(event, element, view) {
            var $this = this;
            event.tooltip.reposition(element.currentTarget, false).toggle(true).focus(element.currentTarget);
        }
    }, {
        key: 'editEvent',
        value: function editEvent(event, target) {
            var $this = this,
                id = event.id;

            var settings = {
                showLocaleSwitcher: true,
                elementId: id,
                elementType: 'Venti_Event',
                saveButton: true,
                cancelButton: true,
                locale: this._locale,
                onHideModal: function onHideModal() {
                    $this._cal.fullCalendar('refetchEvents');
                }
            };
            new Venti.ElementEditor($(target), settings);
        }
    }, {
        key: 'deleteEvent',
        value: function deleteEvent(event, target) {
            var $this = this,
                id = event.id,
                data = { "eventId": id };

            if (window.confirm(Craft.t("Are you sure you want to delete this event?")) === true) {
                Craft.postActionRequest('venti/event/deleteEvent', data, $.proxy(function (response, textStatus) {
                    if (textStatus == 'success') {
                        $this._cal.fullCalendar('refetchEvents');
                    } else {}
                }, this));
            }
        }
    }, {
        key: 'removeOccurence',
        value: function removeOccurence(event, target) {
            var $this = this,
                id = event.id,
                exDate = event.start.format(),
                locale = event.locale,
                data = { "id": id, "exDate": exDate, "locale": locale };

            if (window.confirm(Craft.t("Are you sure you want to remove this occurence?")) === true) {
                Craft.postActionRequest('venti/event/removeOccurence', data, $.proxy(function (response, textStatus) {
                    if (textStatus == 'success') {
                        $this._cal.fullCalendar('refetchEvents');
                    } else {}
                }, this));
            }
        }
    }, {
        key: 'updateEventDates',
        value: function updateEventDates(event, delta, revertFunc, jsEvent, ui) {
            //console.log(jsEvent);

            var $this = this;
            if (event.repeat == 1) {
                var ruleCollection = this.ruleParams(event.rRule);
                if (ruleCollection['FREQ'] === 'WEEKLY' || ruleCollection['FREQ'] === 'MONTHLY') {
                    this.repeatAlertWindow(event, jsEvent.target);
                    $this._cal.fullCalendar('refetchEvents');
                    return false;
                }
            }
            Craft.postActionRequest('venti/event/updateEventDates', {
                id: event.id,
                locale: event.locale,
                start: event.start.toISOString(),
                end: event.end.toISOString()
            }, function (data) {
                if (data.success) {
                    $this._cal.fullCalendar('refetchEvents');
                }
            });
        }
    }, {
        key: 'ruleParams',
        value: function ruleParams(rrule) {
            var ruleChunks = rrule.split(';'),
                ruleCollection = [];

            for (var i = 0; i < ruleChunks.length; i++) {
                var keyAry = ruleChunks[i].split("=");
                ruleCollection[keyAry[0]] = keyAry[1];
            }
            return ruleCollection;
        }
    }, {
        key: 'repeatAlertWindow',
        value: function repeatAlertWindow(event, target) {
            var $this = this,
                quickShow = false;

            this.showingAlertModal = true;

            if (!this.alertModal) {

                var $content = $('<div id="venti_alertmodal" class="modal alert fitted"/>'),
                    $body = $('<div class="body"><h2>' + Craft.t('You\'re changing a repeating event.') + '</h2><p>' + Craft.t('You\’re changing the date of a repeating event with specific day(s) of the week or month. Edit the event to update the repeat schedule.') + '</p></div>').appendTo($content),
                    $container = $('<div class="inputcontainer text--right"/>').appendTo($body),
                    $cancel = $('<button class="btn cancel">' + Craft.t("Cancel") + '</button>').appendTo($container),
                    $edit = $('<button class="btn submit">' + Craft.t("Edit") + '</button>').appendTo($container);

                this.alertModal = new Garnish.Modal($content, {
                    autoShow: false,
                    closeOtherModals: true,
                    hideOnEsc: true,
                    hideOnShadeClick: true,
                    shadeClass: 'modal-shade dark'
                });

                // Listeners
                Craft.cp.addListener($cancel, 'click', $.proxy(this, 'hideAlertModal'));
                Craft.cp.addListener($edit, 'click', $.proxy(function (evt) {

                    var tg = $(target).parent().removeStyle('position left right top bottom width height opacity z-index');

                    $this.editEvent(event, tg);
                    $this.hideAlertModal();
                }));
            }

            if (quickShow) {
                this.alertModal.quickShow();
            } else {
                this.alertModal.show();
            }
        }
    }, {
        key: 'groupToggles',
        value: function groupToggles(evt) {
            var $this = this,
                target = evt.target,
                origSources = this._params.eventSources,
                sources = this._sources,
                quickShow = false;

            if (!this.sourcesModal) {

                var $content = $('<form id="venti_groupsmodal" class="modal fitted venti_groupsmodal"/>'),
                    $body = $('<div class="body"><h1 class="text--center">' + Craft.t('Groups') + '</h1></div>').appendTo($content),
                    $list = $('<ul class="venti_group_selects" />').appendTo($body),
                    $footer = $('<div class="footer"/>').appendTo($content),
                    $cancel = $('<button class="btn cancel">' + Craft.t("Cancel") + '</button>').appendTo($footer),
                    $done = $('<button class="btn submit slim" value="submit">' + Craft.t("Update") + '</button>').appendTo($footer);

                // create checkbox fields and toggle
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = origSources[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var key = _step.value;

                        var selected = false,
                            $item = $('<li class="venti_group_select_item" />').appendTo($list);

                        if (sources.some(function (e) {
                            return e.id === key.id;
                        })) {
                            selected = true;
                        }

                        var $input = $('<input id="venti_group_select-' + key.id + '" class="venti_group_select_input" name="venti_group_select-' + key.id + '" data-id="' + key.id + '" type="checkbox"' + (selected ? 'checked=checked' : '') + '>').appendTo($item),
                            $label = $('<label for="venti_group_select-' + key.id + '" class="venti_group_select_label"><span style="background-color:' + key.color + '"></span>' + key.label + '</label>').appendTo($item);
                    }

                    // Create Sources Modal from Garnish.Modal
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                this.sourcesModal = new Garnish.Modal($content, {
                    autoShow: false,
                    closeOtherModals: true,
                    hideOnEsc: true,
                    hideOnShadeClick: true,
                    shadeClass: 'modal-shade light',
                    onHide: $.proxy(this, 'onHideGroupsModal')
                });

                // Listeners
                Craft.cp.addListener($cancel, 'click', $.proxy(function (evt) {
                    evt.preventDefault();
                    $this.hideSourcesModal();
                }));

                Craft.cp.addListener($content, 'submit', $.proxy(function (evt) {

                    evt.preventDefault();
                    var form = $(evt.target),
                        sourceCollection = [];

                    form.find('input').each(function () {
                        var _this = $(this),
                            _id = _this.data('id');

                        if (_this.is(":checked")) {
                            var _iteratorNormalCompletion2 = true;
                            var _didIteratorError2 = false;
                            var _iteratorError2 = undefined;

                            try {
                                for (var _iterator2 = origSources[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    var key = _step2.value;

                                    if (parseInt(key.id) === parseInt(_id)) {
                                        sourceCollection.push(key);
                                    }
                                }
                            } catch (err) {
                                _didIteratorError2 = true;
                                _iteratorError2 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                        _iterator2.return();
                                    }
                                } finally {
                                    if (_didIteratorError2) {
                                        throw _iteratorError2;
                                    }
                                }
                            }
                        }
                    });

                    $this._sources = sourceCollection;
                    Craft.setLocalStorage("Venti.eventSources", $this._sources);

                    $this.resetEventSources();
                    $this.hideSourcesModal();
                }));
            }

            if (quickShow) {
                this.sourcesModal.quickShow();
            } else {
                this.sourcesModal.show();
            }
        }
    }, {
        key: 'onMouseout',
        value: function onMouseout(event, jsEvent, view) {
            this._tooltip.hide();
        }
    }, {
        key: 'hideAlertModal',
        value: function hideAlertModal() {
            this.alertModal.hide();
        }
    }, {
        key: 'hideSourcesModal',
        value: function hideSourcesModal() {
            this.sourcesModal.hide();
        }
    }, {
        key: 'onHideGroupsModal',
        value: function onHideGroupsModal() {
            var $this = this,
                modal = this.sourcesModal.$container;
            // reset checkbox state to saved state
            modal.find('input').each(function () {
                var _this = $(this),
                    _id = _this.data('id');
                _this.prop('checked', false);
                // If checkbox is in saved sources set it to checked
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = $this._sources[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var key = _step3.value;

                        if (parseInt(key.id) === parseInt(_id)) {
                            _this.prop('checked', true);
                        }
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }
            });
        }

        /**
         * Return formated event string for tooltip
         * @return string
         */

    }, {
        key: 'tipDateFormat',
        value: function tipDateFormat(event) {
            var dateFormat = $('[data-date-format]').data('date-format'),
                timeFormat = $('[data-time-format]').data('time-format'),
                format = dateFormat + " " + timeFormat,
                startDate = moment(event.start),
                endDate = moment(event.end),
                output = "";

            if (event.allDay) {
                if (event.multiDay) {
                    //output += Craft.t("All Day from");
                    //output += " " + startDate.formatPHP(format) + " " + Craft.t("to") + " " + endDate.formatPHP(format);
                    output += "<div><strong>" + Craft.t("Begins") + ":</strong> " + startDate.formatPHP(format);
                    output += "</div><div>";
                    output += "<strong>" + Craft.t("Ends") + ":</strong> " + endDate.formatPHP(format);
                    output += "</div>";
                } else {
                    //output += Craft.t("All Day from");
                    //output += " " + startDate.formatPHP(format) + " " + Craft.t("to") + " " + endDate.formatPHP(timeFormat);
                    output += "<strong>" + Craft.t("Begins") + ":</strong> " + startDate.formatPHP(format);
                    output += "</div><div>";
                    output += "<strong>" + Craft.t("Ends") + ":</strong> " + endDate.formatPHP(timeFormat);
                    output += "</div>";
                }
            } else {
                if (event.multiDay) {
                    //output += " " + startDate.formatPHP(format) + " " + Craft.t("to") + " " + endDate.formatPHP(format);
                    output += "<div><strong>" + Craft.t("Begins") + ":</strong> " + startDate.formatPHP(format);
                    output += "</div><div>";
                    output += "<strong>" + Craft.t("Ends") + ":</strong> " + endDate.formatPHP(format);
                    output += "</div>";
                } else {
                    //output += " " + startDate.formatPHP(format) + " " + Craft.t("to") + " " + endDate.formatPHP(timeFormat);
                    output += "<div><strong>" + Craft.t("Begins") + ":</strong> " + startDate.formatPHP(format);
                    output += "</div><div>";
                    output += "<strong>" + Craft.t("Ends") + ":</strong> " + endDate.formatPHP(timeFormat);
                    output += "</div>";
                }
            }

            return output;
        }
    }, {
        key: 'mapLocales',
        value: function mapLocales(ventiLocale) {
            var lang = {
                "ar_ma": "ar",
                "ar_sa": "ar-sa",
                "ar_tn": "ar",
                "ar": "ar",
                "bg": "bg",
                "ca_es": "ca",
                "cs": "cs",
                "da": "da",
                "de_de": "de",
                "de_at": "de-at",
                "en": "en",
                "en_us": "en",
                "en_gb": "en-gb",
                "en_ca": "en-ca",
                "en_au": "en-au",
                "en_ie": "en-ie",
                "en_nz": "en-nz",
                "es": "es",
                "es_us": "es",
                "es_cl": "es",
                "es_es": "es",
                "es_mx": "es",
                "es_ve": "es",
                "fi": "fi",
                "fr": "fr",
                "fr_ca": "fr-ca",
                "fr_ch": "fr-ch",
                "he": "he",
                "hr": "hr",
                "hr_hr": "hr",
                "hu": "hu",
                "id": "id",
                "id_id": "id",
                "it": "it",
                "it_it": "it",
                "it_ch": "it",
                "ja": "ja",
                "ja_jp": "ja",
                "ko": "ko",
                "ko_kr": "ko",
                "lt": "lt",
                "lv": "lv",
                "nb": "nb",
                "nl": "nl",
                "nl_be": "nl",
                "nl_nl": "nl",
                "pl": "pl",
                "pl_pl": "pl",
                "pt_br": "pt-br",
                "pt": "pt",
                "ro": "ro",
                "ro_ro": "ro",
                "ru": "ru",
                "ru_ru": "ru",
                "sk": "sk",
                "sl": "sl",
                "sr": "sr",
                "sv": "sv",
                "th": "th",
                "tr": "tr",
                "tr_tr": "tr",
                "uk": "uk",
                "vi": "vi",
                "zh_cn": "zh-cn",
                "zh_tw": "zh-tw"
            };
            return lang[ventiLocale];
        }
    }, {
        key: 'input',
        get: function get() {
            return this._input;
        }
    }, {
        key: 'id',
        get: function get() {
            return this._id;
        }
    }, {
        key: 'params',
        get: function get() {
            return this._params;
        }
    }, {
        key: 'defaults',
        get: function get() {
            return this._defaults;
        }
    }, {
        key: 'cal',
        get: function get() {
            return this._cal;
        },
        set: function set(cal) {
            this._cal = cal;
        }
    }, {
        key: 'sources',
        get: function get() {
            return this._sources;
        },
        set: function set(sources) {
            this._sources = sources;
        }
    }, {
        key: 'localebtn',
        get: function get() {
            return this._localebtn;
        },
        set: function set(btn) {
            this._localebtn = btn;
        }
    }, {
        key: 'locale',
        set: function set(locale) {
            this._locale = locale;
        },
        get: function get() {
            return this._locale;
        }
    }, {
        key: 'localized',
        set: function set(loc) {
            this._localized = loc;
        },
        get: function get() {
            return this._localized;
        }
    }, {
        key: 'alertModal',
        set: function set(modal) {
            this._alertModal = modal;
        },
        get: function get() {
            return this._alertModal;
        }
    }, {
        key: 'tooltip',
        get: function get() {
            return this._tooltip;
        },
        set: function set(ttip) {
            this._tooltip = ttip;
        }
    }, {
        key: 'cpLanguage',
        get: function get() {
            return this._cpLanguage;
        }
    }, {
        key: 'editLocales',
        set: function set(loc) {
            this._editLocales = loc;
        },
        get: function get() {
            return this._editLocales;
        }
    }]);

    return VentiCalendar;
}();

/**
 * Locations Class
 */

var VentiLocation = function () {
    function VentiLocation(options) {
        _classCallCheck(this, VentiLocation);

        var $this = this;
        this._options = options ? options : {};
        this._fields = {
            findAddr: document.querySelectorAll(".find-address-input")[0],
            address: document.querySelectorAll(".loc-address-input")[0],
            city: document.querySelectorAll(".loc-city-input")[0],
            state: document.querySelectorAll(".loc-state-input")[0],
            zip: document.querySelectorAll(".loc-zip-input")[0],
            lat: document.querySelectorAll(".loc-lat-input")[0],
            lng: document.querySelectorAll(".loc-lng-input")[0],
            country: document.querySelectorAll(".loc-countries-input select")[0]
        };
        this._mapContainer = document.querySelectorAll('.map_container')[0];

        google.maps.event.addDomListener(window, 'load', function () {
            $this.initalize();
        });

        this.initMap();
    }

    _createClass(VentiLocation, [{
        key: 'initalize',
        value: function initalize() {
            var $this = this;
            var address = this._fields.findAddr;
            var autocomplete = new google.maps.places.Autocomplete(address);
            autocomplete.setTypes(['geocode']);
            google.maps.event.addListener(autocomplete, "place_changed", function () {
                var place = autocomplete.getPlace();
                if (!place.geometry) {
                    return;
                }

                var address = " ";
                if (place.address_components) {
                    address = [place.address_components[0] && place.address_components[0].short_name || "", place.address_components[1] && place.address_components[1].short_name || "", place.address_components[2] && place.address_components[2].short_name || ""].join(" ");
                }
            });

            // Prevent address autocomplete input from submitting form on return.
            address.addEventListener('keypress', function (e) {
                if (e.keyCode == 13) {
                    var src = e.srcElement || e.target;
                    if (src.tagName.toLowerCase() != "textarea") {
                        e.stopPropagation();
                        if (e.preventDefault) {
                            e.preventDefault();
                        } else {
                            e.returnValue = false;
                        }
                    }
                }
            });

            autocomplete.addListener('place_changed', function (evt) {
                $this.codeAddress(evt, $this);
                $this.fillAddress(evt, $this, autocomplete);
            });
        }
    }, {
        key: 'codeAddress',
        value: function codeAddress(evt, clas) {
            var $this = clas;
            var geocoder = new google.maps.Geocoder();
            var findAddrValue = $this._fields.findAddr.value;
            geocoder.geocode({ 'address': findAddrValue }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {

                    $this._fields.lat.value = results[0].geometry.location.lat();
                    $this._fields.lng.value = results[0].geometry.location.lng();
                    $this.loadMap(results[0].geometry.location.lat(), results[0].geometry.location.lng());
                } else {
                    //alert("Geocode was not successful for the following reason: " + status);
                }
            });
        }
    }, {
        key: 'fillAddress',
        value: function fillAddress(evt, clas, autocomplete) {
            var $this = clas;
            var place = autocomplete.getPlace();
            var address = "";

            for (var i = 0; i < place.address_components.length; i++) {
                var addressType = place.address_components[i].types[0];
                var fld = $this._fields;

                switch (addressType) {
                    case 'street_number':
                        address += place.address_components[i]['short_name'];
                        break;
                    case 'route':
                        address += " " + place.address_components[i]['long_name'];
                        fld.address.value = address;
                        break;
                    case 'locality':
                        fld.city.value = place.address_components[i]['long_name'];
                        break;
                    case 'administrative_area_level_1':
                        fld.state.value = place.address_components[i]['short_name'];
                        break;
                    case 'postal_code':
                        fld.zip.value = place.address_components[i]['short_name'];
                        break;
                    case 'country':
                        var select = fld.country;
                        for (var option in select.options) {
                            if (select.options[option].value === place.address_components[i]['short_name']) {
                                select.options[option].selected = true;
                            }
                        }
                        break;
                }
            }
        }
    }, {
        key: 'getFullAddress',
        value: function getFullAddress() {
            var addressDict = [this._fields.address.value, this._fields.city.value, this._fields.state.value, this._fields.zip.value];

            return addressDict.join(" ");
        }
    }, {
        key: 'initMap',
        value: function initMap() {
            var $this = this;

            if (this._fields.lat.value !== "" && this._fields.lng.value !== "") {
                this.loadMap(parseFloat(this._fields.lat.value), parseFloat(this._fields.lng.value));
            }
        }
    }, {
        key: 'loadMap',
        value: function loadMap(lat, lng) {
            var locLatLng = { lat: lat, lng: lng };
            var map = new google.maps.Map(this._mapContainer, {
                center: locLatLng,
                disableDefaultUI: true,
                zoom: 15
            });
            var marker = new google.maps.Marker({
                position: locLatLng,
                map: map
            });
        }
    }, {
        key: 'fields',
        get: function get() {
            return this._fields;
        }
    }, {
        key: 'input',
        set: function set(fields) {
            this._fields = fields;
        }
    }]);

    return VentiLocation;
}();