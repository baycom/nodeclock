var timers;
var timerParms;
var selectedTimer;
var timerStarted;
var timerStopped;
var timerFormat;
var timerMode;
var timerSounds;
var timerLength;
var timer2Length;
var timerEnabled;
var timerOperation;
var interval;
var nowms;
var secs;
var hours;
var minutes;
var seconds;
var uuid;
var bgcolor;
var fgcolor;
var socket = io();
var timeSkew = 0;
var audioSupported = false;
var intervalTimer = null;
var urlLoaded = false;
var ignorepush = false;
var oldTimeStr = null;
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
var audioPlaying = false;

toastr.options = {
	"closeButton": false,
	"debug": false,
	"newestOnTop": false,
	"progressBar": false,
	"positionClass": "toast-top-left",
	"preventDuplicates": true,
	"onclick": null,
	"showDuration": "300",
	"hideDuration": "1000",
	"timeOut": "5000",
	"extendedTimeOut": "1000",
	"showEasing": "swing",
	"hideEasing": "linear",
	"showMethod": "fadeIn",
	"hideMethod": "fadeOut"
}
var QueryString = function () {
	// This function is anonymous, is executed immediately and 
	// the return value is assigned to QueryString!
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = decodeURIComponent(pair[1]);
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
			query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
			query_string[pair[0]].push(decodeURIComponent(pair[1]));
		}
	}
	return query_string;
}();

function beep(wait = 0, frequency = 440, duration = 1000, volume = 0.5, updateAudioPlaying = true, type = 'square') {
	if (updateAudioPlaying && audioPlaying) return 0;

	setTimeout(function () {
		var oscillator = audioCtx.createOscillator();
		var gainNode = audioCtx.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(audioCtx.destination);

		gainNode.gain.value = volume;
		oscillator.frequency.value = frequency;
		oscillator.type = type;
		audioPlaying = true;
		oscillator.start();
		setTimeout(function () { oscillator.stop(); if (updateAudioPlaying) audioPlaying = false }, duration);
	}, wait);
	return 1;
};

function beep51() {
	console.log("beep51");
	beep(0, 463, 200, 0.5, false);
	beep(1000, 463, 200, 0.5, false);
	beep(2000, 463, 200, 0.5, false);
	beep(3000, 463, 200, 0.5, false);
	beep(4000, 463, 200, 0.5, false);
	beep(5000, 158, 1000, 1);
}
function beep1() {
	beep(0, 463, 200, 1);
}
function beep0() {
	beep(0, 158, 1000, 1);
}

