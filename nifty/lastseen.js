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

var lookup = function(username, messageFunction){
	if(lastSeenFile[username]){
		messageFunction("I last saw " + username + " at " + lastSeenFile[username].time + " on " + lastSeenFile[username].channel + ", saying '" + lastSeenFile[username].message + "'.");
	}else{
		messageFunction("Sorry, I don't have any information on that user yet :(")
	}
}

var learn = function(message){
	lastSeenFile[message.author.username] = {
		"time":getTimestamp(message),
		"channel":message.channel.name,
		"message":message.cleanContent
	};
	console.log(lastSeenFile)
	remember();
}

var remember = function(){
	//write loaded lastSeenFile to lastseen.json
	fs.writeFile('./lastseen.json', JSON.stringify(lastSeenFile));
}

module.exports = {
	lookup: lookup,
	learn: learn
}