var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var ApiKeySet = require('../models/api_key_set');
var https = require('https');
var querystring = require('querystring');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
	// Make a ApiKeySet tuple which stores customer's api access tokens
	var AKS = new ApiKeySet({ jawboneAccessToken: null, fitbitAccessToken: null, googlefitAccessToken: null });

	// Save ApiKeySet
	AKS.save(function( err, data ) {
		if (err) {
			console.log(err);
		}
		else {
			console.log('Saved : ', data );
		}
	});

	// Account registering through passport module
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

router.get('/fitbitAuth', function(req, res){
	var code = req.query.code;
});

router.get('/jawboneAuth', function(req, res) {
	// variables for exchanging code into token(api key)
	var code		  = req.query.code;
	var client_id	  = 'UyxeL9V3KSQ';
	var client_secret = '86c395e53be487a18b283039170f0f31adc068c7';
	var grant_type	  = 'authorization_code';
	
	console.log('receivied code to exchange : ' + code);

	// for https get request
	var options = {
		host: 'jawbone.com',
		path: '/auth/oauth2/token?client_id='+ client_id + '&client_secret='
				+ client_secret + '&grant_type=' + grant_type + '&code=' + code
	};

	// exchanging code into token
	var jawboneAPIkey = https.get(options, function(Jres) {
		var res_data = '';
		
		Jres.on('data', function(chunk) {
			res_data += chunk;
			console.log(res_data);
		}); // accumulating data chunk to res_data
		
		Jres.on('end', function() {
			var json = JSON.parse(res_data);

			// extracting apiKeySetPK value from user
			var userAKSPK = req.user.apiKeySetPK;

			// Update user's ApiKeySet with AccessToken data
			ApiKeySet.findByIdAndUpdate(userAKSPK, { jawboneAccessToken : res_data }, function(err, found) {
				if (err) {
					console.log(err);
				} else {
					//console.log(found);
				}
			});

			// final rendering
			res.render('jawboneTokenShow', {user : req.user.username, jtoken : json.access_token});
		});
	})
	
	jawboneAPIkey.on('error', function(e) {
		console.log("Got error: " + e.message);
	});
});

router.get('/googlefitAuth', function(req, res) {
	var code	 = req.query.code;
	var res_data = '';

	// Build the post string from an object
	var post_data = querystring.stringify({
    	'code'			: code,
	    'client_id'		: '808917252921-qc0o0bl2v33i3ffk6krc1hng4dt31nn4.apps.googleusercontent.com',
	    'client_secret'	: '6_JBek8GiKWQGHb1ei04WhSa',
		'redirect_uri'	: 'https://yakufit.com/googlefitAuth',
		'grant_type'	: 'authorization_code'
	});

	// An object of options to indicate where to post to
	var post_options = {
		hostname: 'www.googleapis.com',
		path	: '/oauth2/v3/token',
		method	: 'POST',
		headers	: {
			'Content-Type'	: 'application/x-www-form-urlencoded',
			'Content-Length': post_data.length
		}
	};

	// Make a request object to send https req
	// if you can't get the meaning of this codes, see fitbitAuth which is up of this file
	var gfitPOSTreq = https.request(post_options, function(Gres) {
		Gres.setEncoding('utf8');

		Gres.on('data', function(chunk){
			res_data += chunk;
		});		

		Gres.on('end', function() {
			var json = JSON.parse(res_data);
	
			var userAKSPK = req.user.apiKeySetPK;

			ApiKeySet.findByIdAndUpdate(userAKSPK, { googlefitAccessToken : res_data }, function(err, found) {
				if (err) {
					console.log(err);
				} else {
					console.log(found);
				}
			});
					
			res.render('googlefitTokenShow', {user : req.user.username, gtoken : json.access_token});
		});
	});
	
	// Write data to send and Send
	gfitPOSTreq.write(post_data);
	gfitPOSTreq.end();
	
	gfitPOSTreq.on('error', function(e) {
		console.log("Got error: " + e.message);
	});
});

module.exports = router;
