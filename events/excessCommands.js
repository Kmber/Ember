const HentaiConfig = require('../models/hentai/hentaiSchema');
const ServerConfig = require('../models/serverConfig/schema');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');
const DisabledCommand = require('../models/commands/DisabledCommands');

const excessCommands = new Map();
const excessCommandsPath = path.join(__dirname, '..', 'excesscommands');
const commandFolders = fs.readdirSync(excessCommandsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(excessCommandsPath, folder)).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        try {
            const command = require(path.join(excessCommandsPath, folder, file));
            excessCommands.set(command.name, { command, folder });
            if (command.aliases) {
                for (const alias of command.aliases) {
                    excessCommands.set(alias, { command, folder });
                }
            }
        } catch (error) {
            console.error(`Error loading excess command ${file}:`, error);
        }
    }
}

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;
        if (!message.guild) return;

        let hentaiSettings;
        try {
            hentaiSettings = await HentaiConfig.findOne({ serverId: message.guild.id });
        } catch (err) {
            console.error('Error fetching hentai configuration from Mongoose:', err);
        }

        let serverConfig;
        try {
            serverConfig = await ServerConfig.findOne({ serverId: message.guild.id });
        } catch (err) {
            console.error('Error fetching server configuration from Mongoose:', err);
        }
        
        const prefix = serverConfig?.prefix || config.prefix;

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const commandData = excessCommands.get(commandName);

        if (!commandData) return;

        const { command, folder } = commandData;

        if (folder === 'hentai') {
            if (!hentaiSettings?.status) {
                return message.reply('Hentai commands are currently disabled.');
            }
        }

        if (config.excessCommands && (folder === 'hentai' || config.excessCommands[folder])) {
            const isDisabled = await DisabledCommand.findOne({
                guildId: message.guild.id,
                commandName: command.name
            });

            if (isDisabled) {
                return message.reply(`❌ The \`${prefix}${command.name}\` command is disabled in this server.`);
            }

            try {
                await command.execute(message, args, client);
            } catch (error) {
                console.error(error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Command Error')
                    .setDescription(`An error occurred while executing the \`${command.name}\` command.`)
                    .addFields({ name: 'Error Details:', value: error.message });

                message.reply({ embeds: [errorEmbed] });
            }
        }
    }
};
