#Discord Bot for Marin Makers' Discord Server
A bot for the Marin Makers' Discord Server written with [discord.js](https://www.npmjs.com/package/discord.js).

###How to Run the Bot
Clone this repo, navigate to it, and run `npm install` to install the dependencies. Then, run the bot with the command `node bot.js port`. If you drop the port term, the http server will default to port 8080.

![Bot](http://i68.tinypic.com/10hr2tk.png)
###Current Features
- [x] Dice Rolling
- [x] Posting tweets
- [x] Help and Rules

###Planned Features
- [ ] Last Seen
- [ ] Polls/Voting
- [ ] Query WolframAlpha, other search engines
- [ ] Webpage for configuring bot
- [ ] Interacting with forthcoming Marin Makers Webpage from discord

###Augmenting the Bot
To add features to the bot, store your feature in a .js file inside the nifty directory. Then, within bot.js, require the .js file, and add to the commands object as shown in the example object.

Each command includes a process attribute, which defines a function that executes your code. The function defined within this attribute should take three parameters - the author of the message that triggered the command, the channel the command was sent in, and the rest of the message after the call to the command.

You should also build your code to accomodate for a callback function to do things like message the channel or otherwise use the results of your code. 

###Developers
- [Nathaniel Knopf](https://github.com/nathanielknopf/)
- [Stephen Rivest](https://github.com/Magicsteve46/)
- [Morgaine Mandigo-Stoba](https://github.com/mmandigostoba)
- [Miles Florence](https://github.com/milesflo)
- [Sean Dow](https://github.com/bobthepally)
