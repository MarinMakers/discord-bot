var Twitter = require('twitter');
var fs = require('fs');

var getTime = function(){
	var date = new Date();
	return date.getTime();
}

var getTimestamp = function(time){
	var date = new Date(time);
	var timestampReadable = (date.getMonth()+1).toString() + '/' + date.getDate() + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
	return timestampReadable;
}

try {
	var discord_auth = require('../auth.json');
} catch (e) {
	console.log("Auth file not found!");
}

try {
	var trendingFile = JSON.parse(fs.readFileSync('./db/trending.json'));
}catch (e){
	console.log("Initializing trending.json...");
	fs.writeFileSync('./db/trending.json', '{"time":"new","length":0}');
	trendingFile = JSON.parse(fs.readFileSync('./db/trending.json'));
}


var initialize = function(messageFunction){
	var twitterClient = new Twitter({
		consumer_key: discord_auth.twitter.consumer_key,
		consumer_secret: discord_auth.twitter.consumer_secret,
		access_token_key: discord_auth.twitter.access_token_key,
		access_token_secret: discord_auth.twitter.access_token_secret	
	});

	messageFunction("Initialized! Fire at will, captain.");
	return twitterClient;
}

var postTweet = function(twitterClient, tweet, messageFunction){
	if(twitterClient){
		twitterClient.post('statuses/update', {status: tweet}, function(error, tweet, response){
			if(error){
				console.log('error: ' + error);
				messageFunction("Error posting tweet...");
			}
			else {
				messageFunction("Posted tweet successfully!");
			};
			console.log("Tweeted: " + tweet);
			console.log("Response: " + response);
		})
	}else{
		messageFunction("You must run '!twitter initialize' before you can post a tweet!");
	}
}

var search = function(twitterClient, query, messageFunction){
	if(twitterClient){
		twitterClient.get('search/tweets', {q: query, lang: 'en'}, function(error, tweets, response){
			if(error){
				console.log('error: ' + error);
				messageFunction("Error searching Twitter for " + query + ".");
			}
			var tweets = tweets.statuses;
			if(tweets.length > 0){
				var max = (tweets.length >= 5) ? 5 : tweets.length;
				for(var i = 0; i < max; i++){
					messageFunction('Tweet: ' + tweets[i].text + ' ", by: ' + tweets[i].user.screen_name);
				}
			}else{
				messageFunction("No tweets found matching your search for " + query);
			}
		})
	}else{
		messageFunction("You must run '!twitter initialize' before you can search twitter!");
	}
}

var getTrending = function(twitterClient, messageFunction){
	if(twitterClient){
		if(trendingFile.time == "new" || getTime() - trendingFile.time >= 900000){
			console.log('pulling');
			twitterClient.get('trends/place', {id: 23424977}, function(error, tweets, response){
				if(error){
					console.log(error);
					messageFunction("Error pulling trends...");
				};
				trendingFile.time = getTime();
				var trends = tweets[0].trends;
				trendingFile.length = trends.length;
				for(var i = 0; i < trends.length; i++){
					trendingFile[i] = trends[i];
				}
				messageFunction("Pulled new trending subjects");
				sendTrending(messageFunction);
				fs.writeFile('./db/trending.json', JSON.stringify(trendingFile));
			})
		}else{
			messageFunction("Showing trending subjects from " + getTimestamp(trendingFile.time));
			sendTrending(messageFunction);
		}
	}else{
		messageFunction("You must run '!twitter initialize' before you can track trends on twitter!")
	}
}

var sendTrending = function(messageFunction){
	var trendingString = 'Trending on Twitter right now: '
	for(var i = 0; i < trendingFile.length; i++){
		trendingString += trendingFile[i].name + ', '
	}
	console.log(trendingString);
	messageFunction(trendingString);
}

module.exports = {
	postTweet: postTweet,
	initialize: initialize,
	search: search,
	getTrending: getTrending
}
