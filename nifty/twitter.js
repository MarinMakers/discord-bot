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
//	if(user.hasRole("tweeter")){
		console.log("user has roll of tweeter")
		client.post('statuses/update', {status: tweet}, function(error, tweet, response){
			if(error){
				console.log('error: ' + error)
			}
			else {
				done()
			}
			console.log("Tweeted: " + tweet)
			console.log("Response: " + response)
		})
//	}else{
//		console.log("kill yourself")
//	}
}

var search = function(query){
	//search that shit
}

module.exports = {
	postTweet: postTweet,
	search: search
}
