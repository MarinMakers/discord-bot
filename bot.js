//This is the main script for the bot. To start the bot, run this script with node
var Discord = require('discord.js');
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