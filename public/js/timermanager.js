       	var selectedTimer = -1;
	var timers;
	var timerParms;
	var socket = io();
	var timeSkew = 0;
	var hideGUI = false;
	var timer;

	navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

	function vibrate(length) {
		if (navigator.vibrate) {
			navigator.vibrate([length]);
		}
	}
	
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
	socket.on('timersChanged', function (data) {
		console.debug("timersChanged: "+data);
		if(data.rtc) {
                        timeSkew = $.now()-data.rtc;
	        	console.debug("prefsChanged / timeSkew:" + timeSkew);
	        	changeSettings(data);
		} 
		if(Array.isArray(data)) {
        		fillSelect(data);
                }
         });
        
	function fillSelect(data) {
  		var $select = $('#timers');
		if(data) {
			timers = data;
			$select.html('<option value="-1">Select or add Timer</option>');
			$.each(data, function(key, val){
				console.debug("add:"+key+" val:"+val.timerName);
				$select.append('<option value="' + val.uuid + '">' + val.timerName + '</option>');
			});
			$("#serverok").show();
			updateForm();
		} else {
			$("#timerStartDiv").hide();
			$("#serverok").show();
 			$select.html('<option id="-1">none available</option>');
			toastr.error("No timers available.");
		}
        }
	function changeSettings(data) {
		timerPrefs = data;	
	}
        function findUUID(uuid) {
		for(var i = 0; i < timers.length; i++){
  			if(timers[i].uuid == uuid){
    				return timers[i];
  			}
		}
		return null;
	}
	function updateForm() {
		if(selectedTimer != -1) {
			timer=findUUID(selectedTimer);
			$("#timers option").filter(function() {
			    return $(this).val() == selectedTimer; 
			}).prop('selected', true);

			$("#timerDelete").show();
			$("#timerStartDiv").show();
			$("#timerName").val(timer.timerName);
			$("#bgcolor").val(timer.bgcolor);
			$("#fgcolor").val(timer.fgcolor);
			$("#uuid").val(timer.uuid);
			$("#timerStarted").val(timer.timerStarted);
			$("#timerStopped").val(timer.timerStopped);
			$("#timerEnabled").val(timer.timerEnabled);
			$("#timerLength").val(timer.timerLength);
			$("#timer2Length").val(timer.timer2Length);
			$("#timerFormat option").filter(function() {
			    return $(this).val() == timer.timerFormat; 
			}).prop('selected', true);
			$("#timerMode option").filter(function() {
			    return $(this).val() == timer.timerMode; 
			}).prop('selected', true);
			$("#timerOperation option").filter(function() {
			    return $(this).val() == timer.timerOperation; 
			}).prop('selected', true);
			$("#timerSounds option").filter(function() {
			    return $(this).val() == timer.timerSounds; 
			}).prop('selected', true);
			$("#timerRestartButton option").filter(function() {
			    return $(this).val() == timer.timerRestartButton; 
			}).prop('selected', true);
			timerModeSelected();
		} else {
			$("#timerDelete").hide();
			$("#uuid").val('');
			$("#lastChaged").val(0);
			$("#timerStarted").val(0);
			$("#timerStopped").val(0);
			$("#timerStartDiv").hide();
		}
	}
	function timerSelected(sel) {
       		selectedTimer = $("#timers").val();
		updateForm();
		$("#timerParms").hide();
		$("#add").show();
		if(selectedTimer == -1) {
		        $("#preview").html('');
		} else {
                        $("#preview").html('<iframe width="300" height="150" style="-webkit-transform:scale(1.0);-moz-transform-scale(1.0);" src="timer?uuid='+selectedTimer+'" frameborder="1"></iframe><p><a href="timer?uuid='+selectedTimer+'" target="timer1">Fullscreen</a>');
                }
  	}
	function parseTime(timeStr) {
		var t = timeStr.split(':');
		if(timeStr.length > 5 ) {
			return (+t[0]) * 60 * 60 + (+t[1]) * 60 + (+t[2]); 
		} else {
			return (+t[0]) * 60 + (+t[1]); 
		}
		return 0;
	}
	function isCounterRunning() {	
	        if(timer.timerStarted < timer.timerStopped) {
	                return false;
	        }
	        var secs;
		var secsSinceStart = ($.now()-timer.timerStarted)/1000;
                var tl=parseTime(timer.timerLength);
                var interval = parseInt(timer.timerOperation)==2?1:0;
                if(interval) {
                        return true;
                }
                if(!interval && timer.timerMode !=2) {
                        tl++;
                }
		switch(parseInt(timer.timerMode)) {
			case 1: // count down
                                secs = Math.floor(tl-secsSinceStart);
                                if(secs > 0) {
                                        return true;
                                }       
				break;
			case 2: // count up
				secs = Math.floor(secsSinceStart);
				if(secs <= tl) {
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
  	function pushAPI(url, embed) {
  	        console.debug("Push");
  		$.get('pushURL', { 'url': url,
                                   'embed': embed})
                                              .done( function(data) {
                                                      toastr.success('URL pushed');
                                        });
  	}
  	function push(sel) {
                pushAPI(selectedTimer, 0);
  	}
  	function pushURL(sel) {
                var url=prompt("URL:","");
                var prefix = 'http://';
                if (!url.match(/^http/))	// do NOT prefix https:// urls
                {
                        url = prefix + url;
                }
                pushAPI('<iframe src="'+url+'" scrolling="auto" frameborder="0" width="%width%" height="%height%" allowfullscreen></iframe>',1);
  	}
	function timerStart(sel) {
	        if(!isCounterRunning()) {
                        vibrate(500);
		        $("#timerStarted").val($.now()+timeSkew);
		        $.get('timerStart', { 'uuid': selectedTimer, 
                                              'lastChanged': timer.lastChanged})
                                              .done( function(data) {
                                                      toastr.success('Timer started');
                                        });
                }
        }
	function timerResume(sel) {
		$("#timerResumed").val($.now()+timeSkew);
		$.get('timerResume', { 'uuid': selectedTimer,
                                       'lastChanged': timer.lastChanged})
			.done( function(data) {
				toastr.success('Timer resumed');
			});
  	}
	function timerStop(sel) {
		vibrate(500);
		$("#timerStopped").val($.now()+timeSkew);
		$.get('timerStop', { 'uuid': selectedTimer,
                                     'lastChanged': timer.lastChanged})
			.done( function(data) {
				toastr.success('Timer stopped');
			});
  	}
	function timerEnable(enabled) {
		vibrate(500);
	        console.debug("timerEnable:"+enabled);
		$("#timerEnabled").val(enabled);
		if(enabled) {
        		$.get('timerEnable', { 'uuid': selectedTimer,
        		                       'lastChanged': timer.lastChanged})
	        		.done( function(data) {
                                toastr.success('Timer enabled');
			});
                } else {
        		$.get('timerDisable', { 'uuid': selectedTimer,
        		                        'lastChanged': timer.lastChanged})
	        		.done( function(data) {
                                toastr.success('Timer disabled');
			});
                }
  	}
	function timerAdd(obj) {
		$("#timerParms").show();
		$("#add").hide();
        }
	function timerDelete(obj) {
		$("#timerParms").hide();
		$("#add").show();
		$.get('timerDelete', { 'uuid': selectedTimer,
                                       'lastChanged': timer.lastChanged})
			.done( function(data) {
				toastr.success('Timer deleted');
			});
	}
	function guid() {
 		 function s4() {
    			return Math.floor((1 + Math.random()) * 0x10000)
      				.toString(16)
      				.substring(1);
  		}
  		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	}
	function timerSet(obj) {
		var val = $("#timerLength").val();
		var val2 = $("#timer2Length").val();
		var regexp = /(([01][0-9]|[02][0-3]):){0,1}[0-5][0-9]:[0-5][0-9]/;
		if($("#timerMode").val() != 4 && (!regexp.test(val) || !regexp.test(val2)) || !$("#timerName").val()) {
			toastr.error("Please set a name and a length like HH:MM:SS");
		} else {
		        if(!timer || !timer.lastChanged) {
                                $("#lastChanged").val(0);
		        } else {
                                $("#lastChanged").val(timer.lastChanged);
		        }
			if(!$("#uuid").val()) {
				$("#uuid").val(guid());
			}

			$.get('timerSet', $('#timerForm').serialize())
				.done( function(data) {
					toastr.success("Timer updated");
				});
			$("#timerParms").hide();
			$("#add").show();
		}
	}
	function timerModeSelected(obj) {
		if($("#timerMode").val() == 4) {
			$("#timerModeDiv").hide();
		} else {
			$("#timerModeDiv").show();
		}
	}
	$(function(){
	        $('#bgcolor').colorpicker();
        });
	$(function(){
	        $('#fgcolor').colorpicker();
        });
        $(document).ready(function() {
                $("#hide").click(function() {
                        hideGUI=!hideGUI;
                        if(hideGUI) {
                                $("#hide").html("Show");
                                $("#preview").hide();
                                $("#preview").html("");
                                $("#add").hide();
//                                $("#stop").hide();
                                $("#resume").hide();
                                $("#push").hide();
                                $("#pushURL").hide();
                                $("#enable").hide();
                                $("#disable").hide();
                                $("#timerParms").hide();
                                $("#timerSelector").hide();
                        } else {
                                $("#hide").html("Hide");
                                $("#preview").show();
                                $("#add").show();
//                                $("#stop").show();
                                $("#resume").show();
                                $("#push").show();
                                $("#pushURL").show();
                                $("#enable").show();
                                $("#disable").show();
                                $("#timerSelector").show();
                                timerSelected($("#timers"));
                        }        
                });
                $("#enable").click(function() {
                        timerEnable(true);
                });
                $("#disable").click(function() {
                        timerEnable(false);
                });
                document.title = "Manage "+ window.location.hostname;
                $("#headline").text("Manage "+ window.location.hostname);
        });
        
