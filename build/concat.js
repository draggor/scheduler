var DIALOG_FIELDS;
var POSITIONS = {};
var HOSTS = {};
var CMD = {};
var OVERLAP = new Array(122);

for(var i = 0; i < OVERLAP.length; i++) {
	OVERLAP[i] = {};
}

function noop() {}

var getId = (function() {
	var cnt = 0;
	return function() {
		return cnt++;
	}
})();

function getWidth(duration) {
	var d = parseFloat(duration);
	if(!d) {
		d = .5;
	}
	return Math.floor(160.0 * d);
}

function getSlotPosition(left) {
	return Math.floor((left - 168) / 80);
}

function getSlots(time) {
	var s = Math.ceil(time/.5);
	return isNaN(s) || s === 0 ? 1 : s;
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

CMD.add_host = function(host, lower) {
	var input = $('#addhostdialog input')
	  , hostSelect = $('#dialog select[name="host"]');
	  ;
	if(HOSTS[lower]) {
		input.addClass('ui-state-error');
	} else {
		HOSTS[lower] = host;
		hostSelect.append($('<option>', {value:host}).html(host));
		$('#addhostdialog').dialog('close');
	}
};

CMD.edit = function(id, name, time, host) {
	var data = {
		name: name
	,	time: time
	,	host: host
	};
	var css = {
		width: getWidth(time)
	};
	var e;
	if(id === -1) {
		e = addEvent.call($('#add'));
	} else {
		e = $('#' + id);
		var old = POSITIONS[id];
		if(old.host !== host || old.time !== time) {
			var slotp = getSlotPosition(old.left)
			  , slots = getSlots(old.time)
			  ;
			overlapRemove(id, e, old, slotp, slots);
			slots = getSlots(time);
			overlapAdd(id, host, slotp, slots);
		}
	}
	e.html(data.name).data(data).css(css);
	var revert = false;
	e.draggable({
		grid: [80,20]
	,	appendTo: 'body'
	,	revert: 'invalid'
	,	revertDuration: 0
	,	helper: function() {
			return $('<div>').addClass('border-label').html(data.name).css(css).css({background:'gray'});
		}
	}).droppable({
		accept: '.border-label'
	,	over: function(event, ui) {
			ui.helper.data('revert', true);
		}
	,	out: function(event, ui) {
			ui.helper.data('revert', false);
		}
	});
	store(e);
	return e;
}

CMD.move = function(id, top, left) {
	var old = POSITIONS[id]
	  , curr = $('#' + id)
	  , slotp = getSlotPosition(old.left)
	  , slots = old ? getSlots(old.time) : getSlots(curr.data('time'))
	  , host = old.host
	  ;
	if(old && slotp >= 0) {
		overlapRemove(id, curr, old, slotp, slots);
	}

	store($('#' + id).css({
		position:'absolute'
	,	top: top
	,	left: left
	}))

	slotp = getSlotPosition(left);
	overlapAdd(id, host, slotp, slots);
};



$(function() {
	timeLabel();
	dayLabel();
	var rooms = ['Bee Hall', 'Conference', 'Gluttony', 'Hell', 'My Butt', 'Your butt'];
	for(var i in rooms) {
		$('#time-label').after($('<div>').addClass('room-highlight'));
		$('#rooms').append($('<div>').addClass('room-label').html(rooms[i]));
		$('#time-label').after($('<div>').addClass('room-highlight'));
		$('#rooms').append($('<div>').addClass('room-label').html(rooms[i]));
	}
	$('div.room-highlight').each(function() {
		$(this).droppable({
			accept: '.border-label'
		,	drop: function(event, ui) {
				if(ui.helper.data('revert') || (ui.position.top < 68 || ui.position.left < 168)) {
					//we used to have to move the helper back to its origin here, now we just do nothing.
				} else {
					send(['move', [ui.draggable.attr('id'), ui.position.top, ui.position.left]]);
				}
			}
		});
	});
	$('#add').click(addEventDialog);
	$('#dialog input[name="add_host"]').click(addHostDialog);
	DIALOG_FIELDS = getDialogFields();
});

function send(msg) {
	CMD[msg[0]].apply(null, msg[1]);
}

function getDialogFields() {
	var m = {};
	$('#dialog fieldset label').each(function() {
		var name = $(this).attr('for');
		m[name] = wrapDialogField($(this).parent().find('[name="' + name + '"]'));
	});
	return m;
}

function wrapDialogField(field) {
	var val = function(v) { return v ? field.val(v) : field.val(); }
	  , reset = function() { field.val('').removeClass('ui-state-error'); }
	  , tagName = field.prop('tagName')
	  , inputType = field.attr('type')
	  ;
	//console.log(tagName + ' ' + inputType);
	if (tagName == 'SELECT') {
		
	} else if (tagName == 'INPUT') {
		if(inputType == 'button') {
			reset = noop;
		}
	}
	return {val: val, reset: reset};
}

function populateFields(id) {
	var item = POSITIONS[id];
	DIALOG_FIELDS.event_name.val(item.name);
	DIALOG_FIELDS.host.val(item.host);
	DIALOG_FIELDS.duration.val(item.time);
}

function addEventDialog() {
	$('#dialog').dialog({
		modal: true
	,	buttons: {
			Create: function() {
				editEvent(-1, DIALOG_FIELDS);
				$(this).dialog("close");
			}
		,	Cancel: function() {
				$(this).dialog("close");
			}
		}
	,	close: function() {
			$.each(DIALOG_FIELDS, function(i, v) { this.reset(); });
		}
	});
}

function editEventDialog() {
	var self = $(this);
	populateFields(self.attr('id'));
	$('#dialog').dialog({
		modal: true
	,	buttons: {
			Save: function() {
				editEvent(self.attr('id'), DIALOG_FIELDS);
				$(this).dialog("close");
			}
		,	Cancel: function() {
				$(this).dialog("close");
			}
		}
	,	close: function() {
			$.each(DIALOG_FIELDS, function(i, v) { this.reset(); });
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
				if(HOSTS[lower]) {
					input.addClass('ui-state-error');
				} else {
					send(['add_host', [host, lower]]);
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

function store(item) {
	var json = {
		top: parseInt(item.css('top').slice(0, -2))
	,	left: parseInt(item.css('left').slice(0, -2))
	,	name: item.data('name')
	,	time: item.data('time')
	,	host: item.data('host')
	};
	POSITIONS[item.attr('id')] = json;
	return item;
}

function editEvent(id, dialogFields) {
	var name = dialogFields.event_name.val()
	  , time = parseFloat(dialogFields.duration.val())
	  , host = dialogFields.host.val()
	  ;
	time = isNaN(time) ? .5 : time;
	send(['edit', [id, name, time, host]]);
}

function addEvent() {
	var data = {
		hasmoved: false
	,	revert: false
	,	id: 'eventid' + getId()
	};
	var css = {
		width: getWidth(.5)
	};
	var newEvent = $('<div>', {id:data.id}).addClass('border-label').html(data.name).data(data).css(css);
	$(this).after(newEvent);
	newEvent.dblclick(editEventDialog);
	return newEvent;
}

function overlapRemove(id, ev, old, slotp, slots) {
	var host = old.host;
	ev.removeClass('conflict');
	for(var i = slotp; i < slotp + slots; i++) {
		OVERLAP[i][host] = OVERLAP[i][host].filter(function(v) { return v !== id; });
		if(OVERLAP[i][host].length === 1) {
			$('#' + OVERLAP[i][host][0]).removeClass('conflict');
		}
	}
}

function overlapAdd(id, host, slotp, slots) {
	for(var i = slotp; i < slotp + slots; i++) {
		if(OVERLAP[i][host]) {
			OVERLAP[i][host].push(id);
			if(Object.keys(OVERLAP[i][host]).length >= 2) {
				$.each(OVERLAP[i][host], function(index, value) {
					$('#' + value).addClass('conflict');
				});
			}
		} else {
			OVERLAP[i][host] = [id];
		}
	}
}
