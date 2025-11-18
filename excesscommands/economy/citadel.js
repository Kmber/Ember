const {
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

async function viewCitadels(message) {
    const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
    if (!profile.properties || profile.properties.length === 0) {
        return message.reply('You do not own any citadels. Use `!acquirecitadel` to get your first one!');
    }

    const components = [];
    const header = new ContainerBuilder()
        .setAccentColor(0x4CAF50)
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# Your Citadels`)
        );
    components.push(header);

    profile.properties.forEach(citadel => {
        const isPrimary = profile.primaryResidence === citadel.propertyId;
        const citadelContainer = new ContainerBuilder()
            .setAccentColor(isPrimary ? 0xFFD700 : 0x95A5A6)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## ${citadel.name} ${isPrimary ? '(Primary)' : ''}`),
                new TextDisplayBuilder().setContent(`**Type:** ${citadel.type}\n**Value:** $${citadel.currentValue.toLocaleString()}`)
            );
        components.push(citadelContainer);
    });

    await message.reply({ components, flags: MessageFlags.IsComponentsV2 });
}

async function setPrimary(message, args) {
    const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
    const citadelName = args.join(' ');

    if (!citadelName) {
        return message.reply('Please specify the name of the citadel you want to set as primary.');
    }

    const targetCitadel = profile.properties.find(p => p.name.toLowerCase() === citadelName.toLowerCase());

    if (!targetCitadel) {
        return message.reply(`You do not own a citadel named \`${citadelName}\`.`);
    }

    profile.primaryResidence = targetCitadel.propertyId;
    await profile.save();

    await message.reply(`Your primary citadel has been set to \`${targetCitadel.name}\`.`);
}

async function renameCitadel(message, args) {
    if (args.length < 2) {
        return message.reply('Usage: `!citadel rename "<old name>" "<new name>"`');
    }

    const [oldName, newName] = args.join(' ').split('\" ').map(s => s.replace(/\"/g, ''));

    if (!oldName || !newName) {
        return message.reply('Usage: `!citadel rename "<old name>" "<new name>"`');
    }

    const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
    const targetCitadel = profile.properties.find(p => p.name.toLowerCase() === oldName.toLowerCase());

    if (!targetCitadel) {
        return message.reply(`You do not own a citadel named \`${oldName}\`.`);
    }

    targetCitadel.name = newName;
    await profile.save();

    await message.reply(`Your citadel \`${oldName}\` has been renamed to \`${newName}\`.`);
}

async function sellCitadel(message, args) {
    const citadelName = args.join(' ');

    if (!citadelName) {
        return message.reply('Please specify the name of the citadel you want to sell.');
    }

    const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
    const citadelIndex = profile.properties.findIndex(p => p.name.toLowerCase() === citadelName.toLowerCase());

    if (citadelIndex === -1) {
        return message.reply(`You do not own a citadel named \`${citadelName}\`.`);
    }

    const [soldCitadel] = profile.properties.splice(citadelIndex, 1);
    profile.wallet += soldCitadel.currentValue;

    if (profile.primaryResidence === soldCitadel.propertyId) {
        profile.primaryResidence = profile.properties.length > 0 ? profile.properties[0].propertyId : null;
    }

    await profile.save();

    await message.reply(`You have sold \`${soldCitadel.name}\` for $${soldCitadel.currentValue.toLocaleString()}.`);
}

module.exports = {
    name: 'citadel',
    aliases: ['stronghold'],
    description: 'Manage your citadels with various subcommands',
    usage: '!citadel <view|setprimary|rename|sell> [args]',
    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide a subcommand. Usage: `!citadel <view|setprimary|rename|sell> [args]`');
        }

        const subcommand = args[0].toLowerCase();

        switch (subcommand) {
            case 'view':
                await viewCitadels(message);
                break;
            case 'setprimary':
                await setPrimary(message, args.slice(1));
                break;
            case 'rename':
                await renameCitadel(message, args.slice(1));
                break;
            case 'sell':
                await sellCitadel(message, args.slice(1));
                break;
            default:
                message.reply('Invalid subcommand. Usage: `!citadel <view|setprimary|rename|sell> [args]`');
        }
    }
};