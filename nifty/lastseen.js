var fs = require('fs');

try {
	var lastSeenFile = JSON.parse(fs.readFileSync('./lastseen.json'));
}catch (e){
	console.log("Initializing lastseen.json...");
	fs.writeFileSync('./lastseen.json', '{}');
	lastSeenFile = JSON.parse(fs.readFileSync('./lastseen.json'));
}

var getTimestamp = function(message){
	var date = new Date(message.timestamp);
	var timestampReadable = (date.getMonth()+1).toString() + '/' + date.getDate() + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
	return timestampReadable;
}

var lookup = function(name, messageFunction){
	if(lastSeenFile[name]){
		messageFunction("I last saw " + name + " at " + lastSeenFile[name].time + " on " + lastSeenFile[name].channel + ", saying '" + lastSeenFile[name].message + "'.");
	}else{
		messageFunction("Sorry, I don't have any information on that user!\nI store data by nickname (or by username if someone doesn't have a nickname) so make sure you're using the right name! :)");
	};
}

var learn = function(message){
	//store by nickname if user has one, else by username
	var username = (message.server.memberMap[message.author.id].nick) ? message.server.memberMap[message.author.id].nick : message.author.username;
	lastSeenFile[username] = {
		"time":getTimestamp(message),
		"channel":message.channel.name,
		"message":message.cleanContent
	};
	remember();
}

var remember = function(){
	//write loaded lastSeenFile to lastseen.json
	fs.writeFile('./lastseen.json', JSON.stringify(lastSeenFile), function(err){
		if(err){
			console.log('error writing lastseen.json: ' + err);
		}
	});
}

module.exports = {
	lookup: lookup,
	learn: learn
}