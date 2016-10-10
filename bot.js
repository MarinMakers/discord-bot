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

var botParameters = {
	"localMode": ((process.argv.indexOf("-l") != -1 || process.argv.indexOf("-local") != -1) ? true : false)
}

if (botParameters.localMode) {
	console.log("Starting bot in local mode..")
}

var bot = new Discord.Client();

var fs = require('fs');
var Twitter = require('twitter');
var child_process = require('child_process');

//Custom modules
var twitterBot = require('./nifty/twitter.js')(bot);
var decider = require('./nifty/decisions.js')(bot);
var gitHelper = require('./nifty/git.js')(bot);
var lastSeen = require('./nifty/lastseen.js')(bot);
var todo = require('./nifty/todo.js')(bot);

//initialize the twitterClient variable, but don't give it a value
var twitterClient;

//call checkRole(message.sender, message.server, 'role')
bot.checkRole = function(user, server, role){
	for (var i = 0; i < server.roles.length; i++){
		if(server.roles[i].name == role && user.hasRole(server.roles[i])){
			return true;
		}
	}
	return false;
}

var getMethod = function(argument){
	//Grab first word in a command
	if(argument.indexOf(' ') != -1){
		return argument.substring(0, argument.indexOf(' '));
	}else{
		return argument;
	}
}

var getParameter = function(argument){
	return argument.substring(argument.indexOf(' ')+1, argument.length);
}

