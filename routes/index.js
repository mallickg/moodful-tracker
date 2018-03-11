const express = require('express');
const passport = require('passport');
const {Account} = require('../models/account');
const Entry = require('../models/entry');
const Config = require('../models/team');

const router = express.Router();
const app = express();

//GET /
router.get('/', (req, res) => {
    Config
        .findOne()
        .exec()
        .then(config => {
            var teams = config.teams;
            console.log(config.teams)
            res.render('index', { user : req.user, teams: teams });
        });
});


//POST /register
router.post('/register', (req, res, next) => {
    Account.register(new Account({ username : req.body.username, firstName: req.body.firstName }), req.body.password, (err, account) => {
        if (err) {
          return res.render('index', { error : err.message });
        }
        account.team = req.body.teamName;
        account.save();
        console.log("Account sauvegardé")
        passport.authenticate('local')(req, res, () => {
            req.session.save((err) => {
                if (err) {
                    return next(err);
                }
                res.redirect('/dashboard');
            });
        });
    });
});

//POST LOGIN
router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) {
        return res.render('index', { error : 'Username or password is incorrect' , teams: []});
      }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/dashboard');
      });
    })(req, res, next);
});


//GET /logout
router.get('/logout', (req, res, next) => {
    req.logout();
    req.session.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

router.get('/ping', (req, res) => {
    res.status(200).send("pong!");
});

//GET /log
router.get('/log', (req, res) => {
    if (!req.user) {
      res.redirect('/');
    }
    var allEntries = [];
    Account
        .find({team: req.user.team}, (err, users) => {
            console.log("Accounts found ----> " + users.length);
            for (var i = 0; i < users.length; i++) {
                for (var j = 0; j < users[i].entries.length; j++) {
                    allEntries.push(users[i].entries[j]);
                }
            }
            res.render('log', {user : req.user, entries: allEntries });
        });

});

//GET /addEntry
router.get('/addEntry', (req, res) => {
    if (!req.user) {
      res.redirect('/');
    }

    /*var monEntry = new Entry({ moods : [{name:"angry"}, {name:"amused"}],
                               activities : [{name: "art"}, {name:"chores"}] });

    monEntry.save(function (err) {
        if (err) { throw err; }
        console.log('Entry ajouté avec succès !');
    });*/
    Entry.find(null, (err, entry) => {
        if (err) { throw err; }
        res.render('add', {user : req.user, moods: entry[0].moods, activities:entry[0].activities});
    });
});

//GET /editEntry
router.get('/edit/:date', (req, res) => {
    if (!req.user) {
      res.redirect('/');
    }
    Account 
      .find({_id : req.user.id},{entries: {$elemMatch: {date: Number(req.params.date)}}})
      .exec() 
      .then(user => {
       console.log("Account find ----> " + user);
       Entry
	.findOne()
	.exec()
	.then(entry => {
		var mood = user[0].entries[0].mood;
        var activity = user[0].entries[0].activity;
		console.log("mood found ------> " + mood);
        console.log("activity found ------> " + activity);
		var allMoods = entry.moods;
		console.log("Entry moods value -------> " + entry.moods);
        console.log("Entry activities value -------> " + entry.activities);

        res.render('edit', {user : req.user, entries: user[0].entries[0], moods:entry.moods, activities:entry.activities, mood:mood, activity:activity });
		
   	 })
		
      }) 
      .catch(err => { console.error(err); 
    res.status(500).redirect('/log'); });
});


function repeatMood(allMoods, mood){
		for(var a=0; a<allMoods.length; a++){
			if(allMoods[a].name == mood){
				return mood; 
			}
		}	
		return null;  	
}


function moodData(req, entries){
    console.log("Entries request found " + req.user.entries);
    console.log("Entries found -----> " + entries)
    var lastTen = entries.reverse().slice(-10); //get last 10 entries

    var arr = [];
     for (var i = 0; i < lastTen.length; i++) {
        console.log("Entries[0] ------> " + entries[0]);
        var key = entries[i].mood;
        console.log("key ----> " + key)

        for(var j = 0; j < arr.length; j++){
            var obj = arr[j]

            if (obj.name == key) {

                obj['value']++;
                break;
            }
        }
        if (j == arr.length || arr.length == 0) {
            var obj = {};  
            obj['name'] = key;
            obj['value'] = 1;
            arr.push(obj)
        }
    }
    console.log("Array ----> " + arr)
    return arr;
}


//GET /dashboard
router.get('/dashboard', (req, res) => {
    if (!req.user) {
      res.redirect('/');
      return
    }
    console.log("Request user " + req.user);
    var allEntries = [];
    Account
        .find({team: req.user.team}, (err, users) => {
            console.log("Accounts found ----> " + users.length);
            for (var i = 0; i < users.length; i++) {
                for (var j = 0; j < users[i].entries.length; j++) {
                    allEntries.push(users[i].entries[j]);
                }
            }
            let arr = moodData(req, allEntries);
            res.render('dashboard', {user : req.user, data : arr, entries: allEntries });
        });
});


//POST /addEntry
router.post('/addEntry', (req, res) => {
    Account 
      .findById(req.user.id, (err, user) => {
          console.log("User --------------> " + user);
          user.entries.push({
              'date': Date.now(),
              'mood': req.body.mood,
              'activity': req.body.activity,
              'journal': req.body.journal,
              'user': req.user.firstName
          });
          user.save();
          res.redirect('/log');
      }) 
      .catch(err => { console.error(err); 
    res.status(500).redirect('/log'); });
});

// POST /edit/:date
router.post('/edit/:date', (req, res) => {
    var tabActivity = [];
    var activities = req.body.activity + '';
    console.log("activities str -------> " + activities)
    if (activities.indexOf(",")) {
        var arrayOfActivities = activities.split(",");
        console.log("arrayOfActivities  -------> " + arrayOfActivities);
        tabActivity=arrayOfActivities;
    } else {
        tabActivity.push(req.body.activity);
    }

    Account
      .findById(req.user.id)
      .update(
          {entries: {$elemMatch: {date: Number(req.params.date)}}},
          {$set: {'entries.$.mood': req.body.mood, 
            'entries.$.activity': tabActivity,
            'entries.$.journal': req.body.journal}}
      )
      .exec() 
      .then(user => {
        res.redirect('/log');
      })
      .catch(err => { console.error(err); 
    res.status(500).redirect('/log'); });
});


//GET /delete/:date
router.get('/delete/:date', (req, res) => {
    if (!req.user) {
      res.redirect('/');
    }

    Account
      .findById(req.user.id)
      .update(
          {entries: {$elemMatch: {date: Number(req.params.date)}}},
          { $pull: {entries:{date: Number(req.params.date)} }}
      )
      .exec() 
      .then(user => {
        res.redirect('/log');
      }) 
      .catch(err => { console.error(err); 
    res.status(500).redirect('/log'); });
});


///module.exports = router;
var routes = router;
module.exports = {routes, app};
