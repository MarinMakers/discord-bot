#Discord Bot for Marin Makers' Discord Server
A bot for the Marin Makers' Discord Server written with [discord.js](https://www.npmjs.com/package/discord.js).

## Table of Contents
+ [Deployment](https://github.com/MarinMakers/discord-bot/blob/master/README.md#deployment)
+ [Current Features](https://github.com/MarinMakers/discord-bot/blob/master/README.md#current-features)
+ [Planned Features](https://github.com/MarinMakers/discord-bot/blob/master/README.md#planned-features)
+ [Contributing to the Bot](https://github.com/MarinMakers/discord-bot/blob/master/README.md#contributing-to-the-bot)
  - [Process](https://github.com/MarinMakers/discord-bot/blob/master/README.md#process)
  - [Usage](https://github.com/MarinMakers/discord-bot/blob/master/README.md#usage)
  - [Description](https://github.com/MarinMakers/discord-bot/blob/master/README.md#description)
+ [Developers](https://github.com/MarinMakers/discord-bot/blob/master/README.md#developers)

###Deployment
To deploy the bot, clone this repo, navigate to it, run `npm install` to install all dependencies, and run `node bot.js`.

![Bot](http://i68.tinypic.com/10hr2tk.png)
###Current Features
- [x] Dice Rolling
- [x] Twitter posting, searching, viewing trends
- [x] Help and Rules
- [x] To-Do List/Tracking
- [x] Last Seen
- [x] Banana eating, lenny, and coding advice

###Planned Features
- [ ] Polls/Voting
- [ ] News Summary
- [ ] Query search engines
- [ ] Marin Makers Website

###Contributing to the Bot
To add commands to the bot:

1. Create your command in a .js file in the directory `/nifty` as a [module](https://www.sitepoint.com/understanding-module-exports-exports-node-js/).
2. In bot.js, require the .js file with an appropriate variable name.
3. Add to the `commands` object as shown in the example object.

Each Command will have 3 properties: `process`, `usage` and `description`.

####Process
Each command includes a `process` property, which contains the function executed by the command. This should take two parameters - the `message` object, and `argument`, which is any text trailing the command. 

#####Some Terminology
For commands, it can be useful to have multiple functions in your module stored under the same `process` (such as how `!twitter tweet`, `!twitter search`, and `!twitter trending` are all handled by one command object). 

In general, commands can be designed like this:`!command method parameters`

Methods are the sub-commands that call different functions in your module, and should be one word long. They can be pulled from the argument parameter fed to the `process` property with `getMethod(argument)`.

Parameters are any additional text that you want to feed to your methods. They can be of any length, and can be pulled from the argument parameter fed to the `process` property with `getParameter(argument)`.

####Usage
Next is the `usage` property. This should be a string listing all possible arguments in your command. 

__If your command does not require any additional arguments, do not create a usage property__.

####Description
And finally, a `description` property which is just a plaintext explaination of what the command does. 

Be sure to describe what every possible instance of `usage` does in order of appearance, and keep it brief.

###Developers
- [Nathaniel Knopf](https://github.com/nathanielknopf)
- [Miles Florence](https://github.com/milesflo)
- [Stephen Rivest](https://github.com/Magicsteve46)
- [Morgaine Mandigo-Stoba](https://github.com/mmandigostoba)
- [Sean Dow](https://github.com/bobthepally)
