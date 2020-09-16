const express = require('express');	// express web server framework
const request = require('request');	// "request" library
const cors = require("cors"); // cross-origin resource sharing
const querystring = require('querystring'); //this might be able to be qs??
const cookieParser = require('cookie-parser'); //idk what this does

//this is set up so that you can run this app like this: node index.js _clientid_ _client_secret_
//for local development. if the parameters are there it'll run like that
var myArgs = process.argv.slice(2);
const herokuRedirect = 'http://label-explorer.herokuapp.com/callback';
const localRedirect = 'http://localhost:8000/callback';
//if there are 2 parameters passed in, local args. else, internet args
const client_id = (myArgs.length == 2) ? myArgs[0] : process.env.SPOTIFY_CLIENT_ID;
const client_secret = (myArgs.length == 2) ? myArgs[1] : process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = (myArgs.length == 2) ? localRedirect : herokuRedirect;

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string

 the generated string is of length length
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

const app = express();

app.use(express.static(__dirname + '/public'))
	.use(cors())
	.use(cookieParser());

app.get('/login', function(req, res) {
	//create and store a cookie from random number
	var state = generateRandomString(16);
	res.cookie(stateKey, state);

	//web app requests spotify authorization
	var scope = 'user-read-private user-read-email';
	res.redirect('https://accounts.spotify.com/authorize?' + 
		querystring.stringify({
			response_type: 'code',
			client_id: client_id,
			scope: scope,
			redirect_uri: redirect_uri,
			state: state
		}));
});

app.get('/callback', function (req, res){
	//web app requests refresh and access tokens
	//after checking the state parameter

	var code = req.query.code || null;
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies[stateKey] : null;

	if (state == null || state !== storedState){
		//the states do not match, user not authorized
		res.redirect('/#' + 
			querystring.stringify({
				error: 'state_mismatch'
			}));
	} else {
		res.clearCookie(stateKey);
		var authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: 'authorization_code'
			},
			headers: {
				'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
			},
			json: true
		};

		request.post(authOptions, function(error, response, body) {
			if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          //console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
      	//console.log(body);
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
		});
	}
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/secret', (req, res) => {
	res.send('Nice!')
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, () =>{
	console.log('Spotify Web app listening on port ' + port)
});