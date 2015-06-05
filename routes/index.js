var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var ApiKeySet = require('../models/api_key_set');
var https = require('https');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
	var AKS = new ApiKeySet({ jawboneAccessToken: null, fitbitAccessToken: null, googlefitAccessToken: null });

	AKS.save(function( err, data ) {
		if (err) {
			console.log(err);
		}
		else {
			console.log('Saved : ', data );
		}
	});

    Account.register(new Account({ username : req.body.username, email : req.body.email, apiKeySetPK : AKS.id }), req.body.password, function(err, account) {
        if (err) {
          return res.render("register", {info: "Sorry. That username already exists. Try again."});
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});


router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/jawboneAuth', function(req, res) {
	var token = req.query.code
	
	console.log(token);

	var options = {
		host: 'jawbone.com',
		path: '/auth/oauth2/token?client_id=UyxeL9V3KSQ&client_secret=86c395e53be487a18b283039170f0f31adc068c7&grant_type=authorization_code&code='+token
	};

	var jawboneAPIkey = https.get(options, function(Jres) {
		var res_data = '';
		
		Jres.on('data', function(chunk) {
			res_data += chunk;
		});
		
		Jres.on('end', function() {
			console.log(res_data);
			
			var json = JSON.parse(res_data);

			var jtoken = json.access_token;

			var userAKSPK = req.user.apiKeySetPK;

			ApiKeySet.findByIdAndUpdate(userAKSPK, { jawboneAccessToken : res_data }, function(err, found) {
				if (err) {
					console.log(err);
				} else {
					console.log(found);
				}
			});
					
			res.render('jawboneTokenShow', {user : req.user.username, jtoken : jtoken});
		});
	})
	
	jawboneAPIkey.on('error', function(e) {
		console.log("Got error: " + e.message);
	});
});

router.get('googlefitAuth', function(res, req) {
	
	
	console.log(token);

	var options = {
		host: 'jawbone.com',
		path: '/auth/oauth2/token?client_id=UyxeL9V3KSQ&client_secret=86c395e53be487a18b283039170f0f31adc068c7&grant_type=authorization_code&code='+token
	};

	var googlefitAPIkey = https.get(options, function(Gres) {
		var res_data = '';
		
		Gres.on('data', function(chunk) {
			res_data += chunk;
		});
		
		Gres.on('end', function() {
			console.log(res_data);
			
			var json = JSON.parse(res_data);

			var gtoken = json.access_token;
			
			var userAKSPK = req.user.apiKeySetPK;

			ApiKeySet.findByIdAndUpdate(userAKSPK, { googlefitAccessToken : res_data }, function(err, found) {
				if (err) {
					console.log(err);
				} else {
					console.log(found);
				}
			});
					
			res.render('googlefitTokenShow', {user : req.user.username, gtoken : gtoken});
		});
	})
	
	googlefitAPIkey.on('error', function(e) {
		console.log("Got error: " + e.message);
	});
});

module.exports = router;