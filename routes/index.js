var express = require('express');
var router = express.Router();
var www = require('../bin/www');
var util = require('util');

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
  www.storage.removeItem("uuid-" + req.query.uuid, function(err) {
    var json=www.storage.valuesWithKeyMatch(/uuid-/);
//  console.log("nix:"+util.inspect(json, false, null));  
    res.send(json);
    www.send('timersChanged', json);
    });
});

router.get('/timerSet', function(req, res, next) {
  console.log(util.inspect(req.query.uuid, false, null));
  www.storage.setItem("uuid-"+req.query.uuid, req.query, function(err) {
    var json=www.storage.valuesWithKeyMatch(/uuid-/);
    res.send(json);
    var prefs = { rtc: (new Date()).getTime() };
    www.send('prefsChanged', prefs); 
    www.send('timersChanged', json);
  });
});

router.get('/timerStart', function(req, res, next) {
  www.storage.getItem("uuid-" + req.query.uuid, function(err, json) {;
    if(json) {
        console.log(util.inspect(json, false, null));
        json.timerStarted=(new Date()).getTime();
        console.log(util.inspect(json, false, null));
        www.storage.setItem("uuid-"+req.query.uuid, json, function(err) {
          var json=www.storage.valuesWithKeyMatch(/uuid-/);
          res.send(json);
          var prefs = { rtc: (new Date()).getTime() };
          www.send('prefsChanged', prefs); 
          www.send('timersChanged', json);
        });
    }
  });
});

router.get('/timerStop', function(req, res, next) {
  www.storage.getItem("uuid-" + req.query.uuid, function(err, json) {;
    if(json) {
        console.log(util.inspect(json, false, null));
        json.timerStopped=(new Date()).getTime();
        console.log(util.inspect(json, false, null));
        www.storage.setItem("uuid-"+req.query.uuid, json, function(err) {
          var json=www.storage.valuesWithKeyMatch(/uuid-/);
          res.send(json);
          var prefs = { rtc: (new Date()).getTime() };
          www.send('prefsChanged', prefs); 
          www.send('timersChanged', json);
        });
    }
  });
});

module.exports = router;
