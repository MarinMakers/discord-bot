var listFile;

var fs = require('fs');

try {
	listFile = JSON.parse(fs.readFileSync('./db/todo.json'));
} catch (e) {
	console.log("To-do list not found - creating blank one.");
	fs.writeFileSync("./db/todo.json", '{"id":1,"channels":{},"tasks":[]}');
	listFile = JSON.parse(fs.readFileSync('./db/todo.json'));
}

var add = function(taskToAdd, message, messageFunction){

	var idOnChannel = (listFile.channels[message.channel.name]) ? listFile.channels[message.channel.name] : 1;

	if(!listFile.channels[message.channel.name]){
		listFile.channels[message.channel.name] = 1;
	}

	var newTask = {
		user: 		message.sender.name,
		task: 		taskToAdd,
		complete: 	false,
		channel: 	message.channel.name,
		id: 		listFile.id, //global id
		idOnChannel:idOnChannel //local id
	}

	listFile.tasks.push(newTask);

	messageFunction(message.author+": Entry " + listFile.channels[message.channel.name] + " added successfully!");

	listFile.id = (listFile.id + 1);
	listFile.channels[message.channel.name] += 1;
	remember();
}

var remove = function(ids, message, messageFunction){
	var idArr = ids.split(",").map(function(num) {return parseInt(num.trim())});
	for (id in idArr){
		var found = false;
		for (task in listFile.tasks){
			var singleTask = listFile.tasks[task];
			if(singleTask.idOnChannel === idArr[id] && singleTask.channel === message.channel.name){
				found = true;
				if (singleTask.user == message.sender.name){
					listFile.tasks.splice(task, 1);
					messageFunction(message.author+": Entry " + idArr[id] + " removed successfully!");
					break;
				}else{
					messageFunction("Sorry, you do not have privileges for entry " + idArr[id]);
					break;
				}
			}
		}
		if (!found){
			messageFunction("Sorry, couldn't find a task with the ID " + id);
		}
	}
	remember();
}

var complete = function(completeId, message, messageFunction){
	var completeId = parseInt(completeId);
	for (task in listFile.tasks){
		if (listFile.tasks[task].channel === message.channel.name && listFile.tasks[task].idOnChannel === completeId){
			listFile.tasks[task].complete = true;
			messageFunction(message.author+": Entry " + completeId + " has been completed! Woo!!");
			break;
		}
	}
	remember();
}

var remember = function(){
	fs.writeFileSync('./db/todo.json', JSON.stringify(listFile));
}

var showTasks = function(message, messageFunction){
	var todoList = listFile.tasks.filter(function(task){
		return task.channel == message.channel.name;
	})
	if (todoList.length){
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
			taskForm += singleTask.idOnChannel + ".) " + singleTask['user'] + ": " + singleTask['task'] + "\n";
		}
		taskForm += "```";
		messageFunction(taskForm);
	}else{
		messageFunction("No tasks found on this channel -- Add some with `!todo add <task>`");
	}
}

var exportList = function(message, messageFunction) {
	bot.sendFile(message.channel,"./db/todo.json","To-do List","Uploading File...",function(err,msg) {
		if (err) {
			bot.sendMessage(message.channel,err);
		}  else {
			bot.sendMessage(message.channel,"File uploaded!");
		}
	});
}

module.exports = {
	add: add,
	remove: remove,
	complete: complete,
	showTasks: showTasks,
	exportList: exportList
}
