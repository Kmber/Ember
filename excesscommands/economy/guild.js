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
    name: 'guild',
    aliases: ['g', 'guilds'],
    description: 'Manage your guild conglomerate with enhanced v2 components',
    usage: '!guild [collect/upgrade/recruit/dismiss/delete] [guild_id] [amount]',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);

            if (profile.guilds.length === 0) {
                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏰 No Guild Conglomerate Yet\n## START YOUR PATH TO POWER\n\n> You don\'t own any guilds! Time to start building your conglomerate.`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const infoContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                infoContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 🚀 **GET STARTED**\n\n**Command:** \`!startguild <type>\`\n**Available Types:** \`alchemists_guild, scriveners_guild, masons_guild, mercenary_guild, thieves_guild, arcane_syndicate\`\n\n**💡 Enhanced Features:**\n> • Much higher profit margins\n> • Acolytes now generate significant income\n> • Experience and skill progression\n> • Guild selling/deletion options`)
                );

                components.push(infoContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const action = args[0]?.toLowerCase();

            if (!action) {
             
                let totalDailyProfit = 0;
                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0xFF9800);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏰 Your Guild Conglomerate\n## ENHANCED GUILD TREASURY\n\n> Managing ${profile.guilds.length}/${profile.maxGuilds} guilds with improved profit margins`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

          
                const statsContainer = new ContainerBuilder()
                    .setAccentColor(0x2ECC71);

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 📊 **GUILD STATISTICS**')
                );

             
                for (let a_guild of profile.guilds) {
                    const income = await EconomyManager.calculateGuildIncome(a_guild);
                    totalDailyProfit += income.profit;
                }

                const totalAssetValue = profile.guilds.reduce((total, g) => total + g.purchasePrice, 0);

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💎 Total Daily Profit:** \`${totalDailyProfit.toLocaleString()} Embers\`\n**🏰 Guild\'s Total Worth:** \`${totalAssetValue.toLocaleString()} Embers\`\n**📈 Guild Influence:** \`${profile.guildInfluence}%\``)
                );

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Experience:** \`${profile.experience.toLocaleString()} XP\`\n**📊 Guilds:** \`${profile.guilds.length}/${profile.maxGuilds}\`\n**⭐ Average Reputation:** \`${Math.floor(profile.guilds.reduce((sum, g) => sum + g.reputation, 0) / profile.guilds.length)}%\``)
                );

                components.push(statsContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

             
                const guildsContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB);

                guildsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🏪 **YOUR GUILDS**')
                );

                const guildsToShow = profile.guilds.slice(0, 3);
                
                for (let i = 0; i < guildsToShow.length; i++) {
                    const g = guildsToShow[i];
                    const gType = GUILD_TYPES[g.type];
                    const income = await EconomyManager.calculateGuildIncome(g);
                    const hoursUntilCollection = g.lastCollection ?
                        Math.max(0, 24 - Math.floor((Date.now() - g.lastCollection.getTime()) / (1000 * 60 * 60))) : 0;

                    const guildText = `**${i + 1}. ${g.name}** (Level ${g.level})\n` +
                        `> **Type:** \`${gType?.name || g.type}\`\n` +
                        `> **💰 Daily Profit:** \`${income.profit.toLocaleString()} Embers\` (Revenue: ${income.revenue.toLocaleString()} Embers)\n` +
                        `> **👥 Acolytes:** \`${g.acolytes}/${gType.maxAcolytes}\` (Cost: ${income.expenses.toLocaleString()} Embers)\n` +
                        `> **⭐ Reputation:** \`${g.reputation}%\` • **🎯 Efficiency:** \`${Math.floor(g.efficiency * 100)}%\`\n` +
                        `> **⏰ Collection:** \`${hoursUntilCollection > 0 ? `${hoursUntilCollection}h remaining` : 'Ready!'}\``;

                    guildsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(guildText)
                    );
                }

                if (profile.guilds.length > 3) {
                    guildsContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`*...and ${profile.guilds.length - 3} more guilds*`)
                    );
                }

                components.push(guildsContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

              
                const footerContainer = new ContainerBuilder()
                    .setAccentColor(0x95A5A6);

                footerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`## 📋 **QUICK COMMANDS**\n\n**\`!guild collect\`** - Collect daily profits\n**\`!guild upgrade <#>\`** - Upgrade guild level\n**\`!guild recruit <#> [amount]\`** - Recruit acolytes\n**\`!guild dismiss <#> [amount]\`** - Dismiss acolytes\n**\`!guild delete <#>\`** - Sell guild\n**\`!guild help\`** - Full command list`)
                );

                components.push(footerContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

     
            if (action === 'collect') {
                const result = await EconomyManager.collectGuildIncome(message.author.id, message.guild.id);

                if (result.totalProfit <= 0) {
                    const components = [];

                    const noCollectionContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    noCollectionContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ⏰ No Profits Ready\n## PATIENCE PAYS OFF\n\n> No profits ready for collection! Your guilds need 24 hours to generate income.\n\n**💡 Tip:** Use this time to upgrade your guilds or recruit more acolytes!`)
                    );

                    components.push(noCollectionContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

              
                const rewards = await EconomyManager.giveGuildExperience(profile, 'collect', result.totalProfit);
                await profile.save();

                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 💰 Guild Profits Collected!\n## SUCCESSFUL COLLECTION\n\n> Your enhanced guild conglomerate has generated substantial profits!`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const resultsContainer = new ContainerBuilder()
                    .setAccentColor(0x27AE60);

                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 📊 **COLLECTION REPORT**')
                );

                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💎 Total Profit:** \`${result.totalProfit.toLocaleString()} Embers\`\n**💳 New Balance:** \`${profile.wallet.toLocaleString()} Embers\`\n**🏰 Guilds:** \`${result.guildReport.length}\``)
                );

                resultsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**⭐ Experience Gained:** \`+${rewards.expGain} XP\`\n**📈 Skill Gained:** \`+${rewards.skillGain}%\`\n**🎯 Total Experience:** \`${profile.experience.toLocaleString()} XP\``)
                );

               
                if (result.guildReport.length > 0) {
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
                    
                    const reportContainer = new ContainerBuilder()
                        .setAccentColor(0x1B5E20);

                    reportContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('## 💼 **GUILD BREAKDOWN**')
                    );

                    const reportText = result.guildReport.slice(0, 3).map(g =>
                        `**${g.name}**\n> **Revenue:** \`${g.revenue.toLocaleString()} Embers\`\n> **Expenses:** \`${g.expenses.toLocaleString()} Embers\`\n> **Net Profit:** \`${g.profit.toLocaleString()} Embers\``
                    ).join('\n\n');

                    reportContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(reportText)
                    );

                    components.push(reportContainer);
                }

                components.push(resultsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

       
            if (action === 'dismiss') {
                const guildIndex = parseInt(args[1]) - 1;
                const dismissAmount = parseInt(args[2]) || 1;

                if (isNaN(guildIndex) || guildIndex < 0 || guildIndex >= profile.guilds.length) {
                    const components = [];

                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Invalid Guild Number\n## SELECTION ERROR\n\n> Invalid guild number! Use \`!guild\` to see your guilds numbered 1-${profile.guilds.length}.`)
                    );

                    components.push(errorContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const guild = profile.guilds[guildIndex];

                if (guild.acolytes < dismissAmount) {
                    const components = [];

                    const insufficientContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    insufficientContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 👥 Not Enough Acolytes\n## DISMISSAL BLOCKED\n\n> **${guild.name}** only has ${guild.acolytes} acolytes!\n> You cannot dismiss ${dismissAmount} acolytes.`)
                    );

                    components.push(insufficientContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

               
                const dismissalFee = dismissAmount * 200; 
                guild.acolytes -= dismissAmount;
                profile.wallet = Math.max(0, profile.wallet - dismissalFee);

          
                const rewards = await EconomyManager.giveGuildExperience(profile, 'dismiss', dismissAmount);
                await profile.save();

                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0xFF5722);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👥 Acolytes Dismissed\n## CULLING OF THE RANKS\n\n> Dismissed ${dismissAmount} acolytes from **${guild.name}**`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const detailsContainer = new ContainerBuilder()
                    .setAccentColor(0xE64A19);

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💼 **DISMISSAL DETAILS**')
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💸 Dismissal Fee:** \`${dismissalFee.toLocaleString()} Embers\`\n**👥 Remaining Acolytes:** \`${guild.acolytes}\`\n**💰 Daily Savings:** \`${(dismissAmount * GUILD_TYPES[guild.type].acolyteCost * 0.6).toLocaleString()} Embers\`\n**💳 Remaining Wallet:** \`${profile.wallet.toLocaleString()} Embers\``)
                );

                components.push(detailsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

        
            if (action === 'delete' || action === 'sell') {
                const guildIndex = parseInt(args[1]) - 1;

                if (isNaN(guildIndex) || guildIndex < 0 || guildIndex >= profile.guilds.length) {
                    const components = [];

                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Invalid Guild Number\n## SELECTION ERROR\n\n> Invalid guild number! Use \`!guild\` to see your guilds numbered 1-${profile.guilds.length}.`)
                    );

                    components.push(errorContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const guild = profile.guilds[guildIndex];
                const sellValue = await EconomyManager.sellGuild(profile, guildIndex);
                
        
                const rewards = await EconomyManager.giveGuildExperience(profile, 'delete');
                await profile.save();

                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x9C27B0);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏰 Guild Disbanded Successfully!\n## GUILD CHARTER REVOKED\n\n> **${guild.name}** has been disbanded for \`${sellValue.toLocaleString()} Embers\`!`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const detailsContainer = new ContainerBuilder()
                    .setAccentColor(0x7B1FA2);

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💰 **REVOCATION DETAILS**')
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💎 Revocation Value:** \`${sellValue.toLocaleString()} Embers\`\n**📊 Original Cost:** \`${guild.purchasePrice.toLocaleString()} Embers\`\n**📈 Net Gain/Loss:** \`${(sellValue - guild.purchasePrice).toLocaleString()} Embers\`\n**💳 New Balance:** \`${profile.wallet.toLocaleString()} Embers\``)
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**⭐ Experience Gained:** \`+${rewards.expGain} XP\`\n**🏰 Remaining Guilds:** \`${profile.guilds.length}/${profile.maxGuilds}\``)
                );

                components.push(detailsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

    
            if (action === 'upgrade') {
                const guildIndex = parseInt(args[1]) - 1;
                if (isNaN(guildIndex) || guildIndex < 0 || guildIndex >= profile.guilds.length) {
                    const components = [];

                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Invalid Guild Number\n## SELECTION ERROR\n\n> Invalid guild number! Use \`!guild\` to see your guilds numbered 1-${profile.guilds.length}.`)
                    );

                    components.push(errorContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const guild = profile.guilds[guildIndex];
                const guildType = GUILD_TYPES[guild.type];

                if (guild.level >= guildType.maxLevel) {
                    const components = [];

                    const maxLevelContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    maxLevelContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🏆 Maximum Level Reached\n## GUILD FULLY UPGRADED\n\n> **${guild.name}** is already at maximum level (${guildType.maxLevel})!\n\n**💡 Tip:** Consider starting a new guild or recruiting more acolytes!`)
                    );

                    components.push(maxLevelContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                if (profile.wallet < guild.upgradeCost) {
                    const components = [];

                    const insufficientContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    insufficientContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 💸 Insufficient Funds\n## UPGRADE BLOCKED\n\n> You need \`${guild.upgradeCost.toLocaleString()} Embers\` to upgrade **${guild.name}**!\n> Current wallet: \`${profile.wallet.toLocaleString()} Embers\`\n> Shortage: \`${(guild.upgradeCost - profile.wallet).toLocaleString()} Embers\``)
                    );

                    components.push(insufficientContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

      
                const oldIncome = await EconomyManager.calculateGuildIncome(guild);
                
     
                const upgradeCostPaid = guild.upgradeCost;
                profile.wallet -= upgradeCostPaid;
                guild.level += 1;
                guild.upgradeCost = Math.floor(upgradeCostPaid * guildType.upgradeCostMultiplier);
                guild.reputation = Math.min(100, guild.reputation + 5);
                guild.efficiency = Math.min(2.0, guild.efficiency + 0.05);

          
                const newIncome = await EconomyManager.calculateGuildIncome(guild);
                
                profile.transactions.push({
                    type: 'expense',
                    amount: upgradeCostPaid,
                    description: `Upgraded ${guild.name} to level ${guild.level}`,
                    category: 'guild'
                });

              
                const rewards = await EconomyManager.giveGuildExperience(profile, 'upgrade');
                await profile.save();

                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x2196F3);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 📈 Guild Upgraded!\n## LEVEL UP SUCCESS\n\n> **${guild.name}** has been upgraded to level ${guild.level}!`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const detailsContainer = new ContainerBuilder()
                    .setAccentColor(0x1976D2);

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💰 **UPGRADE BENEFITS**')
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💰 Upgrade Cost:** \`${upgradeCostPaid.toLocaleString()} Embers\`\n**📊 New Level:** \`${guild.level}/${guildType.maxLevel}\`\n**⭐ Reputation:** \`${guild.reputation}%\` (+5%)\n**🎯 Efficiency:** \`${Math.floor(guild.efficiency * 100)}%\` (+5%)`)
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**📈 Daily Profit Increase:** \`${(newIncome.profit - oldIncome.profit).toLocaleString()} Embers\`\n**💎 New Daily Profit:** \`${newIncome.profit.toLocaleString()} Embers\`\n**⭐ Experience:** \`+${rewards.expGain} XP\`\n**📊 Skill:** \`+${rewards.skillGain}%\``)
                );

                const nextUpgradeText = guild.level < guildType.maxLevel ? 
                    `**🔮 Next Upgrade:** \`${guild.upgradeCost.toLocaleString()} Embers\`` : 
                    '**🏆 Max Level Reached!**';
                
                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`${nextUpgradeText}\n**💳 Remaining Wallet:** \`${profile.wallet.toLocaleString()} Embers\``)
                );

                components.push(detailsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

    
            if (action === 'recruit') {
                const guildIndex = parseInt(args[1]) - 1;
                const recruitAmount = parseInt(args[2]) || 1;

                if (isNaN(guildIndex) || guildIndex < 0 || guildIndex >= profile.guilds.length) {
                    const components = [];

                    const errorContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    errorContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# ❌ Invalid Guild Number\n## SELECTION ERROR\n\n> Invalid guild number! Use \`!guild\` to see your guilds.`)
                    );

                    components.push(errorContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

                const guild = profile.guilds[guildIndex];
                const guildType = GUILD_TYPES[guild.type];

                if (guild.acolytes + recruitAmount > guildType.maxAcolytes) {
                    const components = [];

                    const maxAcolytesContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12);

                    maxAcolytesContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 👥 Acolyte Limit Reached\n## RECRUITMENT BLOCKED\n\n> **${guild.name}** can only have ${guildType.maxAcolytes} acolytes!\n> Current: ${guild.acolytes}/${guildType.maxAcolytes}\n> Requested: +${recruitAmount}`)
                    );

                    components.push(maxAcolytesContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

         
                const baseRecruitingCost = 1000 + (guild.level * 200); 
                const recruitingCost = recruitAmount * baseRecruitingCost;
                
                if (profile.wallet < recruitingCost) {
                    const components = [];

                    const insufficientContainer = new ContainerBuilder()
                        .setAccentColor(0xE74C3C);

                    insufficientContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 💸 Insufficient Funds\n## RECRUITMENT BLOCKED\n\n> You need \`${recruitingCost.toLocaleString()} Embers\` to recruit ${recruitAmount} acolytes!\n> Current wallet: \`${profile.wallet.toLocaleString()} Embers\`\n> Cost per acolyte: \`${baseRecruitingCost.toLocaleString()} Embers\``)
                    );

                    components.push(insufficientContainer);

                    return message.reply({
                        components: components,
                        flags: MessageFlags.IsComponentsV2
                    });
                }

            
                const oldIncome = await EconomyManager.calculateGuildIncome(guild);
                
                profile.wallet -= recruitingCost;
                guild.acolytes += recruitAmount;
                
                const newIncome = await EconomyManager.calculateGuildIncome(guild);
                const profitIncrease = newIncome.profit - oldIncome.profit;

                
                const rewards = await EconomyManager.giveGuildExperience(profile, 'recruit', recruitAmount);
                await profile.save();

                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x9C27B0);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 👥 Acolytes Recruited!\n## RANKS BOLSTERED\n\n> Successfully recruited ${recruitAmount} acolytes for **${guild.name}**!`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const detailsContainer = new ContainerBuilder()
                    .setAccentColor(0x7B1FA2);

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 💼 **RECRUITING BENEFITS**')
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💰 Recruiting Cost:** \`${recruitingCost.toLocaleString()} Embers\`\n**👥 Total Acolytes:** \`${guild.acolytes}/${guildType.maxAcolytes}\`\n**💸 Daily Acolyte Cost:** \`${newIncome.expenses.toLocaleString()} Embers\`\n**📈 Daily Profit Increase:** \`${profitIncrease.toLocaleString()} Embers\``)
                );

                detailsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💎 New Daily Profit:** \`${newIncome.profit.toLocaleString()} Embers\`\n**⭐ Experience:** \`+${rewards.expGain} XP\`\n**📊 Skill:** \`+${rewards.skillGain}%\`\n**💳 Remaining Wallet:** \`${profile.wallet.toLocaleString()} Embers\``)
                );

                components.push(detailsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

         
            if (action === 'help') {
                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x607D8B);

                headerContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`# 🏰 Guildmaster\'s Ledger\n## COMPLETE COMMAND GUIDE\n\n> Learn how to manage and grow your guild conglomerate with enhanced features`)
                );

                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const commandsContainer = new ContainerBuilder()
                    .setAccentColor(0x546E7A);

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 📋 **AVAILABLE COMMANDS**')
                );

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**\`!guild\`** - View all your guilds with enhanced stats\n**\`!guild collect\`** - Collect daily profits (24h cooldown)\n**\`!guild upgrade <#>\`** - Upgrade guild level for massive income boost`)
                );

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**\`!guild recruit <#> [amount]\`** - Recruit acolytes for significant profit boost\n**\`!guild dismiss <#> [amount]\`** - Dismiss acolytes to reduce costs\n**\`!guild delete <#>\`** - Sell guild for 60-80% of purchase price`)
                );

                commandsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**\`!startguild <type>\`** - Start a new guild with enhanced profits\n\n**💡 Enhanced Features:**\n> • Much higher profit margins\n> • Experience and skill progression\n> • Better acolyte ROI\n> • Guild selling options`)
                );

                components.push(commandsContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

        } catch (error) {
            console.error('Error in enhanced guild command:', error);
            
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **GUILD ERROR**\n\nSomething went wrong while processing your guild command. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};