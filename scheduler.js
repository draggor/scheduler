var dialogFieldObjs;
var positions = {};
var hosts = {};

$(function() {
	timeLabel();
	dayLabel();
	var rooms = ['Bee Hall', 'Conference', 'Gluttony', 'Hell', 'My Butt', 'Your butt'];
	for(var i in rooms) {
		$('#time-label').after($('<div>').addClass('room-highlight'));
		$('#rooms').append($('<div>').addClass('room-label').html(rooms[i]));
	}
	$('#add').click(addEventDialog);
	$('#dialog input[name="add_host"]').click(addHostDialog);
	dialogFieldObjs = getDialogFields();
});

var getId = (function() {
	var cnt = 0;
	return function() {
		return cnt++;
	}
})();

function noop() {}

function getDialogFields() {
	var m = {};
	$('#dialog fieldset label').each(function() {
		var name = $(this).attr('for');
		m[name] = wrapDialogField($(this).parent().find('[name="' + name + '"]'));
	});
	return m;
}

function wrapDialogField(field) {
	var val = function() { return field.val(); }
	  , reset = function() { field.val('').removeClass('ui-state-error'); }
	  , tagName = field.prop('tagName')
	  , inputType = field.attr('type')
	  ;
	console.log(tagName + ' ' + inputType);
	if (tagName == 'SELECT') {
		
	} else if (tagName == 'INPUT') {
		if(inputType == 'button') {
			reset = noop;
		}
	}
	return {val: val, reset: reset};
}

function addEventDialog() {
	var self = this;
	$('#dialog').dialog({
		modal: true
	,	buttons: {
			Create: function() {
				addEvent.call(self, dialogFieldObjs);
				$(this).dialog("close");
			}
		,	Cancel: function() {
				$(this).dialog("close");
			}
		}
	,	close: function() {
			$.each(dialogFieldObjs, function(i, v) { this.reset(); });
		}
	});
}

function addHostDialog() {
	var input = $('#addhostdialog input')
	  , hostSelect = $('#dialog select[name="host"]');
	  ;
	$('#addhostdialog').dialog({
		modal: true
	,	buttons: {
			Add: function() {
				var host = input.val()
				  , lower = host.toLowerCase()
				  ;
				if(hosts[lower]) {
					input.addClass('ui-state-error');
				} else {
					hosts[lower] = host;
					hostSelect.append($('<option>', {value:host}).html(host));
					$(this).dialog('close');
				}
			}
		,	Cancel: function() {
				$(this).dialog('close');
			}
		}
	,	close: function() {
			$(this).find('input').val('').removeClass('ui-state-error');
		}
	});
}

function getWidth(duration) {
	var d = parseFloat(duration);
	if(!d) {
		d = .5;
	}
	return Math.floor(160.0 * d);
}

function store(item) {
	var json = {
		top: item.css('top')
	,	left: item.css('left')
	,	name: item.data('name')
	,	time: item.data('time')
	};
	positions[item.attr('id')] = json;
	return item;
}

function makeEvent(dialogFields) {
	var data = {
		name: dialogFields.event_name.val()
	,	time: dialogFields.duration.val()
	,	hasmoved: false
	,	id: 'eventid' + getId()
	};
	var css = {
		width: getWidth(data.time)
	};
	var item = $('<div>', {id:data.id}).addClass('border-label').html(data.name).data(data).css(css);
	store(item);
	return item;
}

function addEvent(dialogFields) {
	var newEvent = makeEvent(dialogFields);
	$(this).after(newEvent);
	newEvent.draggable({
		grid: [80,20]
	,	appendTo: 'body'
	,	stop: function(event, ui) {
			$(event.target).css({
				position:'absolute'
			,	top: ui.position.top
			,	left: ui.position.left
			});
			store($(event.target));
		}
	});
}

function blankLabel() {
	return $('<span>').addClass('time-label').html('&nbsp');
}

function ampm(i) {
	return (Math.floor(i/12)+1)%2 == 0 ? 'am' : 'pm';
}

function timeLabel() {
	var div = $('#time-label').append(blankLabel()).append(blankLabel());
	for(var i = 0; i < 61; i++) {
		var hour = i % 12;
		hour = hour || 12;
		div.append($('<span>').addClass('time-label').html(hour + ampm(i))).append(blankLabel());
	}
}

function dayLabel() {
	var div = $('#day-label').append(blankLabel()).append(blankLabel());
	var days = ['Friday', 'Friday', 'Saturday', 'Saturday', 'Saturday', 'Saturday', 'Sunday', 'Sunday', 'Sunday', 'Sunday', 'Monday'];
	for(var i = 0; i < 121; i++) {
		if(i % 12 == 0) {
			div.append($('<span>').addClass('time-label').html(days.shift()));
		} else {
			div.append(blankLabel());
		}
	}
}
