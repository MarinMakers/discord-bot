//This is the main script for the bot. To start the bot, run this script with node
try {
	var Discord = require("discord.js");
} catch (e){
	console.log("Please run npm install and ensure it passes with no errors!");
	process.exit();
}

try {
	var discord_auth = require('./auth.json');
} catch (e) {
	console.log("Auth file not found!");
}

var http = require('http');
var Twitter = require('twitter');

var twitter_client = new Twitter({
	consumer_key: discord_auth.twitter.consumer_key,
	consumer_secret: discord_auth.twitter.consumer_secret,
	access_token_key: discord_auth.twitter.access_token_key,
	access_token_secret: discord_auth.twitter.access_token_secret
})

var bot = new Discord.Client();
var twitter_bot = require('./nifty/twitter.js');
var decider = require('./nifty/decisions.js');

var commands = {
	'!tweet': {
		process: function(user,channel,text) {
			twitter_bot.postTweet(twitter_client, user, text, function(success){
				if(success){
					bot.sendMessage(message.channel, "Tweet posted!")
				}else{
					bot.sendMessage(message.channel, "Tweet failed to post :( !")
				}
			})
		},
		usage: "!tweet <tweet body>",
		description: "Post a tweet from the twitter channel"
	},
	'!help': {
		process: function(user) {
			bot.sendMessage(user, "Available Commands:", function() {
				for (var cmd in commands) {
					var info = cmd;
					var usage = commands[cmd].usage;
					if (usage) {
						info += " " + usage;
					}
					var description = commands[cmd].description;
					if(description){
						info += "\n\t" + description;
					}
					bot.sendMessage(user,info);
				}
			})
		},
		usage: "!help",
		description: "PM's users a list of commands and invocation"
	},
	'!roll': {
		process: function(user,channel,arguements) {
			decider.rollDice
		},
		usage: "!roll <d20 syntax>",
		description: "Roll dice using d20 syntax"
	}
}

function output(error, token) {
    if (error) {
        console.log('There was an error logging in: ' + error);
        return;
    } else {
        console.log('Logged in. Token: ' + token);
    }
}

bot.loginWithToken(discord_auth.token, output);

bot.on('message', function(message){
	//if bot is mentioned
	if (message.isMentioned(bot.user)) {
		//Trim the mention from the message and any whitespace
		var command = message.content.substring(bot.user.id.length+4,message.content.length).trim();
		//If first character is !, <insert hella commands>
		if (command.substring(0,1) === "!") {
			var to_execute = command.split(' ')[0];
			var argument = command.substring(command.indexOf(' ')+1, command.length);
			console.log('command: ' + to_execute);
			console.log('argument: ' + argument);
			if (commands[to_execute]) {
				if (to_execute == '!help') {
					commands[to_execute].process(message.author, argument);
				} else {
					commands[to_execute].process(message.author, message.channel, argument, function(result){
						bot.sendMessage(message.channel, "result: " + result)
					})
				}
			}  else {
				bot.sendMessage(message.channel, "Unknown Command");
			}
		}
	}
})

http.createServer().listen(6969, function(){
	console.log("Listening on port 6969");
})
