const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { GUILD_TYPES } = require('../../models/economy/constants/guildData');

module.exports = {
    name: 'startguild',
    aliases: ['guild-start', 'newguild'],
    description: 'Start a new guild for passive income with v2 components',
    usage: '!startguild <type>',
    async execute(message, args) {
        try {
            if (!args[0]) {
                
                const components = [];

             
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏰 Available Guild Types\n## FORGE YOUR LEGACY\n\n> Choose from various guild types, each with unique profit potential and requirements`)
                );

                components.push(headerContainer);

            
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

               
                const guildContainer = new ContainerBuilder()
                    .setAccentColor(0x2ECC71);

                guildContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 📜 **GUILD CATEGORIES**')
                );

          
                const guildEntries = Object.entries(GUILD_TYPES);
                const firstHalf = guildEntries.slice(0, 3);
                const secondHalf = guildEntries.slice(3);

            
                const firstGuildText = firstHalf.map(([id, g]) =>
                    `**\`${id}\`** - ${g.name}\n> **Cost:** \`${g.baseCost.toLocaleString()} Embers\`\n> **Description:** ${g.description}\n> **Daily Income:** \`${g.dailyIncome[0]} Embers-${g.dailyIncome[1]} Embers\``
                ).join('\n\n');

                guildContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(firstGuildText)
                );

               
                if (secondHalf.length > 0) {
                    const secondGuildText = secondHalf.map(([id, g]) =>
                        `**\`${id}\`** - ${g.name}\n> **Cost:** \`${g.baseCost.toLocaleString()} Embers\`\n> **Description:** ${g.description}\n> **Daily Income:** \`${g.dailyIncome[0]} Embers-${g.dailyIncome[1]} Embers\``
                    ).join('\n\n');

                    guildContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(secondGuildText)
                    );
                }

                components.push(guildContainer);

              
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const instructionsContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                instructionsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🚀 **HOW TO START**\n\n**Command:** \`!startguild <type>\`\n**Example:** \`!startguild thieves_guild\`\n\n**💡 Tips:**\n> • Each guild type has different profit potential\n> • Higher cost guilds usually have better returns\n> • You can upgrade and recruit acolytes later`)
                );

                components.push(instructionsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const guildType = args[0].toLowerCase();
            const guildData = GUILD_TYPES[guildType];

            if (!guildData) {
                const components = [];

                const errorContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                errorContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# ❌ Invalid Guild Type\n## GUILD NOT FOUND\n\n> **\`${guildType}\`** is not a valid guild type!\n> Use \`!startguild\` to see all available options.`)
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
                        .setContent(`# 🏰 Guild Limit Reached\n## MAXIMUM CAPACITY\n\n> You can only own **${profile.maxGuilds}** guilds!\n> Current guilds: **${profile.guilds.length}/${profile.maxGuilds}**\n\n**💡 Tip:** Increase your influence to expand your guild capacity.`)
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
                        .setContent(`# 🚫 Guild Already Owned\n## DUPLICATE GUILD TYPE\n\n> You already own a **${guildData.name}**!\n> Each player can only own one guild of each type.`)
                );

                components.push(duplicateContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            if (profile.wallet < guildData.baseCost) {
                const components = [];

                const insufficientContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                insufficientContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💸 Insufficient Funds\n## CANNOT AFFORD GUILD\n\n> You need **\`${guildData.baseCost.toLocaleString()} Embers\`** to start **${guildData.name}**!\n> Current wallet: **\`${profile.wallet.toLocaleString()} Embers\`**\n> Shortage: **\`${(guildData.baseCost - profile.wallet).toLocaleString()} Embers\`**`)
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
                acolytes: 0,
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

            profile.wallet -= guildData.baseCost;
            profile.guilds.push(guild);
            profile.guildInfluence = Math.min(100, profile.guildInfluence + 5);

        
            profile.transactions.push({
                type: 'expense',
                amount: guildData.baseCost,
                description: `Started guild: ${guildData.name}`,
                category: 'guild'
            });

            await profile.save();

            const components = [];

        
            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 🏰 Guild Started Successfully!\n## WELCOME TO THE CONGLOMERATE\n\n> Congratulations! You\'ve successfully started **${guildData.name}** for \`${guildData.baseCost.toLocaleString()} Embers\`!`)
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
                    .setContent(`**🏰 Guild Name:** \`${guildData.name}\`\n**📊 Starting Level:** \`1\`\n**👥 Acolytes:** \`0\`\n**⭐ Reputation:** \`50%\`\n**🎯 Efficiency:** \`100%\``)
            );

            detailsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💰 Daily Income Range:** \`${guildData.dailyIncome[0].toLocaleString()} Embers-${guildData.dailyIncome[1].toLocaleString()} Embers\`\n**📈 Next Upgrade Cost:** \`${guild.upgradeCost.toLocaleString()} Embers\`\n**💳 Remaining Wallet:** \`${profile.wallet.toLocaleString()} Embers\``)
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
                    .setContent(`**🎯 Guild Influence Gained:** \`+5%\` (Now ${profile.guildInfluence}%)\n**🏰 Total Guilds:** \`${profile.guilds.length}/${profile.maxGuilds}\`\n**💼 Guild Conglomerate:** Growing strong!`)
            );

            components.push(progressContainer);

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const tipsContainer = new ContainerBuilder()
                .setAccentColor(0x9B59B6);

            tipsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 💡 **MANAGEMENT TIPS**\n\n**\`!guild\`** - View your guild conglomerate\n**\`!guild collect\`** - Collect daily profits (24h cooldown)\n**\`!guild upgrade <#>\`** - Upgrade for higher income\n**\`!guild recruit <#> [amount]\`** - Recruit acolytes to boost profits\n\n> Your guild will start generating income immediately!`)
            );

            components.push(tipsContainer);

            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in startguild command:', error);

       
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **GUILD STARTUP ERROR**\n\nSomething went wrong while starting your guild. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};