function findUUID(uuid) {
	for (var i = 0; i < timers.length; i++) {
		if (timers[i].uuid == uuid) {
			return timers[i];
		}
	}
	return null;
}
function fillSelect(data) {
	var $select = $('#timers');
	if (data) {
		timers = data;
		$select.html('<option value="-1">Select or add Timer</option>');
		$.each(data, function (key, val) {
			console.debug("add:" + key + " val:" + val.timerName);
			$select.append('<option value="' + val.uuid + '">' + val.timerName + '</option>');
		});
	} else {
		$select.html('<option id="-1">none available</option>');
		toastr.error("No timers available.");
	}
}
function timerByUUID(uuid) {
	selectedTimer = findUUID(uuid);
	if (selectedTimer) {
		document.title = selectedTimer.timerName;
		console.debug(selectedTimer);
	} else {
		toastr.error("Timer not available / deleted!");
		$("#timers").show();
	}
	return selectedTimer;
}
function timerSelected(sel) {
	uuid = sel.value;
	$("#timers").hide();
	updateTimer(uuid);
	window.history.pushState("", "", 'timer?uuid=' + uuid);
}
function renderDaytime() {
	var now = new Date(nowms);
	hours = now.getHours();
	minutes = now.getMinutes();
	seconds = now.getSeconds();
}
function parseTime(timeStr) {
	if (timeStr === undefined) {
		return 0;
	}
	var t = timeStr.split(':');
	if (timeStr.length > 5) {
		return (+t[0]) * 60 * 60 + (+t[1]) * 60 + (+t[2]);
	} else {
		return (+t[0]) * 60 + (+t[1]);
	}
	return 0;
}
function renderCounter(timerMode) {
	var secsSinceStart = (nowms - timerStarted) / 1000;
	var stopped = timerStarted <= timerStopped;
	var tl;

	if (parseInt(selectedTimer.timerRestartButton)) {
		$("#restart").show();
	} else {
		$("#restart").hide();
	}

	if (timerOperation == 3) {
		tl = timerLength + timer2Length;
	} else {
		tl = timerLength;
	}

	if (!interval && timerMode != 2) {
		tl++;
	}

	switch (timerMode) {
		case 1: // count down
			if (stopped) {
				if (timerOperation == 3) {
					tl = timerLength;
				}
				secs = tl - (interval ? 0 : 1);
			} else {
				if (interval) {
					secs = Math.floor(secsSinceStart) % tl;
					secs = tl - secs - 1;
				} else {
					secs = Math.floor(tl - secsSinceStart);
					secs = (secs > 0) ? secs : 0;
				}
				if (timerOperation == 3) {
					if (secs >= timer2Length) {
						secs -= timer2Length;
					} else {
						if (secs == 0) {
							secs = timerLength;
						}
					}
				}
			}
			break;
		case 2: // count up
			if (stopped) {
				secs = 0;
			} else {
				secs = Math.floor(secsSinceStart);
				if (interval) {
					secs %= tl;
					secs = Math.abs(secs);
				}
				secs = (secs <= tl) ? secs : tl;
			}
			break;
		case 3: // count down & up
			if (stopped) {
				secs = tl;
			} else {
				secs = Math.floor(tl - secsSinceStart);
				secs = Math.abs(secs);
			}
			break;
	}
	hours = Math.floor(secs / 3600);
	minutes = Math.floor(secs / 60) % 60;
	seconds = secs % 60;
}
function displayTimer() {
	nowms = $.now() - timeSkew;
	switch (timerMode) {
		case 1:
		case 2:
		case 3: renderCounter(timerMode);
			break;
		case 4: renderDaytime();
			break;
	}
	if (hours < 10) hours = "0" + hours;
	if (minutes < 10 && timerFormat < 4) minutes = "0" + minutes;
	if (seconds < 10) seconds = "0" + seconds;
	timeStr = hours + ':' + minutes + ':' + seconds;
	if (oldTimeStr == timeStr) {
		return;
	}
	oldTimeStr = timeStr;

	switch (timerFormat) {
		case 4: minutes += +hours * 60;
		case 5:
		case 1: $('#timer').text(minutes + ':' + seconds);
			break;
		case 2: $('#timer').text(hours + ':' + minutes);
			break;
		case 3: $('#timer').text(hours + ':' + minutes + ':' + seconds);
			break;
	}
	if (audioSupported) {
		if (timerSounds > 0) {
			if (timerMode == 1 || timerMode == 3) {
				if (secs == 5) {
					beep51();
				}
			}
			if (timerMode == 2) {
				if (timerLength - secs == 5) {
					beep51();
				}
			}
		}
		if (timerSounds == 2) {
			if (timerMode == 1 || timerMode == 3) {
				if (secs == 60) {
					beep1();
				}
			}
			if (timerMode == 2) {
				if (timerLength - secs == 60) {
					beep1();
				}
			}
		}
	}
}
function enableTimer() {
	displayTimer();
	$('#timer').fadeIn(1000);
}
function disableTimer() {
	$('#timer').fadeOut(1500);
}
function startTimer() {
	displayTimer();
	if (audioSupported && timerMode < 4 && timerSounds > 0) {
		if ((interval && (secs == timerLength || secs == timerLength-1)) || (!interval && secs == timerLength) || (timerMode == 2 && secs == 0)) {
			beep0();
		}
	}
	if (!intervalTimer) {
		intervalTimer = setInterval(displayTimer, 10);
	}
}
function stopTimer() {
	clearInterval(intervalTimer);
	intervalTimer = false;

}
function isCounterRunning() {
	if (timerStarted < timerStopped) {
		return false;
	}
	var secs;
	var secsSinceStart = (nowms - timerStarted) / 1000;
	var tl = timerLength;
	if (interval) {
		return true;
	}
	if (!interval && timerMode != 2) {
		tl++;
	}
	switch (parseInt(timerMode)) {
		case 1: // count down
			secs = Math.floor(tl - secsSinceStart);
			console.debug("secs:" + secs);
			if (secs > 0) {
				return true;
			}
			break;
		case 2: // count up
			secs = Math.floor(secsSinceStart);
			if (secs <= tl) {
				return true;
			}
			break;
		case 3: // count down & up
		case 4: // daytime
			return true;
			break;
	}
	return false;
}
function timerStart(obj) {
	console.debug("timerStart");
	if (!isCounterRunning()) {
		$.get('timerStart', {
			'uuid': selectedTimer.uuid,
			'lastChanged': selectedTimer.lastChanged
		});
	}
}
function updateTimer(uuid) {
	timerByUUID(uuid);
	timerStarted = parseInt(selectedTimer.timerStarted);
	timerStopped = parseInt(selectedTimer.timerStopped);
	timerEnabled = parseInt(selectedTimer.timerEnabled);
	timerFormat = parseInt(selectedTimer.timerFormat);
	timerLength = parseTime(selectedTimer.timerLength);
	timer2Length = parseTime(selectedTimer.timer2Length);
	timerMode = parseInt(selectedTimer.timerMode);
	timerSounds = parseInt(selectedTimer.timerSounds);
	timerOperation = parseInt(selectedTimer.timerOperation)
	interval = timerOperation >= 2 ? 1 : 0;
	if (!bgcolor) {
		$('body').css('background-color', selectedTimer.bgcolor);
		$('#timer').css('background-color', selectedTimer.bgcolor);
		$('html').css('background-color', selectedTimer.bgcolor);
	} else {
		$('body').css('background-color', bgcolor);
		$('#timer').css('background-color', bgcolor);
		$('html').css('background-color', bgcolor);
	}
	if (!fgcolor) {
		$('body').css('color', selectedTimer.fgcolor);
	} else {
		$('body').css('color', fgcolor);
	}
	if (timerEnabled) {
		enableTimer();
	} else {
		disableTimer();
	}
	if (timerStarted > timerStopped) {
		startTimer();
	} else {
		stopTimer();
	}
	$("#restart").hide();
	$("#timers").hide();
	resizeTimer();
}
socket.on('timersChanged', function (data) {
	console.debug("timersChanged" + data);
	if (data.rtc) {
		// timeSkew = $.now()-data.rtc;
		//$("#debug").text("skew: "+timeSkew+"ms");
		console.debug("prefsChanged / timeSkew:" + timeSkew);
		timerPrefs = data;
	}
	if (data.url && !ignorepush) {
		var url = data.url;
		var embed = parseInt(data.embed);
		console.debug("pushURL: " + url + " embed: " + embed);
		stopTimer();
		if (embed) {
			$('#timer').css('top', 0);
			var width = $(window).width();
			var height = $(window).height();
			url = url.replace(/%width%/, width).replace(/%height%/, height);
			console.debug(url);
			$('#timer').html(url);
			urlLoaded = true;
		} else {
			uuid = url;
			updateTimer(uuid);
			window.history.pushState("", "", 'timer?uuid=' + uuid);
		}
		$("#timers").hide();
	}
	console.debug("urlLoaded " + urlLoaded);
	if (Array.isArray(data)) {
		fillSelect(data);
		if (uuid) {
			updateTimer(uuid);
		} else {
			if (!urlLoaded) {
				$("#timers").show();
			}
		}
	}
});
function getWidthOfText(txt, fontname, fontsize) {
	var c = document.createElement('canvas');
	var ctx = c.getContext('2d');
	ctx.font = fontsize + "px " + fontname;
	var m = ctx.measureText(txt);
	return m.width;
}
function resizeTimer() {
	var height = document.documentElement.clientHeight;
	var fontsize = Math.floor(height * 0.5);
	var textwidth;
	var windowWidth = $(window).width();
	var font = "Arial, Monaco, Calibri, sans-serif";
	do {
		textwidth = getWidthOfText("00:00:00", font, fontsize);
		fontsize -= 5;
	} while (textwidth > windowWidth);
	var font = fontsize + "px " + font;

	$('#timer').css('font', font);
	var fontheight = parseInt(window.getComputedStyle($("#timer")[0]).fontSize, 10);
	//                console.debug(font + "font size: "+fontsize+"font height: "+fontheight);
	var newtop = (height / 2) - (fontheight / 1.7);
	$('#timer').css('top', newtop + 'px');
}
$(window).on('resize orientationChange', function (event) {
	resizeTimer();
});
$(document).ready(function () {
	$("#timer").click(function () {
		if (BigScreen.enabled) {
			BigScreen.toggle();
			resizeTimer();
		}
		return false;
	});
	if (!QueryString.noaudio) {
		audioSupported = true;
	}
	$("body").css('overflow', 'hidden');
	uuid = QueryString.uuid;
	bgcolor = QueryString.bgcolor;
	fgcolor = QueryString.fgcolor;
	ignorepush = QueryString.ignorepush;
	resizeTimer();
});
