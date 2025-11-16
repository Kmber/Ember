const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { GUILDS } = require('../../models/economy/constants/guildData');

module.exports = {
    name: 'foundguild',
    aliases: ['guild-start', 'newguild'],
    description: 'Found a new guild for passive income with v2 components',
    usage: '!foundguild <type>',
    async execute(message, args) {
        try {
            if (!args[0]) {
                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏰 Available Guild Types\n## FORGE YOUR DOMINION\n\n> Choose from various guild types, each with unique influence and requirements`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const guildContainer = new ContainerBuilder()
                    .setAccentColor(0x2ECC71);

                guildContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 📜 **GUILD CATEGORIES**')
                );

                const guildEntries = Object.entries(GUILDS);
                const businessText = guildEntries.map(([id, guild]) =>
                    `**\`${id}\`** - ${guild.name}\n> **Cost:** \`${guild.baseCost.toLocaleString()} Embers\`\n> **Description:** ${guild.description}\n> **Daily Income:** \`${guild.dailyIncome[0]}-${guild.dailyIncome[1]} Embers\``
                ).join('\n\n');

                guildContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(businessText)
                );
                
                components.push(guildContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🚀 **HOW TO FOUND A GUILD**\n\n**Command:** \`!foundguild <type>\`\n**Example:** \`!foundguild assassins_guild\`\n\n**💡 Tips:**\n> • Each guild type has different influence potential\n> • Higher cost guilds usually have better returns\n> • You can upgrade and recruit apprentices later`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const guildType = args[0].toLowerCase();
            const guildData = GUILDS[guildType];

            if (!guildData) {
                const components = [];
                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                errorContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Guild Type\n## GUILD NOT FOUND\n\n> **\`${guildType}\`** is not a valid guild type!\n> Use \`!foundguild\` to see all available options.`)
                );
                components.push(errorContainer);
                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

            if (profile.guilds.length >= profile.maxGuilds) {
                const components = [];
                const limitContainer = new ContainerBuilder()
                    .setAccentColor(0xF39C12);
                limitContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏰 Guild Limit Reached\n## MAXIMUM CAPACITY\n\n> You can only lead **${profile.maxGuilds}** guilds!\n> Current guilds: **${profile.guilds.length}/${profile.maxGuilds}**\n\n**💡 Tip:** Enhance your leadership skill to increase capacity.`)
                );
                components.push(limitContainer);
                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (profile.guilds.some(b => b.type === guildType)) {
                const components = [];
                const duplicateContainer = new ContainerBuilder()
                    .setAccentColor(0xE67E22);
                duplicateContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🚫 Guild Already Founded\n## DUPLICATE GUILD TYPE\n\n> You already lead a **${guildData.name}**!\n> Each lord can only lead one guild of each type.`)
                );
                components.push(duplicateContainer);
                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (profile.embers < guildData.baseCost) {
                const components = [];
                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);
                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Embers\n## CANNOT AFFORD GUILD\n\n> You need **\`${guildData.baseCost.toLocaleString()} Embers\`** to found **${guildData.name}**!\n> Current Embers: **\`${profile.embers.toLocaleString()}\`**\n> Shortage: **\`${(guildData.baseCost - profile.embers).toLocaleString()} Embers\`**`)
                );
                components.push(insufficientContainer);
                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const guild = {
                guildId: `${guildType}_${Date.now()}`,
                name: guildData.name,
                type: guildType,
                level: 1,
                apprentices: 0,
                revenue: 0,
                expenses: 0,
                profit: 0,
                reputation: 50,
                purchasePrice: guildData.baseCost,
                upgradeCost: Math.floor(guildData.baseCost * guildData.upgradeCostMultiplier),
                dailyIncome: 0,
                lastCollection: new Date(),
                efficiency: 1.0
            };

            profile.embers -= guildData.baseCost;
            profile.guilds.push(guild);
            profile.leadershipSkill = Math.min(100, profile.leadershipSkill + 5);

            profile.transactions.push({
                type: 'expense',
                amount: guildData.baseCost,
                description: `Founded guild: ${guildData.name}`,
                category: 'guild'
            });

            await profile.save();

            const components = [];

            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);
            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🏰 Guild Founded Successfully!\n## WELCOME TO LEADERSHIP\n\n> Congratulations! You've successfully founded **${guildData.name}** for \`${guildData.baseCost.toLocaleString()} Embers\`!`)
            );
            components.push(headerContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const detailsContainer = new ContainerBuilder()
                .setAccentColor(0x2ECC71);
            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📊 **GUILD OVERVIEW**')
            );
            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏰 Guild Name:** \`${guildData.name}\`\n**📊 Starting Level:** \`1\`\n**👥 Apprentices:** \`0\`\n**⭐ Reputation:** \`50%\`\n**🎯 Efficiency:** \`100%\``)
            );
            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Daily Income Range:** \`${guildData.dailyIncome[0].toLocaleString()}-${guildData.dailyIncome[1].toLocaleString()} Embers\`\n**📈 Next Upgrade Cost:** \`${guild.upgradeCost.toLocaleString()} Embers\`\n**💳 Remaining Embers:** \`${profile.embers.toLocaleString()}\``)
            );
            components.push(detailsContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const progressContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);
            progressContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 📈 **PROGRESS & REWARDS**')
            );
            progressContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🎯 Leadership Skill Gained:** \`+5%\` (Now ${profile.leadershipSkill}%)\n**🏰 Total Guilds:** \`${profile.guilds.length}/${profile.maxGuilds}\`\n**📜 Guild Portfolio:** Growing strong!`)
            );
            components.push(progressContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const tipsContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);
            tipsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💡 **MANAGEMENT TIPS**\n\n**\`!guild\`** - View your guild empire\n**\`!guild collect\`** - Collect daily tributes (24h cooldown)\n**\`!guild upgrade <#>\`** - Upgrade for higher income\n**\`!guild recruit <#> [amount]\`** - Recruit apprentices to boost profits\n\n> Your guild will start generating income immediately!`)
            );
            components.push(tipsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in foundguild command:', error);

            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);
            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **GUILD FOUNDING ERROR**\n\nSomething went wrong while founding your guild. Please try again in a moment.')
            );
            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};