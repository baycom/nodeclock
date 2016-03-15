       	var selectedTimer = -1;
	var timers;
	var timerParms;
	var socket = io();
	var timeSkew = 0;
	
	toastr.options = {
  		"closeButton": false,
  		"debug": false,
  		"newestOnTop": false,
  		"progressBar": false,
  		"positionClass": "toast-top-right",
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
		console.debug("timersChanged");
		fillSelect(data);
         });
	socket.on('prefsChanged', function (data) {
                timeSkew = $.now()-data.rtc;
		console.debug("prefsChanged / timeSkew:" + timeSkew);
		changeSettings(data);
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
			var data=findUUID(selectedTimer);
			$("#timers option").filter(function() {
			    return $(this).val() == selectedTimer; 
			}).prop('selected', true);

			$("#timerDelete").show();
			$("#timerStartDiv").show();
			$("#timerName").val(data.timerName);
			$("#uuid").val(data.uuid);
			$("#timerStarted").val(data.timerStarted);
			$("#timerStopped").val(data.timerStopped);
			$("#timerLength").val(data.timerLength);
			$("#timerFormat option").filter(function() {
			    return $(this).val() == data.timerFormat; 
			}).prop('selected', true);
			$("#timerMode option").filter(function() {
			    return $(this).val() == data.timerMode; 
			}).prop('selected', true);
			$("#timerOperation option").filter(function() {
			    return $(this).val() == data.timerOperation; 
			}).prop('selected', true);
			$("#timerSounds option").filter(function() {
			    return $(this).val() == data.timerSounds; 
			}).prop('selected', true);
			$("#timerRestartButton option").filter(function() {
			    return $(this).val() == data.timerRestartButton; 
			}).prop('selected', true);
			timerModeSelected();
		} else {
			$("#timerDelete").hide();
			$("#uuid").val('');
			$("#timerStarted").val(0);
			$("#timerStopped").val(0);
			$("#timerStartDiv").hide();
		}
	}
	function timerSelected(sel) {
       		selectedTimer = sel.value;
		updateForm();
		$("#timerParms").hide();
		$("#add").show();
		if(selectedTimer == -1) {
		        $("#preview").html('');
		} else {
                        $("#preview").html('<iframe width="300" height="150" style="-webkit-transform:scale(1.0);-moz-transform-scale(1.0);" src="/timer?uuid='+selectedTimer+'" frameborder="1"></iframe><p><a href="/timer?uuid='+selectedTimer+'" target="timer">Fullscreen</a>');
                }
  	}
	function timerStart(sel) {
		$("#timerStarted").val($.now()+timeSkew);
		$.get('/timerStart', { 'uuid': selectedTimer})
			.done( function(data) {
				toastr.success('Timer started');
			});
  	}
	function timerStop(sel) {
		$("#timerStopped").val($.now()+timeSkew);
		$.get('/timerStop', { 'uuid': selectedTimer})
			.done( function(data) {
				toastr.success('Timer stopped');
			});
  	}
	function timerAdd(obj) {
		$("#timerParms").show();
		$("#add").hide();
        }
	function timerDelete(obj) {
		$("#timerParms").hide();
		$("#add").show();
		$.get('/timerDelete', { 'uuid': selectedTimer})
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
		var regexp = /(([01][0-9]|[02][0-3]):){0,1}[0-5][0-9]:[0-5][0-9]/;
		if($("#timerMode").val() != 4 && !regexp.test(val) || !$("#timerName").val()) {
			toastr.error("Please set a name and a length like HH:MM:SS");
		} else {
			$("#lastChanged").val($.now()+timeSkew);
			if(!$("#uuid").val()) {
				$("#uuid").val(guid());
			}

			$.get('/timerSet', $('#timerForm').serialize())
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
