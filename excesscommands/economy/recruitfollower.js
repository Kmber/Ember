const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

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
    aliases: ['follower-add', 'recruit'],
    description: 'Recruit a follower to your stronghold.',
    usage: '!recruitfollower <type> <name>',
    async execute(message, args) {
        try {
            if (args.length < 2) {
                const components = [];

                const usageContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                usageContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ⚔️ Recruit Follower\n## MISSING REQUIRED INFORMATION\n\n> Please specify the follower type and their name!\n> **Usage:** \`!recruitfollower <type> <name>\``)
                );

                components.push(usageContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const typesContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                const typesList = Object.entries(FOLLOWER_TEMPLATES).map(([type, template]) => {
                    const classes = template.classes.slice(0, 2).join(', ');
                    const tributeRange = `${template.tributeRange[0]}-${template.tributeRange[1]} Embers`;
                    return `**\`${type}\`** - ${classes} (${tributeRange})`;
                }).join('\n');

                typesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 👥 **AVAILABLE FOLLOWER TYPES**\n\n${typesList}\n\n**Examples:**\n> \`!recruitfollower squire Garen\`\n> \`!recruitfollower apprentice Ryze\`\n> \`!recruitfollower minion Fizz\``)
                );

                components.push(typesContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const type = args[0].toLowerCase();
            const name = args.slice(1).join(' ');
            
            if (!FOLLOWER_TEMPLATES[type]) {
                const components = [];

                const invalidTypeContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                invalidTypeContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Follower Type\n## UNRECOGNIZED ROLE\n\n> **\`${type}\`** is not a valid follower type!\n> Choose from the available follower roles below.`)
                );

                components.push(invalidTypeContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const validTypesContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                validTypesContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 👥 **VALID FOLLOWER TYPES**\n\n**⚔️ \`squire\`** - A warrior in training\n**🔮 \`apprentice\`** - A student of the arcane arts\n**🙏 \`acolyte\`** - A devoted follower of the divine\n**👹 \`minion\`** - A lesser creature bound to your will\n\n**💡 Try:** \`!recruitfollower squire ${name}\``)
                );

                components.push(validTypesContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            
            if (profile.strongholds.length === 0) {
                const components = [];

                const noStrongholdContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                noStrongholdContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏰 Stronghold Required for Followers\n## NO STRONGHOLD FOR YOUR FOLLOWERS\n\n> You need to own a stronghold before recruiting followers!\n> Followers need a place to train, study, and live.`)
                );

                components.push(noStrongholdContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⚔️ **ACQUIRE A STRONGHOLD FOR YOUR FOLLOWERS**\n\n**Step 1:** Use \`!buystronghold\` to browse available strongholds\n**Step 2:** Purchase a stronghold with follower capacity\n**Step 3:** Set it as your primary seat of power\n**Step 4:** Return here to recruit **${name}** as your ${type}!\n\n**💡 Follower Benefits:**\n> • Followers contribute to quest income\n> • Build loyalty through quests and boons\n> • Enhanced stronghold security and power\n> • Larger retinues = greater influence`)
                );

                components.push(solutionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            const primaryStronghold = profile.strongholds.find(s => s.strongholdId === profile.primaryStronghold);
            if (!primaryStronghold) {
                profile.primaryStronghold = profile.strongholds[0].strongholdId;
                await profile.save();
            }
            
            const activeStronghold = primaryStronghold || profile.strongholds[0];
            
            if (profile.followers.length >= activeStronghold.maxFollowers) {
                const components = [];

                const capacityContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                capacityContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏰 Follower Capacity Limit Reached\n## MAXIMUM RETINUE SIZE\n\n> Your **${activeStronghold.name}** can only house **${activeStronghold.maxFollowers}** followers!\n> You currently have **${profile.followers.length}** followers residing there.`)
                );

                components.push(capacityContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const solutionContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                solutionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## ⚔️ **EXPAND YOUR DOMAIN**\n\n**Current Retinue:** ${profile.followers.map(f => f.name).join(', ')}\n\n**💡 Solutions:**\n> • Upgrade to a larger stronghold with more follower capacity\n> • Acquire an additional stronghold for your expanding retinue\n> • Consider which followers are most essential to your cause\n\n**🎯 Goal:** Find a stronghold that can house **${profile.followers.length + 1}+** followers`)
                );

                components.push(solutionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }
            
            if (profile.followers.some(follower => follower.name.toLowerCase() === name.toLowerCase())) {
                const components = [];

                const duplicateNameContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);

                duplicateNameContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👥 Duplicate Follower Name\n## NAME ALREADY IN USE\n\n> You already have a follower named **${name}**!\n> Each follower needs a unique name for identification.`)
                );

                components.push(duplicateNameContainer);

                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const suggestionContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                const existingFollower = profile.followers.find(f => f.name.toLowerCase() === name.toLowerCase());
                suggestionContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 💡 **NAME SUGGESTIONS**\n\n**Existing Follower:** **${existingFollower.name}** (${existingFollower.role})\n\n**Try Different Names:**\n> \`!recruitfollower ${type} ${name}2\`\n> \`!recruitfollower ${type} ${name.split(' ')[0]} ${name.split(' ')[1] || 'the Great'}\`\n> \`!recruitfollower ${type} [Choose a different name]\`\n\n**💡 Tip:** Use titles or epithets to make each follower unique!`)
                );

                components.push(suggestionContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
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
          
            const avgLoyalty = profile.followers.reduce((sum, f) => sum + f.loyalty, 0) / profile.followers.length;
            profile.followerLoyalty = Math.floor(avgLoyalty);
            
            profile.maxFamiliars = Math.min(10, Math.floor(activeStronghold.maxFollowers / 2) + 1);
            
            await profile.save();
            
            const components = [];

            const successContainer = new ContainerBuilder()
                .setAccentColor(0xFF69B4);

            successContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# ⚔️ Follower Recruited!\n## WELCOME TO THE RETINUE\n\n> **${name}** has officially joined your retinue as your ${type}!\n> Your retinue grows stronger and your dominion expands.`)
            );

            components.push(successContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const profileContainer = new ContainerBuilder()
                .setAccentColor(0xE91E63);

            profileContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 👤 **NEW FOLLOWER PROFILE**')
            );

            profileContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**👤 Name:** \`${name}\`\n**💞 Role:** \`${type}\`\n**🎂 Age:** \`${age} years old\`\n**⚔️ Class:** \`${followerClass}\`\n**💰 Quest Tribute:** \`${tribute} Embers per quest\``)
            );

            profileContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**❤️ Initial Loyalty:** \`50%\` (room for growth!)\n**📈 Quest Efficiency:** \`100%\` (optimal performance)\n**🗺️ Total Quests:** \`0\` (ready for adventure!)\n**📅 Joined Retinue:** \`${new Date().toLocaleDateString()}\``)
            );

            components.push(profileContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const retinueContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            retinueContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🏰 **UPDATED RETINUE STATUS**')
            );

            const totalFollowerIncome = profile.followers.reduce((sum, follower) => {
                return sum + (follower.tribute * follower.questEfficiency * (follower.loyalty / 100));
            }, 0);

            retinueContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**👥 Total Followers:** \`${profile.followers.length}/${activeStronghold.maxFollowers}\`\n**❤️ Average Loyalty:** \`${profile.followerLoyalty}%\`\n**💰 Combined Quest Tribute:** \`${Math.floor(totalFollowerIncome)} Embers/quest\`\n**🏰 Stronghold:** \`${activeStronghold.name}\``)
            );

            retinueContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🦇 Familiar Capacity:** \`${profile.maxFamiliars}\` (updated based on follower count)\n**🎯 Retinue Goal:** Build loyalty through quests and boons\n**📈 Quest Bonus:** Followers contribute to your earnings automatically`)
            );

            components.push(retinueContainer);

            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const loyaltyContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            loyaltyContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💝 **FOLLOWER LOYALTY GUIDE**')
            );

            loyaltyContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🗺️ Embark on Quests:** Use \`!quest\` to build stronger loyalty\n**❤️ Build Loyalty:** Higher loyalty = better quest efficiency and tribute\n**👨‍👩‍👧‍👦 Expand Retinue:** Recruit more followers if you have space\n**🏰 Upgrade Stronghold:** Larger strongholds house larger retinues\n**🎯 Long-term Goal:** Reach 100% loyalty with all followers`)
            );

            loyaltyContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💡 **${name}** is ready to:**\n> • Contribute to your quest earnings automatically\n> • Join you on quests to build stronger loyalty\n> • Help increase your stronghold's overall power\n> • Provide companionship and unwavering support\n\n> Welcome to your growing dominion!`)
            );

            components.push(loyaltyContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in recruitfollower command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **FOLLOWER RECRUITMENT ERROR**\n\nSomething went wrong while recruiting your follower. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};
