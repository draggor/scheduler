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
