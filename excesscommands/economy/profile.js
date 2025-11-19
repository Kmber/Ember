const { 
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { GUILD_TYPES, RAID_DUNGEONS } = require('../../models/economy/constants/guildData');
const ServerConfig = require('../../models/serverConfig/schema');
const config = require('../../config.json');

module.exports = {
    name: 'profile',
    aliases: ['stats', 'me'],
    description: 'View your complete economy profile .',
    async execute(message, args) {
        try {
            const serverConfig = await ServerConfig.findOne({ serverId: message.guild.id });
            const prefix = serverConfig?.prefix || config.prefix;
            const targetUser = message.mentions.users.first() || message.author;
            const profile = await EconomyManager.getProfile(targetUser.id, message.guild.id);
            
            const totalWealth = profile.wallet + profile.bank + profile.followerTithe;
            const powerLevel = EconomyManager.calculatePowerLevel(profile);
            const workMultiplier = EconomyManager.calculateWorkMultiplier(profile);
            const beastValue = profile.beasts.reduce((sum, beast) => sum + beast.currentValue, 0);
            const citadelValue = profile.citadels.reduce((sum, prop) => sum + prop.currentValue, 0);
            const winRate = profile.racingStats.totalRaces > 0 ? 
                ((profile.racingStats.wins / profile.racingStats.totalRaces) * 100).toFixed(1) : '0.0';
            
            const components = [];

      
            const headerContainer = new ContainerBuilder()
                .setAccentColor(0x4CAF50);

            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`# 📊 ${targetUser.username}'s Complete Profile\n## YOUR ECONOMY STATISTICS & ACHIEVEMENTS\n\n> Comprehensive overview of your progress, assets, and achievements`)
            );

            components.push(headerContainer);

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

        
            const financialContainer = new ContainerBuilder()
                .setAccentColor(0x2ECC71);

            financialContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 💰 **FINANCIAL STATUS**')
            );

            financialContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**💵 Wallet:** \`${profile.wallet.toLocaleString()} Embers\`\n**🏦 Bank:** \`${profile.bank.toLocaleString()} Embers\`\n**💰 Follower Tithe:** \`${profile.followerTithe.toLocaleString()} Embers\`\n**💎 Total Wealth:** \`${totalWealth.toLocaleString()} Embers\``)
            );

            financialContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**📈 Level:** \`${profile.level}\`\n**⭐ Experience:** \`${profile.experience.toLocaleString()} XP\`\n**🏆 Reputation:** \`${profile.reputation}\`\n**💼 Work Multiplier:** \`${workMultiplier.toFixed(2)}x\``)
            );

            components.push(financialContainer);

         
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

           
            const assetsContainer = new ContainerBuilder()
                .setAccentColor(0x3498DB);

            assetsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🏰 **ASSETS & CITADELS**')
            );

            assetsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏘️ Citadels Owned:** \`${profile.citadels.length}\`\n**🏰 Citadel Value:** \`${citadelValue.toLocaleString()} Embers\`\n**👹 Beasts Owned:** \`${profile.beasts.length}\`\n**🔥 Beast Value:** \`${beastValue.toLocaleString()} Embers\``)
            );

            assetsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**👥 Followers:** \`${profile.followers.length}\`\n**🤝 Follower Allegiance:** \`${profile.followerAllegiance}%\`\n**🦇 Minions:** \`${profile.minions.length}/${profile.maxMinions}\`\n**🛡️ Power Level:** \`${powerLevel}%\``)
            );

            components.push(assetsContainer);

       
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

    
            const statsContainer = new ContainerBuilder()
                .setAccentColor(0xF39C12);

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## 🏁 **RACING & SECURITY STATS**')
            );

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🏁 Total Races:** \`${profile.racingStats.totalRaces}\`\n**🏆 Race Wins:** \`${profile.racingStats.wins}\`\n**📊 Win Rate:** \`${winRate}%\`\n**💰 Race Earnings:** \`${profile.racingStats.earnings.toLocaleString()} Embers\``)
            );

            statsContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`**🔓 Robbery Attempts:** \`${profile.robberyAttempts}\`\n**📅 Last Robbed:** \`${profile.lastRobbed ? new Date(profile.lastRobbed).toLocaleDateString() : 'Never'}\`\n**👑 Active Roles:** \`${profile.purchasedRoles.filter(r => !r.expiryDate || r.expiryDate > new Date()).length}\``)
            );

            components.push(statsContainer);

         
            if (profile.guilds.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const guildContainer = new ContainerBuilder()
                    .setAccentColor(0x8E44AD);

                guildContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## 🏢 **GUILD EMPIRE**')
                );

            
                const totalGuildValue = profile.guilds.reduce((sum, g) => sum + (g.purchasePrice || 0), 0);
                const totalProfit = profile.guilds.reduce((sum, g) => sum + (g.profit || 0), 0);
                const totalRevenue = profile.guilds.reduce((sum, g) => sum + (g.revenue || 0), 0);

                guildContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🏢 Active Guilds:** \`${profile.guilds.length}/${profile.maxGuilds}\`\n**📊 Guild Skill:** \`${profile.guildSkill}%\`\n**💰 Total Investment:** \`${totalGuildValue.toLocaleString()} Embers\`\n**📈 Total Profit:** \`${totalProfit.toLocaleString()}\``)
                );

            
                if (profile.guilds.length > 0) {
                    let guildDetails = profile.guilds.slice(0, 3).map(guild => {
                        const guildType = GUILD_TYPES[guild.type];
                        const lastCollection = guild.lastCollection ? 
                            new Date(guild.lastCollection).toLocaleDateString() : 'Never';
                        
                        return `**\`${guild.name}\`** (${guildType?.name || guild.type})\n` +
                               `> **Level:** \`${guild.level}/10\` • **Acolytes:** \`${guild.acolytes}\`\n` +
                               `> **Reputation:** \`${guild.reputation}%\` • **Efficiency:** \`${(guild.efficiency * 100).toFixed(0)}%\`\n` +
                               `> **Last Collection:** \`${lastCollection}\``;
                    }).join('\n\n');

                    if (profile.guilds.length > 3) {
                        guildDetails += `\n\n*...and ${profile.guilds.length - 3} more guilds*`;
                    }

                    guildContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(guildDetails)
                    );
                }

                components.push(guildContainer);
            }

         
            if (profile.completedRaids > 0 || profile.failedRaids > 0 || profile.activeRaids.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const raidContainer = new ContainerBuilder()
                    .setAccentColor(0xE74C3C);

                raidContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## ⚔️ **RAID EXPEDITIONS**')
                );

              
                const totalRaids = profile.completedRaids + profile.failedRaids;
                const raidSuccessRate = totalRaids > 0 ? 
                    ((profile.completedRaids / totalRaids) * 100).toFixed(1) : '0.0';

                raidContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**🎯 Total Raids:** \`${totalRaids}\`\n**✅ Successful Raids:** \`${profile.completedRaids}\`\n**❌ Failed Raids:** \`${profile.failedRaids}\`\n**📊 Success Rate:** \`${raidSuccessRate}%\``)
                );

                raidContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**⚔️ Raid Skill:** \`${profile.raidSkill}%\`\n**🔥 Threat Level:** \`${profile.threatLevel}%\`\n**🛡️ Active Raids:** \`${profile.activeRaids.length}\`\n**⏳ Recovery Status:** \`${profile.recoveryTime && profile.recoveryTime > new Date() ? 'Recovering' : 'Ready'}\``)
                );

              
                if (profile.recoveryTime && profile.recoveryTime > new Date()) {
                    const recoveryTimeLeft = Math.ceil((profile.recoveryTime - new Date()) / (60 * 60 * 1000));
                    raidContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**⏳ CURRENTLY RECOVERING**\n\n> **Time Remaining:** \`${recoveryTimeLeft} hours\`\n> **Ready Date:** \`${new Date(profile.recoveryTime).toLocaleString()}\``)
                    );
                }

              
                if (profile.activeRaids.length > 0) {
                    raidContainer.addTextDisplayComponents(
                        new TextDisplayBuilder()
                            .setContent(`**🎯 ACTIVE RAID EXPEDITIONS**\n\n> You are currently involved in \`${profile.activeRaids.length}\` active raid(s)\n> Use \`${prefix}raid status\` for detailed information`)
                    );
                }

                components.push(raidContainer);
            }

          
            if (profile.activeEffects && profile.activeEffects.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

                const effectsContainer = new ContainerBuilder()
                    .setAccentColor(0x9B59B6);

                effectsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent('## ⚡ **ACTIVE ENHANCEMENT EFFECTS**')
                );

                let effectsText = profile.activeEffects.slice(0, 3).map(effect => {
                    const timeLeft = Math.ceil((effect.expiryTime - new Date()) / (60 * 60 * 1000));
                    const stackText = effect.stacks > 1 ? ` (×${effect.stacks})` : '';
                    return `**\`${effect.name}\`**${stackText}\n> **Duration:** \`${timeLeft}h remaining\` • **Multiplier:** \`${effect.multiplier}x\``;
                }).join('\n\n');

                if (profile.activeEffects.length > 3) {
                    effectsText += `\n\n*...and ${profile.activeEffects.length - 3} more effects*`;
                }

                effectsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(effectsText)
                );

                effectsContainer.addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(`**⚡ Total Active Effects:** \`${profile.activeEffects.length}\``)
                );

                components.push(effectsContainer);
            }

        
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const footerContainer = new ContainerBuilder()
                .setAccentColor(0x95A5A6);

            footerContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(`## 📅 **PROFILE INFORMATION**\n\n**Profile Created:** \`${new Date(profile.createdAt).toLocaleDateString()}\`\n**Last Activity:** \`${new Date(profile.updatedAt).toLocaleDateString()}\`\n**Daily Streak:** \`${profile.dailyStreak} days\`\n**Total Transactions:** \`${profile.transactions.length}\``)
            );

            components.push(footerContainer);

          
            await message.reply({
                components: components,
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Error in profile command:', error);
            
        
            const errorContainer = new ContainerBuilder()
                .setAccentColor(0xE74C3C);

            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent('## ❌ **PROFILE ERROR**\n\nUnable to retrieve profile information. Please try again in a moment.')
            );

            return message.reply({
                components: [errorContainer],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};