var commands = {
	//example command object
	//each object has three attributes: process, usage, and description.
	//usage and description are to help users when they run !help
	//the process attribute contains the definition of a function which calls the desired feature,
	//which should be imported from a .js file stored in the nifty directory.
	//In general, one should design their functions to take a callback function as the last parameters, which
	//is to be defined in this object. The callback can handle things like messaging the channel or users.
	//'!example': {
		//process: function(message /*the message object*/, argument /*whatever follows a command (ex. 'hello' in !tweet hello)*/){
			//my_package.myFunction(foo, bar, callbackFunction(){
				//bot.sendMessage(channel, "Example callback executed")	
			//})
		//},
		//usage: "<arguments>", // Do not make usage property if command does not need adtl arguments.
		//description: "This is an example implementation of a command.",
	//},
	'!howtocode':{
		process: function(message, argument){
			message.channel.sendMessage("1. When in doubt, go straight to production.\n2. console.log dat shit!\n3. Eat a banana.")
		},
		description: "Passes on our wisdom."
	},
// 	'!lastseen': {
// 		process: function(message, argument){
// 			lastSeen.lookup(argument, function(msg){
// 				message.channel.sendMessage(msg);
// 			})
// 		},
// 		usage: "<username>",
// 		description: "Tells you the last time a user sent a message on discord, what they said, and where they said it."
// 	},
	'!twitter': {
		process: function(message, argument) {	

			var messageFunction = function(msg){
				message.channel.sendMessage(msg);
			}

			var method = getMethod(argument);

			if (method === "initialize"){
				if (bot.checkRole(message.author, message.server, 'developer')){
					twitterClient = twitterBot.initialize(messageFunction);
				}else{
					messageFunction("Sorry, you must have the role 'developer' to start up my twitter functions.");
				}
			}else if (method === "tweet"){
				var tweet = getParameter(argument);
				if (bot.checkRole(message.author, message.server, 'tweeter')){
					twitterBot.postTweet(twitterClient, tweet, messageFunction);
				} else {
					messageFunction("Sorry, you must have the role 'tweeter' to post a tweet to @MarinMakers. Talk to an admin for permissions.")
				}
			}else if (method === "trending"){
				twitterBot.getTrending(twitterClient, messageFunction);
				//get trending tweets
				// twitterClient = twitterBot.getTrending(twitterClient, messageFunction);
				// messageFunction("This will eventually get trending tweets from twitter");
			}else if (method === "search"){
				//search twitter for the remainder of the argument
				var query = getParameter(argument);
				twitterBot.search(twitterClient, query, messageFunction);
			}else{
				messageFunction("Sorry, I can't tell what you're trying to do.");
			}
			
		},
		usage: "[add <tweet body>] [trending] [search <query>]",
		description: "Post a tweet to @MarinMakers (if you have the role 'tweeter'), check trending topics, search twitter"
	},
	'!todo': {
		//doing this NoSQL because yes.
		process: function(message, argument) {

			var messageFunction = function(msg){
				message.channel.sendMessage(msg);
			}

			var method = getMethod(argument);
			
			if (method === "add"){
				var taskToAdd = getParameter(argument);
				todo.add(taskToAdd, message, messageFunction);
			}  else if (method === "remove"){
				var ids = getParameter(argument);
				todo.remove(ids, message, messageFunction);
			}  else if (method === "complete"){
				var id = getParameter(argument);
				todo.complete(id, message, messageFunction);
				// complete tasks
			}  else if (method === "export") {
				todo.exportList(message, messageFunction,bot);
			}  else{
				todo.showTasks(message, messageFunction);
			}
		},
		usage: "[add <string>] [remove <id>] [complete <id>]",
		description: "Interact with the bot's todo lists."
	},
	'!ping': {
		process: function(message, argument){
			message.channel.sendMessage(message.author + " pong!");
			// console.log("Ping from " + message.author + " aka " + message.author.username);
			// console.log(message.server.memberMap)
			console.log(message.author);
		},
		description: "dumps info on the user to the console of the server."
	},
	'!tableflip': {
		process: function(message,argument) {
			message.channel.sendMessage("(╯°□°）╯︵ ┻━┻");
		},
		description: "Flip a table out of frustration."
	},
	'!pull': {
		process: function(message, argument){
			if (bot.checkRole(message.author, message.server, 'developer')){
				gitHelper.pull(function(msg){
					message.channel.sendMessage(msg);
				})
			}else{
				message.channel.sendMessage("You don't have enough badges to train me!");
			}
		},
		description: "Pulls the bot's code from github on to the server. You must have the role 'developer' to use this functionality."
	},
	'!help': {
		process: function(message, argument) {
			message.author.sendMessage("Available Commands: ", function() {
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
					message.author.sendMessage(info);
				}
			})
		},
		description: "PM's users a list of commands and invocation"
	},
	'!roll': {
		process: function(message, argument) {
			decider.rollDice(argument, function(result){
				message.channel.sendMessage(result)
			})
		},
		usage: "<d20 syntax>",
		description: "Roll dice using d20 syntax"
	},
	'!say': {
		process: function(message, argument) {
			message.channel.sendMessage(argument);
		},
		usage: "<string>",
		description: "Make the bot say something"
	},
	'!kill': {
		process: function(message, argument) {
			if (bot.checkRole(message.author, message.server, 'developer') || bot.checkRole(message.author, message.server, 'Admin')) {
				console.log("Being shut down by " + message.author.username);
				message.channel.sendMessage("Beep boop, powering down.").then(function() {
					process.exit();
				});
			}  else {
				message.channel.sendMessage("You don't have enough badges to train me!");
			}
		},
		description: "This kills the robot. Must have proper privileges to execute."
	},
	'!w2g': {
		process: function(message, argument) {
			var watch2getherUrl = "https://www.watch2gether.com/go#" + getParameter(argument);
			message.channel.sendMessage("watch2gether link: " + watch2getherUrl);
		},
		description: "Create a watch2gether.com lobby"
	},
	'!task': {
		process: function(message,argument) {
			commands["!todo"].process(message,argument)
		},
		description: "Alias for !todo"
	},
	'!silence': {
		process: function(message, argument) {
			if (message.author.id == "157959654599557120"|| message.author.id == "127060142935113728") {
				bot.joeMute = new Date();
				message.channel.sendMessage(message.author.username + " cast Silence on Joe!");
			}  else {
				message.channel.sendMessage(":V"); 
			}
		}
	},
	'!fight': {
		process: function(message, argument) {
			var emote = (Math.random() > 0.9)?"ʕ ง•ᴥ•ʔ ง":"(ง'̀-'́)ง";
			message.channel.sendMessage(emote);
		}
	},
	'!oceanman': {
		process: function(message, argument) {
			var now = new Date();
			if (!bot.cooldown || ( now.valueOf() - bot.cooldown.valueOf() ) >= 86400000) {
				bot.cooldown = new Date();
// 				if (message.author.voiceChannel == null) {
					// If sender is not in a voice channel
					message.channel.sendMessage("Fine you meme loving fucks\nhttps://www.youtube.com/watch?v=6E5m_XtCX3c");
// 				}  else {
// 					// Join voice channel and play the song
// 					bot.joinVoiceChannel(message.author.voiceChannel, function(err, connection) {
// 						if (err) {
// 							console.log(err)
// 						}
// 						if (connection) {
// 							// If this is failing, chech out this article.. https://github.com/hydrabolt/discord.js/issues/415
// 							message.channel.sendMessage("Please end my suffering");
// 							console.log("Playing file - ocean_man.mp3");
// 							connection.playFile('./audio/ocean_man.mp3');
// 						}
// 					});
// 				}
				
			}  else {
				var cooldownHours = 24 - parseInt(Math.abs(now - bot.cooldown) / 36e5);
				message.channel.sendMessage("You can't use this meme for another " + cooldownHours + " hours. How tragic.");
			}
		},
		description: "Obligatory meme. You're welcome Stephen"
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

bot.login(discord_auth.token).then(output);

bot.joeMute = "";

bot.on('message', function(message){
	if (!message.author.bot) {
		//lastSeen.learn(message);

		if (message.author.id == "143825552787243008" && (new Date().valueOf() - bot.joeMute.valueOf()) < 60000) {
			bot.deleteMessage(message,{'wait':0},function() {
				var kindWords = (Math.random()< 0.5) ? "Quiet you." : "Shh";
				message.channel.sendMessage(kindWords);
			});
		}

		if (message.content.toLowerCase().indexOf("eat a banana") != -1) {
			message.channel.sendMessage(":banana:");
		}

		if (message.content.toLowerCase().indexOf("lenny") != -1) {
			message.channel.sendMessage("( ͡° ͜ʖ ͡°)")
		}

		if (message.content.toLowerCase().indexOf("dat boi") != -1) {
			message.channel.sendMessage("oh shit waddup");
		}
		//if bot is mentioned
		if (message.isMentioned(bot.user) || botParameters.localMode && message.content.substring(0,1)=="!") {
			//Trim the mention from the message and any whitespace
			var command = message.content.substring(message.content.indexOf("!"),message.content.length).trim();
			if (command.substring(0,1) === "!") {
				var to_execute = command.split(' ')[0];
				var argument = command.substring(command.indexOf(' ')+1, command.length);
				if (commands[to_execute]) {
					commands[to_execute].process(message, argument)
				}  else {
					message.channel.sendMessage("Unknown Command :(");
				}
			}
		}
	}
})

// //HTTP server stuff
// var http = require('http');
// var express = require('express');
// var app = express();
// var port = 3030;		

// app.get('/', function(req,res) {
// 	console.log("Heard the boop");
// 	res.send("Hello World");
// })

// app.listen(port, function(){
// 	console.log("Listening on port: " + port);
// })

module.exports = bot;
