const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('./economy');

const FOLLOWER_TEMPLATES = {
    squire: {
        roles: ['squire'],
        classes: ['Warrior', 'Guardian', 'Hunter', 'Rogue'],
        tributeRange: [50, 150]
    },
    apprentice: {
        roles: ['apprentice'],
        classes: ['Mage', 'Sorcerer', 'Warlock', 'Priest'],
        tributeRange: [75, 200]
    },
    acolyte: {
        roles: ['acolyte'],
        classes: ['Cleric', 'Paladin', 'Monk', 'Druid'],
        tributeRange: [60, 180]
    },
    minion: {
        roles: ['minion'],
        classes: ['Imp', 'Goblin', 'Kobold', 'Gremlin'],
        tributeRange: [25, 100]
    }
};

module.exports = {
    name: 'recruitfollower',
    aliases: ['follower-add', 'addfamily', 'family-add'],
    description: 'Recruit a follower to your stronghold',
    usage: '!recruitfollower <type> <name>',
    async execute(message, args) {
        if (args.length < 2) {
            const types = Object.keys(FOLLOWER_TEMPLATES).join(', ');
            return message.reply(`❌ Usage: \`!recruitfollower <type> <name>\`\nTypes: ${types}`);
        }

        const type = args[0].toLowerCase();
        const name = args.slice(1).join(' ');

        if (!FOLLOWER_TEMPLATES[type]) {
            return message.reply('❌ Invalid follower type! Use: squire, apprentice, acolyte, minion');
        }

        const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

        if (profile.strongholds.length === 0) {
            return message.reply('❌ You need to own a stronghold to recruit followers!');
        }

        const primaryStronghold = profile.strongholds.find(s => s.strongholdId === profile.primaryStronghold);
        if (!primaryStronghold) {
            profile.primaryStronghold = profile.strongholds[0].strongholdId;
            await profile.save();
        }

        const activeStronghold = primaryStronghold || profile.strongholds[0];

        if (profile.followers.length >= activeStronghold.maxFollowers) {
            return message.reply(`❌ Your stronghold can only house ${activeStronghold.maxFollowers} followers!`);
        }

        if (profile.followers.some(follower => follower.name.toLowerCase() === name.toLowerCase())) {
            return message.reply('❌ You already have a follower with that name!');
        }

        const template = FOLLOWER_TEMPLATES[type];
        const followerClass = template.classes[Math.floor(Math.random() * template.classes.length)];
        const tribute = Math.floor(Math.random() * (template.tributeRange[1] - template.tributeRange[0] + 1)) + template.tributeRange[0];
        const age = type === 'minion' ? Math.floor(Math.random() * 10) + 1 : Math.floor(Math.random() * 20) + 15;

        const follower = {
            followerId: `${type}_${Date.now()}`,
            name,
            role: type,
            age,
            class: followerClass,
            tribute,
            loyalty: 50,
            questEfficiency: 1.0,
            totalQuests: 0,
            dateJoined: new Date(),
            lastQuest: null
        };

        profile.followers.push(follower);

        // Update overall follower loyalty
        const avgLoyalty = profile.followers.reduce((sum, f) => sum + f.loyalty, 0) / profile.followers.length;
        profile.followerLoyalty = Math.floor(avgLoyalty);

        profile.maxFamiliars = Math.min(10, Math.floor(activeStronghold.maxFollowers / 2) + 1);

        await profile.save();

        const embed = new EmbedBuilder()
            .setTitle('⚔️ Follower Recruited!')
            .setDescription(`**${name}** has joined your retinue as your ${type}!`)
            .addFields(
                { name: '👤 Age', value: `${age} years old`, inline: true },
                { name: '⚔️ Class', value: followerClass, inline: true },
                { name: '💰 Tribute', value: `$${tribute}/quest`, inline: true },
                { name: '❤️ Loyalty', value: '50%', inline: true },
                { name: '👥 Total Retinue', value: `${profile.followers.length}/${activeStronghold.maxFollowers}`, inline: true }
            )
            .setColor('#FF69B4')
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
