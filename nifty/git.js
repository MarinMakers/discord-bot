var child_process = require('child_process');

function pull(messageFunction){
	child_process.exec('git pull', function(error, stdout, stderr){
		if(error){
			console.log(error);
			messageFunction('error: ' + error);
			return;
		}
		messageFunction('stdout: ' + stdout);
		messageFunction('stderr: ' + stderr);
	})
}

module.exports = function(bot) {
	return {
		pull: pull
	}
}