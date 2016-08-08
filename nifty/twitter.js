
var Twitter = require('twitter');

try {
	var discord_auth = require('../auth.json');
} catch (e) {
	console.log("Auth file not found!");
}

var client = new Twitter({
	consumer_key: discord_auth.twitter.consumer_key,
	consumer_secret: discord_auth.twitter.consumer_secret,
	access_token_key: discord_auth.twitter.access_token_key,
	access_token_secret: discord_auth.twitter.access_token_secret,})

//figure out how to do stuff lol
var postTweet = function(client, user, tweet, done){
	client.post('statuses/update', {status: tweet}, function(error, tweet, response){
		if(error){
			console.log('error: ' + error)
			done(false)
		}
		else {
			done(true)
		}
		console.log("Tweeted: " + tweet)
		console.log("Response: " + response)
	})
}

module.exports = {
	postTweet: postTweet
}
