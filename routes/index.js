var express = require('express');
var router = express.Router();
var www = require('../bin/www');
var util = require('util');

function now() {
  return (new Date).getTime();
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Timer Setup' });
});

router.get('/timer', function(req, res, next) {
  res.render('timer', { title: 'Universal Timer' });
});

router.get('/prefsGet', function(req, res, next) {
  var json = { rtc: (new Date()).getTime() };
//  console.log("nix:"+util.inspect(json, false, null));  
  res.send(json);
});

router.get('/timersGet', function(req, res, next) {
  var json=www.storage.valuesWithKeyMatch(/uuid-/);
//  console.log("nix:"+util.inspect(json, false, null));  
  res.send(json);
});

router.get('/timerDelete', function(req, res, next) {
  www.storage.getItem("uuid-" + req.query.uuid, function(err, json) {
    if(json) {
      if(json.lastChanged == req.query.lastChanged) {
        www.storage.removeItem("uuid-" + req.query.uuid, function(err) {
          var json=www.storage.valuesWithKeyMatch(/uuid-/);
//    	  console.log("nix:"+util.inspect(json, false, null));  
          res.send(json);
          www.send('timersChanged', json);
        });
      }
    }
  });
});

router.get('/timerSet', function(req, res, next) {
  console.log(util.inspect(req.query.uuid, false, null));
  www.storage.getItem("uuid-" + req.query.uuid, function(err, json) {
      if(!json || json.lastChanged == req.query.lastChanged) {
        req.query.lastChanged = now();
        www.storage.setItem("uuid-"+req.query.uuid, req.query, function(err) {
          var json=www.storage.valuesWithKeyMatch(/uuid-/);
          res.send(json);
          var prefs = { rtc: (new Date()).getTime() };
          www.send('prefsChanged', prefs); 
          www.send('timersChanged', json);
        });
    }
  });
});

router.get('/timerStart', function(req, res, next) {
  www.storage.getItem("uuid-" + req.query.uuid, function(err, json) {;
    if(json) {
      if(json.lastChanged == req.query.lastChanged) {
        console.log(util.inspect(json, false, null));
        json.lastChanged = json.timerStarted = now();;
        console.log(util.inspect(json, false, null));
        www.storage.setItem("uuid-"+req.query.uuid, json, function(err) {
          var json=www.storage.valuesWithKeyMatch(/uuid-/);
          res.send(json);
          var prefs = { rtc: (new Date()).getTime() };
          www.send('prefsChanged', prefs); 
          www.send('timersChanged', json);
        });
      }
    }
  });
});

router.get('/timerStop', function(req, res, next) {
  www.storage.getItem("uuid-" + req.query.uuid, function(err, json) {;
    if(json) {
      if(json.lastChanged == req.query.lastChanged) {
        console.log(util.inspect(json, false, null));
        json.lastChanged = json.timerStopped = now();
        console.log(util.inspect(json, false, null));
        www.storage.setItem("uuid-"+req.query.uuid, json, function(err) {
          var json=www.storage.valuesWithKeyMatch(/uuid-/);
          res.send(json);
          var prefs = { rtc: (new Date()).getTime() };
          www.send('prefsChanged', prefs); 
          www.send('timersChanged', json);
        });
      }
    }
  });
});
router.get('/timerEnable', function(req, res, next) {
  www.storage.getItem("uuid-" + req.query.uuid, function(err, json) {;
    if(json) {
      if(json.lastChanged == req.query.lastChanged) {
        console.log(util.inspect(json, false, null));
        json.timerEnabled = 1;
        json.lastChanged = now();
        console.log(util.inspect(json, false, null));
        www.storage.setItem("uuid-"+req.query.uuid, json, function(err) {
          var json=www.storage.valuesWithKeyMatch(/uuid-/);
          res.send(json);
          var prefs = { rtc: (new Date()).getTime() };
          www.send('prefsChanged', prefs); 
          www.send('timersChanged', json);
        });
      }
    }
  });
});
router.get('/timerDisable', function(req, res, next) {
  www.storage.getItem("uuid-" + req.query.uuid, function(err, json) {;
    if(json) {
      if(json.lastChanged == req.query.lastChanged) {
        console.log(util.inspect(json, false, null));
        json.timerEnabled = 0;
        json.lastChanged = now(); 
        console.log(util.inspect(json, false, null));
        www.storage.setItem("uuid-"+req.query.uuid, json, function(err) {
          var json=www.storage.valuesWithKeyMatch(/uuid-/);
          res.send(json);
          var prefs = { rtc: (new Date()).getTime() };
          www.send('prefsChanged', prefs); 
          www.send('timersChanged', json);
        });
      }
    }
  });
});
router.get('/pushURL', function(req, res, next) {
  www.send('prefsChanged', req.query);
});

module.exports = router;
