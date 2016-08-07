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

var bot = new Discord.Client();

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
	if (message.isMentioned(bot.user)) {
		message.content = message.content.substring(bot.user.id.length + 4, message.content.length).trim();
		console.log(message.content)
		//everything goes in here
		bot.sendMessage(message.channel,"Hello!");
	}
	//console.log(message)
})

http.createServer().listen(6969, function(){
	console.log("Listening on port 6969");
})
