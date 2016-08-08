// rolls a dice with to_roll sides
var d20 = require('d20');

var roll = function(user,channel,to_roll,callbackFunction){
	callbackFunction(d20.roll(to_roll))
}

// flips a coin
var coin = function(){
	if(d20.roll(2) === 1) {
		return "heads"
	} else {
		return "tails"
	};
}

// fuck my life
module.exports = {
	rollDice: roll,
	coin: coin
}
