var d20 = require('d20');

var roll = function(to_roll, callbackFunction){
	var roll_array = to_roll.split('+')
	var sum = 0
	var valid_roll = true
	for (var i = 0; i < roll_array.length; i++){
		var this_die = roll_array[i]
		if(parseInt(this_die.split('d')[0]) > 50){
			if(valid_roll){
				callbackFunction("Sorry boss, I only got so much memory :(")
				valid_roll = false
			}
		}else{
			sum += d20.roll(this_die)
		}
	}
	if(valid_roll){
		callbackFunction("Result: " + sum)
	}
}

// flips a coin
var coin = function(callbackFunction){
	var result = (d20.roll(2) === 1) ? 'heads' : 'tails'
	callbackFunction(result);
}

module.exports = function(bot) {
	return {
		rollDice: roll,
		coin: coin
	}
}
