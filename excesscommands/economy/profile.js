const {
    TextDisplayBuilder,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags
} = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { GUILD_TYPES, RAID_TARGETS } = require('../../models/economy/constants/businessData');

module.exports = {
    name: 'chronicle',
    aliases: ['stats', 'me', 'legacy'],
    description: 'View your complete adventurer\'s chronicle.',
    async execute(message, args) {
        try {
            const targetUser = message.mentions.users.first() || message.author;
            const profile = await EconomyManager.getProfile(targetUser.id, message.guild.id);

            // Calculate derived values
            const guildCoffers = (profile.guilds || []).reduce((sum, g) => sum + (g.profit || 0), 0);
            const totalWealth = (profile.embers || 0) + (profile.royal_treasury || 0) + guildCoffers;
            const wardStrength = EconomyManager.calculateWardingLevel(profile);
            const questBonus = EconomyManager.calculateQuestMultiplier(profile);
            const mountValue = (profile.mounts || []).reduce((sum, mount) => sum + (mount.currentValue || 0), 0);
            const strongholdValue = (profile.strongholds || []).reduce((sum, stronghold) => sum + (stronghold.currentValue || 0), 0);
            const followerLoyalty = (profile.followers || []).length > 0 ? Math.floor((profile.followers || []).reduce((sum, f) => sum + (f.loyalty || 0), 0) / (profile.followers || []).length) : 0;

            // Arena stats
            const arenaWinRate = (profile.arenaStats && profile.arenaStats.totalBattles > 0) ? ((profile.arenaStats.wins / profile.arenaStats.totalBattles) * 100).toFixed(1) : '0.0';

            // Hunting stats
            const huntingWinRate = (profile.huntingStats && profile.huntingStats.totalHunts > 0) ? ((profile.huntingStats.successfulHunts / profile.huntingStats.totalHunts) * 100).toFixed(1) : '0.0';

            const components = [];

            const headerContainer = new ContainerBuilder().setAccentColor(0x4CAF50);
            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`# 📜 ${targetUser.username}\'s Chronicle\n## YOUR LEGACY & ACHIEVEMENTS\n\n> A detailed record of your wealth, assets, and notable deeds.`)
            );
            components.push(headerContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const wealthContainer = new ContainerBuilder().setAccentColor(0x2ECC71);
            wealthContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## 💰 **WEALTH & INFLUENCE**'));
            wealthContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**🪙 Embers:** \`${profile.embers.toLocaleString()}\`\n**🏦 Royal Treasury:** \`${profile.royal_treasury.toLocaleString()}\`\n**🏰 Guild Coffers:** \`${guildCoffers.toLocaleString()}\`\n**💎 Total Wealth:** \`${totalWealth.toLocaleString()}\``)
            );
            wealthContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**📈 Level:** \`${profile.level}\`\n**⭐ Experience:** \`${profile.experience.toLocaleString()} XP\`\n**🏆 Reputation:** \`${profile.reputation}\`\n**📜 Quest Bonus:** \`${questBonus.toFixed(2)}x\``)
            );
            components.push(wealthContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const assetsContainer = new ContainerBuilder().setAccentColor(0x3498DB);
            assetsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## 🏰 **ASSETS & RETINUE**'));
            assetsContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**🏘️ Strongholds Owned:** \`${(profile.strongholds || []).length}\`\n**🏰 Stronghold Value:** \`${strongholdValue.toLocaleString()} Embers\`\n**🐎 Mounts Owned:** \`${(profile.mounts || []).length}\`\n**🐴 Mount Value:** \`${mountValue.toLocaleString()} Embers\``)
            );
            assetsContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**👥 Followers:** \`${(profile.followers || []).length}\`\n**❤️ Followers Loyalty:** \`${followerLoyalty}%\`\n**🦇 Familiars:** \`${(profile.familiars || []).length}/${profile.maxFamiliars || 1}\`\n**🛡️ Ward Strength:** \`${wardStrength}%\``)
            );
            components.push(assetsContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            // Arena Battles Section
            if (profile.arenaStats.totalBattles > 0) {
                const arenaContainer = new ContainerBuilder().setAccentColor(0xF39C12);
                arenaContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## ⚔️ **ARENA BATTLES**'));
                arenaContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**⚔️ Total Battles:** \`${profile.arenaStats.totalBattles}\`\n**🏆 Victories:** \`${profile.arenaStats.wins}\`\n**📊 Success Rate:** \`${arenaWinRate}%\`\n**💰 Arena Earnings:** \`${profile.arenaStats.earnings.toLocaleString()} Embers\``)
                );
                components.push(arenaContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
            }

            // Monster Hunting Section
            if (profile.huntingStats.totalHunts > 0) {
                const huntingContainer = new ContainerBuilder().setAccentColor(0xE67E22);
                huntingContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## 🏹 **MONSTER HUNTING**'));
                huntingContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**🎯 Total Hunts:** \`${profile.huntingStats.totalHunts}\`\n**✅ Successful Hunts:** \`${profile.huntingStats.successfulHunts}\`\n**📊 Success Rate:** \`${huntingWinRate}%\`\n**💰 Total Earnings:** \`${profile.huntingStats.totalEarnings.toLocaleString()} Embers\``)
                );
                huntingContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**🦇 Monsters Slain:** \`${profile.huntingStats.monstersSlain}\`\n**💎 Rare Finds:** \`${profile.huntingStats.rareMonstersFound}\`\n**📦 Treasure Chests:** \`${profile.huntingStats.treasureChestsFound}\`\n**🏔️ Deepest Level:** \`${profile.huntingStats.deepestDungeonLevel}\``)
                );
                components.push(huntingContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
            }


            // Followers System Section
            if ((profile.followers || []).length > 0) {
                const followersContainer = new ContainerBuilder().setAccentColor(0x9B59B6);
                followersContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## 👥 **LOYAL FOLLOWERS**'));
                const totalTribute = (profile.followers || []).reduce((sum, f) => sum + (f.tribute || 0), 0);
                followersContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**👥 Followers:** \`${(profile.followers || []).length}\`\n**💰 Combined Tribute:** \`${totalTribute.toLocaleString()} Embers/quest\`\n**❤️ Average Loyalty:** \`${followerLoyalty}%\`\n**🏰 Quest Efficiency:** Boosts your earnings`)
                );
                components.push(followersContainer);
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
            }
            if ((profile.guilds || []).length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                const guildContainer = new ContainerBuilder().setAccentColor(0x8E44AD);
                guildContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## 🌍 **GUILDS**'));
                const totalGuildValue = (profile.guilds || []).reduce((sum, g) => sum + (g.purchasePrice || 0), 0);
                const totalTribute = (profile.guilds || []).reduce((sum, g) => sum + (g.profit || 0), 0);
                guildContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**🌍 Active Guilds:** \`${(profile.guilds || []).length}/${profile.maxGuilds || 1}\`\n**📊 Guild Management Skill:** \`${profile.guildManagementSkill || 0}%\`\n**💰 Total Influence:** \`${totalGuildValue.toLocaleString()}\`\n**📈 Total Tribute:** \`${totalTribute.toLocaleString()}\``)
                );
                components.push(guildContainer);
            }

            if ((profile.completedRaids || 0) > 0 || (profile.failedRaids || 0) > 0 || (profile.activeRaids || []).length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                const raidContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
                raidContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## 💰 **DUNGEON RAIDS**'));
                const totalRaids = (profile.completedRaids || 0) + (profile.failedRaids || 0);
                const raidSuccessRate = totalRaids > 0 ? (((profile.completedRaids || 0) / totalRaids) * 100).toFixed(1) : '0.0';
                raidContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**🎯 Total Raids:** \`${totalRaids}\`\n**✅ Successful Raids:** \`${profile.completedRaids || 0}\`\n**❌ Failed Raids:** \`${profile.failedRaids || 0}\`\n**📊 Success Rate:** \`${raidSuccessRate}%\`\n**⚔️ Raiding Skill:** \`${profile.raidingSkill || 0}%\`\n**😈 Notoriety:** \`${profile.notoriety || 0}%\``)
                );
                components.push(raidContainer);
            }

            if ((profile.activeEffects || []).length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                const effectsContainer = new ContainerBuilder().setAccentColor(0x9B59B6);
                effectsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## ✨ **ACTIVE EFFECTS**'));
                let effectsText = (profile.activeEffects || []).slice(0, 3).map(effect => {
                    const timeLeft = Math.ceil((effect.expiryTime - new Date()) / (60 * 60 * 1000));
                    const stackText = effect.stacks > 1 ? ` (×${effect.stacks})` : '';
                    return `**\`${effect.name}\`**${stackText}\n> **Duration:** \`${timeLeft}h remaining\` • **Potency:** \`${effect.multiplier}x\``;
                }).join('\n\n');
                if ((profile.activeEffects || []).length > 3) {
                    effectsText += `\n\n*...and ${(profile.activeEffects || []).length - 3} more effects*`;
                }
                effectsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(effectsText));
                components.push(effectsContainer);
            }

            const footerContainer = new ContainerBuilder().setAccentColor(0x95A5A6);
            footerContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## 📅 **CHRONICLE INFORMATION**\n\n**Chronicle Started:** \`${new Date(profile.createdAt).toLocaleDateString()}\`\n**Last Updated:** \`${new Date(profile.updatedAt).toLocaleDateString()}\`\n**Daily Streak:** \`${profile.dailyStreak || 0} days\`\n**Total Deeds:** \`${(profile.transactions || []).length}\``)
            );
            components.push(footerContainer);

            await message.reply({ components: components, flags: MessageFlags.IsComponentsV2 });

        } catch (error) {
            console.error('Error in chronicle command:', error);
            const errorContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
            errorContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('## ❌ **CHRONICLE ERROR**\n\nUnable to retrieve your chronicle. The mists of time obscure the records.')
            );
            return message.reply({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 });
        }
    }
};
