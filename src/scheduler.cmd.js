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
	,	revert: false
	,	helper: function() {
			return $('<div>').addClass('border-label').html(data.name).css(css).css({background:'gray'});
		}
	,	start: function(event, ui) {
			ui.helper.data('original-position', ui.helper.offset());
		}
	,	stop: function(event, ui) {
			if(ui.position.top < 68 || ui.position.left < 168) {
				ui.helper.offset(ui.helper.data('original-position'));
			} else {
				send(['move', [$(event.target).attr('id'), ui.position.top, ui.position.left]]);
			}
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


