const { Client, MessageEmbed } = require('discord.js');
const config = require('./config');
const commands = require('./help');

const channels = {
  submit: '741199010878193775',
  grades: '741207301490212885',
};

let bot = new Client({
  fetchAllMembers: true, // Remove this if the bot is in large guilds.
  presence: {
    status: 'online',
    activity: {
      name: `${config.prefix}help`,
      type: 'LISTENING'
    }
  }
});

bot.on('ready', () => console.log(`Logged in as ${bot.user.tag}.`));

bot.on('message', async message => {
  // Check for command
  if (message.content.startsWith(config.prefix)) {
    let args = message.content.slice(config.prefix.length).split(' ');
    let command = args.shift().toLowerCase();

    switch (command) {

      case 'submit':
        if (!args[0]) {
          return message.reply('You didn\'t provide a link.')
            .then((sentMessage) => {
              message.delete({ timeout: 1500 });
              sentMessage.delete({ timeout: 3000 });
            });
        }
        else {
          try {
            homeworkURL = new URL(args[0]);
            
            homeworkEmbed = new MessageEmbed()
              .setTitle(`Submission from ${message.member ? message.member.displayName : message.author.username}`)
              .setDescription(`[Week 2 - JS Homework](${homeworkURL.href})`)
              .addField('Your homework will be graded in a few days', `Go to <#${channels.grades}> to check your grades :point_left:`)
              .setColor('RED')
              .setTimestamp()
              .setThumbnail(bot.user.displayAvatarURL());

            message.delete({ timeout: 1500 });
            message.reply('Thanks for your submission. Your homework will be graded soon. :nerd:')
            return bot.channels.fetch(channels.submit)
              .then(submitChannel => submitChannel.send(homeworkEmbed));
          } catch(error) {
            console.log(error);
            message.delete({ timeout: 1500 });
            return message.reply('The link you specified is invalid. Make sure it is in the fowllowing format\n`https://www.your-homework.com/`');
          }
        }

      case 'clear':
        if (!args[0]) {
          return message.reply('You didn\'t specify any amount.')
            .then((sentMessage) => {
              message.delete({ timeout: 1500 });
              sentMessage.delete({ timeout: 3000 });
            });
        }
        else if (isNaN(args[0])) {
          return message.reply('The amount specified is not a number!')
            .then((sentMessage) => {
              message.delete({ timeout: 1500 });
              sentMessage.delete({ timeout: 3000 });
          });
        }
        else if (args[0] > 100) {
          return message.reply('You can\'t delete more than 100 messages at once!')
            .then((sentMessage) => {
              message.delete({ timeout: 1500 });
              sentMessage.delete({ timeout: 3000 });
          });
        }
        else if (args[0] < 1) {
          return message.reply('You have to delete at least one message!')
            .then((sentMessage) => {
              message.delete({ timeout: 1500 });
              sentMessage.delete({ timeout: 3000 });
          });
        }
        await message.channel.messages
          .fetch({ limit: parseInt(args[0])+1 })
          .then(messages => {
            message.channel.bulkDelete(messages)
              .then(messages => message.channel.send(`Deleted \`${messages.size-1}\` messages.`).then(sentMessage => sentMessage.delete({ timeout: 1500 }))
              );
          });
        break;

      case 'ping':
        let msg = await message.reply('Pinging...');
        await msg.edit(`PONG! Message round-trip took \`${Date.now() - msg.createdTimestamp}ms.\``);
        message.delete({ timeout: 1500 });
        break;

      case 'say':
      case 'repeat':
        if (args.length > 0)
          message.channel.send(args.join(' '));
        else
          message.reply('You did not send a message to repeat, cancelling command.');
        message.delete({ timeout: 1500 });
        break;

      /* Unless you know what you're doing, don't change this command. */
      case 'help':
        let embed =  new MessageEmbed()
          .setTitle('HELP MENU')
          .setColor('RED')
          .setFooter(`Requested by: ${message.member ? message.member.displayName : message.author.username}`, message.author.displayAvatarURL())
          .setThumbnail(bot.user.displayAvatarURL());
        if (!args[0])
          embed
            .setDescription(Object.keys(commands).map(command => `\`${command.padEnd(Object.keys(commands).reduce((a, b) => b.length > a.length ? b : a, '').length)}\` :: ${commands[command].description}`).join('\n'));
        else {
          if (Object.keys(commands).includes(args[0].toLowerCase()) || Object.keys(commands).map(c => commands[c].aliases || []).flat().includes(args[0].toLowerCase())) {
            let command = Object.keys(commands).includes(args[0].toLowerCase())? args[0].toLowerCase() : Object.keys(commands).find(c => commands[c].aliases && commands[c].aliases.includes(args[0].toLowerCase()));
            embed
              .setTitle(`COMMAND - ${command}`);

            if (commands[command].aliases) {
              message.delete({ timeout: 1500 });
              embed
                .addField('Command aliases', `\`${commands[command].aliases.join('`, `')}\``);
            }
            embed
              .addField('DESCRIPTION', commands[command].description)
              .addField('FORMAT', `\`\`\`${config.prefix}${commands[command].format}\`\`\``);
          }
          else {
            message.delete({ timeout: 1500 });
            embed
              .setColor('RED')
              .setDescription('This command does not exist. Please use the help command without specifying any commands to list them all.');
            return message.channel.send(embed)
              .then(sentMessage => sentMessage.delete({ timeout: 3000 }));
          }
        }
        message.channel.send(embed);
        message.delete({ timeout: 1500 });
        break;
    }
  }
});

bot.login(config.token);
