//This is the main script for the bot. To start the bot, run this script with node
var port = (process.argv[2]) ? process.argv[2] : 8080

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

var fs = require('fs');

try {
	var todoList = require('./todo.json');
} catch (e) {
	console.log("To-do list not found, creating blank one.");
	fs.writeFileSync("./todo.json", '{"id":1,tasks":[]}');
}

var bot = new Discord.Client();

var http = require('http');

var Twitter = require('twitter');
var child_process = require('child_process');
var twitter_bot = require('./nifty/twitter.js');
var decider = require('./nifty/decisions.js');

var twitter_client = new Twitter({
	consumer_key: discord_auth.twitter.consumer_key,
	consumer_secret: discord_auth.twitter.consumer_secret,
	access_token_key: discord_auth.twitter.access_token_key,
	access_token_secret: discord_auth.twitter.access_token_secret
})

//call checkRole(message.sender, message.server, 'role')
var checkRole = function(user, server, role){
	// if (server.rolesOfUser(user).indexOf() == -1) {
	// 	return true;
	// }
	for (var i = 0; i < server.roles.length; i++){
		if(server.roles[i] == role && user.hasRole(server.roles[i])){
			return true
		}
	}
	return false
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
	'!tweet': {
		process: function(message, tweet) {
			if (checkRole(message.author, message.server, 'tweeter')){
				twitter_bot.postTweet(twitter_client, message.author, tweet, function(success){
					if (success){
						bot.sendMessage(message.channel, "Tweet posted!");
					} else {
						bot.sendMessage(message.channel, "Tweet failed to post :( !");
					};
				})
			} else {
				bot.sendMessage(message.channel, "You must have role 'tweeter' to post a tweet.")
			}
		},
		usage: "<tweet body>",
		description: "Post a tweet from the twitter channel. You must have the role 'tweeter' to post a tweet"
	},
	'!todo': {
		//doing this NoSQL because yes.
		process: function(message,argument) {
			// V JSON file imported and parsed
			var listFile = JSON.parse(fs.readFileSync('./todo.json'));
			// V New array created out of tasks created in the channel message was sent from
			var todoList = listFile.tasks.filter( function(task) {
				return task.channel == message.channel.name;
			});
			if (argument.substring(0,3) === "add") {
				// Add task
				listFile.tasks.push({
					time:     message.timestamp, //This will not be read later, but again, yes.
					user:     message.sender.name,
					task:     argument.substring(3,argument.length).trim(),
					complete: false,
					channel:  message.channel.name,
					id:       listFile.id //This is going to be string datatype most of the time.
				});
				listFile = (parseInt(listFile.id)++).toString();
				fs.writeFileSync('./todo.json',JSON.stringify(listFile));
				bot.sendMessage(message.channel,"Task added " + message.author + "!");
			}  else if (argument.split(" ")[0] === "remove") {
				// Remove task
				var removeId = argument.split(" ")[1];
				for (task in listFile) {
					if (listFile[task].id === removeId) {
						listFile.splice(task,1);
						bot.sendMessage(message.channel, "Entry " + removeId + " removed, " + message.author + ".")
						break;
					}
				}
				fs.writeFileSync('./todo.json',JSON.stringify(listFile));
			}  else if (argument.split(" ")[0] === "complete") {
				// Complete task
				var completeId = argument.split(" ")[1];
				for (task in listFile) {
					if (listFile[task].id === completeId) {
						listFile[task].complete = true;
						bot.sendMessage(message.channel, "Entry " + completeId + " has been completed! Woo!!");
						break;
					}
				}
				fs.writeFileSync('./todo.json',JSON.stringify(listFile));
			}  else {
				// View all tasks
				if (todoList.length == 0) {
					bot.sendMessage(message.channel, "No tasks found on this channel. Add some with `!todo add <task>`");
				}  else {
					var taskForm = "```diff\r! === " + message.channel.name + " To-do List ===\n";
					for (task in todoList){
						var singleTask = todoList[task];
						if (singleTask.complete == true) {
							//green syntax highlighting
							taskForm += "+ ";
						} else { 
							//grey syntax highlighting
							taskForm += "  ";
						};
						taskForm += singleTask.id + ".) " + singleTask['user'] + ": " + singleTask['task'] + "\n";
					}
					taskForm += "```";
					bot.sendMessage(message.channel, taskForm);
				}
			}
		},
		usage: "[add <string>] [remove <id>] [complete <id>]",
		description: "Read the bot's to-do list, and write new entries"
	},
	'!ping': {
		process: function(message, argument){
			bot.sendMessage(message.channel, "Hi there, " + message.author.name + "! :)");
			console.log("Ping from " + message.author + " aka " + message.author.name);
		},
		description: "dumps info on the user to the console of the server."
	},
	'!tableflip': {
		process: function(message,argument) {
			bot.sendMessage(message.channel, "(╯°□°）╯︵ ┻━┻");
		},
		description: "Flip a table out of frustration."
	},
	'!pull': {
		process: function(message, argument){
			if (checkRole(message.author, message.server, 'developer')){
				child_process.exec('git pull', function(error, stdout, stderr){
					if(error){
						console.log(error);
						bot.sendMessage(message.channel, 'error: ' + error);
						return;
					}
					bot.sendMessage(message.channel, 'stdout: ' + stdout);
					bot.sendMessage(message.channel, 'stderr: ' + stderr);
				})
			}
		},
		description: "Pulls the bot's code from github on to the server. You must have the role 'developer' to use this functionality."
	},
	'!help': {
		process: function(message, argument) {
			bot.sendMessage(message.author, "Available Commands: ", function() {
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
					bot.sendMessage(message.author,info);
				}
			})
		},
		description: "PM's users a list of commands and invocation"
	},
	'!roll': {
		process: function(message, argument) {
			decider.rollDice(argument, function(result){
				bot.sendMessage(message.channel, result)
			})
		},
		usage: "<d20 syntax>",
		description: "Roll dice using d20 syntax"
	},
	'!kill': {
		process: function(message, argument) {
			if (checkRole(message.author, message.server, 'developer') || checkRole(message.author, message.server, 'Admin')) {
				bot.sendMessage(message.channel, "Beep boop, powering down.");
				process.exit();
			}  else {
				bot.sendMessage(message.channel, "You don't have enough badges to train me!");
			}
		},
		description: "This kills the robot. Must have proper privileges to execute."
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
	if (message.content.toLowerCase().indexOf("eat a banana") != -1) {
		bot.sendMessage(message.channel,":banana:");
	}
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
				commands[to_execute].process(message, argument)
			}  else {
				bot.sendMessage(message.channel, "Unknown Command :(");
			}
		}
	}
})

http.createServer().listen(port, function(){
	console.log("Listening on port: " + port);
})
