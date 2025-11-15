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
            
            const totalWealth = profile.embers + profile.treasury + profile.guild_coffers;
            const wardStrength = EconomyManager.calculateWardStrength(profile);
            const questBonus = EconomyManager.calculateQuestBonus(profile);
            const mountValue = profile.mounts.reduce((sum, mount) => sum + mount.currentValue, 0);
            const strongholdValue = profile.strongholds.reduce((sum, stronghold) => sum + stronghold.currentValue, 0);
            const campaignWinRate = profile.campaignStats.totalCampaigns > 0 ? 
                ((profile.campaignStats.wins / profile.campaignStats.totalCampaigns) * 100).toFixed(1) : '0.0';
            
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
                new TextDisplayBuilder().setContent(`**🪙 Embers:** \`${profile.embers.toLocaleString()}\`\n**🏦 Treasury:** \`${profile.treasury.toLocaleString()}\`\n**🏰 Guild Coffers:** \`${profile.guild_coffers.toLocaleString()}\`\n**💎 Total Wealth:** \`${totalWealth.toLocaleString()}\``)
            );
            wealthContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**📈 Level:** \`${profile.level}\`\n**⭐ Experience:** \`${profile.experience.toLocaleString()} XP\`\n**🏆 Renown:** \`${profile.renown}\`\n**📜 Quest Bonus:** \`${questBonus.toFixed(2)}x\``)
            );
            components.push(wealthContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const assetsContainer = new ContainerBuilder().setAccentColor(0x3498DB);
            assetsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## 🏰 **ASSETS & RETINUE**'));
            assetsContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**🏘️ Strongholds Owned:** \`${profile.strongholds.length}\`\n**🏰 Stronghold Value:** \`${strongholdValue.toLocaleString()} Embers\`\n**🐎 Mounts Owned:** \`${profile.mounts.length}\`\n**🐴 Mount Value:** \`${mountValue.toLocaleString()} Embers\``)
            );
            assetsContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**👥 Retinue:** \`${profile.followers.length}\`\n**❤️ Retinue Loyalty:** \`${profile.followerLoyalty}%\`\n**🦇 Familiars:** \`${profile.familiars.length}/${profile.maxFamiliars}\`\n**🛡️ Ward Strength:** \`${wardStrength}%\``)
            );
            components.push(assetsContainer);
            components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));

            const campaignContainer = new ContainerBuilder().setAccentColor(0xF39C12);
            campaignContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## ⚔️ **CAMPAIGNS & WARDS**'));
            campaignContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**⚔️ Total Campaigns:** \`${profile.campaignStats.totalCampaigns}\`\n**🏆 Campaigns Won:** \`${profile.campaignStats.wins}\`\n**📊 Success Rate:** \`${campaignWinRate}%\`\n**💰 Campaign Spoils:** \`${profile.campaignStats.spoils.toLocaleString()} Embers\``)
            );
            components.push(campaignContainer);

            if (profile.guilds.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                const guildContainer = new ContainerBuilder().setAccentColor(0x8E44AD);
                guildContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## 🌍 **GUILDS**'));
                const totalGuildValue = profile.guilds.reduce((sum, g) => sum + (g.purchasePrice || 0), 0);
                const totalTribute = profile.guilds.reduce((sum, g) => sum + (g.tribute || 0), 0);
                guildContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**🌍 Active Guilds:** \`${profile.guilds.length}/${profile.maxGuilds}\`\n**📊 Guild Skill:** \`${profile.guildSkill}%\`\n**💰 Total Influence:** \`${totalGuildValue.toLocaleString()}\`\n**📈 Total Tribute:** \`${totalTribute.toLocaleString()}\``)
                );
                components.push(guildContainer);
            }

            if (profile.completedRaids > 0 || profile.failedRaids > 0 || profile.activeRaids.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                const raidContainer = new ContainerBuilder().setAccentColor(0xE74C3C);
                raidContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## 💰 **DUNGEON RAIDS**'));
                const totalRaids = profile.completedRaids + profile.failedRaids;
                const raidSuccessRate = totalRaids > 0 ? ((profile.completedRaids / totalRaids) * 100).toFixed(1) : '0.0';
                raidContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**🎯 Total Raids:** \`${totalRaids}\`\n**✅ Successful Raids:** \`${profile.completedRaids}\`\n**❌ Failed Raids:** \`${profile.failedRaids}\`\n**📊 Success Rate:** \`${raidSuccessRate}%\``)
                );
                components.push(raidContainer);
            }

            if (profile.activeEnchantments && profile.activeEnchantments.length > 0) {
                components.push(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large));
                const effectsContainer = new ContainerBuilder().setAccentColor(0x9B59B6);
                effectsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent('## ✨ **ACTIVE ENCHANTMENTS**'));
                let effectsText = profile.activeEnchantments.slice(0, 3).map(effect => {
                    const timeLeft = Math.ceil((effect.expiryTime - new Date()) / (60 * 60 * 1000));
                    const stackText = effect.stacks > 1 ? ` (×${effect.stacks})` : '';
                    return `**\`${effect.name}\`**${stackText}\n> **Duration:** \`${timeLeft}h remaining\` • **Potency:** \`${effect.potency}x\``;
                }).join('\n\n');
                if (profile.activeEnchantments.length > 3) {
                    effectsText += `\n\n*...and ${profile.activeEnchantments.length - 3} more enchantments*`;
                }
                effectsContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(effectsText));
                components.push(effectsContainer);
            }

            const footerContainer = new ContainerBuilder().setAccentColor(0x95A5A6);
            footerContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## 📅 **CHRONICLE INFORMATION**\n\n**Chronicle Started:** \`${new Date(profile.createdAt).toLocaleDateString()}\`\n**Last Updated:** \`${new Date(profile.updatedAt).toLocaleDateString()}\`\n**Offering Streak:** \`${profile.offeringStreak} days\`\n**Total Deeds:** \`${profile.transactions.length}\``)
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