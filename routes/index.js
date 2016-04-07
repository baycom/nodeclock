var express = require('express');
var router = express.Router();
var www = require('../bin/www');
var util = require('util');

function now() {
  return (new Date).getTime();
}

function sendUpdate(res) {
  var json=www.storage.valuesWithKeyMatch(/uuid-/);
  res.send(json);
  var prefs = { rtc: now() };
  www.send('timersChanged', prefs); 
  www.send('timersChanged', json);
  var cat = prefs+json;
  console.log("sendUpdate");
  console.log(util.inspect(cat, false, null));
}

/* GET home page. */
router.get('/manage', function(req, res, next) {
  console.log("/manage");
  res.render('index', { title: 'Timer Setup' });
});

router.get('/', function(req, res, next) {
  res.writeHead(301, {Location: 'timer'});
  res.end();
});

router.get('/timer', function(req, res, next) {
  console.log("/timer");
  res.render('timer', { title: 'Universal Timer' });
});

router.get('/prefsGet', function(req, res, next) {
  console.log("/prefsGet");
  sendUpdate(res);
});

router.get('/timersGet', function(req, res, next) {
  console.log("/timersGet");
  sendUpdate(res);
});

router.get('/timerDelete', function(req, res, next) {
  console.log("/timerDelete");
  www.storage.getItem("uuid-" + req.query.uuid, function(err, json) {
    if(json) {
      if(json.lastChanged == req.query.lastChanged) {
        www.storage.removeItem("uuid-" + req.query.uuid, function(err) {
          sendUpdate(res);
        });
      } else {
        console.log("lastChanged mismatch");
        sendUpdate(res);
      }
    }
  });
});

router.get('/timerSet', function(req, res, next) {
  console.log("/timerSet");
  console.log(util.inspect(req.query.uuid, false, null));
  www.storage.getItem("uuid-" + req.query.uuid, function(err, json) {
      if(!json || json.lastChanged == req.query.lastChanged) {
        req.query.lastChanged = now();
        www.storage.setItem("uuid-"+req.query.uuid, req.query, function(err) {
          sendUpdate(res);
        });
    } else {
      console.log("lastChanged mismatch");
      sendUpdate(res);
    }
  });
});

router.get('/timerStart', function(req, res, next) {
  console.log("/timerStart");
  www.storage.getItem("uuid-" + req.query.uuid, function(err, json) {;
    if(json) {
      if(json.lastChanged == req.query.lastChanged) {
        console.log(util.inspect(json, false, null));
        json.lastChanged = json.timerStarted = now();;
        console.log(util.inspect(json, false, null));
        www.storage.setItem("uuid-"+req.query.uuid, json, function(err) {
          sendUpdate(res);
        });
      } else {
        console.log("lastChanged mismatch");
        sendUpdate(res);
      }
    }
  });
});

router.get('/timerStop', function(req, res, next) {
  console.log("/timerStop");
  www.storage.getItem("uuid-" + req.query.uuid, function(err, json) {;
    if(json) {
      if(json.lastChanged == req.query.lastChanged) {
        console.log(util.inspect(json, false, null));
        json.lastChanged = json.timerStopped = now();
        console.log(util.inspect(json, false, null));
        www.storage.setItem("uuid-"+req.query.uuid, json, function(err) {
          sendUpdate(res);
        });
      } else {
        console.log("lastChanged mismatch");
        sendUpdate(res);
      }
    }
  });
});
router.get('/timerEnable', function(req, res, next) {
  console.log("/timerEnable");
  www.storage.getItem("uuid-" + req.query.uuid, function(err, json) {;
    if(json) {
      if(json.lastChanged == req.query.lastChanged) {
        console.log(util.inspect(json, false, null));
        json.timerEnabled = 1;
        json.lastChanged = now();
        console.log(util.inspect(json, false, null));
        www.storage.setItem("uuid-"+req.query.uuid, json, function(err) {
          sendUpdate(res);
        });
      } else {
        console.log("lastChanged mismatch");
        sendUpdate(res);
      }
    }
  });
});
router.get('/timerDisable', function(req, res, next) {
  console.log("/timerDisable");
  www.storage.getItem("uuid-" + req.query.uuid, function(err, json) {;
    if(json) {
      if(json.lastChanged == req.query.lastChanged) {
        console.log(util.inspect(json, false, null));
        json.timerEnabled = 0;
        json.lastChanged = now(); 
        console.log(util.inspect(json, false, null));
        www.storage.setItem("uuid-"+req.query.uuid, json, function(err) {
          sendUpdate(res);
        });
      } else {
        console.log("lastChanged mismatch");
        sendUpdate(res);
      }
    }
  });
});
router.get('/pushURL', function(req, res, next) {
  console.log("/pushURL");
  www.send('timersChanged', req.query);
  res.end();
});

module.exports = router;
