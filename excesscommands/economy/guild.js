const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { GUILD_TYPES } = require('../../models/economy/constants/businessData');

module.exports = {
    name: 'guild',
    aliases: ['glds', 'guilds'],
    description: 'Manage your guild empire with v2 components',
    usage: '!guild [collect/upgrade/recruit/dismiss/disband] [guild_id] [amount]',
    async execute(message, args) {
        try {
            const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
            profile.souls = Number(profile.souls) || 0;

            if (profile.guilds.length === 0) {
                const components = [];
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🏰 No Guild Dominion Yet\n## FORGE YOUR PATH TO POWER\n\n> You do not lead any guilds! It is time to forge your dominion.`)
                    );
                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const infoContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 🚀 **BEGIN YOUR ASCENSION**\n\n**Command:** \`!foundguild <type>\`\n**Available Guilds:** \`assassins_guild, alchemy_lab, mercenary_company, trading_syndicate, arcane_sanctum, thieves_guild\`\n\n**💡 Benefits of Power:**\n> • Command vast tributes of Souls\n> • Apprentices generate significant income\n> • Gain influence and leadership skills\n> • Option to disband guilds that no longer serve you`)
                    );
                components.push(infoContainer);

                return message.reply({
                    components: components,
                    flags: MessageFlags.IsComponentsV2
                });
            }

            const action = args[0]?.toLowerCase();

            if (!action) {
                let totalDailyTribute = 0;
                const components = [];

                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0xFF9800)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 🏰 Your Guild Dominion\n## YOUR SHADOW EMPIRE\n\n> Commanding ${profile.guilds.length}/${profile.maxGuilds} guilds with immense influence`)
                    );
                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const statsContainer = new ContainerBuilder()
                    .setAccentColor(0x2ECC71)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('## 📊 **DOMINION STATISTICS**')
                    );

                for (let guild of profile.guilds) {
                    const income = await EconomyManager.calculateGuildIncome(guild);
                    totalDailyTribute += income.profit;
                }

                const totalAssetValue = profile.guilds.reduce((total, guild) => total + guild.purchasePrice, 0);

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**💀 Total Daily Tribute:** \`${totalDailyTribute.toLocaleString()} Souls\`\n**🏰 Dominion Value:** \`${totalAssetValue.toLocaleString()} Souls\`\n**📈 Leadership Skill:** \`${profile.guildManagementSkill || 0}%\``)
                );

                statsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**✨ Influence:** \`${profile.experience.toLocaleString()} XP\`\n**📊 Guilds:** \`${profile.guilds.length}/${profile.maxGuilds}\`\n**⭐ Average Renown:** \`${Math.floor(profile.guilds.reduce((sum, guild) => sum + guild.reputation, 0) / profile.guilds.length)}%\``)
                );

                components.push(statsContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const guildsContainer = new ContainerBuilder()
                    .setAccentColor(0x3498DB)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('## 📜 **YOUR GUILDS**')
                    );

                const guildsToShow = profile.guilds.slice(0, 3);
                
                for (let i = 0; i < guildsToShow.length; i++) {
                    const guild = guildsToShow[i];
                    const guildType = GUILD_TYPES[guild.type];
                    const income = await EconomyManager.calculateGuildIncome(guild);
                    const hoursUntilCollection = guild.lastCollection ?
                        Math.max(0, 24 - Math.floor((Date.now() - guild.lastCollection.getTime()) / (1000 * 60 * 60))) : 0;

                    const guildText = `**${i + 1}. ${guild.name}** (Level ${guild.level})\n` +
                        `> **Type:** \`${guildType?.name || guild.type}\`\n` +
                        `> **💀 Daily Tribute:** \`${income.profit.toLocaleString()} Souls\` (Revenue: ${income.revenue.toLocaleString()})\n` +
                        `> **👥 Apprentices:** \`${guild.apprentices}/${guildType.maxApprentices}\` (Upkeep: ${income.expenses.toLocaleString()} Souls)\n` +
                        `> **⭐ Renown:** \`${guild.reputation}%\` • **🎯 Efficiency:** \`${Math.floor(guild.efficiency * 100)}%\`\n` +
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
                    .setAccentColor(0x95A5A6)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`## 📋 **QUICK EDICTS**\n\n**\`!guild collect\`** - Collect daily tributes\n**\`!guild upgrade <#>\`** - Upgrade guild level\n**\`!guild recruit <#> [amount]\`** - Recruit apprentices\n**\`!guild dismiss <#> [amount]\`** - Dismiss apprentices\n**\`!guild disband <#>\`** - Disband a guild\n**\`!guild help\`** - Full command list`)
                    );
                components.push(footerContainer);

                return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
            }

            if (action === 'collect') {
                const result = await EconomyManager.collectGuildIncome(message.author.id, message.guild.id);

                if (result.totalProfit <= 0) {
                    const components = [];
                    const noCollectionContainer = new ContainerBuilder()
                        .setAccentColor(0xF39C12)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(`# ⏰ No Tributes Ready\n## PATIENCE, MY LORD\n\n> No tributes are ready for collection! Your guilds require a full day to gather their tithes.\n\n**💡 Tip:** Use this time to upgrade your guilds or recruit more apprentices!`)
                        );
                    components.push(noCollectionContainer);
                    return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
                }

                const rewards = await EconomyManager.giveBusinessExperience(profile, 'collect', result.totalProfit);
                await profile.save();

                const components = [];
                const headerContainer = new ContainerBuilder()
                    .setAccentColor(0x4CAF50)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`# 💀 Guild Tributes Collected!\n## A BOUNTIFUL HARVEST\n\n> Your dark dominion has yielded substantial tributes.`)
                    );
                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const resultsContainer = new ContainerBuilder()
                    .setAccentColor(0x27AE60)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent('## 📊 **COLLECTION REPORT**')
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**💀 Total Tribute:** \`${result.totalProfit.toLocaleString()} Souls\`\n**💳 New Soul Balance:** \`${profile.souls.toLocaleString()} Souls\`\n**🏰 Guilds Reporting:** \`${result.businessReport.length}\``)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**✨ Influence Gained:** \`+${rewards.expGain} XP\`\n**📈 Leadership Gained:** \`+${rewards.skillGain}%\`\n**🎯 Total Influence:** \`${profile.experience.toLocaleString()} XP\``)
                    );
                components.push(resultsContainer);

                if (result.businessReport.length > 0) {
                    const reportContainer = new ContainerBuilder()
                        .setAccentColor(0x1B5E20)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent('## 📜 **GUILD LEDGER**')
                        );

                    const reportText = result.businessReport.slice(0, 3).map(guild =>
                        `**${guild.name}**\n> **Revenue:** \`${guild.revenue.toLocaleString()} Souls\`\n> **Upkeep:** \`${guild.expenses.toLocaleString()} Souls\`\n> **Net Tribute:** \`${guild.profit.toLocaleString()} Souls\``
                    ).join('\n\n');

                    reportContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(reportText));
                    components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
                    components.push(reportContainer);
                }

                return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
            }

            if (action === 'dismiss') {
                const guildIndex = parseInt(args[1]) - 1;
                const dismissAmount = parseInt(args[2]) || 1;

                if (isNaN(guildIndex) || guildIndex < 0 || guildIndex >= profile.guilds.length) {
                    const components = [];
                    const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C).addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ❌ Invalid Guild Number\n## SELECTION ERROR\n\n> Invalid guild number! Use \`!guild\` to see your guilds numbered 1-${profile.guilds.length}.`));
                    components.push(errorContainer);
                    return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
                }

                const guild = profile.guilds[guildIndex];

                if (guild.apprentices < dismissAmount) {
                    const components = [];
                    const insufficientContainer = new ContainerBuilder().setAccentColor(0xF39C12).addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 👥 Not Enough Apprentices\n## DISMISSAL BLOCKED\n\n> **${guild.name}** only has ${guild.apprentices} apprentices!\n> You cannot dismiss ${dismissAmount} of them.`));
                    components.push(insufficientContainer);
                    return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
                }

                const dismissalCost = dismissAmount * 200; 
                guild.apprentices -= dismissAmount;
                profile.souls = Math.max(0, profile.souls - dismissalCost);

                const rewards = await EconomyManager.giveBusinessExperience(profile, 'fire', dismissAmount);
                await profile.save();

                const components = [];
                const headerContainer = new ContainerBuilder().setAccentColor(0xFF5722).addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 👥 Apprentices Dismissed\n## RANKS THINNED\n\n> Dismissed ${dismissAmount} apprentices from **${guild.name}**`));
                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const detailsContainer = new ContainerBuilder().setAccentColor(0xE64A19).addTextDisplayComponents(new TextDisplayBuilder().setContent('## 📜 **DISMISSAL DETAILS**')).addTextDisplayComponents(new TextDisplayBuilder().setContent(`**💸 Severance Paid:** \`${dismissalCost.toLocaleString()} Souls\`\n**👥 Remaining Apprentices:** \`${guild.apprentices}\`\n**💰 Daily Upkeep Savings:** \`${(dismissAmount * GUILD_TYPES[guild.type].employeeCost * 0.6).toLocaleString()} Souls\`\n**💳 Remaining Souls:** \`${profile.souls.toLocaleString()} Souls\``));
                components.push(detailsContainer);

                return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
            }

            if (action === 'disband') {
                const guildIndex = parseInt(args[1]) - 1;

                if (isNaN(guildIndex) || guildIndex < 0 || guildIndex >= profile.guilds.length) {
                    const components = [];
                    const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C).addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ❌ Invalid Guild Number\n## SELECTION ERROR\n\n> Invalid guild number! Use \`!guild\` to see your guilds numbered 1-${profile.guilds.length}.`));
                    components.push(errorContainer);
                    return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
                }

                const guild = profile.guilds[guildIndex];
                const sellValue = await EconomyManager.disbandGuild(profile, guildIndex);
                const rewards = await EconomyManager.giveBusinessExperience(profile, 'delete');
                await profile.save();

                const components = [];
                const headerContainer = new ContainerBuilder().setAccentColor(0x9C27B0).addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 🏰 Guild Disbanded!\n## A CHAPTER CLOSES\n\n> **${guild.name}** has been disbanded for \`${sellValue.toLocaleString()} Souls\`!`));
                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const detailsContainer = new ContainerBuilder().setAccentColor(0x7B1FA2).addTextDisplayComponents(new TextDisplayBuilder().setContent('## 💰 **FINAL ACCOUNTS**')).addTextDisplayComponents(new TextDisplayBuilder().setContent(`**💎 Souls Reclaimed:** \`${sellValue.toLocaleString()} Souls\`\n**📊 Original Investment:** \`${guild.purchasePrice.toLocaleString()} Souls\`\n**📈 Net Gain/Loss:** \`${(sellValue - guild.purchasePrice).toLocaleString()} Souls\`\n**💳 New Soul Balance:** \`${profile.souls.toLocaleString()} Souls\``)).addTextDisplayComponents(new TextDisplayBuilder().setContent(`**✨ Influence Gained:** \`+${rewards.expGain} XP\`\n**🏰 Remaining Guilds:** \`${profile.guilds.length}/${profile.maxGuilds}\``));
                components.push(detailsContainer);

                return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
            }

            if (action === 'upgrade') {
                const guildIndex = parseInt(args[1]) - 1;
                if (isNaN(guildIndex) || guildIndex < 0 || guildIndex >= profile.guilds.length) {
                    const components = [];
                    const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C).addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ❌ Invalid Guild Number\n## SELECTION ERROR\n\n> Invalid guild number! Use \`!guild\` to see your guilds numbered 1-${profile.guilds.length}.`));
                    components.push(errorContainer);
                    return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
                }

                const guild = profile.guilds[guildIndex];
                const guildType = GUILD_TYPES[guild.type];

                if (guild.level >= guildType.maxLevel) {
                    const components = [];
                    const maxLevelContainer = new ContainerBuilder().setAccentColor(0xF39C12).addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 🏆 Maximum Level Reached\n## GUILD FULLY UPGRADED\n\n> **${guild.name}** is already at maximum level (${guildType.maxLevel})!\n\n**💡 Tip:** Consider founding a new guild or recruiting more apprentices!`));
                    components.push(maxLevelContainer);
                    return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
                }

                if (profile.souls < guild.upgradeCost) {
                    const components = [];
                    const insufficientContainer = new ContainerBuilder().setAccentColor(0xE74C3C).addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 💸 Insufficient Souls\n## UPGRADE BLOCKED\n\n> You need \`${guild.upgradeCost.toLocaleString()} Souls\` to upgrade **${guild.name}**!\n> Current soul balance: \`${profile.souls.toLocaleString()}\`\n> Shortage: \`${(guild.upgradeCost - profile.souls).toLocaleString()} Souls\``));
                    components.push(insufficientContainer);
                    return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
                }

                const oldIncome = await EconomyManager.calculateGuildIncome(guild);
                
                const upgradeCostPaid = guild.upgradeCost;
                profile.souls -= upgradeCostPaid;
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

                const rewards = await EconomyManager.giveBusinessExperience(profile, 'upgrade');
                await profile.save();

                const components = [];
                const headerContainer = new ContainerBuilder().setAccentColor(0x2196F3).addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 📈 Guild Upgraded!\n## ASCENSION ACHIEVED\n\n> **${guild.name}** has been upgraded to level ${guild.level}!`));
                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const detailsContainer = new ContainerBuilder().setAccentColor(0x1976D2).addTextDisplayComponents(new TextDisplayBuilder().setContent('## 💰 **UPGRADE BENEFITS**')).addTextDisplayComponents(new TextDisplayBuilder().setContent(`**💰 Upgrade Cost:** \`${upgradeCostPaid.toLocaleString()} Souls\`\n**📊 New Level:** \`${guild.level}/${guildType.maxLevel}\`\n**⭐ Renown:** \`${guild.reputation}%\` (+5%)\n**🎯 Efficiency:** \`${Math.floor(guild.efficiency * 100)}%\` (+5%)`)).addTextDisplayComponents(new TextDisplayBuilder().setContent(`**📈 Daily Tribute Increase:** \`${(newIncome.profit - oldIncome.profit).toLocaleString()} Souls\`\n**💎 New Daily Tribute:** \`${newIncome.profit.toLocaleString()} Souls\`\n**⭐ Influence Gained:** \`+${rewards.expGain} XP\`\n**📊 Leadership Gained:** \`+${rewards.skillGain}%\``));
                
                const nextUpgradeText = guild.level < guildType.maxLevel ? `**🔮 Next Upgrade:** \`${guild.upgradeCost.toLocaleString()} Souls\`` : '**🏆 Max Level Reached!**';
                detailsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${nextUpgradeText}\n**💳 Remaining Souls:** \`${profile.souls.toLocaleString()} Souls\``));
                components.push(detailsContainer);

                return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
            }

            if (action === 'recruit') {
                const guildIndex = parseInt(args[1]) - 1;
                const recruitAmount = parseInt(args[2]) || 1;

                if (isNaN(guildIndex) || guildIndex < 0 || guildIndex >= profile.guilds.length) {
                    const components = [];
                    const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C).addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ❌ Invalid Guild Number\n## SELECTION ERROR\n\n> Invalid guild number! Use \`!guild\` to see your guilds.`));
                    components.push(errorContainer);
                    return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
                }

                const guild = profile.guilds[guildIndex];
                const guildType = GUILD_TYPES[guild.type];

                if (guild.apprentices + recruitAmount > guildType.maxApprentices) {
                    const components = [];
                    const maxApprenticesContainer = new ContainerBuilder().setAccentColor(0xF39C12).addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 👥 Apprentice Limit Reached\n## RECRUITMENT BLOCKED\n\n> **${guild.name}** can only have ${guildType.maxApprentices} apprentices!\n> Current: ${guild.apprentices}/${guildType.maxApprentices}\n> Requested: +${recruitAmount}`));
                    components.push(maxApprenticesContainer);
                    return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
                }

                const baseRecruitCost = 1000 + (guild.level * 200);
                const recruitCost = Number(recruitAmount * baseRecruitCost);

                if (profile.souls < recruitCost) {
                    const components = [];
                    const insufficientContainer = new ContainerBuilder().setAccentColor(0xE74C3C).addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 💸 Insufficient Souls\n## RECRUITMENT BLOCKED\n\n> You need \`${recruitCost.toLocaleString()} Souls\` to recruit ${recruitAmount} apprentices!\n> Current soul balance: \`${profile.souls.toLocaleString()}\`\n> Cost per apprentice: \`${baseRecruitCost.toLocaleString()} Souls\``));
                    components.push(insufficientContainer);
                    return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
                }

                const oldIncome = await EconomyManager.calculateGuildIncome(guild);

                profile.souls -= recruitCost;
                profile.souls = Number(profile.souls) || 0;
                guild.apprentices += recruitAmount;

                const newIncome = await EconomyManager.calculateGuildIncome(guild);
                const profitIncrease = newIncome.profit - oldIncome.profit;

                const rewards = await EconomyManager.giveBusinessExperience(profile, 'hire', recruitAmount);
                await profile.save();

                const components = [];
                const headerContainer = new ContainerBuilder().setAccentColor(0x9C27B0).addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 👥 Apprentices Recruited!\n## RANKS SWELLED\n\n> Successfully recruited ${recruitAmount} apprentices for **${guild.name}**!`));
                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const detailsContainer = new ContainerBuilder().setAccentColor(0x7B1FA2).addTextDisplayComponents(new TextDisplayBuilder().setContent('## 📜 **RECRUITMENT BENEFITS**')).addTextDisplayComponents(new TextDisplayBuilder().setContent(`**💰 Recruitment Cost:** \`${recruitCost.toLocaleString()} Souls\`\n**👥 Total Apprentices:** \`${guild.apprentices}/${guildType.maxApprentices}\`\n**💸 Daily Apprentice Upkeep:** \`${newIncome.expenses.toLocaleString()} Souls\`\n**📈 Daily Tribute Increase:** \`${profitIncrease.toLocaleString()} Souls\``)).addTextDisplayComponents(new TextDisplayBuilder().setContent(`**💎 New Daily Tribute:** \`${newIncome.profit.toLocaleString()} Souls\`\n**⭐ Influence Gained:** \`+${rewards.expGain} XP\`\n**📊 Leadership Gained:** \`+${rewards.skillGain}%\`\n**💳 Remaining Souls:** \`${Number(profile.souls).toLocaleString()} Souls\``));
                components.push(detailsContainer);

                return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
            }

            if (action === 'help') {
                const components = [];
                const headerContainer = new ContainerBuilder().setAccentColor(0x607D8B).addTextDisplayComponents(new TextDisplayBuilder().setContent(`# 🏰 Guild Management Edicts\n## COMPLETE COMMAND GUIDE\n\n> Learn how to manage and grow your guild dominion.`));
                components.push(headerContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const commandsContainer = new ContainerBuilder().setAccentColor(0x546E7A).addTextDisplayComponents(new TextDisplayBuilder().setContent('## 📋 **AVAILABLE EDICTS**')).addTextDisplayComponents(new TextDisplayBuilder().setContent(`**\`!guild\`** - View all your guilds with dominion stats\n**\`!guild collect\`** - Collect daily tributes (24h cooldown)\n**\`!guild upgrade <#>\`** - Upgrade guild level for massive income boost`)).addTextDisplayComponents(new TextDisplayBuilder().setContent(`**\`!guild recruit <#> [amount]\`** - Recruit apprentices for significant profit boost\n**\`!guild dismiss <#> [amount]\`** - Dismiss apprentices to reduce upkeep\n**\`!guild disband <#>\`** - Disband a guild for 60-80% of its founding cost`)).addTextDisplayComponents(new TextDisplayBuilder().setContent(`**\`!foundguild <type>\`** - Found a new guild with great potential\n\n**💡 Benefits of Power:**\n> • Command vast tributes of Souls\n> • Apprentices generate significant income\n> • Gain influence and leadership skills\n> • Option to disband guilds that no longer serve you`));
                components.push(commandsContainer);

                return message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });
            }

        } catch (error) {
            console.error('Error in guild command:', error);
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C)
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## ❌ **GUILD COMMAND ERROR**\n\nSomething went wrong while executing your command. The scribes are looking into it.')
                );
            return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};