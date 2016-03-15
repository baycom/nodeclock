	var timers;
	var timerParms;
	var selectedTimer;
	var timerStarted;
	var timerStopped;
	var timerFormat;
	var nowms;
	var secs;
	var hours;
	var minutes;
	var seconds;
	var uuid;
	var socket = io();
	var timeSkew = 0;
	var beep1 = new Audio("/media/beep-1.mp3");
	var beep4 = new Audio("/media/countdown.mp3");
	var intervalTimer;

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
  		for (var i=0;i<vars.length;i++) {
    			var pair = vars[i].split("=");
        		// If first entry with this name
    			if (typeof query_string[pair[0]] === "undefined") {
      				query_string[pair[0]] = decodeURIComponent(pair[1]);
        		// If second entry with this name
    			} else if (typeof query_string[pair[0]] === "string") {
      				var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      				query_string[pair[0]] = arr;
        		// If third or later entry with this name
    			} else {
      				query_string[pair[0]].push(decodeURIComponent(pair[1]));
    			}
  		} 
    		return query_string;
	}();
        function findUUID(uuid) {
		for(var i = 0; i < timers.length; i++){
  			if(timers[i].uuid == uuid){
    				return timers[i];
  			}
		}
		return null;
	}
        function fillSelect(data) {
                var $select = $('#timers');
                if(data) {
                        timers = data;
                        $select.html('<option value="-1">Select or add Timer</option>');
                        $.each(data, function(key, val){
                                console.debug("add:"+key+" val:"+val.timerName);
                                $select.append('<option value="' + val.uuid + '">' + val.timerName + '</option>');
                        });
                } else {
                        $select.html('<option id="-1">none available</option>');
                        toastr.error("No timers available.");
                }
        }
	function timerByUUID(uuid) {
		selectedTimer = findUUID(uuid);
		if(selectedTimer) {
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
		var myURL = document.location;
		document.location = myURL + "?uuid="+uuid;
        }
	function displayDaytime() {
		var now = new Date (nowms);
		hours = now.getHours();
		minutes = now.getMinutes();
		seconds = now.getSeconds();
	}
	function parseTime(timeStr) {
		var t = timeStr.split(':');
		if(t.length > 5 ) {
			return (+t[0]) * 60 * 60 + (+t[1]) * 60 + (+t[2]); 
		} else {
			return (+t[0]) * 60 + (+t[1]); 
		}
		return 0;
	}
	function displayCounter(timerMode) {
		var interval = parseInt(selectedTimer.timerOperation)==2?1:0;
		var timerLength = parseTime(selectedTimer.timerLength);
		var secsSinceStart = (nowms-timerStarted)/1000;

		if(parseInt(selectedTimer.timerRestartButton)) {
                        $("#restart").show();
		} else {
		        $("#restart").hide();
		}
                timerLength+=1;
	
		switch(timerMode) {
			case 1: // count down
				if(interval) {
                                        secs = Math.floor(secsSinceStart)%timerLength;
                                        secs = timerLength - secs -1;
				        console.debug("secs:"+secs);
				} else {
                                        secs = Math.floor(timerLength-secsSinceStart);
					secs = (secs > 0)?secs:0;
				}
				break;
			case 2: // count up
				secs = Math.floor(secsSinceStart);
				if(interval) {
					secs %=timerLength;
					secs = Math.abs(secs);
				}
				secs = (secs <= timerLength)?secs:timerLength;
				break;
			case 3: // cound down & up
				secs = Math.floor(timerLength-secsSinceStart);
				secs = Math.abs(secs);
				break;
		}
		hours = Math.floor(secs/3600);
		minutes = Math.floor(secs/60);
		seconds = secs%60;
	}
	function renderTimer() {
		nowms = $.now() - timeSkew;
		var timerMode = parseInt(selectedTimer.timerMode);
		var timerSounds = parseInt(selectedTimer.timerSounds);
		switch(timerMode) {
				case 1: 
				case 2: 
				case 3: displayCounter(timerMode);
					break;
				case 4: displayDaytime(); 
					break;
		}
		if(hours < 10) hours = "0"+hours;
		if(minutes < 10) minutes = "0"+minutes;
		if(seconds < 10) seconds ="0"+seconds;
		
		switch(timerFormat) {
			case 1: $('#timer').text(minutes+':'+seconds);
				break;
			case 2: $('#timer').text(hours+':'+minutes);
				break;
			case 3: $('#timer').text(hours+':'+minutes+':'+seconds);
				break;
		}
		if(timerSounds>0) {
		        if(secs == 5) {
        		        beep4.play();
                        }
		}
		if(timerSounds == 2) {
		        if(secs == 60) {
        		        beep1.play();
                        }
		} 
		
	}
	function startTimer() {
	        $('#timer').fadeIn(1000);
		intervalTimer = setInterval(renderTimer, 300);
	}
	function stopTimer(a) {
		clearInterval(intervalTimer);
		beep4.pause();
		beep4.currentTime=0;
		beep1.pause();
		beep1.currentTime=0;
		$('#timer').fadeOut(1500);
	}
	function timerStart(obj) {
	        console.debug("timerStart");
	        $.get('/timerStart', { 'uuid': selectedTimer.uuid});
	}
	socket.on('timersChanged', function (data) {
		console.debug("timersChanged");
		fillSelect(data);
		if(uuid) {
			timerByUUID(uuid);
			timerStarted = parseInt(selectedTimer.timerStarted);
			timerStopped = parseInt(selectedTimer.timerStopped);
			timerFormat = parseInt(selectedTimer.timerFormat);
			if(timerStarted > timerStopped) {
				startTimer();
			} else {
				stopTimer();
			}
		} else {
			$("#timers").show();
		}
        });
	socket.on('prefsChanged', function (data) {
                timeSkew = $.now()-data.rtc;
                $("#debug").text("skew: "+timeSkew+"ms");
		console.debug("prefsChanged / timeSkew:" + timeSkew);
		timerPrefs = data;	
        });
        function resizeTimer() {
                var newPos;
                if($(window).height()>300) {
                        newPos=150;
                } else {
                        newPos=35;
                }
                var newtop=($(window).height()/2)-newPos;
                $('#timer').css('top', newtop + 'px');        
        }
        $(window).on('resize orientationChange', function(event) {
                resizeTimer();
        });
        $(document).ready(function() {
                $("#timer").click(function() {
                if (BigScreen.enabled) {
                        BigScreen.toggle();
                }
                return false;
        });

                uuid = QueryString.uuid;
                resizeTimer();
        }); 
          