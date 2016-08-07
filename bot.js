//This is the main script for the bot. To start the bot, run this script with node
try {
	var Discord = require("discord.js");
} catch (e){
	console.log("Please run npm install and ensure it passes with no errors!");
	process.exit();
}

var discord_auth = require('./auth.json');

var bot = new Discord.Client();

function output(error, token) {
    if (error) {
        console.log('There was an error logging in: ' + error);
        return;
    } else
        console.log('Logged in. Token: ' + token);
    }
}

bot.loginWithToken(discord_auth.token, output);

bot.on('message', function(message){
	console.log(message)
})